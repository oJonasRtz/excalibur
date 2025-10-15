
export function  getTime(timestamp, flag = false) {
	const date = new Date(timestamp);

	const hour = String(date.getHours()).padStart(2, '0');
	const minute = String(date.getMinutes()).padStart(2, '0');
	const second = String(date.getSeconds()).padStart(2, '0');

	if (flag) return {hour, minute, second};

	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();

	return {day, month, year, hour, minute, second};
}
