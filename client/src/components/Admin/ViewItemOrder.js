import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";

import Product from "../Product";
import ErrorText from "../ErrorText";
import { RESPONSE, ROLE, STATUS } from "../../enums";
import { Axios } from "../../utilities";
import { setError } from "../../redux/actions";

function ViewItemOrder(props) {
	const { history, location, match, auth, error } = props;
	const { setError } = props;

	const itemOrderId = match.params.itemOrderId;
	const [count, setCount] = useState(0);
	const [status, setStatus] = useState("");
	const [user, setUser] = useState(null);
	const [address, setAddress] = useState(null);
	const [itemOrder, setItemOrder] = useState(null);
	const [orderItemPacks, setOrderItemPacks] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getItemOrder();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getItemOrder() {
		if (!itemOrderId) history.goBack();
		const res = await Axios.GET(`/itemOrder/${itemOrderId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		if (!res.data.orderItemPacks.length) history.goBack();
		if (
			auth.user._id !== res.data.user._id &&
			auth.user._id !== res.data.orderItemPacks[0].shopkeeperId &&
			![ROLE.ADMIN, ROLE.COADMIN].includes(auth.user.role)
		)
			history.goBack();

		setUser(res.data.user);
		setAddress(res.data.address);
		setItemOrder(res.data.itemOrder);
		setOrderItemPacks(res.data.orderItemPacks);

		setCount(res.data.orderItemPacks.reduce((total, curr) => total + curr.count, 0));
		setStatus(
			res.data.orderItemPacks.reduce(
				(final, curr) => (curr.status !== STATUS.CANCELLED ? curr.status : final),
				STATUS.CANCELLED
			)
		);
		setLoading(false);
	}

	async function replaceOrder() {
		setError("");
		const res = await Axios.POST(`/itemOrder/${itemOrder._id}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		history.push(`/viewItemOrder/${res.data.id}`);
	}

	async function cancelOrderItemPack(orderItemPackId, index) {
		setError("");
		if (orderItemPacks[index].status === STATUS.CANCELLED) return;
		const res = await Axios.DELETE(`/itemOrder/${orderItemPackId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setOrderItemPacks((prev) => {
			const result = [...prev];
			result[index].status = STATUS.CANCELLED;
			setStatus(
				result.reduce(
					(final, curr) => (curr.status !== STATUS.CANCELLED ? curr.status : final),
					STATUS.CANCELLED
				)
			);
			return result;
		});
	}

	async function cancelOrderItemPacks() {
		setError("");
		await Promise.all(
			orderItemPacks.map((orderItemPack) => {
				if (orderItemPack.status === STATUS.CANCELLED) return;
				return Axios.DELETE(`/itemOrder/${orderItemPack._id}`);
			})
		);
		setOrderItemPacks((prev) => {
			const result = [...prev];
			result.forEach((val) => (val.status = STATUS.CANCELLED));
			return result;
		});
		setStatus(STATUS.CANCELLED);
	}

	async function changeOrderItemPacksStatus() {
		setError("");
		let value;
		if (status === STATUS.PENDING) value = STATUS.DISPATCHED;
		else if (status === STATUS.DISPATCHED) value = STATUS.DELIVERED;
		else return;

		await Promise.all(
			orderItemPacks.map((orderItemPack) => {
				if (orderItemPack.status !== STATUS.CANCELLED)
					return Axios.PUT(`/itemOrder/${orderItemPack._id}`, { status: value });
			})
		);
		setOrderItemPacks((prev) => {
			const result = [...prev];
			result.forEach((val) => {
				if (val.status === STATUS.CANCELLED) return;
				val.status = value;
			});
			return result;
		});
		setStatus(value);
	}

	return (
		<div className="flex flex-col min-h80 btn-main">
			{!loading && (
				<div className="flex flex-col width90 ml-auto mr-auto">
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<p className="bold large-font-size ml-10 mt-20">Items</p>

					<div className="items">
						{auth.user._id === user._id && (
							<div className="flex flex-row flex-wrap mt-20">
								{orderItemPacks.map((orderItemPack, index) => (
									<div
										key={orderItemPack._id}
										className="flex flex-col align-center ml-10 mr-10 justify-around height-fit"
										style={{ maxWidth: "18%" }}
									>
										<Product
											className="hover-pointer"
											shopName={orderItemPack.shopkeeper.shopName}
											item={{
												...orderItemPack.item,
												price: orderItemPack.price,
											}}
											onClick={() =>
												history.push(`/viewItem/${orderItemPack.item._id}`)
											}
										/>
										<div className="white btn-violet pl-10 pr-10 pt-5 pb-5">
											<p>Qty : {orderItemPack.count}</p>
										</div>
										<p>{orderItemPack.status}</p>
										<button
											className="btn btn-danger"
											disabled={orderItemPack.status !== STATUS.PENDING}
											onClick={() =>
												cancelOrderItemPack(orderItemPack._id, index)
											}
										>
											Cancel Order
										</button>
										{orderItemPack.status === STATUS.DELIVERED &&
											orderItemPack.deliveredDate}
									</div>
								))}
							</div>
						)}

						{auth.user._id !== user._id && (
							<div className="flex flex-row br-10 p-10 btn-white mt-20">
								<div className="flex flex-col width60">
									{orderItemPacks.map((orderItemPack, index) => (
										<div
											key={orderItemPack._id}
											className="flex flex-row p-5 align-center"
										>
											<p className="bold">
												{orderItemPack.item.itemName} [{orderItemPack.count}
												]
											</p>
											<ClearRoundedIcon
												className="danger hover-pointer"
												onClick={() =>
													cancelOrderItemPack(orderItemPack._id, index)
												}
											/>
											<p className="ml-20">{orderItemPack.status}</p>

											<p className="ml-auto">Price : {orderItemPack.price}</p>
										</div>
									))}
								</div>
								<div className="width40 flex flex-col align-center">
									<p className="big-font-size bold">{user.userName}</p>
									<p className="small-font-size">{user.phone}</p>
									<p className="small-font-size">
										{address.society}, {address.area}, {address.city},{" "}
										{address.state} - {address.pincode}
									</p>
								</div>
							</div>
						)}
					</div>

					<div className="flex flex-row mt-50 mb-50">
						{auth.user._id === user._id && (
							<div className="mt-auto">
								<button className="btn btn-success" onClick={replaceOrder}>
									Replace Order
								</button>
							</div>
						)}

						{auth.user._id !== user._id && (
							<div className="buttons mt-auto">
								<button
									className="btn btn-success"
									disabled={status === STATUS.CANCELLED}
									onClick={changeOrderItemPacksStatus}
								>
									{status === STATUS.PENDING ? "Dispatched" : "Delivered"}
								</button>
								<button
									className="btn btn-danger ml-10"
									disabled={
										status === STATUS.DELIVERED || status === STATUS.CANCELLED
									}
									onClick={cancelOrderItemPacks}
								>
									Cancel Order
								</button>
							</div>
						)}

						<div className="flex flex-col width40 ml-auto mt-auto text-right">
							<p className="bold big-font-size">Total Price : {itemOrder.price}</p>
							<p>Order ID : {itemOrder._id}</p>
							<p>Order Date : {itemOrder.placedDate}</p>
							<p>Total Qty : {count}</p>
						</div>
					</div>
				</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewItemOrder);
