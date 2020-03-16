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
import { createBundle as createWorkingDirectoryBundle } from '../../lib/workingDirectory'
import { workingDirectory } from '../setup'


describe('tests repository bundle', function () {
	const storage = inflate(workingDirectory)
	const adapter = strom.lib.filesystem.adapters.memory.createBundle(storage)
	const filesystem = strom.lib.filesystem.createBundle(adapter)
	const repository = strom.lib.repository.createBundle(filesystem)

	const workingDirectoryBundle = createWorkingDirectoryBundle(filesystem)

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
							reference: 'master'
						}),
						tags: {}
					}
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('repository.getState', function () {
		it('gets state of working directory', function () {
			const received = repository.getState()
			const expected = {
				added: Object.keys(workingDirectory),
				modified: [],
				removed: []
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('repository.commit', function () {
		it('commit stage', function () {
			repository.stage([
				'setup-cinema4d/model_main.c4d'
			])

			const commitId = repository.commit('initial commit')

			const tree = inflate(
				workingDirectoryBundle.getFile('setup-cinema4d/model_main.c4d')
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

	describe('repository.getHead', function () {
		it('gets head of repository', function () {
			const received = repository.getHead()
			const expected = {
				type: 'branch',
				reference: 'master'
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('repository.checkout', function () {
		it('checkout repository', function () {
			repository.checkout('development')

			const received = repository.getHead()
			const expected = {
				type: 'branch',
				reference: 'development'
			}

			expect(received).to.deep.equal(expected)
		})
	})
})