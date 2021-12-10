import React from "react";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";

function PaginationBar(props) {
	const { className, onPrevious, onNext, disablePrevious, disableNext } = props;
	return (
		<div className={`flex flex-row violet ml-auto mr-auto ${className}`}>
			<ArrowBackIosRoundedIcon
				transform="scale(1.3)"
				cursor={disablePrevious ? "not-allowed" : "pointer"}
				onClick={disablePrevious ? () => {} : onPrevious}
			/>
			<ArrowBackIosRoundedIcon
				transform="scale(1.3) rotate(180)"
				cursor={disableNext ? "not-allowed" : "pointer"}
				onClick={disableNext ? () => {} : onNext}
				className="ml-5"
			/>
		</div>
	);
}

export default PaginationBar;
