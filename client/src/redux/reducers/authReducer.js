import { USER_ACTION } from "../../enums";
import { isEmptyObject } from "../../utilities";

const initialState = {
	user: {},
	loading: false,
	isAuthenticated: false,
};

export default function authReducer(state = initialState, action) {
	switch (action.type) {
		case USER_ACTION.USER_LOADING:
			return {
				user: {},
				loading: true,
				isAuthenticated: false,
			};

		case USER_ACTION.SET_USER:
			return {
				user: action.payload,
				loading: false,
				isAuthenticated: !isEmptyObject(action.payload),
			};

		default:
			return state;
	}
}
