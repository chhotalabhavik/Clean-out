const stringToArray = (string) => {
	string = string.split(",");
	return string.map((str) => str.trim());
};

const arrayToString = (array) => {
	return array.join(", ");
};

module.exports = {
	stringToArray,
	arrayToString,
};
