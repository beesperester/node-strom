// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { describe, it, beforeEach } from 'mocha'
import strom from '../../index'
import { getBlobPath, getTreePath } from '../../lib/tree'
import { noop } from '../../lib/utilities'
import { hashMap } from '../../lib/utilities/hashing'
import { inflate } from '../../lib/utilities/map'
import { serialize } from '../../lib/utilities/serialization'
import * as setup from '../setup'

let filesystem, adapter, storage

const createFilesystem = () => {
	const result = setup.createFilesystem()

	filesystem = result.filesystem
	adapter = result.adapter
	storage = result.storage
}

describe('unit/repository', function () {
	describe('initRepository', function () {
		beforeEach(function () {
			createFilesystem()

			strom.lib.repository.initRepository(filesystem)
		})

		it('succeeds', function () {
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
			strom.lib.repository.initRepository(filesystem)

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
							reference: 'master'
						}),
						tags: {}
					}
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('commitRepository', function () {
		it('succeeds', function () {
			strom.lib.stage.stageFiles(filesystem)([
				'setup-cinema4d/model_main.c4d'
			])

			const commitId = strom.lib.repository.commitRepository(filesystem)('initial commit')

			const tree = inflate(
				strom.lib.workingDirectory.getWorkingDirectoryFileHashed(filesystem)('setup-cinema4d/model_main.c4d')
			)

			const received = strom.lib.commit.getCommit(filesystem)(commitId)

			delete received['created']

			const expected = {
				author: {
					name: 'Bernhard Esperester',
					email: 'bernhard@esperester.de'
				},
				parents: [],
				message: 'initial commit',
				tree: hashMap(
					tree
				)(getTreePath)(getBlobPath)(noop)
			}

			expect(received).to.deep.equal(expected)
		})
	})
})