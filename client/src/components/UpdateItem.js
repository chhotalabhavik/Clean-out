import React, { useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";

import ErrorText from "./ErrorText";
import ImageInput from "./ImageInput";
import { ROLE, RESPONSE } from "../enums";
import { Axios, buildFormData } from "../utilities";
import { setError } from "../redux/actions";

const initialValues = {};

const onSubmit = async (values, setError, history, itemId, itemImage) => {
	setError("");

	const { formData, headers } = buildFormData({ ...values, itemImage: itemImage.itemImage });
	const res = await Axios.PUT(`/item/${itemId}`, formData, headers);
	const data = res.data;

	if (res.success === RESPONSE.FAILURE) setError(data.message);
	else history.goBack();
};

const validationSchema = Yup.object({
	itemName: Yup.string().required("Required"),
	price: Yup.number().typeError("Must be a number").required("Required"),
	description: Yup.string().required("Required"),
});

function UpdateItem(props) {
	const { history, location, match, auth, error } = props;
	const { setError } = props;

	const itemId = match.params.itemId;
	const [loading, setLoading] = useState(true);
	const [isAvailable, setIsAvailable] = useState(false);
	const [itemImage, setItemImage] = useState(null);
	const [itemImageError, setItemImageError] = useState(null);

	useEffect(() => {
		getItem();
		async function getItem() {
			if (!itemId) history.goBack();
			else {
				const res = await Axios.GET(`/item/${itemId}`);
				if (res.success === RESPONSE.FAILURE) {
					setError(res.data.message);
					history.goBack();
				} else {
					if (
						res.data.item.shopkeeperId !== auth.user._id &&
						![ROLE.ADMIN, ROLE.COADMIN].includes(auth.user.role)
					)
						history.goBack();
					else {
						initialValues.itemName = res.data.item.itemName;
						initialValues.price = res.data.item.price;
						initialValues.description = res.data.item.description;
						setIsAvailable(res.data.item.isAvailable);
						setLoading(false);
					}
				}
			}
		}

		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	const onFileUpload = useCallback((name, files) => {
		setError("");
		setItemImageError(null);
		setItemImage(files.length ? files[0] : null);
	}, []);

	return (
		<div className="card_container">
			{!loading && (
				<>
					<h2 className="mb-10">Add Cleaning Product</h2>
					{error.error ? <ErrorText>{error.error}</ErrorText> : null}
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={(values) =>
							onSubmit({ ...values, isAvailable }, setError, history, itemId, {
								itemImage,
								setItemImageError,
							})
						}
					>
						{(formik) => {
							return (
								<Form className="card">
									<div className="form-control">
										<label htmlFor="itemName">Item Name</label>
										<Field type="text" id="itemName" name="itemName" />
										<ErrorMessage name="itemName" component={ErrorText} />
									</div>

									<div className="form-control">
										<label htmlFor="price">Price</label>
										<Field type="text" id="price" name="price" />
										<ErrorMessage name="price" component={ErrorText} />
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

									<div className="form-control-2">
										<div className="form-control">
											<label htmlFor="itemImage">Item Image</label>
											<ImageInput
												name="itemImage"
												onFileUpload={onFileUpload}
											/>
											{itemImageError && (
												<ErrorText>{itemImageError}</ErrorText>
											)}
										</div>
										<div className="flex flex-col justify-center align-center">
											<p>Is available ?</p>
											<button
												type="button"
												className={`btn ${
													isAvailable ? "btn-success" : "btn-danger"
												}`}
												onClick={() => setIsAvailable((prev) => !prev)}
											>
												{isAvailable ? "Available" : "Not available"}
											</button>
										</div>
									</div>

									<button type="submit" className="btn btn-success mt-10">
										Update Item
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
		error: state.error,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateItem);
