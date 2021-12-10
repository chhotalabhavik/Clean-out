import React from "react";

function ViewServiceBar(props) {
	const {
		serviceName,
		serviceCategory,
		subCategories,
		description,
		price,
		workerName,
		status,
		onNameClick,
		placedDate,
		deliveredDate,
		className,
		...rest
	} = props;

	return (
		<div className={`flex flex-col br-10 ${className}`} {...rest}>
			<div className="flex flex-row">
				<p
					className={`bold ${onNameClick ? "hover-pointer" : ""}`}
					onClick={onNameClick ? () => onNameClick() : () => {}}
				>
					{serviceName} [{serviceCategory}]
				</p>
				{workerName && <p className="ml-auto">{workerName}</p>}
			</div>

			<p className="small-font-size">Sub Categories : {subCategories}</p>

			{description && <p className="small-font-size">Description : {description}</p>}

			<div className="flex flex-row mt-auto justify-between">
				<div className="flex flex-col">
					{price && <p>Price : {price}</p>}
					{placedDate && <p>Placed Date : {placedDate}</p>}
				</div>
				<div className="flex flex-col text-right">
					{status && <p>Status : {status}</p>}
					{deliveredDate && <p>Delivered Date : {deliveredDate}</p>}
				</div>
			</div>
		</div>
	);
}

export default ViewServiceBar;
