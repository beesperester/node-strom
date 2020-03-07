// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'
import { serialize } from '../../lib/utilities'

describe('tests strom.lib.head module', function () {
	const adapter = strom.lib.filesystem.adapters.memory.createAdapter()
	const filesystem = strom.lib.filesystem.createFilesystem(adapter)

	describe('tests createHead', function () {
		it('succeeds', function () {
			strom.lib.head.createHead(filesystem)

			const received = adapter.peek()
			const expected = {
				refs: {
					head: serialize('master')
				},
				branches: {
					master: serialize({
						name: 'master',
						commit: null
					})
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('tests getHead', function () {
		it('succeeds', function () {
			const received = strom.lib.head.getHead(filesystem)
			const expected = {
				name: 'master',
				commit: null
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('tests setHead', function () {
		it('succeeds', function () {
			const branch = strom.lib.branch.createBranch(filesystem)('development')()
			const received = strom.lib.head.setHead(filesystem)(branch)
			const expected = 'development'

			expect(received).to.equal(expected)
		})
	})
})
