// Node related imports
import assert from 'assert'

export const filterEmpty = (value) => value && value.trim() !== ''

export const assertType = (expected) => (received) => {
	for (const prop in expected) {
		assert(received, 'Received value must not be empty')
		assert(prop in received, `Received value is missing property ${prop}`)
	}
}

export const noop = (x) => x