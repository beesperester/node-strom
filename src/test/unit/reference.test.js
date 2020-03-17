// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { describe, it } from 'mocha'
import strom from '../../index'
import * as setup from '../setup'

describe('unit/reference', function () {
	const { filesystem } = setup.createFilesystem()

	strom.lib.repository.initRepository(filesystem)

	describe('getHead', function () {
		it('succeeds', function () {
			const received = strom.lib.reference.getHead(filesystem)
			const expected = {
				type: 'branch',
				reference: 'master'
			}

			expect(received).to.deep.equal(expected)
		})
	})
})