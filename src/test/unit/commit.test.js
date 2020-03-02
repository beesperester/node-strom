// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'

describe('tests strom.lib.commit module', function () {
	describe('tests createCommit', function () {
		it('succeeds with expected arguments', function () {
			const repository = strom.lib.repository.createRepository('test')
			const received = strom.lib.commit.createCommit(repository)('initial commit')
			const expected = {
				id: '114017fd47121550446f06d57a16830104b665559d29e10e5c442b73c1a1327e',
				parent: null,
				message: 'initial commit'
			}

			expect(received).to.deep.equal(expected)
		})
	})
})
