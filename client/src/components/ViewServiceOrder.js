import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import StarIcon from "@material-ui/icons/Star";

import Name from "./Name";
import ErrorText from "./ErrorText";
import ViewServiceBar from "./ViewServiceBar";
import { RESPONSE, STATUS } from "../enums";
import { Axios } from "../utilities";
import { setError } from "../redux/actions";

function ViewServiceOrder(props) {
	const { history, location, match, auth, error } = props;
	const { setError } = props;

	const serviceOrderId = match.params.serviceOrderId;
	const [OTP, setOTP] = useState("");
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

			const temp = res.data.serviceOrder;
			if (![temp.userId, temp.workerId, temp.shopkeeperId].includes(auth.user._id))
				history.goBack();
		}

		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	function parseSubCategoryNames(subCategories) {
		const names = subCategories.map((subCategory) => subCategory.name);
		return names.join(", ");
	}

	async function getOTP() {
		setError("");
		const res = await Axios.POST(`/otp/serviceOrder/${serviceOrderId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
	}

	async function verifyOTP() {
		setError("");
		const res = await Axios.PUT(`/otp/serviceOrder/${serviceOrderId}`, { OTP });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setServiceOrder((prev) => {
			const result = { ...prev };
			result.status = STATUS.BEING_SERVED;
			return result;
		});
	}

	async function replaceOrder() {
		setError("");
		const res = await Axios.POST(`/serviceOrder/${serviceOrderId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		history.push(`/viewServiceOrder/${res.data.id}`);
	}

	async function doneOrder() {
		setError("");
		const res = await Axios.PUT(`/serviceOrder/${serviceOrderId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setServiceOrder((prev) => {
			const result = { ...prev };
			result.status = STATUS.DELIVERED;
			result.deliveredDate = new Date().toISOString().substring(0, 10);
			return result;
		});
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

	function giveFeedback() {
		setError("");
		history.push(`/viewWorkerService/${workerService._id}`);
	}

	return (
		<div className="flex flex-col min-h80 btn-main">
			{!loading && (
				<>
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="flex flex-col width90 ml-auto mr-auto">
						<p className="bold large-font-size ml-10 mt-20">Service Order</p>

						<div
							className="flex flex-row btn-white br-10 mt-10 pl-10 pr-10 hover-pointer"
							style={{
								boxShadow: `rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px,
		rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px,
		rgba(0, 0, 0, 0.09) 0px 32px 16px`,
							}}
							onClick={() => history.push(`/viewWorkerService/${workerService._id}`)}
						>
							{serviceOrder.userId === auth.user._id && (
								<>
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
											description={service.description}
											subCategories={parseSubCategoryNames(
												serviceOrder.metaData
											)}
											price={serviceOrder.price}
											status={serviceOrder.status}
											className="p-10"
										/>
									</div>

									<div className="flex flex-col align-center width30 pt-10 pb-10 ml-auto mr-auto">
										<Name isVerified={worker.isVerified}>
											{workerUser.userName}
										</Name>
										<div className="flex flex-row align-center">
											<p>{workerService.ratingValue}</p>
											<StarIcon className="violet" />
											<p>[{workerService.ratingCount}]</p>
										</div>
										<p className="mt-auto small-font-size">
											Ordered : {workerService.orderedCount}
										</p>
									</div>
								</>
							)}

							{[serviceOrder.workerId, serviceOrder.shopkeeperId].includes(
								auth.user._id
							) && (
								<>
									<ViewServiceBar
										serviceName={service.serviceName}
										description={service.description}
										serviceCategory={serviceOrder.serviceCategory}
										subCategories={parseSubCategoryNames(serviceOrder.metaData)}
										price={serviceOrder.price}
										status={serviceOrder.status}
										className="p-10"
									/>
									<div className="mt-10 width30 ml-auto flex flex-col">
										<p className="big-font-size bold">{user.userName}</p>
										<p className="small-font-size">{user.phone}</p>
										<p className="small-font-size">
											{address.society}, {address.area}, {address.city},{" "}
											{address.state} - {address.pincode}
										</p>
									</div>
								</>
							)}
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
									<p>Delivered Date : {serviceOrder.deliveredDate}</p>
								)}
								<p>Status : {serviceOrder.status}</p>
							</div>
						</div>

						<div className="buttons mt-50 mb-50 ml-50">
							{serviceOrder.userId === auth.user._id && (
								<>
									<button className="btn btn-success" onClick={replaceOrder}>
										Replace Order
									</button>
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
									<button
										className="btn btn-violet ml-10 mr-auto"
										onClick={giveFeedback}
									>
										Give Feedback
									</button>
								</>
							)}

							{serviceOrder.workerId === auth.user._id && (
								<>
									{serviceOrder.status === STATUS.PENDING && (
										<button className="btn btn-success" onClick={getOTP}>
											Get OTP
										</button>
									)}
									{serviceOrder.status !== STATUS.DELIVERED && (
										<button
											className="btn btn-danger ml-10"
											onClick={cancelOrder}
											disabled={
												serviceOrder.status === STATUS.DELIVERED ||
												serviceOrder.status === STATUS.CANCELLED
											}
										>
											Cancel Order
										</button>
									)}

									{serviceOrder.status === STATUS.PENDING && (
										<div className="flex flex-row align-center white-bg-input ml-auto">
											<input
												type="text"
												className="ml-auto width40"
												placeholder="Enter OTP"
												value={OTP}
												onChange={(e) => setOTP(e.target.value)}
											/>
											<button
												className="btn btn-success ml-10"
												onClick={verifyOTP}
											>
												Verify OTP
											</button>
										</div>
									)}

									{serviceOrder.status === STATUS.BEING_SERVED && (
										<button
											className="btn btn-success ml-auto"
											onClick={doneOrder}
										>
											Done Order
										</button>
									)}
								</>
							)}

							{serviceOrder.shopkeeperId === auth.user._id && (
								<>
									{serviceOrder.status !== STATUS.DELIVERED && (
										<button
											className="btn btn-danger mr-auto"
											onClick={cancelOrder}
											disabled={
												serviceOrder.status === STATUS.DELIVERED ||
												serviceOrder.status === STATUS.CANCELLED
											}
										>
											Cancel Order
										</button>
									)}
								</>
							)}
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewServiceOrder);
