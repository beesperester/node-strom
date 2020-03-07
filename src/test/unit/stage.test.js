// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'

describe('tests strom.lib.stage module', function () {
	const stage = strom.lib.stage.createStage()

	describe('tests add', function () {
		it('succeeds', function () {
			const received = stage.add('path/to/some/file.txt')
			const expected = [
				'path/to/some/file.txt'
			]

			expect(received).to.deep.equal(expected)
		})
	})

	describe('tests includes', function () {
		it('succeeds', function () {
			const received = stage.includes('path/to/some/file.txt')

			expect(received).to.be.true
		})
	})

	describe('tests remove', function () {
		it('succeeds', function () {
			const received = stage.remove('path/to/some/file.txt')
			const expected = []

			expect(received).to.deep.equal(expected)
		})
	})
})
