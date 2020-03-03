// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'

describe('tests strom.lib.commit module', function () {
	const filesystem = strom.lib.filesystem.createFilesystem()
	const hashPath = strom.lib.hash.pathFromHash(2)(2)

	it('succeeds to createCommit', function () {
		const received = strom.lib.commit.createCommit()('initial commit')
		const expected = {
			parent: null,
			message: 'initial commit'
		}

		expect(received).to.deep.equal(expected)

		const serialized = strom.lib.utilities.serialize(received)
		const hash = strom.lib.hash.hashString(serialized)

		strom.lib.dict.addLeaf(filesystem)(hashPath(hash))(serialized)

		console.log(filesystem)
	})
})
