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

const getCommittedFiles = (filesystem) => {
	const commitId = strom.lib.repository.getRepositoryCommitId(filesystem)

	if (commitId) {
		const commit = strom.lib.commit.getCommit(filesystem)(commitId)

		return strom.lib.commit.getCommitFiles(filesystem)(commit)
	}

	return {}
}

describe('integration/commitRemoveFile', function () {
	describe('commitRemoveFile', function () {
		beforeEach(function () {
			filesystem = createFilesystem()

			strom.lib.repository.initRepository(filesystem)
		})

		it('commits removed file', function () {
			// stage all files and make initial commit
			strom.lib.stage.stageFiles(filesystem)(Object.keys(setup.workingDirectory))

			strom.lib.repository.commitRepository(filesystem)('initial commit')

			// remove file from working directory
			const removeFile = Object.keys(setup.workingDirectory).shift()
			filesystem.remove(removeFile)

			// state removed file
			strom.lib.stage.stageFile(filesystem)(removeFile)

			strom.lib.repository.commitRepository(filesystem)('removes file')

			const removesFileCommitFiles = getCommittedFiles(filesystem)

			const received = Object.keys(removesFileCommitFiles)
			const expected = Object.keys(setup.workingDirectory).filter((x) => x !== removeFile)

			expect(received).to.deep.equal(expected)
		})
	})
})