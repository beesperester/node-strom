// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import path from 'path'

import strom from '../../index'

describe('tests repository branch commit workflow', function () {
	const filesystem = strom.lib.filesystem.createFilesystem()
	const hashPath = strom.lib.hash.pathFromHash(2)(2)

	it('succeeds to createCommit', function () {
		const repository = strom.lib.repository.createRepository()
		const master = strom.lib.branch.createBranch('master')()
		const masterPath = 'refs/branches/master'

		strom.lib.dict.addLeaf(filesystem)(masterPath)(strom.lib.utilities.serialize(master))

		// strom.lib.repository.checkout('master')
	})
})
