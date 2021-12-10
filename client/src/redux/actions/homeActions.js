import { HOME_ACTION, RESPONSE } from "../../enums";
import { Axios } from "../../utilities";
import { setError } from "./errorActions";

export { dataLoading, setData, getDataForHome };

function dataLoading() {
	return {
		type: HOME_ACTION.DATA_LOADING,
	};
}

function setData(data) {
	return {
		type: HOME_ACTION.SET_DATA,
		payload: data,
	};
}

function getDataForHome(history) {
	return async function (dispatch) {
		try {
			dispatch(setError(""));
			dispatch(dataLoading());
			const [resS, resI] = await Promise.all([
				Axios.GET("/serviceCategory"),
				Axios.GET("/item/random"),
			]);
			if (resS.success === RESPONSE.FAILURE) setError(resS.data.message);
			else if (resI.success === RESPONSE.FAILURE) setError(resI.data.message);
			else
				dispatch(
					setData({ items: resI.data.items, serviceCategories: resS.data.categories })
				);
		} catch (error) {
			setError(error);
			history.push("/");
		}
	};
}
