import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import StarIcon from "@material-ui/icons/Star";

import ErrorText from "./ErrorText";
import FeedbackForm from "./FeedbackForm";
import { ROLE, RESPONSE } from "../enums";
import { Axios } from "../utilities";
import { setError } from "../redux/actions";

function ViewItem(props) {
	const { history, location, match, auth, error } = props;
	const { setError } = props;

	const [item, setItem] = useState(null);
	const [ratings, setRatings] = useState([]);
	const [loading, setLoading] = useState(true);

	const [itemCount, setItemCount] = useState(1);
	const [loadMore, setLoadMore] = useState(true);

	useEffect(() => {
		getItem();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getItem() {
		const itemId = match.params.itemId;
		if (!itemId) history.goBack();
		else {
			const res = await Axios.GET(`/item/withRatings/${itemId}`);
			if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

			setItem(res.data.item);
			if (auth.isAuthenticated && ![ROLE.ADMIN, ROLE.COADMIN].includes(auth.user.role))
				setRatings(res.data.ratings.filter((rating) => rating.userId !== auth.user._id));
			else setRatings(res.data.ratings);
			setLoading(false);
		}
	}

	async function editItem() {
		setError("");
		history.push(`/updateItem/${item._id}`);
	}

	async function deleteItem() {
		setError("");
		const res = Axios.DELETE(`/item/${item._id}`);
		if (res.success === RESPONSE.FAILURE) setError(res.data.message);
		else history.goBack();
	}

	async function addToCart() {
		setError("");
		if (!Number.isInteger(Number(itemCount))) return setError("Item count must be integer");
		const res = await Axios.POST(`/item/toCart/${item._id}`, {
			userId: auth.user._id,
			count: itemCount,
			price: itemCount * item.price,
		});
		if (res.success === RESPONSE.FAILURE) setError(res.data.message);
		else history.push("/cart");
	}

	async function moreRatings() {
		setError("");
		if (!ratings.length) return setLoadMore(false);
		const lastKey = ratings[ratings.length - 1].userId;
		const res = await Axios.GET(`/rating/ratings/${item._id}`, { lastKey });
		const newRatings = res.data.ratings.filter((rating) => rating.userId !== auth.user._id);
		if (newRatings.length) setRatings((prevRatings) => [...prevRatings, ...newRatings]);
		else setLoadMore(false);
	}

	function changeBlur() {
		const value = Math.max(0, Math.floor(itemCount));
		setItemCount(value);
	}

	return (
		<div className="view_item_container">
			{!loading && (
				<>
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="left_container align-center">
						<p className="big-font-size bold ml-10">{item.itemName}</p>
						<img
							src={`/images/${item.itemImage}`}
							className="mt-10"
							width="60%"
							alt={item.itemName}
						/>
						<div className="show_rating mt-10">
							{item.ratingValue}
							<StarIcon className="violet" />
							<div className="ml-10">[{item.ratingCount}]</div>
						</div>

						{auth.isAuthenticated &&
							(item.shopkeeperId === auth.user._id ||
								[ROLE.ADMIN, ROLE.COADMIN].includes(auth.user.role)) && (
								<div className="buttons mt-10">
									<button className="btn btn-success" onClick={editItem}>
										Edit
									</button>
									<button className="btn btn-danger ml-10" onClick={deleteItem}>
										Delete
									</button>
								</div>
							)}

						{auth.isAuthenticated && item.shopkeeperId !== auth.user._id && (
							<FeedbackForm
								className="mt-50 mb-50"
								targetId={item._id}
								auth={auth}
								setError={setError}
								target={"ITEM"}
								onFeedbackChange={getItem}
							/>
						)}
					</div>

					<div className="right_container">
						<div className="flex flex-row ml-50 align-center">
							<p className="bold">Items : </p>
							<input
								type="number"
								className="ml-10"
								value={itemCount}
								min="1"
								onChange={(event) => setItemCount(event.target.value)}
								onBlur={changeBlur}
							/>
							<p className="ml-50 bold">Price : </p>
							<input type="text" value={itemCount * item.price} disabled={true} />
							<p className="bold">
								{item.isAvailable ? "Available" : "Not available"}
							</p>
						</div>
						<div className="flex flex-col ml-50 mt-20">
							<p className="big-font-size bold">Description</p>
							<p className="small-font-size">{item.description}</p>
						</div>
						<div className="flex flex-col ml-50 mt-20">
							<p className="big-font-size bold">By : </p>
							<p className="small-font-size">{item.shopkeeper.shopName}</p>
						</div>
						<div className="flex flex-row mt-20 align-center width100">
							<p className="bold ml-50">Total orders : </p>
							<input
								type="text"
								className="right"
								value={item.orderedCount}
								disabled={true}
							/>
							{auth.isAuthenticated && auth.user._id !== item.shopkeeperId && (
								<button
									className="btn btn-violet ml-auto mr-50"
									type="button"
									onClick={addToCart}
									disabled={!item.isAvailable}
								>
									Add to Cart
								</button>
							)}
						</div>

						<div className="flex flex-col mt-50 width100">
							<div className="ml-50">
								<p className="bold large-font-size">Ratings</p>
								{ratings.map((rating) => (
									<div key={rating._id} className="rating_box mt-10">
										<div className="pl-10 pt-10 pb-10">
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
				</>
			)}
		</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewItem);
