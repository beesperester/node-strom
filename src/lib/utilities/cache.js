export const cache = {}

export const config = {
	enabled: true
}

export default {
	get: (signature) => (method) => {
		if (!config.enabled) {
			return method.apply()
		}

		if (!Object.keys(cache).includes(signature)) {
			cache[signature] = method.apply()
		}

		return cache[signature]
	},

	invalidate: (signature) => {
		if (Object.keys(cache).includes(signature)) {
			delete cache[signature]
		}
	},

	enable: () => {
		config.enabled = true
	},

	disable: () => {
		config.enabled = false
	}
}