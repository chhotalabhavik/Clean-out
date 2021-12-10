import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { ROLE } from "../enums";

function AdminRoute({ component: Component, auth, path, ...rest }) {
	return (
		<Route
			{...rest}
			render={(props) =>
				auth.isAuthenticated &&
				(auth.user.role === ROLE.ADMIN || auth.user.role === ROLE.COADMIN) ? (
					<Component {...props} />
				) : (
					<Redirect to={{ pathname: "/" }} />
				)
			}
		/>
	);
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
	};
}
export default connect(mapStateToProps)(AdminRoute);
