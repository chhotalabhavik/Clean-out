import React from "react";

function ViewItemBar(props) {
	const { orderItemPacks, className, forShopkeeper, ...rest } = props;

	return (
		<div className={`flex flex-col width90 br-10 ml-auto mr-auto ${className}`} {...rest}>
			{orderItemPacks.map((orderItemPack) => (
				<div key={orderItemPack.orderItemPack._id}>
					<div className="flex flex-row pl-10 pr-10 pt-10">
						<p className="bold">
							{orderItemPack.item.itemName} [{orderItemPack.orderItemPack.count}]
						</p>
						<p className="ml-auto">Price : {orderItemPack.orderItemPack.price}</p>
					</div>
					<div className="flex flex-row pl-10 pr-10 pb-10">
						<p>{!forShopkeeper && orderItemPack.orderItemPack.status}</p>
					</div>
				</div>
			))}
		</div>
	);
}

export default ViewItemBar;
