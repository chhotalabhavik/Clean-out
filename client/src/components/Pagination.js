import React from "react";

function setValue(index) {
	switch (index) {
		case "left":
			return ["<", -3];
		case "right":
			return [">", 0];
		case "l.":
			return ["...", -2];
		case "r.":
			return ["...", -1];
		default:
			return [index, index];
	}
}

function Pagination(props) {
	let { itemsPerPage, totalItems, currentPage, onPageChange, cut, className, ...rest } = props;

	itemsPerPage = Number(itemsPerPage);
	totalItems = Number(totalItems);
	currentPage = Number(currentPage);
	cut = Number(cut);

	const leftCut = currentPage - cut;
	const rightCut = currentPage + cut;
	const lastPage = Math.ceil(totalItems / itemsPerPage);
	if (currentPage > lastPage) return <></>;

	let paginationBar = [box("left")];
	for (let i = 1; i <= lastPage; i++) paginationBar.push(box(i));
	paginationBar.push(box("right"));

	if (rightCut + 3 <= lastPage)
		paginationBar.splice(rightCut + 1, Math.max(lastPage - rightCut - 1, 0), box("r."));

	if (4 <= leftCut) paginationBar.splice(2, Math.max(leftCut - 2, 0), box("l."));

	return (
		<div className={`flex flex-row ${className}`} {...rest}>
			<div
				className="flex flex-row ml-auto mr-auto mt-10 mb-10 align-center"
				style={{ border: "1px solid black" }}
			>
				{paginationBar.map((val) => val)}
			</div>
		</div>
	);

	function box(val) {
		const [index, key] = setValue(val);
		const classes = `pl-10 pr-10 pt-5 pb-5 hover-pointer ${
			index === currentPage ? "white btn-violet" : "btn-white"
		}`;

		return (
			<div key={key} className={classes} onClick={() => handlePageClick(index)}>
				<p className="hover-pointer">{index}</p>
			</div>
		);
	}

	function handlePageClick(index) {
		switch (index) {
			case "...":
				return;
			case "<": {
				if (currentPage === 1) return;
				return onPageChange(currentPage - 1);
			}
			case ">": {
				if (currentPage === lastPage) return;
				return onPageChange(currentPage + 1);
			}
			default: {
				onPageChange(Number(index));
			}
		}
	}
}

export default Pagination;
