// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'
import { serialize } from '../../lib/utilities/serialization'
import { inflate } from '../../lib/utilities/map'
import { workingDirectory } from '../setup'

describe('tests repository bundle', function () {
	const storage = inflate(workingDirectory)
	const adapter = strom.lib.filesystem.adapters.memory.createBundle(storage)
	const filesystem = strom.lib.filesystem.createBundle(adapter)
	const repository = strom.lib.repository.createBundle(filesystem)

	describe('repository.init', function () {
		it('creates repository structure', function () {
			/**
			 * creates neccessary directories and files if missing,
			 * creates master branch if missing
			 * .strom
			 * 	|- stage
			 * 	|- objects
			 * 	|- references
			 * 	|	|- head
			 *  |	|- tags		
			 * 	|- branches
			 * 		|- master
			*/
			repository.init()

			const received = filesystem.adapter.state()
			const expected = {
				...storage,

				'.strom': {
					stage: serialize({
						add: [],
						remove: []
					}),
					branches: {
						master: serialize({
							commit: null
						})
					},
					objects: {},
					references: {
						head: serialize({
							type: 'branch',
							reference: 'branches/master'
						}),
						tags: {}
					}
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})
})