// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { describe, it } from 'mocha'
import strom from '../../index'
import * as setup from '../setup'

describe('unit/workingDirectory', function () {
	const { filesystem } = setup.createFilesystem()

	strom.lib.repository.initRepository(filesystem)

	describe('getState', function () {
		it('succeeds', function () {
			const received = strom.lib.workingDirectory.getState(filesystem)
			const expected = {
				added: Object.keys(setup.workingDirectory),
				modified: [],
				removed: []
			}

			expect(received).to.deep.equal(expected)
		})
	})
})