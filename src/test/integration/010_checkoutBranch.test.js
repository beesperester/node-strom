// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { beforeEach, describe, it } from 'mocha'
import strom from '../../index'
import { hashString } from '../../lib/utilities/hashing'
import * as setup from '../setup'

let filesystem

const createFilesystem = () => {
	const { filesystem } = setup.createFilesystem()

	return filesystem
}

describe.skip('integration/checkoutBranch', function () {
	describe('checkoutBranch', function () {
		beforeEach(function () {
			filesystem = createFilesystem()

			strom.lib.repository.initRepository(filesystem)
		})

		it('checkout branch "development"', function () {
			strom.lib.branch.checkoutBranch(filesystem)('development')

			const receivedHead = strom.lib.reference.getHead(filesystem)
			const expectedHead = {
				type: 'branch',
				reference: 'development'
			}

			expect(receivedHead).to.deep.equal(expectedHead)

			// test working directory
			const receivedFiles = strom.lib.workingDirectory.getWorkingDirectoryFiles(filesystem)
			const expectedFiles = Object.keys(setup.workingDirectory).reduce((previousValue, currentValue) => {
				previousValue[currentValue] = hashString(setup.workingDirectory[currentValue])

				return previousValue
			}, {})

			expect(receivedFiles).to.deep.equal(expectedFiles)
		})

		it('fails to checkout because of uncommitted changes', function () {
			// commit file
			const file = 'setup-cinema4d/model_main.c4d'

			strom.lib.stage.stageFile(filesystem)(file)

			strom.lib.repository.commitRepository(filesystem)('initial commit')

			// working directory should now remove commited file from added list
			const receivedWorkingDirectoryState = strom.lib.workingDirectory.getState(filesystem)
			const expectedWorkingDirectoryState = {
				added: [
					...Object.keys(setup.workingDirectory).filter((x) => x !== file)
				],
				modified: [],
				removed: []
			}

			expect(receivedWorkingDirectoryState).to.deep.equal(expectedWorkingDirectoryState)

			// checkout new branch development
			strom.lib.branch.checkoutBranch(filesystem)('development')

			// checkout existing branch master
			const checkout = () => strom.lib.branch.checkoutBranch(filesystem)('master')

			expect(checkout).to.throw()
		})

		it('succeeds to checkout', function () {
			const files = Object.keys(setup.workingDirectory)
			const firstFile = files.shift()

			strom.lib.stage.stageFile(filesystem)(firstFile)

			strom.lib.repository.commitRepository(filesystem)('initial commit')

			strom.lib.branch.checkoutBranch(filesystem)('development')

			strom.lib.stage.stageFiles(filesystem)(files)

			strom.lib.repository.commitRepository(filesystem)('adds other files')

			strom.lib.branch.checkoutBranch(filesystem)('master')

			const state = filesystem.adapter.state()

			const received = strom.lib.workingDirectory.getWorkingDirectoryFiles(filesystem)
			const expected = {
				[firstFile]: hashString(setup.workingDirectory[firstFile])
			}

			expect(receivedFiles).to.deep.equal(expectedFiles)
		})
	})
})