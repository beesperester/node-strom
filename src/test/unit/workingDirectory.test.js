// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { describe, it } from 'mocha'
import strom from '../../index'
import { getFilesystem, workingDirectory } from '../setup'

describe('unit/workingDirectory', function () {
	const { filesystem } = getFilesystem()

	strom.lib.repository.initRepository(filesystem)

	describe('getState', function () {
		it('succeeds', function () {
			const received = strom.lib.workingDirectory.getState(filesystem)
			const expected = {
				added: Object.keys(workingDirectory),
				modified: [],
				removed: []
			}

			expect(received).to.deep.equal(expected)
		})
	})
})