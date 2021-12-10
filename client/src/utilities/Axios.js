import axios from "axios";

const GET = async (URL, params, headers = null) => {
	const response = await (headers
		? axios.get(URL, { params, headers })
		: axios.get(URL, { params }));
	return await response.data;
};

const POST = async (URL, data, headers = null) => {
	const response = await (headers ? axios.post(URL, data, { headers }) : axios.post(URL, data));
	return await response.data;
};

const PUT = async (URL, data, headers = null) => {
	const response = await (headers ? axios.put(URL, data, { headers }) : axios.put(URL, data));
	return await response.data;
};

const DELETE = async (URL, params, headers = null) => {
	const response = await (headers
		? axios.delete(URL, { params, headers })
		: axios.delete(URL, { params }));
	return await response.data;
};

const Axios = { GET, POST, PUT, DELETE };
export default Axios;
