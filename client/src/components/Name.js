import React from "react";
import VerifiedUserRoundedIcon from "@material-ui/icons/VerifiedUserRounded";

function Name(props) {
	const { isVerified, className, children } = props;
	return (
		<div className={`flex flex-row align-center ${className}`}>
			{children}
			{isVerified && <VerifiedUserRoundedIcon color="primary" />}
		</div>
	);
}

export default Name;
