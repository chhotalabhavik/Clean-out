import axios from "axios";
import { ROLE, RESPONSE } from "../enums";
import Axios from "./Axios";

export {
	arrayToString,
	buildFormData,
	coadminFirewall,
	dataURLtoFile,
	isEmptyObject,
	scrollToBottom,
	scrollToTop,
	setAuthToken,
	stringToArray,
	timeout,
};

function arrayToString(array) {
	return array.join(", ");
}

function buildFormData(data) {
	const keys = Object.keys(data);
	const formData = new FormData();

	keys.forEach((key) => {
		if (Array.isArray(data[key])) {
			data[key].forEach((value) => formData.append(key, value));
		} else {
			formData.append(key, data[key]);
		}
	});

	const headers = { "Content-Type": "multipart/form-data" };
	return { formData, headers };
}

async function coadminFirewall(auth, userId, history, setError, cb, ...args) {
	if (auth.user.role === ROLE.ADMIN) return cb(...args);

	const res = await Axios.GET(`/user/${userId}`);
	if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
	if (res.data.user.role === ROLE.COADMIN && auth.user._id !== res.data.user._id)
		return history.goBack();
	cb(...args);
}

function dataURLtoFile(dataURL, filename) {
	const arr = dataURL.split(",");
	const mime = arr[0].match(/:(.*?);/)[1];
	const bstr = atob(arr[1]);

	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) u8arr[n] = bstr.charCodeAt(n);

	return new File([u8arr], filename, { type: mime });
}

function isEmptyObject(value) {
	return value && Object.keys(value).length === 0 && value.constructor === Object;
}

function scrollToBottom() {
	window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
}

function scrollToTop() {
	window.scrollTo({ top: 0, behavior: "smooth" });
}

function setAuthToken(token) {
	if (token) {
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		delete axios.defaults.headers.common["Authorization"];
	}
}

function stringToArray(string) {
	string = string.split(",");
	return string.map((str) => str.trim());
}

async function timeout(seconds) {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
