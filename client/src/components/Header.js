import React, { useState, useEffect } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";

import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import { RESPONSE, ROLE } from "../enums";
import { Axios, scrollToBottom } from "../utilities";
import { setError } from "../redux/actions";

function Header(props) {
	const { history, auth, location } = props;
	const [request, setRequest] = useState(null);
	const [notificationBar, setNotificationBar] = useState(false);

	useEffect(() => {
		if (auth.isAuthenticated) document.title = `Clean Out (${auth.user.role})`;
		else document.title = "Clean Out";
	}, [auth.isAuthenticated, location.pathname]);

	function handleClick(event) {
		history.push(`/${event.target.name}`);
	}

	async function toggleBar() {
		if (notificationBar) setNotificationBar(false);
		else {
			const res = await Axios.GET(`/worker/shopkeeperRequest/${auth.user._id}`);
			if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
			setRequest(res.data.request);
			setNotificationBar(true);
		}
	}

	async function acceptRequest() {
		const res = await Axios.POST(`/worker/shopkeeperResponse/${auth.user._id}`, {
			response: true,
		});
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setNotificationBar(false);
	}

	async function rejectRequest() {
		const res = await Axios.POST(`/worker/shopkeeperResponse/${auth.user._id}`, {
			response: false,
		});
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setNotificationBar(false);
	}

	return (
		<div className="header_container">
			<div className="flex flex-row">
				<span className="logo">Clean Out</span>
				<ul className="flex flex-row li-mr-20 align-center">
					<li>
						<button name="" className="white btn-black" onClick={handleClick}>
							HOME
						</button>
					</li>
					<li>
						<button className="white btn-black" onClick={scrollToBottom}>
							CONTACT
						</button>
					</li>
					{auth.isAuthenticated &&
						[ROLE.SHOPKEEPER, ROLE.WORKER].includes(auth.user.role) && (
							<li>
								<button
									name="viewAllRequestedOrders"
									className="white btn-black"
									onClick={handleClick}
								>
									REQUESTED ORDERS
								</button>
							</li>
						)}

					{auth.isAuthenticated && [ROLE.ADMIN, ROLE.COADMIN].includes(auth.user.role) && (
						<li>
							<button name="admin" className="white btn-black" onClick={handleClick}>
								ADMIN
							</button>
						</li>
					)}

					{auth.isAuthenticated && auth.user.role === ROLE.ADMIN && (
						<li>
							<Link to="/admin/serviceCategories" className="white btn-black">
								SERVICE CATEGORIES
							</Link>
						</li>
					)}
				</ul>
			</div>

			<div className="flex flex-row">
				<ul className="flex flex-row li-mr-20 align-center">
					{!auth.isAuthenticated && location.pathname !== "/login" && (
						<li>
							<button name="login" className="white btn-black" onClick={handleClick}>
								LOGIN
							</button>
						</li>
					)}
					{auth.isAuthenticated && (
						<li>
							<button name="logout" className="white btn-black" onClick={handleClick}>
								LOGOUT
							</button>
						</li>
					)}
					{auth.isAuthenticated && (
						<>
							<li>
								<button
									className="white btn-black"
									onClick={() => history.push("/cart")}
								>
									<ShoppingCartIcon className="icon" />
								</button>
							</li>
							<li>
								<button
									className="white btn-black"
									onClick={() => history.push("/viewProfile")}
								>
									<AccountCircleIcon className="icon" />
								</button>
							</li>
						</>
					)}
					{auth.isAuthenticated && auth.user.role === ROLE.WORKER && (
						<li>
							<NotificationsActiveIcon
								className="icon hover-pointer"
								onClick={toggleBar}
							/>
							{notificationBar && (
								<div className="notification_bar">
									<div className="m-10 br-10 btn-white flex flex-row align-center">
										<div className="width80 flex flex-col black p-10">
											<p className="bold">{request.shopkeeperName}</p>
											<p className="small-font-size">
												Contact : {request.phone}
											</p>
											<p className="small-font-size">
												From : {request.shopName}
											</p>
											<p>
												Has requested to add you as their worker. Would you
												like to join them ?
											</p>
										</div>
										<div className="width20">
											<div className="flex flex-col p-5 m-auto">
												<button
													className="btn btn-success width30"
													onClick={acceptRequest}
												>
													Accept
												</button>
												<button
													className="btn btn-danger width30 mt-10"
													onClick={rejectRequest}
												>
													Reject
												</button>
											</div>
										</div>
									</div>
								</div>
							)}
						</li>
					)}
				</ul>
			</div>
		</div>
	);
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));
