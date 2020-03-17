// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { describe, it } from 'mocha'
import strom from '../../index'
import { getFilesystem } from '../setup'

describe('unit/branch', function () {
	const { filesystem } = getFilesystem()

	strom.lib.repository.initRepository(filesystem)

	describe('checkoutBranch', function () {
		it('succeeds', function () {
			strom.lib.branch.checkoutBranch(filesystem)('development')

			const received = strom.lib.reference.getHead(filesystem)
			const expected = {
				type: 'branch',
				reference: 'development'
			}

			expect(received).to.deep.equal(expected)
		})
	})
})