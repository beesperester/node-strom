// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { beforeEach, describe, it } from 'mocha'
import strom from '../../index'
import { getBlobPath, getTreePath } from '../../lib/tree'
import { noop } from '../../lib/utilities'
import { hashMap } from '../../lib/utilities/hashing'
import { inflate } from '../../lib/utilities/map'
import * as setup from '../setup'

let filesystem, adapter, storage

const createFilesystem = () => {
	const result = setup.createFilesystem()

	filesystem = result.filesystem
	adapter = result.adapter
	storage = result.storage
}

describe('unit/commit', function () {
	describe('commit', function () {
		beforeEach(function () {
			createFilesystem()

			strom.lib.repository.initRepository(filesystem)
		})

		it('succeeds', function () {
			strom.lib.stage.stageFiles(filesystem)([
				'setup-cinema4d/model_main.c4d'
			])

			const author = {
				name: 'Bernhard Esperester',
				email: 'bernhard@esperester.de'
			}
			const message = 'initial commit'
			const parents = []
			const commitId = strom.lib.commit.commit(filesystem)(parents)(author)(message)

			const tree = inflate(
				strom.lib.workingDirectory.getWorkingDirectoryFile(filesystem)('setup-cinema4d/model_main.c4d')
			)

			const received = strom.lib.commit.getCommit(filesystem)(commitId)
			const expected = {
				author,
				parents,
				message,
				tree: hashMap(
					tree
				)(getTreePath)(getBlobPath)(noop)
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('compare', function () {
		it('adds file', function () {
			// compare two commits
			const firstFile = Object.keys(setup.workingDirectory)[0]
			const secondFile = Object.keys(setup.workingDirectory)[1]

			// commit first file
			strom.lib.stage.stageFile(filesystem)(firstFile)

			const firstCommitId = strom.lib.repository.commitRepository(filesystem)('initial commit')

			// commit second file
			strom.lib.stage.stageFile(filesystem)(secondFile)

			const secondCommitId = strom.lib.repository.commitRepository(filesystem)('second commit')

			// compare both commits
			const received = strom.lib.commit.compare(filesystem)(firstCommitId)(secondCommitId)
			const expected = {
				added: [
					secondFile
				],
				modified: [],
				removed: []
			}

			expect(received).to.deep.equal(expected)
		})

		it('removes file', function () {
			// compare two commits
			const removedFile = Object.keys(setup.workingDirectory)[0]

			// commit first file
			strom.lib.stage.stageFiles(filesystem)(Object.keys(setup.workingDirectory))

			const firstCommitId = strom.lib.repository.commitRepository(filesystem)('initial commit')

			// commit second file
			filesystem.remove(removedFile)

			strom.lib.stage.stageFile(filesystem)(removedFile)

			const secondCommitId = strom.lib.repository.commitRepository(filesystem)('second commit')

			// compare both commits
			const received = strom.lib.commit.compare(filesystem)(firstCommitId)(secondCommitId)
			const expected = {
				added: [],
				modified: [],
				removed: [
					removedFile
				]
			}

			expect(received).to.deep.equal(expected)
		})
	})
})