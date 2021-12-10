import { ERROR_ACTION } from "../../enums";

const initialState = {
	error: "",
};

export default function errorReducer(state = initialState, action) {
	switch (action.type) {
		case ERROR_ACTION.SET_ERROR:
			return {
				error: action.payload,
			};

		default:
			return state;
	}
}
