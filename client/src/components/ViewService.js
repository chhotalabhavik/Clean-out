import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import ErrorText from "./ErrorText";
import { RESPONSE } from "../enums";
import { Axios } from "../utilities";
import { setError } from "../redux/actions";

function ViewService(props) {
	const { history, location, match, auth, error } = props;
	const { setError } = props;

	const serviceId = match.params.serviceId;
	const [service, setService] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!serviceId) history.goBack();

		getService();
		async function getService() {
			const res = await Axios.GET(`/service/${serviceId}`);
			if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
			if (res.data.service.serviceProviderId !== auth.user._id) history.goBack();
			setService(res.data.service);
			setLoading(false);
		}

		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	function editService() {
		setError("");
		history.push(`/updateService/${serviceId}`);
	}

	async function deleteService() {
		setError("");
		const res = await Axios.DELETE(`/service/${serviceId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		history.goBack();
	}

	return (
		<div className="card_container">
			{!loading && (
				<>
					<h2 className="mt-20 mb-10">{service.serviceName}</h2>
					{error.error ? <ErrorText>{error.error}</ErrorText> : null}
					<div className="card mb-50">
						<div className="form-control">
							<label>Description</label>
							<textarea
								disabled
								className="height-auto"
								value={service.description}
								rows="5"
							/>
						</div>
						<div className="form-control">
							<label>Category</label>
							<input type="text" disabled value={service.serviceCategory} />
						</div>
						<div className="width90">
							{service.subCategories.map((subCategory) => (
								<div key={subCategory.name} className="flex flex-row align-center">
									<p className="small-font-size">{subCategory.name}</p>
									<div className="flex flex-row ml-auto mt-5">
										{subCategory.mxSqFt && (
											<div className="form-control-3 flex flex-row align-center ml-5">
												<input
													type="text"
													disabled
													value={subCategory.mxSqFt}
													className="ml-auto"
												/>
												<p className="ml-5 small-font-size mr-5">MxSqFt</p>
											</div>
										)}
										<div className="form-control-3 flex flex-row align-center">
											<input
												type="text"
												disabled
												value={subCategory.price}
												className="ml-auto"
											/>
											<p className="normal small-font-size ml-5">Price</p>
										</div>
									</div>
								</div>
							))}
						</div>
						<div className="buttons mt-10">
							<button className="btn btn-success" onClick={editService}>
								Edit
							</button>
							<button className="btn btn-danger ml-10" onClick={deleteService}>
								Delete
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
		error: state.error,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewService);
