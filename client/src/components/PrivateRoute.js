import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

function PrivateRoute({ component: Component, auth, path, ...rest }) {
	return (
		<Route
			{...rest}
			render={(props) =>
				auth.isAuthenticated === true ? (
					<Component {...props} />
				) : (
					<Redirect to={{ pathname: "/login", state: { prevPath: path } }} />
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
export default connect(mapStateToProps)(PrivateRoute);
