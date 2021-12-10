import React, { useState, useEffect, useRef, useCallback } from "react";
import { dataURLtoFile, timeout } from "../utilities";

function Canvas({ captureImage, toggleCamera }) {
	const videoPlayerRef = useRef(null);
	const [isCaptured, setIsCaptured] = useState(false);

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({
				audio: false,
				video: true,
			})
			.then((stream) => {
				videoPlayerRef.current.srcObject = stream;
				videoPlayerRef.current.onloadedmetadata = () => {
					videoPlayerRef.current.play();
				};
				window.localStream = stream;
			})
			.catch((err) => {
				console.log(err);
			});

		return () => {
			window.localStream.getTracks().map((track) => track.stop());
			// videoPlayerRef.current.srcObject.getTracks()[0].stop();
		};
	}, []);

	useEffect(() => {
		const reload = async () => {
			if (isCaptured) {
				await timeout(0.5);
				setIsCaptured(false);
			}
		};
		reload();
	}, [isCaptured]);

	const takePhoto = useCallback(() => {
		setIsCaptured(true);
		const canvas = document.createElement("canvas");
		canvas.width = videoPlayerRef.current.width;
		canvas.height = videoPlayerRef.current.height;

		const context = canvas.getContext("2d");
		context.drawImage(videoPlayerRef.current, 0, 0, 480, 360);
		const file = dataURLtoFile(canvas.toDataURL("image/jpeg"), "temp.jpeg");
		captureImage(file);
	}, [captureImage]);

	return (
		<div className="canvas">
			<video ref={videoPlayerRef} width="480" height="360" />
			<div className="buttons">
				<button type="button" className="btn btn-black mt-10" onClick={takePhoto}>
					Take photo!
				</button>
				<button type="button" className="btn btn-black mt-10 ml-10" onClick={toggleCamera}>
					Close Camera
				</button>
			</div>
			{isCaptured && <p>Captured</p>}
		</div>
	);
}

export default Canvas;
