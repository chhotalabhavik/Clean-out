import React from "react";

function ErrorText(props) {
	const { className, children } = props;
	return (
		<div className="danger flex flex-row ml-auto mr-auto">
			<p className={className}>{children}</p>
		</div>
	);
}

export default ErrorText;
