import React, { useState, useCallback } from "react";
import Canvas from "./Canvas";

function ImageInput({ name, multiple, onFileUpload }) {
	const [cameraOpen, setCameraOpen] = useState(false);

	const toggleCamera = useCallback(() => {
		setCameraOpen((prev) => !prev);
	}, []);

	const captureImage = useCallback((file) => onFileUpload(name, [file]), [name, onFileUpload]);

	const fileUpload = useCallback(
		(event) => {
			const files = event.target.files;
			const arr = [];
			if (files.length) {
				arr.push(files[0]);
				if (files[1]) arr.push(files[1]);
			}
			onFileUpload(name, arr);
		},
		[name, onFileUpload]
	);

	return (
		<>
			{cameraOpen && (
				<Canvas toggleCamera={toggleCamera} captureImage={captureImage}></Canvas>
			)}
			<input type="file" id={name} name={name} multiple={multiple} onChange={fileUpload} />
			<button
				type="button"
				className="btn camera"
				onClick={toggleCamera}
				disabled={cameraOpen}
			>
				Camera
			</button>
		</>
	);
}

export default ImageInput;
