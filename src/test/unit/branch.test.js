// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'
import { serialize } from '../../lib/utilities'

describe('tests strom.lib.branch module', function () {
	const adapter = strom.lib.filesystem.adapters.memory.createAdapter()
	const filesystem = strom.lib.filesystem.createFilesystem(adapter)

	describe('tests createBranch', function () {
		it('succeeds', function () {
			const received = strom.lib.branch.createBranch(filesystem)('development')(null)
			const expected = 'development'

			expect(received).to.equal(expected)

			const expectedAdapterState = {
				branches: {
					development: serialize({
						commit: null
					})
				}
			}

			expect(adapter.state()).to.deep.equal(expectedAdapterState)
		})
	})
})
