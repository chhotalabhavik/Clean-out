import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import StarIcon from "@material-ui/icons/Star";

import Name from "./Name";
import ErrorText from "./ErrorText";
import Pagination from "./Pagination";
import ViewServiceBar from "./ViewServiceBar";
import { RESPONSE } from "../enums";
import { Axios } from "../utilities";
import { setError, getDataForHome } from "../redux/actions";

function ServiceStore(props) {
	const { history, location, auth, home, error } = props;
	const { setError, getDataForHome } = props;

	let category;
	if (location.state && location.state.category) category = location.state.category;

	const [page, setPage] = useState(1);
	const [services, setServices] = useState([]);
	const [pincode, setPincode] = useState("");
	const [sortBy, setSortBy] = useState("price");
	const [serviceCategory, setServiceCategory] = useState("");
	const [subCategoriesInput, setSubCategoriesInput] = useState({});
	const [totalItems, setTotalItems] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!home.isLoaded) return getDataForHome(history);

		const serCat = serviceCategory || category || home.serviceCategories[0].category;
		setServiceCategory(serCat);
		formatSubCategories(serCat);

		if (auth.isAuthenticated) getPincodeFromUser();
		else getPincodeFromPrompt();

		return () => {
			setLoading(true);
		};
	}, [location.pathname, home.isLoaded]);

	useEffect(() => {
		if (pincode) getServices(1);
	}, [pincode]);

	useEffect(() => {
		if (!loading) getServices(1);
	}, [sortBy]);

	useEffect(() => {
		if (!loading) getServices(1);
	}, [subCategoriesInput]);

	useEffect(() => {
		if (!loading) {
			getServices(1);
			formatSubCategories(serviceCategory);
		}
	}, [serviceCategory]);

	async function formatSubCategories(serCat) {
		let array = {};
		home?.serviceCategories
			.find((value) => value.category === serCat)
			?.subCategories.map((subCategory) => (array[subCategory.name] = false));

		setSubCategoriesInput(array);
	}

	function getSubCategoriesAsString() {
		let result = "";
		Object.keys(subCategoriesInput).map((subCategory) => {
			if (subCategoriesInput[subCategory]) result += `,${subCategory}`;
		});
		if (result) return result.substr(1);
		return result;
	}

	async function getPincodeFromUser() {
		const res = await Axios.GET(`/address/${auth.user._id}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setPincode(res.data.address.pincode);
	}

	function isValid(answer) {
		if (!answer || answer.length !== 6) return false;
		for (let i = 0; i < answer.length; i++)
			if (answer[i] < "0" || answer[i] > "9") return false;
		return true;
	}

	function getPincodeFromPrompt() {
		let answer = "";
		while (!answer || !isValid(answer)) {
			answer = prompt("Enter your pincode");
		}
		if (!answer) history.goBack();
		else setPincode(answer);
	}

	async function getServices(pageNumber) {
		const res = await Axios.GET(`/service/store`, {
			sortBy,
			pincode,
			page: pageNumber,
			subCategories: getSubCategoriesAsString(),
			serviceCategory: serviceCategory || home.serviceCategories[0].category,
		});
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setTotalItems(res.data.totalItems);
		setServices(res.data.services);
		setPage(pageNumber);
		setLoading(false);
	}

	function changeSortBy(value) {
		setError("");
		if (value === sortBy) return;
		setSortBy(value);
	}

	function changeServiceCategory(event) {
		setError("");
		setServiceCategory(event.target.value);
	}

	function toggleSubCategoryInput(subCategory) {
		setError("");
		setSubCategoriesInput((prev) => {
			const result = { ...prev };
			result[subCategory] = !result[subCategory];
			return result;
		});
	}

	function parseSubCategoryNames(subCategories) {
		const names = subCategories.map((subCategory) => subCategory.name);
		return names.join(", ");
	}

	return (
		<div className="flex flex-col min-h80 btn-main">
			{!loading && (
				<div className="flex flex-col ml-auto mr-auto mt-50 width90">
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="flex flex-row align-center">
						<select
							name="category"
							style={{
								fontSize: "1.5em",
								backgroundColor: "var(--main)",
								border: "none",
								fontWeight: "bold",
							}}
							value={serviceCategory}
							onChange={changeServiceCategory}
						>
							{home.serviceCategories.map((category) => (
								<option value={category.category}>
									{category.category.toUpperCase()}
								</option>
							))}
						</select>
						<div className="flex flex-row align-center ml-auto">
							<p className="ml-auto mr-10">Sort By : </p>
							<div
								className={`pt-5 pb-5 pl-10 pr-10 br-10 hover-pointer ${
									sortBy === "price" ? "white btn-violet" : "btn-white"
								}`}
								onClick={() => changeSortBy("price")}
							>
								<input type="radio" name="sortBy" hidden />
								<label className="small-font-size normal hover-pointer">
									Price
								</label>
							</div>

							<div
								className={`pt-5 pb-5 pl-10 pr-10 br-10 hover-pointer ml-5 ${
									sortBy === "ratingValue" ? "white btn-violet" : "btn-white"
								}`}
								onClick={() => changeSortBy("ratingValue")}
							>
								<input type="radio" name="sortBy" hidden />
								<label className="small-font-size normal hover-pointer">
									Rating
								</label>
							</div>

							<div
								className={`pt-5 pb-5 pl-10 pr-10 br-10 hover-pointer ml-5 ${
									sortBy === "orderedCount" ? "white btn-violet" : "btn-white"
								}`}
								onClick={() => changeSortBy("orderedCount")}
							>
								<input type="radio" name="sortBy" hidden />
								<label className="small-font-size normal hover-pointer">
									Popularity
								</label>
							</div>
						</div>
					</div>

					<div className="flex flex-col mt-20 mb-20">
						<div className="flex flex-row">
							<p className="white flex btn-violet pl-10 pr-10 pt-5 pb-5 br-10">
								Sub Categories
							</p>
						</div>

						<div className="flex flex-row flex-wrap mt-10">
							{Object.keys(subCategoriesInput).map((subCategory) => (
								<div
									key={subCategory}
									className="flex flex-row align-center pl-10 pr-10"
								>
									<input
										id={subCategory}
										type="checkbox"
										value={subCategoriesInput[subCategory]}
										className="hover-pointer"
										onChange={() => toggleSubCategoryInput(subCategory)}
									/>
									<label
										className="normal ml-5 hover-pointer"
										htmlFor={subCategory}
									>
										{subCategory}
									</label>
								</div>
							))}
						</div>
					</div>

					<div className="flex flex-row flex-wrap justify-around align-center">
						{services.map((value) => {
							const {
								workerService,
								service,
								workerUser,
								worker,
								shopkeeper,
								price,
							} = value;
							return (
								<div
									key={value._id}
									className="flex flex-row btn-white br-10 pl-10 width45 mt-10 mb-10 hover-pointer p-10 shadow"
									onClick={() =>
										history.push(`/viewWorkerService/${workerService._id}`)
									}
								>
									<div className="flex flex-row">
										<div className="flex">
											<img
												src={`/images/${worker.profilePicture}`}
												alt={workerUser.userName}
												height="100px"
												className="ml-auto mr-10 pt-10 pb-10"
											/>
										</div>

										<ViewServiceBar
											serviceName={service.serviceName}
											serviceCategory={service.serviceCategory}
											description={service.description}
											subCategories={parseSubCategoryNames(
												service.subCategories
											)}
											price={price}
										/>
									</div>

									<div className="flex flex-col align-center width20 mt-auto mb-auto ml-10">
										<Name isVerified={worker.isVerified}>
											{workerUser.userName}
										</Name>

										{shopkeeper && (
											<Name
												isVerified={shopkeeper.isVerified}
												className="small-font-size"
											>
												{shopkeeper.shopName}
											</Name>
										)}
										<div className="flex flex-row align-center">
											<p>{workerService.ratingValue}</p>
											<StarIcon className="violet" />
											<p className="ml-10">[{workerService.ratingCount}]</p>
										</div>
										<p className="">Ordered : {workerService.orderedCount}</p>
									</div>
								</div>
							);
						})}
					</div>

					{services.length ? (
						<Pagination
							itemsPerPage="10"
							totalItems={totalItems}
							currentPage={page}
							onPageChange={getServices}
							cut={3}
							className="mt-20 mb-50"
						/>
					) : (
						<p className="ml-auto mr-auto mt-50">No services found</p>
					)}
				</div>
			)}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
		error: state.error,
		home: state.home,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
		getDataForHome: (history) => getDataForHome(history)(dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceStore);
