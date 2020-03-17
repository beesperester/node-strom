// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { describe, it, beforeEach } from 'mocha'
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
})