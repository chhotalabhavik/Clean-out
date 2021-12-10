import React, { useState, useCallback, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";

import ErrorText from "./ErrorText";
import ImageInput from "./ImageInput";
import { ROLE, RESPONSE } from "../enums";
import { Axios, buildFormData } from "../utilities";
import { setError } from "../redux/actions";

const initialValues = { itemName: "", price: "", description: "" };

const onSubmit = async (values, setError, history, user, itemImage) => {
	setError(null);
	if (itemImage.itemImage === null || itemImage.itemImage === "") {
		return itemImage.setItemImageError("Required");
	}

	const { formData, headers } = buildFormData({ ...values, itemImage: itemImage.itemImage });
	const res = await Axios.POST(`/item/${user._id}`, formData, headers);
	const data = res.data;

	if (res.success === RESPONSE.FAILURE) setError(data.message);
	else history.goBack();
};

const validationSchema = Yup.object({
	itemName: Yup.string().required("Required"),
	price: Yup.number().typeError("Must be a number").required("Required"),
	description: Yup.string().required("Required"),
});

function AddItem(props) {
	const { history, auth, error } = props;
	const { setError } = props;

	const [itemImage, setItemImage] = useState("");
	const [itemImageError, setItemImageError] = useState(null);

	useEffect(() => {
		if (auth.user.role !== ROLE.SHOPKEEPER) history.goBack();
	}, []);

	useEffect(() => {
		if (itemImage !== null) setItemImageError(null);
		else setItemImageError("Required");
	}, [itemImage]);

	const onFileUpload = useCallback((name, files) => {
		setError("");
		setItemImageError(null);
		setItemImage(files.length ? files[0] : null);
	}, []);

	return (
		<div className="card_container">
			<h2 className="mb-10">Add Cleaning Product</h2>
			{error.error ? <ErrorText>{error.error}</ErrorText> : null}
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={(values) =>
					onSubmit(values, setError, history, auth.user, {
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
								<Field as="textarea" id="description" name="description" rows="5" />
								<ErrorMessage name="description" component={ErrorText} />
							</div>

							<div className="form-control">
								<label htmlFor="itemImage">Item Image</label>
								<ImageInput name="itemImage" onFileUpload={onFileUpload} />
								{itemImageError && <ErrorText>{itemImageError}</ErrorText>}
							</div>

							<button type="submit" className="btn btn-success mt-10">
								Add Item
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

export default connect(mapStateToProps, mapDispatchToProps)(AddItem);
