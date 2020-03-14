// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'
import { serialize } from '../../lib/utilities/serialization'

describe('tests repository branch commit workflow', function () {
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
		it('succeeds', function () {
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

			const receivedInitAdapterState = adapter.state()
			const expectedInitAdapterState = {
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

			expect(receivedInitAdapterState).to.deep.equal(expectedInitAdapterState)
		})
	})

	describe('repository.status', function () {
		it('succeeds', function () {
			/**
			 * checks for file modifications and untracked files
			 */
			const receivedStatus = repository.status()
			const expectedStatus = {
				untracked: [
					'setup-cinema4d/model_main.c4d',
					'setup-cinema4d/tex/albedo.jpg',
					'setup-zbrush/sculpt_main.ztl'
				],
				modified: [],
				removed: []
			}

			expect(receivedStatus).to.deep.equal(expectedStatus)
		})
	})

	describe('repository.stage.addFiles', function () {
		it('succeeds', function () {
			/**
			 * adds file to stage
			 */
			repository.stage.addFiles([
				'setup-cinema4d/model_main.c4d'
			])

			const receivedStage = repository.stage.state()
			const expectedStage = {
				add: [
					'setup-cinema4d/model_main.c4d'
				],
				remove: []
			}

			expect(receivedStage).to.deep.equal(expectedStage)
		})
	})

	describe('repository.commit', function () {
		it('succeeds', function () {
			/**
			 * commit stage
			 */
			const receivedCommitID = repository.commit('initial commit')
			const expectedCommitID = 'b87c453822b3bd67871b8f55b95a21bac6c0e3cf1ea5f4af3d23432e20546a7c'

			expect(receivedCommitID).to.equal(expectedCommitID)
		})
	})

	describe('repository.status', function () {
		it('succeeds', function () {
			/**
			 * checks for file modifications and untracked files
			 */
			const receivedStatus = repository.status()
			const expectedStatus = {
				untracked: [
					'setup-cinema4d/tex/albedo.jpg',
					'setup-zbrush/sculpt_main.ztl'
				],
				modified: [],
				removed: []
			}

			expect(receivedStatus).to.deep.equal(expectedStatus)
		})
	})

	describe('repository.stage.addFiles', function () {
		it('succeeds', function () {
			/**
			 * adds file to stage
			 */
			repository.stage.addFile(
				'setup-zbrush/sculpt_main.ztl'
			)

			const receivedStage = repository.stage.state()
			const expectedStage = {
				add: [
					'setup-zbrush/sculpt_main.ztl'
				],
				remove: []
			}

			expect(receivedStage).to.deep.equal(expectedStage)
		})
	})

	describe('repository.commit', function () {
		it('succeeds', function () {
			/**
			 * commit stage
			 */
			const receivedCommitID = repository.commit('second commit')
			const expectedCommitID = 'f25413bebf49cd2614bb86ee224b87214525af1b8c064c3ea750f656a5ff2242'

			expect(receivedCommitID).to.equal(expectedCommitID)
		})
	})
})