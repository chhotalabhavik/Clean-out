import React from "react";

import Name from "./Name";

function Worker(props) {
	const { workerUser, worker, className, ...rest } = props;
	const { userName, phone } = workerUser;
	const { profilePicture, isVerified } = worker;

	return (
		<div className={`flex flex-row ${className}`} {...rest}>
			<div className="width60 m-auto p-5">
				<img src={`/images/${profilePicture}`} alt={userName} height="150px" />
			</div>
			<div className="width40 flex flex-col ml-auto mr-auto p-10">
				<Name className="bold large-font-size" isVerified={isVerified}>
					{userName}
				</Name>
				<p className="mt-10">{phone}</p>
			</div>
		</div>
	);
}

export default Worker;
