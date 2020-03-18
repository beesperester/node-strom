// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { beforeEach, describe, it } from 'mocha'
import strom from '../../index'
import { hashString } from '../../lib/utilities/hashing'
import * as setup from '../setup'
import { serialize } from '../../lib/utilities/serialization'

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
			strom.lib.branch.merge(filesystem)('development')('fast forward')

			const received = strom.lib.repository.getRepositoryCommitId(filesystem)
			const expected = thirdCommitId

			expect(received).to.equal(expected)
		})

		it('merge branch "development" onto "master"', function () {
			// prune working directory
			strom.lib.workingDirectory.pruneWorkingDirectory(filesystem)

			// add first file
			const firstFile = 'setup-cinema4d/test1.c4d'

			filesystem.write(firstFile)(serialize('asdf'))

			// stage first file
			strom.lib.stage.stageFile(filesystem)(firstFile)

			// commit first file
			strom.lib.repository.commitRepository(filesystem)('first commit')

			// switch to new branch "development"
			strom.lib.branch.checkoutBranch(filesystem)('development')

			// add second file
			const secondFile = 'setup-cinema4d/test2.c4d'

			filesystem.write(secondFile)(serialize('qwert'))

			// stage second file
			strom.lib.stage.stageFile(filesystem)(secondFile)

			// commit second file
			strom.lib.repository.commitRepository(filesystem)('second commit')

			// add third file
			const thirdFile = 'setup-cinema4d/test3.c4d'

			filesystem.write(thirdFile)(serialize('foo'))

			// stage third file
			strom.lib.stage.stageFile(filesystem)(thirdFile)

			// commit third file
			strom.lib.repository.commitRepository(filesystem)('third commit')

			// switch back to branch "master"
			strom.lib.branch.checkoutBranch(filesystem)('master')

			// add fourth file
			const fourthFile = 'setup-cinema4d/test4.c4d'

			filesystem.write(fourthFile)(serialize('bar'))

			// stage fourth file
			strom.lib.stage.stageFile(filesystem)(fourthFile)

			// commit fourth file
			strom.lib.repository.commitRepository(filesystem)('fourth commit')

			// merge branch "development" onto "master"
			strom.lib.branch.merge(filesystem)('development')('proper merge')

			const commitId = strom.lib.repository.getRepositoryCommitId(filesystem)
			const commit = strom.lib.commit.getCommit(filesystem)(commitId)
			const commitFiles = strom.lib.commit.getCommitFiles(filesystem)(commit)

			const received = Object.keys(commitFiles).sort()
			const expected = [
				firstFile,
				secondFile,
				thirdFile,
				fourthFile
			].sort()

			expect(received).to.deep.equal(expected)
		})
	})
})