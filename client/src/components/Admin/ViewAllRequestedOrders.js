import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";

import Name from "../Name";
import ErrorText from "../ErrorText";
import Pagination from "../Pagination";
import ViewServiceBar from "../ViewServiceBar";
import { setError } from "../../redux/actions";
import { RESPONSE, ROLE, STATUS } from "../../enums";
import { Axios } from "../../utilities";

function ViewAllRequestedOrders(props) {
	const { history, location, match, error } = props;
	const { setError } = props;
	const userId = match.params.userId;

	const [tempUser, setTempUser] = useState(null);
	const [page, setPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId) return history.goBack();
		getUser();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getUser() {
		const res = await Axios.GET(`/user/${userId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setTempUser(res.data.user);
		getOrders(1, res.data.user);
	}

	async function getOrders(page, user = tempUser) {
		if (![ROLE.SHOPKEEPER, ROLE.WORKER].includes(user.role)) return history.goBack();

		const resource = user.role.toLowerCase();
		const res = await Axios.GET(`/${resource}/requestedOrders/${userId}`, { page });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setTotalItems(res.data.totalItems);
		setOrders(res.data.orders);
		setPage(page);
		setLoading(false);
	}

	function parseSubCategoryNames(subCategories) {
		if (!subCategories) return;
		let names = subCategories.map((subCategory) => subCategory.name);
		return names.join(", ");
	}

	async function cancelOrder(index) {
		setError("");
		const serviceOrderId = orders[index].serviceOrder._id;
		const res = await Axios.DELETE(`/serviceOrder/${serviceOrderId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setOrders((prev) => {
			const result = [...prev];
			result[index].serviceOrder.status = STATUS.CANCELLED;
			return result;
		});
	}

	async function cancelOrderItemPack(index, indexIn) {
		setError("");
		const orderItemPackId = orders[index].orderItemPacks[indexIn]._id;
		const res = await Axios.DELETE(`/itemOrder/${orderItemPackId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setOrders((prev) => {
			const result = [...prev];
			result[index].orderItemPacks[indexIn].status = STATUS.CANCELLED;
			return result;
		});
	}

	async function cancelOrderItemPacks(index) {
		setError("");
		await Promise.all(
			orders[index].orderItemPacks.map((orderItemPack) => {
				if (orderItemPack.status !== STATUS.CANCELLED)
					return Axios.DELETE(`/itemOrder/${orderItemPack._id}`);
			})
		);
		setOrders((prev) => {
			const result = [...prev];
			result[index].orderItemPacks.map(
				(orderItemPack) => (orderItemPack.status = STATUS.CANCELLED)
			);
			return result;
		});
	}

	function getStatus(index) {
		let status = STATUS.CANCELLED;
		orders[index].orderItemPacks.forEach((orderItemPack) => {
			if (orderItemPack.status !== STATUS.CANCELLED) status = orderItemPack.status;
		});
		return status;
	}

	async function changeOrderItemPacksStatus(index, status) {
		setError("");
		await Promise.all(
			orders[index].orderItemPacks.map((orderItemPack) => {
				if (orderItemPack.status !== STATUS.CANCELLED)
					return Axios.PUT(`/itemOrder/${orderItemPack._id}`, { status });
			})
		);

		setOrders((prev) => {
			const result = [...prev];
			result[index].orderItemPacks.forEach((orderItemPack) => {
				if (orderItemPack.status !== STATUS.CANCELLED) orderItemPack.status = status;
			});
			return result;
		});
	}

	function netPrice(index) {
		let netPrice = 0;
		orders[index].orderItemPacks.map((orderItemPack) => (netPrice += orderItemPack.price));
		return netPrice;
	}

	function getDeliveredDate(index) {
		let date;
		orders[index].orderItemPacks.map((orderItemPack) => {
			if (orderItemPack.deliveredDate) date = orderItemPack.deliveredDate;
		});
		return date;
	}

	async function pushToWorkerService(index) {
		setError("");
		const workerId = orders[index].serviceOrder.workerId;
		const serviceId = orders[index].serviceOrder.serviceId;
		const res = await Axios.GET(`/service/onlyWorkerService`, {
			workerId,
			serviceId,
		});
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		history.push(`/viewWorkerService/${res.data.workerService._id}`);
	}

	return (
		<div className="min-h80 btn-main">
			{!loading && (
				<>
					<div className="flex flex-col width90 ml-auto mr-auto pt-10">
						{error.error && <ErrorText>{error.error}</ErrorText>}
						<p className="bold large-font-size mt-10 mb-20">Orders</p>
						{orders.length > 0 &&
							orders.map((order, index) => {
								let serviceOrder = null,
									itemOrder = null;
								if ("itemOrder" in order) itemOrder = order;
								else serviceOrder = order;

								return (
									<div key={index}>
										{serviceOrder && (
											<div className="flex flex-row btn-light mb-10 p-10 br-10 shadow">
												<ViewServiceBar
													serviceName={serviceOrder.service.serviceName}
													serviceCategory={
														serviceOrder.serviceOrder.serviceCategory
													}
													subCategories={parseSubCategoryNames(
														serviceOrder.serviceOrder.metaData
													)}
													price={serviceOrder.serviceOrder.price}
													status={serviceOrder.serviceOrder.status}
													onNameClick={() => pushToWorkerService(index)}
													className="width40"
												/>

												<div className="width20 ml-50 flex flex-col">
													<p className="big-font-size bold">
														{serviceOrder.user.userName}
													</p>
													<p className="small-font-size">
														{serviceOrder.user.phone}
													</p>
													<p className="small-font-size">
														{serviceOrder.address.society},{" "}
														{serviceOrder.address.area},{" "}
														{serviceOrder.address.city},{" "}
														{serviceOrder.address.state} -{" "}
														{serviceOrder.address.pincode}
													</p>
												</div>

												{tempUser.role === ROLE.SHOPKEEPER && (
													<div className="width20 ml-50 flex flex-col">
														Worker :{" "}
														<Name
															className="big-font-size bold"
															isVerified={
																serviceOrder.worker.isVerified
															}
														>
															{serviceOrder.workerUser.userName}
														</Name>
														<p className="small-font-size">
															{serviceOrder.workerUser.phone}
														</p>
													</div>
												)}

												<div className="flex flex-col ml-auto">
													<button
														className="btn btn-success"
														onClick={() =>
															history.push(
																`/admin/viewServiceOrder/${serviceOrder.serviceOrder._id}`
															)
														}
													>
														View Order
													</button>
													<button
														className="btn btn-danger mt-10"
														disabled={[
															STATUS.DELIVERED,
															STATUS.CANCELLED,
														].includes(
															serviceOrder.serviceOrder.status
														)}
														onClick={() => cancelOrder(index)}
													>
														Cancel Order
													</button>
												</div>
											</div>
										)}

										{itemOrder && (
											<div className="flex flex-row btn-light br-10 mb-10 p-10 shadow">
												<div className="flex flex-col width40">
													{itemOrder.orderItemPacks.map(
														(orderItemPack, indexIn) => (
															<div
																key={indexIn}
																className="flex flex-row mb-10"
															>
																<div className="flex flex-col">
																	<div className="flex flex-row">
																		<p
																			className="bold hover-pointer"
																			onClick={() =>
																				history.push(
																					`/viewItem/${orderItemPack.item._id}`
																				)
																			}
																		>
																			{
																				orderItemPack.item
																					.itemName
																			}
																		</p>
																		<p className="ml-5">
																			[{orderItemPack.count}]
																		</p>
																	</div>

																	<p>
																		Status :{" "}
																		{orderItemPack.status}
																	</p>
																</div>

																<div
																	hidden={[
																		STATUS.DELIVERED,
																		STATUS.CANCELLED,
																	].includes(
																		orderItemPack.status
																	)}
																>
																	<ClearRoundedIcon
																		className="danger ml-20 hover-pointer"
																		onClick={() =>
																			cancelOrderItemPack(
																				index,
																				indexIn
																			)
																		}
																	/>
																</div>
																<p className="ml-auto">
																	Price : {orderItemPack.price}
																</p>
															</div>
														)
													)}
													<div className="flex flex-row mt-auto">
														<div className="flex flex-col">
															<p>
																Placed Date :{" "}
																{itemOrder.itemOrder.placedDate}
															</p>
															{getStatus(index) ===
																STATUS.DELIVERED && (
																<p>
																	Delivered Date :{" "}
																	{getDeliveredDate(index)}
																</p>
															)}
														</div>
														<p className="ml-auto">
															Net Price : {netPrice(index)}
														</p>
													</div>
												</div>

												<div className="width20 ml-50 flex flex-col">
													<p className="big-font-size bold">
														{itemOrder.user.userName}
													</p>
													<p className="small-font-size">
														{itemOrder.user.phone}
													</p>
													<p className="small-font-size">
														{itemOrder.address.society},{" "}
														{itemOrder.address.area},{" "}
														{itemOrder.address.city},{" "}
														{itemOrder.address.state} -{" "}
														{itemOrder.address.pincode}
													</p>
												</div>

												<div className="flex flex-col ml-auto">
													{getStatus(index) === STATUS.PENDING && (
														<button
															className="btn btn-success"
															disabled={
																[
																	STATUS.CANCELLED,
																	STATUS.DELIVERED,
																].includes(getStatus(index))
																	? true
																	: false
															}
															onClick={() =>
																changeOrderItemPacksStatus(
																	index,
																	STATUS.DISPATCHED
																)
															}
														>
															Dispatched Order
														</button>
													)}
													{getStatus(index) !== STATUS.PENDING && (
														<button
															className="btn btn-success"
															disabled={
																[
																	STATUS.CANCELLED,
																	STATUS.DELIVERED,
																].includes(getStatus(index))
																	? true
																	: false
															}
															onClick={() =>
																changeOrderItemPacksStatus(
																	index,
																	STATUS.DELIVERED
																)
															}
														>
															Delivered Order
														</button>
													)}
													<button
														className="btn btn-danger mt-10"
														disabled={
															[
																STATUS.CANCELLED,
																STATUS.DELIVERED,
															].includes(getStatus(index))
																? true
																: false
														}
														onClick={() => cancelOrderItemPacks(index)}
													>
														Cancel Order
													</button>
												</div>
											</div>
										)}
									</div>
								);
							})}

						{orders.length > 0 ? (
							<Pagination
								itemsPerPage="10"
								totalItems={totalItems}
								currentPage={page}
								onPageChange={getOrders}
								cut={3}
								className="mt-20 mb-50"
							/>
						) : (
							<p className="ml-auto mr-auto mt-50">No orders found</p>
						)}
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewAllRequestedOrders);
