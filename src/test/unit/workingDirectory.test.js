// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { describe, it, beforeEach } from 'mocha'
import strom from '../../index'
import * as setup from '../setup'

let filesystem, adapter, storage

const createFilesystem = () => {
	const result = setup.createFilesystem()

	filesystem = result.filesystem
	adapter = result.adapter
	storage = result.storage
}

describe('unit/workingDirectory', function () {
	describe('getState', function () {
		beforeEach(function () {
			createFilesystem()

			strom.lib.repository.initRepository(filesystem)
		})

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