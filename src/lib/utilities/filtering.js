import minimatch from 'minimatch'

export const filterEmptyString = (value) => value && value.trim() !== ''

export const filterMinimatchString = (patterns) => (items) => items.filter((x) => {
	const minimatchSettings = {
		dot: true
	}

	return !patterns.map((y) => {
		return minimatch(x, y, minimatchSettings)
	}).includes(false)
})