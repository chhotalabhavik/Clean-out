import React, { useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import ErrorText from "./ErrorText";
import { loginUser, setError } from "../redux/actions";

const initialValues = {
	phone: "",
	password: "",
};

const validationSchema = Yup.object({
	phone: Yup.string()
		.required("Required")
		.matches(/^[0-9]+$/, "Must be only digits")
		.length(10, "Must be 10 digits"),
	password: Yup.string().required("Required"),
});

function Login(props) {
	const { history, location, auth, error } = props;
	const { loginUser, setError } = props;

	useEffect(() => {
		if (auth.isAuthenticated) history.goBack();
	}, []);

	function forgotPassword() {
		setError("");
		history.push("forgotPassword");
	}

	return (
		<div className="card_container">
			<h2 className="mb-10">Sign in to Clean Out</h2>
			{error.error ? <ErrorText>{error.error}</ErrorText> : null}
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={(values) => loginUser(values, history, location)}
			>
				{(formik) => {
					return (
						<Form className="card">
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
							<br />
							<div className="buttons">
								<button
									type="submit"
									disabled={
										!formik.dirty || !formik.isValid || formik.isSubmitting
									}
									className="btn btn-success mr-10"
								>
									{formik.isSubmitting ? "Singing In" : "Sign In"}
								</button>
								<button
									type="button"
									className="btn btn-danger"
									onClick={forgotPassword}
								>
									Forgot Password
								</button>
							</div>
						</Form>
					);
				}}
			</Formik>
			<p className="big-font-size mt-10 mb-10">
				New to Clean Out ?{" "}
				<Link to="/register" onClick={() => setError("")}>
					Register
				</Link>
			</p>
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
		loginUser: (...rest) => loginUser(...rest)(dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
