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
			const received = strom.lib.commit.createCommit(filesystem)(null)('initial commit')
			const expected = '114017fd47121550446f06d57a16830104b665559d29e10e5c442b73c1a1327e'

			expect(received).to.equal(expected)

			const expectedFilesystemState = {
				objects: {
					'11': {
						'40': {
							'17fd47121550446f06d57a16830104b665559d29e10e5c442b73c1a1327e': serialize({
								parent: null,
								message: 'initial commit'
							})
						}
					}
				}
			}

			expect(adapter.peek()).to.deep.equal(expectedFilesystemState)
		})
	})
})
