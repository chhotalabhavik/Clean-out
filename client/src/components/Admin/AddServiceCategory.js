import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";

import { Axios, buildFormData } from "../../utilities";
import { setError } from "../../redux/actions";
import { RESPONSE, ROLE } from "../../enums";
import ErrorText from "../ErrorText";
import ImageInput from "../ImageInput";

const initialValues = {
	category: "",
	subCategories: [{ name: "", area: false }],
};

const onSubmit = async (values, setError, history, imageObj) => {
	setError("");
	let { image, setImageError } = imageObj;
	if (!image) return setImageError("Required");
	const name = values.category
		.split(" ")
		.map((val) => val.trim())
		.join("");

	const blob = image.slice(0, image.size, image.type);
	image = new File([blob], `${name}.${image.type.split("/")[1]}`, { type: image.type });
	values = { ...values, subCategories: JSON.stringify(values.subCategories), image };

	const { formData, headers } = buildFormData(values);
	const res = await Axios.POST("/serviceCategory", formData, headers);
	if (res.success === RESPONSE.FAILURE) setError(res.data.message);
	else if (history.length === 1) history.push("/admin/serviceCategories");
	else history.goBack();
};

const validationSchema = Yup.object({
	category: Yup.string().required("Required"),
	subCategories: Yup.array().of(
		Yup.object().shape({
			name: Yup.string().required("Required"),
			area: Yup.boolean().default(false),
		})
	),
});

function AddServiceCategory(props) {
	const { history, auth, error, location } = props;
	const { setError } = props;

	const [image, setImage] = useState("");
	const [imageError, setImageError] = useState("");

	useEffect(() => {
		if (auth.user.role !== ROLE.ADMIN) return history.goBack();
	}, [location.pathname]);

	useEffect(() => {
		if (image === undefined) setImageError("Required");
		else setImageError("");
	}, [image]);

	function onFileUpload(name, files) {
		setError("");
		setImage(files[0]);
	}

	return (
		<div className="flex flex-col btn-main min-h80">
			<div className="flex flex-col width90 align-center">
				<div className="flex flex-col align-center width50">
					<h2 className="ml-auto mr-auto mt-50">Add Service Category</h2>
					{error.error && <ErrorText>{error.error}</ErrorText>}

					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={(values) =>
							onSubmit(values, setError, history, { image, setImageError })
						}
					>
						{(formik) => {
							return (
								<Form className="flex flex-col btn-light br-10 shadow width100 pl-20 pr-20 mt-20">
									<div className="flex flex-row">
										<div className="form-control mr-20">
											<label htmlFor="category">Service Category</label>
											<Field type="text" id="category" name="category" />
											<ErrorMessage name="category" component={ErrorText} />
										</div>

										<div className="form-control">
											<label>Image</label>
											<ImageInput name="image" onFileUpload={onFileUpload} />
											{imageError && <ErrorText>{imageError}</ErrorText>}
										</div>
									</div>

									<div className="form-control">
										<label>Sub Categories</label>

										<FieldArray name="subCategories">
											{(fieldArrayProps) => {
												const { push, remove, form } = fieldArrayProps;
												const { subCategories } = form.values;

												return (
													<div className="flex flex-col">
														{subCategories.map((subCategory, index) => {
															return (
																<div
																	key={index}
																	className="flex flex-row align-center mt-5 mb-5"
																>
																	<label className="normal mr-5">
																		Name
																	</label>
																	<Field
																		name={`subCategories[${index}].name`}
																		style={{
																			width: "40%",
																			border: "none",
																			backgroundColor:
																				"var(--main_theme)",
																			height: "2rem",
																			fontSize: "1.1rem",
																			marginRight: "10px",
																			borderRadius: "5px",
																			paddingLeft: "5px",
																		}}
																	/>

																	<label className="normal mr-5">
																		Area wise
																	</label>
																	<Field
																		type="checkbox"
																		name={`subCategories[${index}].area`}
																		className="mr-10"
																	/>

																	<button
																		type="button"
																		className="btn-white pl-10 pr-10 mr-5"
																		style={{
																			border:
																				"1px solid black",
																		}}
																		hidden={
																			subCategories.length ===
																			1
																		}
																		onClick={() =>
																			remove(index)
																		}
																	>
																		-
																	</button>
																	<button
																		type="button"
																		className="btn-white pl-10 pr-10 mr-10"
																		style={{
																			border:
																				"1px solid black",
																		}}
																		onClick={() =>
																			push({
																				name: "",
																				area: false,
																			})
																		}
																	>
																		+
																	</button>

																	<ErrorMessage
																		name={`subCategories[${index}].name`}
																		component={ErrorText}
																	/>
																</div>
															);
														})}
													</div>
												);
											}}
										</FieldArray>
									</div>

									<button
										type="submit"
										className="btn btn-success width-fit ml-auto mr-auto mb-20 mt-10"
										disabled={formik.isSubmitting}
									>
										{formik.isSubmitting
											? "Adding Subcategory"
											: "Add Subcategory"}
									</button>
								</Form>
							);
						}}
					</Formik>
				</div>
			</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(AddServiceCategory);
