import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";

import { Axios, buildFormData } from "../../utilities";
import { setError } from "../../redux/actions";
import { RESPONSE, ROLE } from "../../enums";
import ErrorText from "../ErrorText";
import ImageInput from "../ImageInput";

function ViewServiceCategory(props) {
	const { auth, error, match, history, location } = props;
	const { setError } = props;

	const serviceCategoryId = match.params.serviceCategoryId;
	const [serviceCategory, setServiceCategory] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!serviceCategoryId) return history.goBack();
		if (auth.user.role !== ROLE.ADMIN) {
			if (history.length === 1) return history.push("/");
			else return history.goBack();
		}
		getServiceCategory();

		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getServiceCategory() {
		const res = await Axios.GET(`/serviceCategory/${serviceCategoryId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setServiceCategory(res.data.serviceCategory);
		setLoading(false);
	}

	function editServiceCategory() {
		setError("");
		history.push(`/admin/updateServiceCategory/${serviceCategoryId}`);
	}

	async function deleteServiceCategory() {
		setError("");
		const res = await Axios.DELETE(`/serviceCategory/${serviceCategoryId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		if (history.length === 1) history.push("/admin/serviceCategories");
		else history.goBack();
	}

	return (
		<div className="flex flex-col min-h80 btn-main">
			{!loading && (
				<div className="flex flex-col width70 ml-auto mr-auto p-20">
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<p className="bold large-font-size">{serviceCategory.category}</p>
					<div className="flex flex-row">
						<div className="flex flex-col width50">
							<div className="flex flex-col shadow btn-light br-10 p-10 mt-20 width90">
								{serviceCategory.subCategories.map((subCategory) => {
									const { name, area } = subCategory;
									return (
										<div key={name} className="flex flex-row align-center">
											<p className="p-10">{name}</p>
											<label className="normal ml-auto mr-5">Area wise</label>
											<input
												type="checkbox"
												onClick={(e) => {
													e.preventDefault();
												}}
												defaultChecked={area}
												className="mr-10"
											/>
										</div>
									);
								})}
							</div>
							<div className="buttons mt-10">
								<button
									className="btn btn-success m-10"
									onClick={editServiceCategory}
								>
									Edit
								</button>
								<button
									className="btn btn-danger m-10"
									onClick={deleteServiceCategory}
								>
									Remove
								</button>
							</div>
						</div>
						<div className="width40 ml-auto mt-20">
							<img
								className="shadow"
								height="300px"
								src={`/images/${serviceCategory.image}`}
							/>
						</div>
					</div>
				</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewServiceCategory);
