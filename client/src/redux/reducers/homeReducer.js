import { HOME_ACTION } from "../../enums";

const initialState = {
	loading: false,
	items: [],
	serviceCategories: [],
	isLoaded: false,
};

export default function homeReducer(state = initialState, action) {
	switch (action.type) {
		case HOME_ACTION.DATA_LOADING:
			return {
				loading: true,
				items: [],
				serviceCategories: [],
				isLoaded: false,
			};

		case HOME_ACTION.SET_DATA:
			return {
				loading: false,
				items: action.payload.items,
				serviceCategories: action.payload.serviceCategories,
				isLoaded: true,
			};

		default:
			return state;
	}
}
