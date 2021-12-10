import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";

import Name from "../Name";
import ErrorText from "../ErrorText";
import Pagination from "../Pagination";
import { RESPONSE } from "../../enums";
import { setError } from "../../redux/actions";
import { Axios } from "../../utilities";

function Admin(props) {
	const { history, error, location } = props;
	const { setError } = props;

	const [page, setPage] = useState(1);
	const [count, setCount] = useState(0);
	const [search, setSearch] = useState("");
	const [tempSearch, setTempSearch] = useState("");
	const [searchBy, setSearchBy] = useState("phone");
	const [searchFor, setSearchFor] = useState("user");
	const [verification, setVerification] = useState("any");
	const [users, setUsers] = useState([]);
	const [totalUsers, setTotalUsers] = useState(0);
	const [totalWorkers, setTotalWorkers] = useState(0);
	const [totalItemOrders, setTotalItemOrders] = useState(0);
	const [totalShopkeepers, setTotalShopkeepers] = useState(0);
	const [totalServiceOrders, setTotalServiceOrders] = useState(0);

	useEffect(() => {
		getInitialData();
	}, [location.pathname]);

	async function getInitialData() {
		const res = await Axios.GET(`/admin`);
		setTotalUsers(res.data.totalUsers);
		setTotalWorkers(res.data.totalWorkers);
		setTotalItemOrders(res.data.totalItemOrders);
		setTotalShopkeepers(res.data.totalShopkeepers);
		setTotalServiceOrders(res.data.totalServiceOrders);
	}

	async function getUsers(search, searchBy, searchFor, verification, page) {
		setError("");
		const res = await Axios.GET(`/admin/users`, {
			search,
			searchBy,
			searchFor,
			verification,
			page,
		});
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setPage(page);
		setUsers(res.data.users);
		setCount(res.data.totalItems);
	}

	function onPageChange(curr_page) {
		getUsers(search, searchBy, searchFor, verification, curr_page);
	}

	async function searchUser(event) {
		event.preventDefault();
		if (!tempSearch) return;
		setSearch(tempSearch);
		setPage(1);
		getUsers(tempSearch, searchBy, searchFor, verification, 1);
	}

	function changeSearchBy(value) {
		setError("");
		if (searchBy === value) return;
		setSearchBy(value);
	}

	function changeSearchFor(value) {
		setError("");
		if (searchFor === value) return;
		setSearchFor(value);
		if (value === "user") changeVerification("any");
	}

	function changeVerification(value) {
		setError("");
		if (verification === value) return;
		setVerification(value);
	}

	function viewProfile(index) {
		setError("");
		history.push(`/admin/viewProfile/${users[index]._id}`);
	}

	async function verifyUser(index) {
		setError("");
		const res = await Axios.PUT(`/admin/verify`, { userId: users[index]._id });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setUsers((prev) => {
			const result = [...prev];
			if (result[index].worker) result[index].worker.isVerified = true;
			else if (result[index].shopkeeper) result[index].shopkeeper.isVerified = true;
			return result;
		});
	}

	return (
		<div className="flex flex-col min-h80 btn-main">
			<div className="flex flex-col width90 ml-auto mr-auto mt-20">
				{error.error && <ErrorText>{error.error}</ErrorText>}
				<div className="flex flex-row">
					<div className="flex flex-col">
						<p className="bold large-font-size">Admin</p>
						<div
							className="flex flex-row btn-white ml-auto p-20 mt-20"
							style={{
								boxShadow: `rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px,
		rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px,
		rgba(0, 0, 0, 0.09) 0px 32px 16px`,
							}}
						>
							<div className="flex flex-col">
								<p>Total Users</p>
								<p>Total Workers</p>
								<p>Total Shopkeepers</p>
								<p>Total Item Orders</p>
								<p>Total Service Orders</p>
							</div>

							<div className="flex flex-col ml-20">
								<p>: {totalUsers}</p>
								<p>: {totalWorkers}</p>
								<p>: {totalShopkeepers}</p>
								<p>: {totalItemOrders}</p>
								<p>: {totalServiceOrders}</p>
							</div>
						</div>
					</div>

					<div className="flex flex-col width60 ml-auto">
						<form
							className="flex flex-row align-center width80 ml-auto"
							onSubmit={searchUser}
						>
							<input
								type="text"
								placeholder={`Enter ${searchBy} ...`}
								value={tempSearch}
								onChange={(e) => setTempSearch(e.target.value)}
								style={{
									backgroundColor: "white",
									paddingLeft: "10px",
									width: "40%",
									fontSize: "0.9rem",
								}}
								className="ml-auto"
							/>

							<SearchRoundedIcon
								className="ml-10 hover-pointer"
								onClick={searchUser}
							/>
						</form>

						<div className="buttons ml-auto mt-10 mr-50">
							<p>Search By : </p>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchBy === "phone" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchBy("phone")}
							>
								Phone
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchBy === "pincode" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchBy("pincode")}
							>
								Pincode
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchBy === "name" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchBy("name")}
							>
								User Name
							</button>
						</div>

						<div className="buttons ml-auto mt-10 mr-50">
							<p>Search For : </p>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchFor === "user" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchFor("user")}
							>
								User
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchFor === "worker" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchFor("worker")}
							>
								Worker
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchFor === "shopkeeper" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchFor("shopkeeper")}
							>
								Shopkeeper
							</button>
						</div>

						<div className="buttons ml-auto mt-10 mr-50">
							<p>Verification : </p>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									verification === "any" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeVerification("any")}
							>
								Any
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									verification === "verified" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeVerification("verified")}
								hidden={searchFor === "user"}
							>
								Only Verified
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									verification === "nonVerified"
										? "btn-violet white"
										: "btn-white"
								}`}
								onClick={() => changeVerification("nonVerified")}
								hidden={searchFor === "user"}
							>
								Only Non Verified
							</button>
						</div>
					</div>
				</div>

				<div className="flex flex-row flex-wrap mt-50">
					{users &&
						users.length > 0 &&
						users.map((value, index) => {
							const { user, address, worker, shopkeeper, shopkeeperUser } = value;
							return (
								<div
									key={index}
									className="flex flex-row btn-white br-10 width30 ml-auto mr-auto p-10 shadow height-fit mt-10"
								>
									<div className="flex flex-col">
										<Name
											isVerified={
												(worker && worker.isVerified) ||
												(shopkeeper && shopkeeper.isVerified)
											}
											className="bold"
										>
											{user.userName}
										</Name>
										{worker && worker.isDependent === "true" && (
											<div className="flex flex-row small-font-size">
												<p>Shopkeeper : </p>
												<Name>
													{shopkeeperUser && shopkeeperUser.userName}
												</Name>
											</div>
										)}
										{user && <p>{user.phone}</p>}
										{address && (
											<p>
												{address.society}, {address.area}, {address.city},{" "}
												{address.state} - {address.pincode}
											</p>
										)}
									</div>

									<div className="flex flex-col ml-auto justify-between">
										<button
											className="btn btn-success"
											onClick={() => viewProfile(index)}
										>
											View Profile
										</button>
										{(worker || shopkeeper) && (
											<button
												disabled={
													(worker && worker.isVerified) ||
													(shopkeeper && shopkeeper.isVerified)
												}
												className="btn btn-success mt-5"
												onClick={() => verifyUser(index)}
											>
												Verified
											</button>
										)}
									</div>
								</div>
							);
						})}
				</div>

				{users.length > 0 && (
					<Pagination
						itemsPerPage="12"
						totalItems={count}
						currentPage={page}
						onPageChange={onPageChange}
						cut={3}
						className="mt-20 mb-50"
					/>
				)}
			</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
