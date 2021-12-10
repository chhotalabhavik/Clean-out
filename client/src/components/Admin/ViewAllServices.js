import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import ErrorText from "../ErrorText";
import ViewServiceBar from "../ViewServiceBar";
import Pagination from "../Pagination";
import { setError } from "../../redux/actions";
import { RESPONSE, ROLE } from "../../enums";
import { Axios } from "../../utilities";

function ViewAllServices(props) {
	const { history, location, match, error } = props;
	const { setError } = props;
	const userId = match.params.userId;

	const [page, setPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId) return history.goBack();
		getUser();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getUser() {
		let res = await Axios.GET(`/user/${userId}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		const user = res.data.user;
		if (user.role === ROLE.WORKER) {
			res = await Axios.GET(`/worker/${userId}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else {
				if (res.data.worker.isDependent === "true") history.goBack();
				else getServices(1);
			}
		} else if (user.role === ROLE.SHOPKEEPER) getServices(1);
		else history.goBack();
	}

	async function getServices(page) {
		const res = await Axios.GET(`/service/services/${userId}`, { page });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setPage(page);
		setServices(res.data.services);
		setTotalItems(res.data.totalItems);
		setLoading(false);
	}

	function addService() {
		setError("");
		history.push(`/admin/addService/${userId}`);
	}

	function parseSubCategoryNames(subCategories) {
		if (!subCategories) return;
		let names = subCategories.map((subCategory) => subCategory.name);
		return names.join(", ");
	}

	return (
		<div className="width100 flex flex-col btn-main min-h80">
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
										onClick={() =>
											history.push(`/admin/viewService/${service._id}`)
										}
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
		error: state.error,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewAllServices);
