import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { Axios } from "../../utilities";
import { setError } from "../../redux/actions";
import { RESPONSE, ROLE } from "../../enums";
import ErrorText from "../ErrorText";

function ServiceCategories(props) {
	const { auth, error, location, history } = props;
	const { setError } = props;

	const [serviceCategories, setServiceCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (auth.user.role !== ROLE.ADMIN) return history.goBack();
		getServiceCategories();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getServiceCategories() {
		const res = await Axios.GET("/serviceCategory");
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setServiceCategories(res.data.categories);
		setLoading(false);
	}

	return (
		<div className="min-h80 btn-main flex flex-col">
			{!loading && (
				<div className="flex flex-col width90 ml-auto mr-auto">
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="flex flex-row align-center mt-20">
						<p className="bold large-font-size">Service Categories</p>
						<Link
							className="btn btn-violet white ml-auto mr-10"
							to="/admin/addServiceCategory"
						>
							Add Service Category
						</Link>
					</div>

					<div className="flex flex-row flex-wrap mt-20">
						{serviceCategories.map((serviceCategory) => {
							return (
								<Link
									className="ml-auto mr-auto btn-light p-10 shadow br-10 black"
									style={{ maxWidth: "18%" }}
									to={`/admin/viewServiceCategory/${serviceCategory._id}`}
								>
									{serviceCategory.category}
								</Link>
							);
						})}
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

export default connect(mapStateToProps, mapDispatchToProps)(ServiceCategories);
