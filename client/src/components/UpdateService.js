import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";

import ErrorText from "./ErrorText";
import { RESPONSE } from "../enums";
import { Axios, isEmptyObject } from "../utilities";
import { setError, getDataForHome } from "../redux/actions";

let initialValues = {};

const onSubmit = async (values, setError, history, serviceId, home) => {
	setError("");
	values = {
		...values,
		subCategories: values.subCategories
			.filter((value) => {
				if (!value || isEmptyObject(value) || !value.name.length) return false;
				return true;
			})
			.map((value) => ({ ...value, name: value.name[0] })),
	};

	if (!values.subCategories || !values.subCategories.length)
		return setError("Choose at least one sub category");

	const category = values.serviceCategory;
	const subCategories = home.serviceCategories.filter((value) => value.category === category)[0]
		.subCategories;

	for (let i = 0; i < values.subCategories.length; i++) {
		const value = values.subCategories[i];
		if (!value.price || Number(value.price) <= 0)
			return setError(`${value.name} must have valid price`);
		for (let j = 0; j < subCategories.length; j++) {
			if (
				subCategories[j].name === value.name &&
				subCategories[j].area &&
				(!value.mxSqFt || Number(value.mxSqFt) <= 0)
			)
				return setError(`${value.name} must have valid square feet size`);
		}
	}

	const res = await Axios.PUT(`/service/${serviceId}`, values);
	if (res.success === RESPONSE.FAILURE) setError(res.data.message);
	else history.goBack();
};

const validationSchema = Yup.object({
	serviceName: Yup.string().required("Required"),
	serviceCategory: Yup.string().required("Required"),
	description: Yup.string().required("Required"),
});

function UpdateService(props) {
	const { history, location, match, auth, error, home } = props;
	const { setError, getDataForHome } = props;

	const serviceId = match.params.serviceId;
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (home.isLoaded) getUser();
		else getDataForHome(history);

		return () => {
			setLoading(true);
		};
	}, [location.pathname, home.isLoaded]);

	async function getUser() {
		if (!serviceId) return history.goBack();

		const res = await Axios.GET(`/service/${serviceId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		const service = res.data.service;
		if (service.serviceProviderId !== auth.user._id) return history.goBack();

		initialValues.serviceName = service.serviceName;
		initialValues.serviceCategory = service.serviceCategory;
		initialValues.subCategories = service.subCategories;
		initialValues.description = service.description;
		formatSubCategories();
	}

	function formatSubCategories() {
		const values = initialValues.subCategories;

		initialValues.subCategories = home.serviceCategories
			.find((value) => value.category === initialValues.serviceCategory)
			.subCategories.map((category) => {
				for (let i = 0; i < values.length; i++)
					if (values[i].name === category.name)
						return { ...values[i], name: [values[i].name] };
				return {};
			});

		setLoading(false);
	}

	return (
		<div className="card_container">
			{!loading && (
				<>
					<h2 className="mt-20 mb-10">Update Service</h2>
					{error.error ? <ErrorText>{error.error}</ErrorText> : null}
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={(values) => onSubmit(values, setError, history, serviceId, home)}
					>
						{(formik) => {
							return (
								<Form className="card mb-50">
									<div className="form-control">
										<label htmlFor="serviceName">Service Name</label>
										<Field type="text" id="serviceName" name="serviceName" />
										<ErrorMessage name="serviceName" component={ErrorText} />
									</div>

									<div className="form-control">
										<label htmlFor="description">Description</label>
										<Field
											as="textarea"
											id="description"
											name="description"
											rows="5"
										/>
										<ErrorMessage name="description" component={ErrorText} />
									</div>

									<div className="form-control">
										<label htmlFor="serviceCategory">For:</label>
										<Field
											className="role_select"
											as="select"
											name="serviceCategory"
											id="serviceCategory"
											onChange={(event) => {
												formik.setValues((prev) => ({
													...prev,
													subCategories: [],
												}));
												formik.handleChange(event);
											}}
										>
											{home?.serviceCategories.map((category) => (
												<option
													key={category._id}
													value={category.category}
												>
													{category.category}
												</option>
											))}
										</Field>
									</div>

									<FieldArray name="subCategories">
										{(fieldArrayProps) => {
											const { serviceCategory } = fieldArrayProps.form.values;
											const categoriesOne = home.serviceCategories.find(
												(category) => category.category === serviceCategory
											);
											return (
												<div className="sub_category_input">
													{categoriesOne?.subCategories.map(
														(subCategory, index) => {
															const isChecked = formik.values
																.subCategories[index]?.name?.length
																? true
																: false;
															return (
																<div
																	key={index}
																	className="sub_category_input_field"
																>
																	<Field
																		type="checkbox"
																		name={`subCategories[${index}].name`}
																		value={subCategory.name}
																		id={`subCategories[${index}].name`}
																		checked={isChecked}
																	></Field>
																	<label
																		className="hover-pointer"
																		htmlFor={`subCategories[${index}].name`}
																	>
																		{subCategory.name}
																	</label>
																	{formik.values.subCategories[
																		index
																	]?.name?.length > 0 && (
																		<>
																			<Field
																				type="number"
																				name={`subCategories[${index}].price`}
																			></Field>
																			<label>Price</label>
																			{subCategory.area && (
																				<>
																					<Field
																						type="number"
																						name={`subCategories[${index}].mxSqFt`}
																					></Field>
																					<label>
																						Max SqFt
																					</label>
																				</>
																			)}
																		</>
																	)}
																</div>
															);
														}
													)}
												</div>
											);
										}}
									</FieldArray>

									<button
										type="submit"
										className="btn btn-success mt-10"
										disabled={
											!formik.dirty || !formik.isValid || formik.isSubmitting
										}
									>
										{formik.isSubmitting
											? "Updating Service"
											: "Update Service"}
									</button>
								</Form>
							);
						}}
					</Formik>
				</>
			)}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
		home: state.home,
		error: state.error,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
		getDataForHome: (history) => getDataForHome(history)(dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateService);
