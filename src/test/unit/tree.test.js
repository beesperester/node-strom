// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'

describe('tests strom.lib.tree module', function () {
	const adapter = strom.lib.filesystem.adapters.memory.createAdapter()
	const filesystem = strom.lib.filesystem.createFilesystem(adapter)
	const stage = strom.lib.stage.createStage()

	describe('tests createTree', function () {
		it('succeeds', function () {
			stage.add('path/to/some/file.txt')
			stage.add('path/to/another_file.txt')

			const received = strom.lib.tree.createTree(filesystem)(stage)
			const expected = 'ff1be787140a50e7571fe01e26b2e1ea6e0d0c8a4aa467c4f5c282301c7a11ba'

			expect(received).to.equal(expected)
		})
	})
})
