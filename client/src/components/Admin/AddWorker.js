import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import ErrorText from "../ErrorText";
import { setError } from "../../redux/actions";
import { ROLE, RESPONSE } from "../../enums";
import { Axios } from "../../utilities";

function AddWorker(props) {
	const { history, location, match, error } = props;
	const { setError } = props;
	const userId = match.params.userId;

	const [phone, setPhone] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId) return history.goBack();
		getUser();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getUser() {
		const res = await Axios.GET(`/user/${userId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		if (res.data.user.role !== ROLE.SHOPKEEPER) return history.goBack();
		setLoading(false);
	}

	function handlePhoneChange(event) {
		setError("");
		setPhone(event.target.value);
	}

	function handlePhoneBlur() {
		setError("");
		if (phone.length !== 10) return setError("Contact number must be of 10 digits");
		for (let i = 0; i < phone.length; i++)
			if (phone[i] < "0" || phone[i] > "9") return setError("Invalid contact number");
	}

	async function onSubmit(event) {
		event.preventDefault();
		setSubmitting(true);
		setError("");
		const res = await Axios.POST(`/shopkeeper/addWorker/${userId}`, { phone });
		if (res.success === RESPONSE.FAILURE) {
			setSubmitting(false);
			setError(res.data.message);
		} else history.goBack();
	}

	return (
		<div className="flex flex-col min-h80 btn-main">
			{!loading && (
				<div className="mb-50 flex flex-col width80 ml-auto mr-auto align-center">
					<h2 className="mt-50 mb-20">Add Worker</h2>
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<form onSubmit={onSubmit} className="card">
						<div className="form-control">
							<label>Enter Contact Number</label>
							<input
								type="text"
								value={phone}
								onChange={handlePhoneChange}
								onBlur={handlePhoneBlur}
							/>
						</div>
						<button
							type="submit"
							className="btn btn-success mt-10 width40 ml-auto mr-auto"
							disabled={submitting}
						>
							{submitting ? "Sending Request" : "Add Worker"}
						</button>
					</form>
				</div>
			)}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		error: state.error,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AddWorker);
