import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import Name from "./Name";
import ErrorText from "./ErrorText";
import { RESPONSE, ROLE } from "../enums";
import { Axios } from "../utilities";
import { setError } from "../redux/actions";

function ViewWorker(props) {
	const { history, location, match, auth, error } = props;
	const { setError } = props;

	const workerId = match.params.workerId;
	const [workerUser, setWorkerUser] = useState(null);
	const [address, setAddress] = useState(null);
	const [worker, setWorker] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getWorker();
		async function getWorker() {
			if (!workerId) history.goBack();
			const res = await Axios.GET(`/worker/${workerId}`);
			if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

			const data = res.data;
			if (
				data.worker.shopkeeperId !== auth.user._id &&
				![ROLE.ADMIN, ROLE.COADMIN].includes(auth.user.role)
			)
				history.goBack();
			setWorkerUser(data.workerUser);
			setAddress(data.address);
			setWorker(data.worker);
			setLoading(false);
		}

		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	async function removeWorker() {
		setError("");
		const res = await Axios.DELETE(`/shopkeeper/worker/${auth.user._id}`, { workerId });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		history.goBack();
	}

	return (
		<div className="min-h80 btn-main flex flex-col">
			{!loading && (
				<>
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="flex flex-row width90 ml-auto mr-auto">
						<div className="flex flex-col width40">
							<div className="flex flex-row width90 mr-auto">
								<div className="flex flex-col">
									<Name
										className="mt-50 bold large-font-size"
										isVerified={worker.isVerified}
									>
										{workerUser.userName}
									</Name>
									<p>{workerUser.phone}</p>
									<p>
										{address.society}, {address.area}, {address.city},{" "}
										{address.state} - {address.pincode}
									</p>
									<p className="bold mt-20">Preferred Locations : </p>
									<p>{worker.pincodes}</p>
								</div>

								<img
									src={`/images/${worker.profilePicture}`}
									className="mt-50 ml-auto"
									height="160px"
									alt={workerUser.userName}
								/>
							</div>

							<button
								className="btn btn-danger ml-auto mr-auto mt-20 p-auto"
								onClick={removeWorker}
							>
								Remove
							</button>
						</div>

						<div className="width60">
							<div className="flex flex-col width90 m-auto">
								<div className="flex flex-row">
									{worker.proofs.map((proof) => (
										<img
											key={proof}
											className="mt-10 mr-10"
											src={`/images/${proof}`}
											height="200px"
											alt="Proof"
										></img>
									))}
								</div>
							</div>
						</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewWorker);
