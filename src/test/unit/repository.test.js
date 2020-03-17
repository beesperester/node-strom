// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { describe, it } from 'mocha'
import strom from '../../index'
import { getBlobPath, getTreePath } from '../../lib/tree'
import { noop } from '../../lib/utilities'
import { hashMap } from '../../lib/utilities/hashing'
import { inflate } from '../../lib/utilities/map'
import { serialize } from '../../lib/utilities/serialization'
import { workingDirectory } from '../setup'

describe('tests repository', function () {
	const storage = inflate(workingDirectory)
	const adapter = strom.lib.filesystem.adapters.memory.createAdapter(storage)
	const filesystem = strom.lib.filesystem.createFilesystem(adapter)

	describe('repository', function () {
		it('initRepository', function () {
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

	describe('workingDirectory', function () {
		it('getState', function () {
			const received = strom.lib.workingDirectory.getState(filesystem)
			const expected = {
				added: Object.keys(workingDirectory),
				modified: [],
				removed: []
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('repository', function () {
		it('commitRepository', function () {
			strom.lib.stage.stageFiles(filesystem)([
				'setup-cinema4d/model_main.c4d'
			])

			const commitId = strom.lib.repository.commitRepository(filesystem)('initial commit')

			const tree = inflate(
				strom.lib.workingDirectory.getWorkingDirectoryFile(filesystem)('setup-cinema4d/model_main.c4d')
			)

			const received = strom.lib.commit.getCommit(filesystem)(commitId)
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

	describe('reference', function () {
		it('getHead', function () {
			const received = strom.lib.reference.getHead(filesystem)
			const expected = {
				type: 'branch',
				reference: 'master'
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('branch', function () {
		it('checkoutBranch', function () {
			strom.lib.branch.checkoutBranch(filesystem)('development')

			const received = strom.lib.reference.getHead(filesystem)
			const expected = {
				type: 'branch',
				reference: 'development'
			}

			expect(received).to.deep.equal(expected)
		})
	})
})