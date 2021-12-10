import { ERROR_ACTION } from "../../enums";

export { setError };

function setError(error) {
	return {
		type: ERROR_ACTION.SET_ERROR,
		payload: error,
	};
}
