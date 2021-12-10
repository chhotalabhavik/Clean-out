import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import Product from "./Product";
import ErrorText from "./ErrorText";
import Pagination from "./Pagination";
import { setError } from "../redux/actions";
import { RESPONSE, ROLE } from "../enums";
import { Axios } from "../utilities";

function ViewAllItems(props) {
	const { history, location, auth, error } = props;
	const { setError } = props;

	const [page, setPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getUser();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getUser() {
		if (auth.user.role === ROLE.SHOPKEEPER) getItems(1);
		else history.goBack();
	}

	async function getItems(page) {
		const res = await Axios.GET(`/item/items/${auth.user._id}`, { page });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setPage(page);
		setTotalItems(res.data.totalItems);
		setItems(res.data.items);
		setLoading(false);
	}

	function addItem() {
		setError("");
		history.push("/addItem");
	}

	return (
		<div className="flex flex-col min-h80 btn-main width100">
			{!loading && (
				<>
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="width80 ml-auto mr-auto flex flex-col">
						<div className="flex flex-row p-10 align-center">
							<p className="bold large-font-size">Items</p>
							<button className="btn btn-violet ml-auto" onClick={addItem}>
								Add Items
							</button>
						</div>
						<div className="flex flex-row flex-wrap ">
							{items.map((item) => (
								<Product
									key={item._id}
									item={item}
									className="btn-main mt-20 hover-pointer ml-auto mr-auto"
									onClick={() => history.push(`/viewItem/${item._id}`)}
									style={{ maxWidth: "18%", textAlign: "center" }}
								/>
							))}
						</div>
						{items.length > 0 ? (
							<Pagination
								itemsPerPage="10"
								totalItems={totalItems}
								currentPage={page}
								onPageChange={getItems}
								cut={3}
								className="mt-20 mb-50"
							/>
						) : (
							<p className="ml-auto mr-auto">No items found</p>
						)}
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewAllItems);
