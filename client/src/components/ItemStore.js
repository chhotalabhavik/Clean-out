import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";

import Product from "./Product";
import ErrorText from "./ErrorText";
import Pagination from "./Pagination";
import { RESPONSE } from "../enums";
import { Axios, scrollToTop } from "../utilities";
import { setError } from "../redux/actions";

function ItemStore(props) {
	const { history, location, auth, error } = props;
	const { setError } = props;

	const [page, setPage] = useState(1);
	const [items, setItems] = useState([]);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState("price");
	const [totalItems, setTotalItems] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getItems(page);
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	useEffect(() => {
		if (!loading) getItems(1);
	}, [sortBy]);

	async function getItems(pageNumber) {
		const res = await Axios.GET(`/item/store`, { sortBy, search, page: pageNumber });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setTotalItems(res.data.totalItems);
		setItems(res.data.items);
		setPage(pageNumber);
		setLoading(false);
		scrollToTop();
	}

	async function searchItem(event) {
		setError("");
		event.preventDefault();
		getItems(1);
	}

	function changeSortBy(value) {
		if (value === sortBy) return;
		setSortBy(value);
	}

	function viewItem(itemId) {
		setError("");
		history.push(`/viewItem/${itemId}`);
	}

	return (
		<div className="flex flex-col min-h80 btn-main">
			{!loading && (
				<div className="flex flex-col width90 ml-auto mr-auto p-10">
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="flex flex-row mt-10 align-center">
						<p className="bold large-font-size ml-10 width20">Items</p>
						<form className="flex flex-row align-center width80" onSubmit={searchItem}>
							<input
								type="text"
								placeholder="Search ..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								style={{
									backgroundColor: "white",
									paddingLeft: "10px",
									width: "40%",
									fontSize: "0.9rem",
								}}
								className="ml-auto"
							/>

							<SearchRoundedIcon
								className="ml-10 hover-pointer"
								onClick={searchItem}
							/>
						</form>
					</div>

					<div className="width100 flex flex-row mt-10 align-center">
						<p className="ml-auto mr-10">Sort By : </p>
						<div
							className={`pt-5 pb-5 pl-10 pr-10 br-10 hover-pointer ${
								sortBy === "price" ? "white btn-violet" : "btn-white"
							}`}
							onClick={() => changeSortBy("price")}
						>
							<input type="radio" name="sortBy" hidden />
							<label className="small-font-size normal hover-pointer">Price</label>
						</div>

						<div
							className={`pt-5 pb-5 pl-10 pr-10 br-10 hover-pointer ml-5 ${
								sortBy === "ratingValue" ? "white btn-violet" : "btn-white"
							}`}
							onClick={() => changeSortBy("ratingValue")}
						>
							<input type="radio" name="sortBy" hidden />
							<label className="small-font-size normal hover-pointer">Rating</label>
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

					<div className="flex flex-row flex-wrap justify-around mt-20">
						{items.map((item) => {
							const itemId = item._id;
							return (
								<>
									<Product
										key={itemId}
										item={item}
										onClick={() => viewItem(itemId)}
										className="hover-pointer p-10 mt-10"
										shopName={item.shopkeeper.shopName}
										style={{ maxWidth: "18%", textAlign: "center" }}
									/>
									<hr />
								</>
							);
						})}
					</div>

					{items.length ? (
						<Pagination
							itemsPerPage="10"
							totalItems={totalItems}
							currentPage={page}
							onPageChange={getItems}
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
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ItemStore);
