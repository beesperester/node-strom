// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'
import { serialize } from '../../lib/utilities'

describe('tests repository branch commit workflow', function () {
	const storage = {
		'setup-cinema4d': {
			'model_main.c4d': serialize('contents of model_main.c4d'),
			tex: {
				'albedo.jpg': serialize('contents of albedo.jpg')
			}
		},
		'setup-zbrush': {
			'sculpt_main.ztl': serialize('contents of sculpt_main.ztl')
		}
	}
	const adapter = strom.lib.filesystem.adapters.memory.createAdapter(storage)
	const filesystem = strom.lib.filesystem.createFilesystem(adapter)

	const repositoryAdapter = strom.lib.filesystem.adapters.memory.createAdapter()
	const repositoryFilesystem = strom.lib.filesystem.createFilesystem(repositoryAdapter)

	const repository = strom.lib.repository.createRepository(repositoryFilesystem)

	describe('tests workflow', function () {
		it('succeeds', function () {
			const received = filesystem.walk('')
			const expected = {}
		})
	})
})
