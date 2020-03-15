// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'
import { serialize } from '../../lib/utilities/serialization'

describe('tests repository base functionality', function () {
	const storage = {
		'setup-cinema4d': {
			'model_main.c4d': serialize('contents of model_main.c4d'),
			tex: {
				'albedo.jpg': serialize('contents of albedo.jpg')
			}
		},
		'setup-zbrush': {
			'sculpt_main.ztl': serialize('contents of sculpt_main.ztl')
		}
	}

	const adapter = strom.lib.filesystem.adapters.memory.createAdapter(storage)
	const filesystem = strom.lib.filesystem.createFilesystem(adapter)
	const repository = strom.lib.repository.createRepository(filesystem)

	describe('repository.init', function () {
		it('creates repository structure', function () {
			/**
			 * creates neccessary directories and files if missing,
			 * creates master branch if missing
			 * .strom
			 * 	|- stage
			 * 	|- objects
			 * 	|- refs
			 * 	|	|- head
			 * 	|- branches
			 * 		|- master
			*/
			repository.init()

			const received = adapter.state()
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
					refs: {
						head: serialize({
							reference: 'branches/master'
						})
					}
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('repository.status', function () {
		it('checks for added, modified, removed files', function () {
			const receivedState = repository.state()
			const expectedState = {
				added: [
					'setup-cinema4d/model_main.c4d',
					'setup-cinema4d/tex/albedo.jpg',
					'setup-zbrush/sculpt_main.ztl'
				],
				modified: [],
				removed: []
			}

			expect(receivedState).to.deep.equal(expectedState)
		})
	})

	describe('repository.stage', function () {
		it('adds added file to stage', function () {
			repository.stage('setup-cinema4d/model_main.c4d')
			repository.stage('setup-cinema4d/tex/albedo.jpg')

			const receivedState = repository.state()
			const expectedState = {
				added: [
					'setup-zbrush/sculpt_main.ztl'
				],
				modified: [],
				removed: []
			}

			expect(receivedState).to.deep.equal(expectedState)
		})

		it('removes file from stage', function () {
			repository.unstage('setup-cinema4d/tex/albedo.jpg')

			const receivedState = repository.state()
			const expectedState = {
				added: [
					'setup-cinema4d/tex/albedo.jpg',
					'setup-zbrush/sculpt_main.ztl'
				],
				modified: [],
				removed: []
			}

			expect(receivedState).to.deep.equal(expectedState)
		})
	})

	describe('repository.commit', function () {
		it('commits staged files', function () {
			/**
			 * commit stage
			 */
			const receivedCommitID = repository.commit('initial commit')
			const expectedCommitID = 'b87c453822b3bd67871b8f55b95a21bac6c0e3cf1ea5f4af3d23432e20546a7c'

			expect(receivedCommitID).to.equal(expectedCommitID)
		})
	})
})