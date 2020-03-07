// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'
import { serialize } from '../../lib/utilities'

describe('tests strom.lib.commit module', function () {
	const adapter = strom.lib.filesystem.adapters.memory.createAdapter()
	const filesystem = strom.lib.filesystem.createFilesystem(adapter)

	describe('tests createCommit', function () {
		it('succeeds', function () {
			const received = strom.lib.commit.createCommit(filesystem)(null)(null)('initial commit')
			const expected = '95054ee719fc41bb1095efb3db3673f423b3cb2b9b505ac0d13b78f5a471aaf4'

			expect(received).to.equal(expected)

			const expectedFilesystemState = {
				objects: {
					'95': {
						'05': {
							'4ee719fc41bb1095efb3db3673f423b3cb2b9b505ac0d13b78f5a471aaf4': serialize({
								parent: null,
								tree: null,
								message: 'initial commit'
							})
						}
					}
				}
			}

			expect(adapter.state()).to.deep.equal(expectedFilesystemState)
		})
	})

	describe('tests getCommit', function () {
		it('succeeds', function () {
			const received = strom.lib.commit.getCommit(filesystem)('95054ee719fc41bb1095efb3db3673f423b3cb2b9b505ac0d13b78f5a471aaf4')
			const expected = {
				parent: null,
				tree: null,
				message: 'initial commit'
			}

			expect(received).to.deep.equal(expected)
		})
	})
})
