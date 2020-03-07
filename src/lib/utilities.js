// Node related imports
import minimatch from 'minimatch'
import assert from 'assert'
import S from 'sanctuary'

export const filterEmpty = (value) => value && value.trim() !== ''

export const assertType = (expected) => (received) => {
	for (const prop in expected) {
		assert(received, 'Received value must not be empty')
		assert(prop in received, `Received value is missing property ${prop}`)
	}
}

export const noop = (x) => x

export const minimatchFilter = (patterns) => (items) => items.filter((x) => {
	const minimatchSettings = {
		dot: true
	}

	return !patterns.map((y) => {
		return minimatch(x, y, minimatchSettings)
	}).includes(false)
})

export const attempt = (f) => {
	const context = this
	try {
		return S.Right(f.call(context))
	} catch (exception) {
		return S.Left(new Error('Unable to attempt function call'))
	}
}

export const serialize = (data) => JSON.stringify(data, undefined, 2)