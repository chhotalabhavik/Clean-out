import { useEffect } from "react";
import { connect } from "react-redux";
import { logoutUser } from "../redux/actions";

function Logout(props) {
	const { history, isAuthenticated } = props;
	const { logoutUser } = props;
	useEffect(() => {
		if (isAuthenticated) {
			logoutUser(history);
			document.title = "Clean Out";
		} else history.goBack();
	}, []);

	return null;
}

function mapStateToProps(state) {
	return {
		isAuthenticated: state.auth.isAuthenticated,
	};
}

export default connect(mapStateToProps, { logoutUser })(Logout);
