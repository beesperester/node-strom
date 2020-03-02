// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'

describe('tests strom.lib.dict module', function () {
	describe('tests deflate', function() {
		it('succeeds with expected arguments', function() {
			const received = strom.lib.dict.deflate({
				path: {
					to: {
						some: {
							leaf: 'hello'
						},
						another: {
							leaf: 'world'
						}
					}
				}
			})('')
			const expected = {
				'path/to/some/leaf': 'hello',
				'path/to/another/leaf': 'world'
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('tests inflate', function() {
		it('succeeds with expected arguments', function () {
			const received = strom.lib.dict.inflate({
				'path/to/some/leaf': 'hello',
				'path/to/another/leaf': 'world'
			})
			const expected = {
				path: {
					to: {
						some: {
							leaf: 'hello'
						},
						another: {
							leaf: 'world'
						}
					}
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})
})
