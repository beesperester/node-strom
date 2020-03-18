export const cache = {}

export default {
	get: (signature) => (method) => {
		if (!Object.keys(cache).includes(signature)) {
			cache[signature] = method.apply()
		}

		return cache[signature]
	},

	invalidate: (signature) => {
		if (Object.keys(cache).includes(signature)) {
			delete cache[signature]
		}
	}
}