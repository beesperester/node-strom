export const cache = {}

export default {
	createSignature: (name) => name,

	get: (signature) => (method) => {
		if (!Object.keys(cache).includes(signature)) {
			cache[signature] = method.apply()
		}

		return cache[signature]
	}
}