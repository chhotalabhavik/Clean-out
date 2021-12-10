import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import ErrorText from "./ErrorText";
import Pagination from "./Pagination";
import ViewServiceBar from "./ViewServiceBar";
import { setError } from "../redux/actions";
import { RESPONSE, ROLE } from "../enums";
import { Axios } from "../utilities";

function ViewAllServices(props) {
	const { history, location, auth, error } = props;
	const { setError } = props;

	const [page, setPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getUser();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getUser() {
		if (auth.user.role === ROLE.WORKER) {
			const res = await Axios.GET(`/worker/${auth.user._id}`);
			if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

			if (res.data.worker.isDependent === "true") history.goBack();
			else getServices(1);
		} else if (auth.user.role === ROLE.SHOPKEEPER) getServices(1);
		else history.goBack();
	}

	async function getServices(page) {
		const res = await Axios.GET(`/service/services/${auth.user._id}`, { page });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setPage(page);
		setServices(res.data.services);
		setTotalItems(res.data.totalItems);
		setLoading(false);
	}

	function addService() {
		setError("");
		history.push("/addService");
	}

	function parseSubCategoryNames(subCategories) {
		if (!subCategories) return;
		let names = subCategories.map((subCategory) => subCategory.name);
		return names.join(", ");
	}

	return (
		<div className="flex flex-col btn-main min-h80">
			{!loading && (
				<>
					{error.error && <ErrorText>{error.error}</ErrorText>}

					<div className="width90 ml-auto mr-auto flex flex-col mt-20">
						<div className="flex flex-row align-center">
							<p className="bold large-font-size">Services</p>
							<button className="btn btn-violet ml-auto" onClick={addService}>
								Add Service
							</button>
						</div>

						<div className="flex flex-row justify-around flex-wrap mt-10">
							{services.length > 0 &&
								services.map((service) => (
									<ViewServiceBar
										key={service._id}
										serviceName={service.serviceName}
										serviceCategory={service.serviceCategory}
										description={service.description}
										subCategories={parseSubCategoryNames(service.subCategories)}
										className="btn-light mt-20 width30 hover-pointer height-fit p-10 shadow"
										onClick={() => history.push(`/viewService/${service._id}`)}
									/>
								))}
						</div>
						{services.length > 0 && (
							<Pagination
								itemsPerPage="10"
								totalItems={totalItems}
								currentPage={page}
								onPageChange={getServices}
								cut={3}
								className="mt-20 mb-50"
							/>
						)}
						{!services.length && <p className="ml-auto mr-auto">No services found</p>}
					</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewAllServices);
