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

describe('integration/mergeBranch', function () {
	beforeEach(function () {
		filesystem = createFilesystem()

		strom.lib.repository.initRepository(filesystem)
	})

	describe('mergeBranch', function () {
		it('fast forward "master" branch to "development"', function () {
			// commits first file
			const firstFile = Object.keys(setup.workingDirectory)[0]
			const secondFile = Object.keys(setup.workingDirectory)[1]
			const thirdFile = Object.keys(setup.workingDirectory)[2]

			strom.lib.stage.stageFile(filesystem)(firstFile)

			const firstCommitId = strom.lib.repository.commitRepository(filesystem)('first commit')

			// checkout new branch "development"
			strom.lib.branch.checkoutBranch(filesystem)('development')

			// commit second file
			strom.lib.stage.stageFile(filesystem)(secondFile)

			const secondCommitId = strom.lib.repository.commitRepository(filesystem)('second commit')

			// commit third file
			strom.lib.stage.stageFile(filesystem)(thirdFile)

			const thirdCommitId = strom.lib.repository.commitRepository(filesystem)('third commit')

			// remove "other" files from filesystem
			Object.keys(setup.workingDirectory).filter((file) => ![firstFile, secondFile, thirdFile].includes(file)).forEach((file) => {
				filesystem.remove(file)
			})

			// checkout branch "master"
			strom.lib.branch.checkoutBranch(filesystem)('master')

			// merge with branch "development"
			strom.lib.branch.merge(filesystem)('development')

			const received = strom.lib.repository.getRepositoryCommitId(filesystem)
			const expected = thirdCommitId

			expect(received).to.equal(expected)
		})
	})
})