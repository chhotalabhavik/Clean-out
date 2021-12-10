import React, { useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";

import ErrorText from "./ErrorText";
import ImageInput from "./ImageInput";
import { ROLE, RESPONSE } from "../enums";
import { Axios, arrayToString, buildFormData } from "../utilities";
import { setError } from "../redux/actions";

const initialValues = {
	userName: "",
	phone: "",
	password: "",
	confirmPassword: "",
	society: "",
	area: "",
	pincode: "",
	city: "",
	state: "",
	role: "USER",
	pincodes: [""],
	shopName: "",
};

const onSubmit = async (values, setError, history, profilePicture, proofs) => {
	setError("");
	const resource =
		values.role === ROLE.WORKER
			? "worker"
			: values.role === ROLE.SHOPKEEPER
			? "shopkeeper"
			: "user";

	let res, data;
	if (values.role === ROLE.USER) res = await Axios.POST(`/${resource}`, values);
	else {
		data = { ...values, proofs };
		if (values.role === ROLE.WORKER) {
			data.profilePicture = profilePicture;
			data.pincodes = arrayToString(values.pincodes);
		}
		const { formData, headers } = buildFormData(data);
		res = await Axios.POST(`/${resource}`, formData, headers);
	}

	data = res.data;
	if (res.success === RESPONSE.SUCCESS) history.goBack();
	else setError(data.message);
};

const validationSchema = Yup.object({
	userName: Yup.string().required("Required"),
	phone: Yup.string()
		.required("Required")
		.matches(/^[0-9]+$/, "Must be only digits")
		.length(10, "Must be 10 digits"),
	password: Yup.string().required("Required"),
	confirmPassword: Yup.string()
		.required("Required")
		.oneOf([Yup.ref("password"), null], "Passwords must match"),
	society: Yup.string().required("Required"),
	area: Yup.string().required("Required"),
	pincode: Yup.string().min(6, "Invalid pincode").required("Required"),
	city: Yup.string().required("Required"),
	state: Yup.string().required("Required"),
	role: Yup.string().required("Required"),
	pincodes: Yup.array().of(
		Yup.number()
			.min(100000, "Invalid pincode")
			.max(999999, "Invalid pincode")
			.typeError("Invalid pincode")
	),
	shopName: Yup.string(),
});

const required = (value) => {
	return value === "" ? "Required" : null;
};

function Register(props) {
	const { history, auth, error } = props;
	const { setError } = props;

	const [profilePicture, setProfilePicture] = useState("");
	const [profilePictureError, setProfilePictureError] = useState(null);

	const [proofs, setProofs] = useState(null);
	const [proofsError, setProofsError] = useState(null);

	useEffect(() => {
		if (auth.isAuthenticated && ![ROLE.ADMIN, ROLE.COADMIN].includes(auth.user.role))
			history.goBack();
	}, []);

	useEffect(() => {
		if (profilePicture != null) setProfilePictureError(null);
		else setProfilePictureError("Required");
	}, [profilePicture]);

	useEffect(() => {
		if (proofs == null || proofs.length) setProofsError(null);
		else setProofsError("Required");
	}, [proofs]);

	const onFileUpload = useCallback((name, files) => {
		setError("");
		if (name === "profilePicture") {
			setProfilePictureError(null);
			setProfilePicture(files.length ? files[0] : null);
		} else if (files.length) {
			setProofs((prev) => {
				const next = prev ? [...prev, ...files] : files;
				return next.slice(Math.max(next.length - 2, 0));
			});
			setProofsError(null);
		}
	}, []);

	return (
		<div className="card_container">
			<h2 className="mt-20 mb-10">Register in to Clean Out</h2>
			{error.error ? <ErrorText>{error.error}</ErrorText> : null}
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={(values) => onSubmit(values, setError, history, profilePicture, proofs)}
			>
				{(formik) => {
					return (
						<Form className="card mb-50">
							<div className="form-control">
								<label htmlFor="userName">Full Name</label>
								<Field type="text" id="userName" name="userName" />
								<ErrorMessage name="userName" component={ErrorText} />
							</div>

							<div className="form-control">
								<label htmlFor="phone">Contact Number</label>
								<Field type="text" id="phone" name="phone" />
								<ErrorMessage name="phone" component={ErrorText} />
							</div>

							<div className="form-control">
								<label htmlFor="password">Password</label>
								<Field type="password" id="password" name="password" />
								<ErrorMessage name="password" component={ErrorText} />
							</div>

							<div className="form-control">
								<label htmlFor="confirmPassword">Confirm Password</label>
								<Field
									type="password"
									id="confirmPassword"
									name="confirmPassword"
								/>
								<ErrorMessage name="confirmPassword" component={ErrorText} />
							</div>

							<div className="form-control">
								<label htmlFor="society">Society</label>
								<Field type="text" id="society" name="society" />
								<ErrorMessage name="society" component={ErrorText} />
							</div>

							<div className="form-control-2">
								<div className="form-control">
									<label htmlFor="area">Area</label>
									<Field type="text" id="area" name="area" />
									<ErrorMessage name="area" component={ErrorText} />
								</div>
								<div className="form-control">
									<label htmlFor="pincode">Pincode</label>
									<Field type="text" id="pincode" name="pincode" />
									<ErrorMessage name="pincode" component={ErrorText} />
								</div>
							</div>

							<div className="form-control-2">
								<div className="form-control">
									<label htmlFor="city">City</label>
									<Field type="text" id="city" name="city" />
									<ErrorMessage name="city" component={ErrorText} />
								</div>
								<div className="form-control">
									<label htmlFor="state">State</label>
									<Field type="text" id="state" name="state" />
									<ErrorMessage name="state" component={ErrorText} />
								</div>
							</div>

							<div className="form-control-2">
								<div className="form-control">
									<label htmlFor="role">For:</label>
									<Field
										className="role_select"
										as="select"
										name="role"
										id="role"
									>
										<option value="USER">Customer</option>
										<option value="SHOPKEEPER">Shopkeeper</option>
										<option value="WORKER">Worker</option>
									</Field>
								</div>
								{formik.values.role === ROLE.SHOPKEEPER && (
									<div className="form-control">
										<label htmlFor="proofs">ID Proofs (max 2)</label>
										<ImageInput
											name="proofs"
											onFileUpload={onFileUpload}
											multiple
										/>
										{proofsError && <ErrorText>{proofsError}</ErrorText>}
									</div>
								)}
							</div>

							{formik.values.role === ROLE.WORKER && (
								<div className="form-control-2">
									<div className="form-control">
										<label htmlFor="profilePicture">Profile Picture</label>
										<ImageInput
											name="profilePicture"
											onFileUpload={onFileUpload}
										/>
										{profilePictureError && (
											<ErrorText>{profilePictureError}</ErrorText>
										)}
									</div>
									<div className="form-control">
										<label htmlFor="proofs">ID Proofs (max 2)</label>
										<ImageInput
											name="proofs"
											onFileUpload={onFileUpload}
											multiple
										/>
										{proofsError && <ErrorText>{proofsError}</ErrorText>}
									</div>
								</div>
							)}

							{formik.values.role === ROLE.WORKER && (
								<div className="form-control">
									<label>Pincodes of preferred locations</label>
									<FieldArray name="pincodes">
										{(fieldArrayProps) => {
											const { push, remove, form } = fieldArrayProps;
											const { pincodes } = form.values;

											return (
												<div className="flex flex-col">
													{pincodes.map((pincode, index) => {
														return (
															<div
																key={index}
																className="flex flex-row align-center mt-5 mb-5 br-10"
															>
																<Field
																	name={`pincodes[${index}]`}
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
																	validate={required}
																/>
																<button
																	type="button"
																	className="btn-white pl-10 pr-10 mr-5"
																	style={{
																		border: "1px solid black",
																	}}
																	hidden={pincodes.length === 1}
																	onClick={() => remove(index)}
																>
																	-
																</button>
																<button
																	type="button"
																	className="btn-white pl-10 pr-10 mr-10"
																	style={{
																		border: "1px solid black",
																	}}
																	onClick={() => push("")}
																>
																	+
																</button>

																<ErrorMessage
																	name={`pincodes[${index}]`}
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
							)}

							{formik.values.role === ROLE.SHOPKEEPER && (
								<div className="form-control">
									<label htmlFor="shopName">Shop Name</label>
									<Field
										type="text"
										id="shopName"
										name="shopName"
										validate={required}
									/>
									<ErrorMessage name="shopName" component={ErrorText} />
								</div>
							)}

							<button
								type="submit"
								disabled={
									!!(
										!formik.dirty ||
										!formik.isValid ||
										formik.isSubmitting ||
										(formik.values.role === ROLE.WORKER &&
											(!profilePicture || !formik.values.pincodes.length)) ||
										(formik.values.role === ROLE.SHOPKEEPER &&
											!formik.values.shopName) ||
										(formik.values.role !== ROLE.USER &&
											proofs &&
											!proofs.length)
									)
								}
								className="btn btn-success mt-10"
							>
								{formik.isSubmitting ? "Registering" : "Register"}
							</button>
						</Form>
					);
				}}
			</Formik>
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

export default connect(mapStateToProps, mapDispatchToProps)(Register);
