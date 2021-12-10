import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import Name from "../Name";
import ErrorText from "../ErrorText";
import ViewItemBar from "../ViewItemBar";
import ViewServiceBar from "../ViewServiceBar";
import { setError } from "../../redux/actions";
import { Axios, coadminFirewall } from "../../utilities";
import { RESPONSE, ROLE } from "../../enums";

function ViewProfile(props) {
	const { history, match, auth, location, error } = props;
	const { setError } = props;
	const userId = match.params.userId;

	const [user, setUser] = useState(null);
	const [address, setAddress] = useState(null);
	const [worker, setWorker] = useState(null);
	const [workerShopkeeper, setWorkerShopkeeper] = useState(null);
	const [shopkeeper, setShopkeeper] = useState(null);
	const [itemOrders, setItemOrders] = useState([]);
	const [serviceOrders, setServiceOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId) return history.goBack();
		coadminFirewall(auth, userId, history, setError, getUserWithOrders);
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getUserWithOrders() {
		let res = await Axios.GET(`/user/${userId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		const tempUser = res.data.user;
		if (tempUser.role === ROLE.WORKER) {
			res = await Axios.GET(`/worker/withOrders/${tempUser._id}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else {
				setUser(res.data.workerUser);
				setAddress(res.data.address);
				setWorker(res.data.worker);
				setItemOrders(res.data.itemOrders);
				setServiceOrders(res.data.serviceOrders);
				if (res.data.worker.isDependent === "true")
					setWorkerShopkeeper(res.data.shopkeeperUser);
				setLoading(false);
			}
		} else if (tempUser.role === ROLE.SHOPKEEPER) {
			res = await Axios.GET(`/shopkeeper/withOrders/${tempUser._id}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else {
				setUser(res.data.shopkeeperUser);
				setAddress(res.data.address);
				setShopkeeper(res.data.shopkeeper);
				setItemOrders(res.data.itemOrders);
				setServiceOrders(res.data.serviceOrders);
				setLoading(false);
			}
		} else {
			res = await Axios.GET(`/user/withOrders/${tempUser._id}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else {
				setUser(res.data.user);
				setAddress(res.data.address);
				setItemOrders(res.data.itemOrders);
				setServiceOrders(res.data.serviceOrders);
				setLoading(false);
			}
		}
	}

	function editProfile() {
		setError("");
		history.push(`/admin/updateProfile/${userId}`);
	}

	async function deleteProfile() {
		setError("");
		if (user.role === ROLE.WORKER) {
			const res = await Axios.DELETE(`/worker/${userId}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else history.goBack();
		} else if (user.role === ROLE.SHOPKEEPER) {
			const res = await Axios.DELETE(`/shopkeeper/${userId}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else history.goBack();
		} else {
			const res = await Axios.DELETE(`/user/${userId}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else history.goBack();
		}
	}

	async function leaveShop() {
		setError("");
		const res = await Axios.DELETE(`/worker/leaveShop/${userId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setWorker((prevWorker) => {
			const newWorker = { ...prevWorker };
			newWorker.shopkeeperId = null;
			newWorker.isDependent = "false";
			return newWorker;
		});
		setWorkerShopkeeper(null);
	}

	async function verifyUser() {
		setError("");
		const res = await Axios.PUT(`/admin/verify`, { userId: user._id });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		if (worker) setWorker((prev) => ({ ...prev, isVerified: true }));
		else if (shopkeeper) setShopkeeper((prev) => ({ ...prev, isVerified: true }));
	}

	function addItem() {
		setError("");
		history.push(`/admin/addItem/${userId}`);
	}

	function addService() {
		setError("");
		history.push(`/admin/addService/${userId}`);
	}

	function viewCart() {
		setError("");
		history.push(`/admin/cart/${userId}`);
	}

	function parseSubCategoryNames(subCategories) {
		let names = subCategories.map((subCategory) => subCategory.name);
		return names.join(", ");
	}

	async function toggleCoadmin() {
		setError("");
		const res = await Axios.PUT(`/admin/toggleCoadmin`, { userId });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setUser((prev) => {
			const result = { ...prev };
			result.role = res.data.role;
			return result;
		});
	}

	return (
		<div className="flex flex-col btn-main min-h80">
			{!loading && (
				<>
					{error.error && (
						<ErrorText className="ml-auto mr-auto">{error.error}</ErrorText>
					)}
					<div className="flex flex-row">
						<div className="flex flex-col width40">
							<div className="flex flex-row width90 m-auto">
								<div>
									<Name
										className="mt-50 bold large-font-size"
										isVerified={
											(worker && worker.isVerified) ||
											(shopkeeper && shopkeeper.isVerified)
										}
									>
										{user && user.userName}
									</Name>
									<p>Role : {user && user.role}</p>
									{shopkeeper && <p>Shop : {shopkeeper.shopName}</p>}
									<p>{user && user.phone}</p>
									{address && (
										<p>
											{address.society}, {address.area}, {address.city},{" "}
											{address.state} - {address.pincode}
										</p>
									)}
									{worker && (
										<div className="flex flex-row mt-5">
											<p>Preferred Locations : {worker.pincodes}</p>
										</div>
									)}
									{worker &&
										worker.isDependent === "true" &&
										workerShopkeeper && (
											<p className="mt-10">
												Shopkeeper : {workerShopkeeper.userName}
											</p>
										)}
								</div>

								{worker && (
									<img
										src={`/images/${worker.profilePicture}`}
										className="mt-50 ml-auto"
										height="160px"
										alt="profile picture"
									/>
								)}
							</div>
							<div className="buttons mr-auto ml-20 pt-20">
								<button className="btn btn-success" onClick={editProfile}>
									Edit
								</button>
								<button className="btn btn-danger ml-10" onClick={deleteProfile}>
									Delete
								</button>
								<button className="btn btn-success ml-10" onClick={viewCart}>
									Cart
								</button>
								{(shopkeeper || worker) && (
									<button
										className="btn btn-success ml-10"
										onClick={verifyUser}
										disabled={
											(shopkeeper && shopkeeper.isVerified) ||
											(worker && worker.isVerified)
										}
									>
										Verified
									</button>
								)}
								{worker && worker.isDependent === "true" && (
									<button className="btn btn-violet ml-10" onClick={leaveShop}>
										Leave Shop
									</button>
								)}
								{auth.user.role === ROLE.ADMIN && (
									<button
										className={`btn ml-10 ${
											user.role === ROLE.COADMIN
												? "btn-danger"
												: "btn-success"
										}`}
										hidden={user.role === ROLE.ADMIN}
										onClick={toggleCoadmin}
									>
										{user.role === ROLE.COADMIN
											? "Remove Coadmin"
											: "Add Coadmin"}
									</button>
								)}
							</div>
						</div>

						<div className="width60">
							<div className="flex flex-col width90 m-auto">
								<div className="flex flex-row">
									{worker &&
										worker.proofs.map((proof) => (
											<img
												key={proof}
												className="mt-10 mr-10"
												src={`/images/${proof}`}
												height="200px"
												alt="Proof"
											></img>
										))}
									{shopkeeper &&
										shopkeeper.proofs.map((proof) => (
											<img
												key={proof}
												className="mt-10 mr-10"
												src={`/images/${proof}`}
												height="200px"
												alt="Proof"
											></img>
										))}
								</div>
								<div className="flex flex-row mt-20 ml-10">
									{shopkeeper && (
										<button
											className="btn btn-violet"
											onClick={() =>
												history.push(`/admin/viewAllItems/${userId}`)
											}
										>
											Items
										</button>
									)}
									{(shopkeeper || (worker && worker.isDependent !== "true")) && (
										<button
											className="btn btn-violet ml-10"
											onClick={() =>
												history.push(`/admin/viewAllServices/${userId}`)
											}
										>
											Services
										</button>
									)}
									{shopkeeper && (
										<button
											className="btn btn-violet ml-10"
											onClick={() =>
												history.push(`/admin/viewAllWorkers/${userId}`)
											}
										>
											Workers
										</button>
									)}

									{(shopkeeper || worker) && (
										<button
											className="btn btn-violet ml-10"
											onClick={() =>
												history.push(
													`/admin/viewAllRequestedOrders/${userId}`
												)
											}
										>
											Requested Orders
										</button>
									)}

									{(shopkeeper || (worker && worker.isDependent !== "true")) && (
										<button
											className="btn btn-violet ml-auto"
											onClick={addService}
										>
											Add Service
										</button>
									)}

									{shopkeeper && (
										<button className="btn btn-violet ml-10" onClick={addItem}>
											Add Item
										</button>
									)}
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-row mt-20 btn-light flex-grow pb-50">
						<div className="flex flex-col width50 mt-20">
							<p className="ml-auto mr-auto">Previous Services Orders</p>
							{serviceOrders.map((serviceOrder) => (
								<ViewServiceBar
									key={serviceOrder.serviceOrder._id}
									serviceName={serviceOrder.service.serviceName}
									serviceCategory={serviceOrder.service.serviceCategory}
									subCategories={parseSubCategoryNames(
										serviceOrder.service.subCategories
									)}
									price={serviceOrder.serviceOrder.price}
									workerName={serviceOrder.workerUser.userName}
									status={serviceOrder.serviceOrder.status}
									className="mt-10 mb-10 btn-main hover-pointer p-10 ml-20 mr-20 shadow"
									onClick={() =>
										history.push(
											`/admin/viewServiceOrder/${serviceOrder.serviceOrder._id}`
										)
									}
								/>
							))}
						</div>
						<div className="flex flex-col width50 mt-20">
							<p className="ml-auto mr-auto">Previous Cleaning Items Orders</p>
							{itemOrders.map((itemOrder) => (
								<ViewItemBar
									key={itemOrder.itemOrder._id}
									orderItemPacks={itemOrder.orderItemPacks}
									className="mt-10 btn-main hover-pointer shadow"
									onClick={() =>
										history.push(
											`/admin/viewItemOrder/${itemOrder.itemOrder._id}`
										)
									}
								/>
							))}
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewProfile);
