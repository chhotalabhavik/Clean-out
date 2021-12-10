import React, { useState } from "react";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link } from "react-router-dom";

import ErrorText from "./ErrorText";
import { RESPONSE } from "../enums";
import { Axios } from "../utilities";

const initialValues = { phone: "", OTP: "", password: "", confirmPassword: "" };

const onSubmit = async (values, setError, history, page) => {
	setError(null);
	if (page.page === 1) {
		let data = { phone: values.phone };
		const res = await Axios.POST("/otp/resetPassword", data);
		data = res.data;

		if (res.success === RESPONSE.SUCCESS) page.setPage(2);
		else setError(data.message);
	} else if (page.page === 2) {
		let data = { phone: values.phone, OTP: values.OTP };
		const res = await Axios.PUT("/otp/resetPassword", data);
		data = res.data;

		if (res.success === RESPONSE.SUCCESS) page.setPage(3);
		else setError(data.message);
	} else {
		let data = { phone: values.phone, password: values.password };
		const res = await Axios.POST("/user/resetPassword", data);
		data = res.data;

		if (res.success === RESPONSE.SUCCESS) history.goBack();
		else setError(data.message);
	}
};

const validationSchema = Yup.object({
	phone: Yup.string()
		.matches(/^[0-9]+$/, "Must be only digits")
		.length(10, "Must be 10 digits"),
	OTP: Yup.string().length(6, "Invalid OTP"),
	password: Yup.string(),
	confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match"),
});

const required = (value) => {
	return value === "" ? "Required" : null;
};

function ForgotPassword(props) {
	const { history } = props;
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);

	return (
		<div className="card_container">
			<h2 className="mb-10">Forgot Password</h2>
			{error ? <ErrorText>{error}</ErrorText> : null}
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={(values) => onSubmit(values, setError, history, { page, setPage })}
			>
				{(formik) => {
					return (
						<Form className="card">
							{page === 1 && (
								<>
									<div className="form-control">
										<label htmlFor="phone">Contact Number</label>
										<Field
											type="text"
											id="phone"
											name="phone"
											validate={required}
										/>
										<ErrorMessage name="phone" component={ErrorText} />
									</div>
									<button type="submit" className="btn btn-success">
										Send OTP
									</button>
								</>
							)}

							{page === 2 && (
								<>
									<div className="form-control">
										<label htmlFor="OTP">OTP</label>
										<Field
											type="text"
											id="OTP"
											name="OTP"
											validate={required}
										/>
										<ErrorMessage name="OTP" component={ErrorText} />
									</div>
									<button type="submit" className="btn btn-success">
										Verify OTP
									</button>
								</>
							)}

							{page === 3 && (
								<>
									<div className="form-control">
										<label htmlFor="password">New Password</label>
										<Field
											type="password"
											id="password"
											name="password"
											validate={required}
										/>
										<ErrorMessage name="password" component={ErrorText} />
									</div>

									<div className="form-control">
										<label htmlFor="confirmPassword">Confirm Password</label>
										<Field
											type="password"
											id="confirmPassword"
											name="confirmPassword"
											validate={required}
										/>
										<ErrorMessage
											name="confirmPassword"
											component={ErrorText}
										/>
									</div>

									<button type="submit" className="btn btn-success">
										Change password
									</button>
								</>
							)}
						</Form>
					);
				}}
			</Formik>
			<p className="big-font-size mt-10 mb-10">
				New to Clean Out ? <Link to="/register">Register</Link>
			</p>
		</div>
	);
}

export default ForgotPassword;
