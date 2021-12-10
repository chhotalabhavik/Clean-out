import React from "react";
import StarIcon from "@material-ui/icons/Star";

function Product(props) {
	const { itemName, itemImage, price, ratingValue, orderedCount, isAvailable } = props.item;
	const { shopName, className, ...rest } = props;

	return (
		<div
			className={`flex flex-col align-center ${className}`}
			style={{ textAlign: "center" }}
			{...rest}
		>
			<img src={`/images/${itemImage}`} alt={itemName} height="180px" />
			<p>{itemName}</p>
			{shopName && <p>From : {shopName}</p>}
			<p>Price : {price}</p>
			<p>{isAvailable ? "In stock" : "Out of stock"}</p>
			<div className="flex flex-row align-center">
				<p>{ratingValue}</p>
				<StarIcon className="violet" />
			</div>
			{orderedCount !== null && <p>Ordered : {orderedCount}</p>}
		</div>
	);
}

export default Product;
