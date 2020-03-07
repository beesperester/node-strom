// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'

describe('tests repository branch commit workflow', function () {
	const adapter = strom.lib.filesystem.adapters.memory.createAdapter({})
	const filesystem = strom.lib.filesystem.createFilesystem(adapter)
	const hashPath = strom.lib.hash.pathFromHash(2)(2)
	const repository = strom.lib.repository.createRepository(filesystem)

	it('succeeds to createCommit', function () {
		const master = strom.lib.branch.createBranch('master')()
		const masterPath = 'refs/branches/master'

		strom.lib.dict.addLeaf(filesystem)(masterPath)(strom.lib.utilities.serialize(master))

		// strom.lib.repository.checkout('master')
	})
})
