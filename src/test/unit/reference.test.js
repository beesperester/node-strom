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

describe('unit/reference', function () {
	describe('getHead', function () {
		beforeEach(function () {
			createFilesystem()

			strom.lib.repository.initRepository(filesystem)
		})

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