import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import StarIcon from "@material-ui/icons/Star";

import Name from "./Name";
import ErrorText from "./ErrorText";
import FeedbackForm from "./FeedbackForm";
import { RESPONSE, ROLE } from "../enums";
import { Axios } from "../utilities";
import { setError } from "../redux/actions";

function ViewWorkerService(props) {
	const { history, location, match, auth, error } = props;
	const { setError } = props;

	const workerServiceId = match.params.workerServiceId;
	const [workerUser, setWorkerUser] = useState(null);
	const [worker, setWorker] = useState(null);
	const [service, setService] = useState(null);
	const [workerService, setWorkerService] = useState(null);
	const [ratings, setRatings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [metaData, setMetaData] = useState(null);
	const [price, setPrice] = useState(0);
	const [loadMore, setLoadMore] = useState(true);

	useEffect(() => {
		getService();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	useEffect(() => {
		if (service) {
			let sum = 0;
			setMetaData(
				service.subCategories.map((subCategory) => {
					const res = {
						name: subCategory.name,
						price: subCategory.price,
						PRICE: subCategory.price,
					};
					if ("mxSqFt" in subCategory) {
						res.sqFt = subCategory.mxSqFt;
						res.MXSQFT = subCategory.mxSqFt;
					} else res.qty = 1;

					sum += subCategory.price;
					return res;
				})
			);
			setPrice(sum);
		}
	}, [service]);

	async function getService() {
		if (!workerServiceId) history.goBack();
		else {
			const res = await Axios.GET(`/service/workerService/${workerServiceId}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else {
				setWorkerUser(res.data.workerUser);
				setWorker(res.data.worker);
				setService(res.data.service);
				setWorkerService(res.data.workerService);
				if (auth.isAuthenticated)
					setRatings(
						res.data.ratings.filter((rating) => rating.userId !== auth.user._id)
					);
				else setRatings(res.data.ratings);
				setLoading(false);
			}
		}
	}

	function handleChange(event, index) {
		setError("");
		const name = event.target.name;
		const value = event.target.value;
		setMetaData((prev) => {
			const res = [...prev];
			res[index][name] = value;
			return res;
		});
	}

	function handleBlur(event, index) {
		setError("");
		const name = event.target.name;
		if (name === "qty") {
			setMetaData((prev) => {
				const res = [...prev];
				res[index].qty = Math.max(1, Math.floor(Number(res[index].qty || 0)));
				const oldPrice = res[index].price;
				const newPrice = res[index].PRICE * res[index].qty;
				res[index].price = newPrice;
				setPrice((prevPrice) => prevPrice - oldPrice + newPrice);
				return res;
			});
		} else {
			setMetaData((prev) => {
				const res = [...prev];
				res[index].sqFt = Math.max(Number(res[index].MXSQFT), Number(res[index].sqFt || 0));
				const oldPrice = res[index].price;
				const newPrice = Math.round(
					(res[index].PRICE / res[index].MXSQFT) * res[index].sqFt
				);
				res[index].price = newPrice;
				setPrice((prevPrice) => prevPrice - oldPrice + newPrice);
				return res;
			});
		}
	}

	async function editService() {
		setError("");
		if ([ROLE.ADMIN, ROLE.COADMIN].includes(auth.user.role))
			history.push(`/admin/updateService/${service._id}`);
		else history.push(`/updateService/${service._id}`);
	}

	async function deleteService() {
		setError("");
		const res = Axios.DELETE(`/service/${service._id}`);
		if (res.success === RESPONSE.FAILURE) setError(res.data.message);
		else history.goBack();
	}

	async function bookService() {
		setError("");
		const data = {
			userId: auth.user._id,
			metaData: metaData.map((subCategory) => {
				delete subCategory.PRICE;
				if (subCategory.MXSQFT) delete subCategory.MXSQFT;
				return subCategory;
			}),
			price,
		};

		const res = await Axios.POST(`/service/bookService/${workerServiceId}`, data);
		if (res.success === RESPONSE.FAILURE) setError(res.data.message);
		else history.push(`/viewServiceOrder/${res.data.id}`);
	}

	async function moreRatings() {
		setError("");
		if (!ratings.length) return setLoadMore(false);
		const lastKey = ratings[ratings.length - 1].userId;
		const res = await Axios.GET(`/rating/ratings/${workerService._id}`, { lastKey });
		const newRatings = res.data.ratings.filter((rating) => rating.userId !== auth.user._id);
		if (newRatings.length) setRatings((prevRatings) => [...prevRatings, ...newRatings]);
		else setLoadMore(false);
	}

	return (
		!loading && (
			<>
				{error.error && <ErrorText>{error.error}</ErrorText>}
				<div className="view_item_container">
					<div className="left_container ml-50">
						<div className="flex flex-row width100 justify-between">
							<div>
								<p className="large-font-size bold">{service.serviceName}</p>
								<Name
									className="mt-10 bold big-font-size"
									isVerified={worker.isVerified}
								>
									{workerUser.userName}
								</Name>
								<p>{workerUser.phone}</p>
								<div className="flex flex-row show_rating mt-10 align-center">
									{workerService.ratingValue}
									<StarIcon className="violet" />
									<div className="ml-10">[{workerService.ratingCount}]</div>
								</div>
							</div>

							<img
								src={`/images/${worker.profilePicture}`}
								className="mt-10"
								height="150px"
								alt={workerUser.userName}
							/>
						</div>

						<p className="bold mt-20 big-font-size">{service.serviceCategory}</p>
						<div className="card-100 mb-20">
							{metaData.map((subCategory, index) => {
								const subCategoryName =
									subCategory.name +
									(subCategory.MXSQFT
										? " [min " + subCategory.MXSQFT + " sqft]"
										: "");
								return (
									<div key={index} className="view_sub_category_input_field">
										<label className="hover-pointer normal small-font-size ml-5">
											{subCategoryName}
										</label>
										<div className="flex flex-col">
											{!subCategory.MXSQFT && (
												<div className="flex flex-row align-center">
													<input
														type="number"
														name="qty"
														onChange={(e) => handleChange(e, index)}
														onBlur={(e) => handleBlur(e, index)}
														value={subCategory.qty}
													/>
													<label className="normal small-font-size ml-5">
														Qty
													</label>
												</div>
											)}
											{subCategory.MXSQFT && (
												<div className="flex flex-row align-center">
													<input
														type="number"
														name="sqFt"
														onChange={(e) => handleChange(e, index)}
														onBlur={(e) => handleBlur(e, index)}
														value={subCategory.sqFt}
													/>
													<label className="normal small-font-size ml-5">
														SqFt
													</label>
												</div>
											)}
										</div>
										<div className="flex flex-col">
											<div className="flex flex-row align-center">
												<input
													type="text"
													disabled
													value={subCategory.price}
												/>
												<label className="normal small-font-size ml-5">
													Price
												</label>
											</div>
										</div>
									</div>
								);
							})}
							<hr />
							<div className="view_sub_category_input_field">
								<div></div>
								<div></div>
								<div>
									<div className="flex flex-row align-center mt-5">
										<input type="text" disabled value={price} />
										<label className="normal small-font-size ml-5">
											Net Price
										</label>
									</div>
								</div>
							</div>
						</div>

						{((auth.isAuthenticated && service.serviceProviderId === auth.user._id) ||
							[ROLE.ADMIN, ROLE.COADMIN].includes(auth.user.role)) && (
							<div className="buttons mt-10 mb-50">
								<button className="btn btn-success" onClick={editService}>
									Edit
								</button>
								<button className="btn btn-danger ml-10" onClick={deleteService}>
									Delete
								</button>
							</div>
						)}

						{auth.isAuthenticated &&
							service.serviceProviderId !== auth.user._id &&
							workerService.workerId !== auth.user._id && (
								<FeedbackForm
									className="mt-20 mb-50"
									targetId={workerService._id}
									auth={auth}
									setError={setError}
									target={"SERVICE"}
									onFeedbackChange={getService}
								/>
							)}
					</div>

					<div className="right_container">
						<div className="flex flex-col ml-50 mt-20">
							<p className="big-font-size bold">Description</p>
							<p className="small-font-size">{service.description}</p>
						</div>
						<div className="flex flex-row mt-20 align-center width100">
							<p className="bold ml-50">Total orders : </p>
							<input
								type="text"
								className="right pt-5"
								value={workerService.orderedCount}
								disabled={true}
							/>
							{auth.isAuthenticated &&
								auth.user._id !== service.serviceProviderId &&
								auth.user._id !== workerService.workerId && (
									<button
										className="btn btn-violet ml-auto mr-50"
										type="button"
										onClick={bookService}
									>
										Book Service
									</button>
								)}
						</div>

						<div className="flex flex-col mt-50 width100">
							<div className="ml-50">
								<p className="bold large-font-size">Ratings</p>
								{ratings.map((rating) => (
									<div key={rating._id} className="rating_box mt-10">
										<div className="p-10">
											<div className="flex flex-row align-center">
												<p className="bold big-font-size">
													{rating.userName}
												</p>
												<p className="ml-50">{rating.ratingValue}/5</p>
											</div>
											<p className="">{rating.description}</p>
										</div>
									</div>
								))}
								<button
									type="button"
									className="btn btn-violet mt-10"
									style={{ width: "fit-content" }}
									onClick={moreRatings}
									disabled={!loadMore || !ratings.length}
								>
									Load More
								</button>
							</div>
						</div>
					</div>
				</div>
			</>
		)
	);
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
		error: state.error,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewWorkerService);
