import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import StarIcon from "@material-ui/icons/Star";

import Name from "../Name";
import ErrorText from "../ErrorText";
import ViewServiceBar from "../ViewServiceBar";
import { RESPONSE, STATUS } from "../../enums";
import { Axios } from "../../utilities";
import { setError } from "../../redux/actions";

function ViewServiceOrder(props) {
	const { history, location, match, error } = props;
	const { setError } = props;

	const serviceOrderId = match.params.serviceOrderId;
	const [user, setUser] = useState(null);
	const [address, setAddress] = useState(null);
	const [workerUser, setWorkerUser] = useState(null);
	const [worker, setWorker] = useState(null);
	const [service, setService] = useState(null);
	const [serviceOrder, setServiceOrder] = useState(null);
	const [workerService, setWorkerService] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getServiceOrder();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getServiceOrder() {
		if (!serviceOrderId) return history.goBack();

		const res = await Axios.GET(`/serviceOrder/${serviceOrderId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setUser(res.data.user);
		setAddress(res.data.address);
		setWorkerUser(res.data.workerUser);
		setWorker(res.data.worker);
		setService(res.data.service);
		setServiceOrder(res.data.serviceOrder);
		setWorkerService(res.data.workerService);
		setLoading(false);
	}

	function parseSubCategoryNames(subCategories) {
		const names = subCategories.map((subCategory) => subCategory.name);
		return names.join(", ");
	}

	async function cancelOrder() {
		setError("");
		const res = await Axios.DELETE(`/serviceOrder/${serviceOrderId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setServiceOrder((prev) => {
			const result = { ...prev };
			result.status = STATUS.CANCELLED;
			return result;
		});
	}

	return (
		<div className="flex flex-col min-h80 btn-main">
			{!loading && (
				<>
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="flex flex-col width90 ml-auto mr-auto">
						<p className="bold large-font-size ml-10 mt-20">Service Order</p>

						<div
							className="flex flex-row btn-white br-10 mt-10 pl-10 pr-10"
							style={{
								boxShadow: `rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px,
		rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px,
		rgba(0, 0, 0, 0.09) 0px 32px 16px`,
							}}
						>
							<div className="flex flex-row width70">
								<div className="flex">
									<img
										src={`/images/${worker.profilePicture}`}
										alt={workerUser.userName}
										height="150px"
										className="ml-auto mr-auto pt-10 pb-10"
									/>
								</div>

								<ViewServiceBar
									serviceName={service.serviceName}
									serviceCategory={serviceOrder.serviceCategory}
									subCategories={parseSubCategoryNames(serviceOrder.metaData)}
									price={serviceOrder.price}
									status={serviceOrder.status}
									onNameClick={() =>
										history.push(`/viewWorkerService/${workerService._id}`)
									}
									className="p-10"
								/>
							</div>

							<div className="flex flex-col align-center width30 pt-10 pb-10 ml-auto mr-auto">
								<Name isVerified={worker.isVerified}>{workerUser.userName}</Name>
								<div className="flex flex-row align-center">
									<p>{workerService.ratingValue}</p>
									<StarIcon className="violet" />
									<p>[{workerService.ratingCount}]</p>
								</div>
								<p className="mt-auto small-font-size">
									Ordered : {workerService.orderedCount}
								</p>
							</div>

							<div className="mt-10 width30 ml-20 flex flex-col">
								<p className="big-font-size bold">{user.userName}</p>
								<p className="small-font-size">{user.phone}</p>
								<p className="small-font-size">
									{address.society}, {address.area}, {address.city},{" "}
									{address.state} - {address.pincode}
								</p>
							</div>
						</div>

						<div className="flex flex-row mt-50">
							<div className="flex flex-col width40 btn-light br-10 p-10">
								{serviceOrder.metaData.map((subCategory, index) => (
									<div key={index} className="flex flex-row align-center">
										<p className="small-font-size">{subCategory.name}</p>
										<div className="flex flex-row ml-auto mt-5">
											{subCategory.sqFt && (
												<div className="form-control-3 flex flex-row align-center ml-5">
													<input
														type="text"
														disabled
														value={subCategory.sqFt}
														className="ml-auto"
													/>
													<p className="ml-5 small-font-size mr-10">
														SqFt
													</p>
												</div>
											)}
											{!subCategory.sqFt && (
												<div className="form-control-3 flex flex-row align-center ml-5">
													<input
														type="text"
														disabled
														value={subCategory.qty}
														className="ml-auto"
													/>
													<p className="ml-5 small-font-size mr-10">
														Qty
													</p>
												</div>
											)}
											<div className="form-control-3 flex flex-row align-center">
												<input
													type="text"
													disabled
													value={subCategory.price}
													className="ml-auto"
												/>
												<p className="normal small-font-size ml-5">Price</p>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className="flex flex-col width40 ml-auto mt-auto text-right">
								<p className="bold big-font-size">
									Total Price : {serviceOrder.price}
								</p>
								<p>Order ID : {serviceOrder._id}</p>
								<p>Order Date : {serviceOrder.placedDate}</p>
								{serviceOrder.deliveredDate && (
									<p>Delivered Date : {serviceOrder.placedDate}</p>
								)}
								<p>Status : {serviceOrder.status}</p>
							</div>
						</div>

						<div className="buttons mt-50 mb-50 ml-50">
							<button
								className="btn btn-danger ml-10"
								disabled={
									serviceOrder.status === STATUS.DELIVERED ||
									serviceOrder.status === STATUS.CANCELLED
								}
								onClick={cancelOrder}
							>
								Cancel Order
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		error: state.error,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewServiceOrder);
