import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";

import ErrorText from "../ErrorText";
import { ROLE, RESPONSE } from "../../enums";
import { Axios, isEmptyObject } from "../../utilities";
import { setError, getDataForHome } from "../../redux/actions";

const initialValues = {
	serviceName: "",
	serviceCategory: "",
	subCategories: [],
	description: "",
};

const onSubmit = async (values, setError, history, userId, home) => {
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

	const res = await Axios.POST(`/service/${userId}`, values);
	if (res.success === RESPONSE.FAILURE) setError(res.data.message);
	else history.goBack();
};

const validationSchema = Yup.object({
	serviceName: Yup.string().required("Required"),
	serviceCategory: Yup.string().required("Required"),
	description: Yup.string().required("Required"),
});

function AddService(props) {
	const { history, location, match, error, home } = props;
	const { setError, getDataForHome } = props;

	const userId = match.params.userId;
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId) return history.goBack();
		getUser();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	useEffect(() => {
		if (home.isLoaded) {
			initialValues.serviceCategory = home.serviceCategories[0]?.category;
			setLoading(false);
		}
	}, [home]);

	async function getUser() {
		let res = await Axios.GET(`/user/${userId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		const user = res.data.user;
		if (user.role === ROLE.USER) history.goBack();
		else if (user.role === ROLE.WORKER) {
			const res = await Axios.GET(`/worker/${userId}`);
			if (res.data.worker.isDependent === "true") history.goBack();
			else if (!home.isLoaded) getDataForHome(history);
			else setLoading(false);
		} else if (!home.isLoaded) getDataForHome(history);
		else setLoading(false);
	}

	return (
		<div className="card_container">
			{!loading && (
				<>
					<h2 className="mt-20 mb-10">Add Service</h2>
					{error.error ? <ErrorText>{error.error}</ErrorText> : null}
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={(values) => onSubmit(values, setError, history, userId, home)}
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
											{home.serviceCategories.map((category) => (
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
													{categoriesOne.subCategories.map(
														(subCategory, index) => {
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
																						className="btn-main"
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
										{formik.isSubmitting ? "Adding Service" : "Add Service"}
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

export default connect(mapStateToProps, mapDispatchToProps)(AddService);
