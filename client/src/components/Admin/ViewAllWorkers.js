import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import Name from "../Name";
import ErrorText from "../ErrorText";
import Pagination from "../Pagination";
import { setError } from "../../redux/actions";
import { RESPONSE } from "../../enums";
import { Axios } from "../../utilities";

function ViewAllWorkers(props) {
	const { history, location, match, error } = props;
	const { setError } = props;
	const userId = match.params.userId;

	const [page, setPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [workers, setWorkers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getWorkers(1);
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function getWorkers(page) {
		const res = await Axios.GET(`/shopkeeper/workers/${userId}`, { page });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		setPage(page);
		setTotalItems(res.data.totalItems);
		setWorkers(res.data.workers);
		setLoading(false);
	}

	function addWorker() {
		setError("");
		history.push(`/admin/addWorker/${userId}`);
	}

	async function removeWorker(index) {
		setError("");
		const workerId = workers[index]._id;
		const res = await Axios.DELETE(`/shopkeeper/worker/${userId}`, { workerId });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setWorkers((prev) => {
			const result = [...prev];
			result.splice(index, 1);
			return result;
		});
	}

	return (
		<div className="flex flex-col min-h80 btn-main width100">
			{!loading && (
				<>
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="width80 ml-auto mr-auto flex flex-col">
						<div className="flex flex-row p-10 align-center">
							<p className="bold large-font-size">Workers</p>
							<button className="btn btn-violet ml-auto" onClick={addWorker}>
								Add Workers
							</button>
						</div>
						<div className="flex flex-row flex-wrap justify-around">
							{workers.map((value, index) => {
								const { worker, workerUser } = value;

								return (
									<>
										<div
											key={workerUser._id}
											className="flex flex-row btn-light br-10 shadow mr-10 ml-10 mt-10 mb-10"
										>
											<div className="width60 m-auto p-5">
												<img
													src={`/images/${worker.profilePicture}`}
													alt={workerUser.userName}
													height="150px"
												/>
											</div>
											<div className="width40 flex flex-col ml-auto mr-auto p-10">
												<Name
													className="bold large-font-size"
													isVerified={worker.isVerified}
												>
													{workerUser.userName}
												</Name>
												<p className="">{workerUser.phone}</p>
												<button
													className="btn btn-success mt-10"
													onClick={() =>
														history.push(`/viewWorker/${value._id}`)
													}
												>
													View
												</button>
												<button
													className="btn btn-danger mt-5"
													onClick={() => removeWorker(index)}
												>
													Remove
												</button>
											</div>
										</div>
									</>
								);
							})}
						</div>
						{workers.length > 0 ? (
							<Pagination
								itemsPerPage="10"
								totalItems={totalItems}
								currentPage={page}
								onPageChange={getWorkers}
								cut={3}
								className="mt-20 mb-50"
							/>
						) : (
							<p className="ml-auto mr-auto mt-50">No workers found</p>
						)}
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewAllWorkers);
