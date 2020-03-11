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
					branches: {
						master: serialize({
							commit: null
						})
					},
					objects: {},
					refs: {
						head: serialize({
							ref: 'branches/master'
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
			const expectedStage = [
				'setup-cinema4d/model_main.c4d'
			]

			expect(receivedStage).to.deep.equal(expectedStage)
		})
	})

	describe('repository.commit', function () {
		it('succeeds', function () {
			/**
			 * commit stage
			 */
			const receivedCommitID = repository.commit('initial commit')
			const expectedCommitID = ''

			expect(receivedCommitID).to.equal(expectedCommitID)
		})
	})
})