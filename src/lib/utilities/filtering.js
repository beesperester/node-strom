import minimatch from 'minimatch'

export const filterEmptyString = (value) => value && String(value).trim() !== ''

export const filterEqual = (initialValue) => (value) => value && initialValue === value

export const filterMinimatchString = (patterns) => (value) => {
	const minimatchSettings = {
		dot: true
	}

	return !patterns.map((pattern) => {
		return minimatch(value, pattern, minimatchSettings)
	}).includes(false)
}