import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import homeReducer from "./homeReducer";

export default combineReducers({
	auth: authReducer,
	home: homeReducer,
	error: errorReducer,
});
