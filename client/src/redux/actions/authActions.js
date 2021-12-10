import jwt_decode from "jwt-decode";
import { setError } from "./errorActions";
import { USER_ACTION, RESPONSE } from "../../enums";
import { Axios, setAuthToken } from "../../utilities";

export { userLoading, setUser, loginUser, logoutUser, setUserFromStorage };

function userLoading() {
	return {
		type: USER_ACTION.USER_LOADING,
	};
}

function setUser(user) {
	return {
		type: USER_ACTION.SET_USER,
		payload: user,
	};
}

function loginUser(user, history, location) {
	return async function (dispatch) {
		dispatch(userLoading());
		const res = await Axios.POST("/auth/login", user);
		if (res.success === RESPONSE.FAILURE) {
			dispatch(setError(res.data.message));
		} else {
			dispatch(setError(""));
			dispatch(setUser(res.data.user));
			setAuthToken(res.data.token);
			localStorage.setItem("token", res.data.token);
			if (location.state?.prevPath) history.replace(location.state.prevPath);
			else history.goBack();
		}
	};
}

function logoutUser(history) {
	return function (dispatch) {
		dispatch(userLoading());
		dispatch(setError(""));
		dispatch(setUser({}));
		localStorage.removeItem("token");
		history.goBack();
	};
}

async function setUserFromStorage(store) {
	store.dispatch(userLoading());
	const token = localStorage.getItem("token");
	if (token) {
		const decodedToken = jwt_decode(token);
		const expirationTime = decodedToken.exp * 1000 - 60000;
		if (Date.now() >= expirationTime) {
			store.dispatch(setUser({}));
			localStorage.removeItem("token");
		} else {
			// const res = await Axios.GET(`/jwt/refreshToken`, { token });
			// store.dispatch(setUser(jwt_decode(res.data.newToken)));
			store.dispatch(setUser(jwt_decode(token)));
		}
	} else {
		store.dispatch(setUser({}));
	}
}
