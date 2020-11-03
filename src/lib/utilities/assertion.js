import assert from 'assert'

export const assertType = (expected) => (received) => {
	for (const prop in expected) {
		assert(received, 'Received value must not be empty')
		assert(prop in received, `Received value is missing property ${prop}`)
	}
}