import React, { useState, useEffect } from "react";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import EjectRoundedIcon from "@material-ui/icons/EjectRounded";
import { Axios, timeout } from "../utilities";
import { RESPONSE } from "../enums";

function FeedbackForm(props) {
	const { auth, targetId, target } = props;
	const { setError, onFeedbackChange } = props;
	const [ratingId, setRatingId] = useState(null);
	const [feedback, setFeedback] = useState(3);
	const [description, setDescription] = useState("");
	const [added, setAdded] = useState(false);
	const [updated, setUpdated] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getPrevRating();
		async function getPrevRating() {
			const res = await Axios.GET(`/rating/targetAndUser/${auth.user._id}`, { targetId });
			if (res.success === RESPONSE.SUCCESS) {
				setRatingId(res.data.rating._id);
				setFeedback(res.data.rating.ratingValue);
				setDescription(res.data.rating.description);
			}
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		changeStatus();
		async function changeStatus() {
			if (added) {
				await timeout(2);
				setAdded(false);
			}
			if (updated) {
				await timeout(2);
				setUpdated(false);
			}
		}
	}, [added, updated]);

	function handleChange(event) {
		setDescription(event.target.value);
	}

	async function handleSubmit() {
		setError("");
		if (ratingId) {
			const res = await Axios.PUT(`/rating/${ratingId}`, {
				ratingValue: feedback,
				description,
				target,
			});
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			setUpdated(true);
		} else {
			const res = await Axios.POST(`/rating/${auth.user._id}`, {
				targetId,
				ratingValue: feedback,
				description,
				target,
			});

			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else {
				setRatingId(res.data.id);
				setAdded(true);
			}
		}
		onFeedbackChange();
	}

	return (
		<div className={`feedback_form ${props.className}`}>
			{!loading && (
				<div className="flex flex-col">
					<p>Feedback</p>
					<div className="feedback_form_stars">
						{[...Array(5)].map((val, index) => (
							<div key={index}>
								<input type="radio" name="feedback" />
								<label onClick={() => setFeedback(index + 1)}>
									{feedback >= index + 1 ? (
										<StarIcon className="violet mr-20" transform="scale(2)" />
									) : (
										<StarBorderIcon
											className="violet mr-20"
											transform="scale(2)"
										/>
									)}
								</label>
							</div>
						))}
					</div>
					<div className="feedback_form_description">
						<textarea
							className="mt-20"
							value={description}
							onChange={handleChange}
							placeholder="Write something..."
						/>
						<EjectRoundedIcon
							transform="scale(2) rotate(90)"
							className="ml-10 mt-20 violet hover-pointer"
							onClick={handleSubmit}
						/>
					</div>
					{added && <p className="ml-auto mr-auto mt-10 success">Added feedback</p>}
					{updated && <p className="ml-auto mr-auto mt-10 success">Updated feedback</p>}
				</div>
			)}
		</div>
	);
}

export default FeedbackForm;
