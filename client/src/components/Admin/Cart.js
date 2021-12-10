import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";

import Product from "../Product";
import ErrorText from "../ErrorText";
import { setError } from "../../redux/actions";
import { RESPONSE, ROLE } from "../../enums";
import { Axios, coadminFirewall } from "../../utilities";

function Cart(props) {
	const { history, location, match, auth, error } = props;
	const { setError } = props;
	const userId = match.params.userId;

	const [count, setCount] = useState(0);
	const [price, setPrice] = useState(0);
	const [cartItemPacks, setCartItemPacks] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!userId) return history.goBack();
		coadminFirewall(auth, userId, history, setError, getCartItemPacks);
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getCartItemPacks() {
		const res = await Axios.GET(`/cart/${userId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		const array = res.data.cartItemPacks;
		setCartItemPacks(array || []);
		setCount(array.reduce((total, curr) => total + curr.count, 0));
		setPrice(array.reduce((total, curr) => total + curr.count * curr.item.price, 0));
		setLoading(false);
	}

	async function placeOrder() {
		setError("");
		const res = await Axios.POST(`/cart/placeOrder/${userId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		history.push(`/admin/viewItemOrder/${res.data.id}`);
	}

	async function clearCart() {
		setError("");
		const res = await Axios.DELETE(`/cart/${userId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setCartItemPacks([]);
	}

	function changeCount(event, index) {
		setError("");
		setCartItemPacks((prev) => {
			const res = [...prev];
			res[index].count = event.target.value;
			return res;
		});
	}

	function changeBlur(index) {
		setError("");
		const target = cartItemPacks[index];
		const value = Math.max(Math.floor(target.count), 0);
		changeCartItemPackCount(target._id, value);
		setCartItemPacks((prev) => {
			const res = [...prev];
			if (value === 0) res.splice(index, 1);
			else res[index].count = value;
			return res;
		});
	}

	function removeItem(index) {
		setError("");
		const target = cartItemPacks[index];
		changeCartItemPackCount(target._id, 0);
		setCartItemPacks((prev) => {
			const res = [...prev];
			res.splice(index, 1);
			return res;
		});
	}

	async function changeCartItemPackCount(id, value) {
		setError("");
		const res = await Axios.PUT(`/cart/${id}`, { value });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
	}

	return (
		<div className="flex flex-col min-h80 btn-main">
			{!loading && (
				<>
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="flex flex-col width90 ml-auto mr-auto mb-50 mt-20">
						<p className="bold large-font-size ml-20">Items</p>
						{cartItemPacks.length > 0 && (
							<>
								<div className="flex flex-row flex-wrap">
									{cartItemPacks.map((cartItemPack, index) => {
										const item = cartItemPack.item;
										return (
											<div
												key={cartItemPack._id}
												className="m-10"
												style={{ maxWidth: "18%", textAlign: "center" }}
											>
												<div className="flex flex-row">
													<div className="flex flex-col align-center">
														<Product
															className="hover-pointer"
															item={item}
															shopName={
																cartItemPack.shopkeeper.shopName
															}
															onClick={() =>
																history.push(
																	`/admin/viewItem/${item._id}`
																)
															}
														/>
														<div className="flex flex-row btn-violet white-input p-5 align-center">
															<label className="normal">Qty : </label>
															<input
																className="btn-violet"
																type="number"
																value={cartItemPack.count}
																color="white"
																onChange={(e) =>
																	changeCount(e, index)
																}
																onBlur={() => changeBlur(index)}
															/>
														</div>
													</div>
													<ClearRoundedIcon
														className="danger hover-pointer"
														onClick={() => removeItem(index)}
													/>
												</div>
											</div>
										);
									})}
								</div>

								<div className="flex flex-row align-center mt-50">
									<div className="buttons mr-auto">
										<button className="btn btn-success" onClick={placeOrder}>
											Place Order
										</button>
										<button
											className="btn btn-danger ml-10"
											onClick={clearCart}
										>
											Clear Cart
										</button>
									</div>
									<div className="flex flex-col ml-auto">
										<p>Total Quantity : {count}</p>
										<p>Total Price : {price}</p>
									</div>
								</div>
							</>
						)}
						{!cartItemPacks.length && (
							<p className="ml-auto mr-auto">No items in the cart</p>
						)}
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

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
