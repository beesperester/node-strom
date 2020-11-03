import moment from 'moment'

export const sortMoment = (a, b) => {
	if (moment(a).isSame(b)) {
		return 0
	}
	else if (moment(a).isAfter(b)) {
		return 1
	} else {
		return -1
	}
}