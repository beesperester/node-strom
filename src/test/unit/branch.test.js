// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { beforeEach, describe, it } from 'mocha'
import strom from '../../index'
import { serialize } from '../../lib/utilities/serialization'
import * as setup from '../setup'

let filesystem, adapter, storage

const createFilesystem = () => {
	const result = setup.createFilesystem()

	filesystem = result.filesystem
	adapter = result.adapter
	storage = result.storage
}

describe('unit/branch', function () {
	describe('checkoutBranch', function () {
		beforeEach(function () {
			createFilesystem()

			strom.lib.repository.initRepository(filesystem)
		})

		it('checkout branch "development"', function () {
			strom.lib.branch.checkoutBranch(filesystem)('development')

			const state = filesystem.adapter.state()
			const received = {
				references: state['.strom'].references,
				branches: state['.strom'].branches
			}
			const expected = {
				references: {
					head: serialize({
						type: 'branch',
						reference: 'development'
					}),
					tags: {}
				},
				branches: {
					master: serialize({
						commit: null
					}),
					development: serialize({
						commit: null
					})
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})
})