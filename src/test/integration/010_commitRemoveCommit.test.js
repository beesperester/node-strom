// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'
import { serialize } from '../../lib/utilities/serialization'
import { workingDirectory } from '../setup'
import { hashString } from '../../lib/utilities/hashing'
import { inflate } from '../../lib/utilities/map'

describe.skip('tests commit remove commit', function () {
	const adapter = strom.lib.filesystem.adapters.memory.createBundle(inflate(workingDirectory))
	const filesystem = strom.lib.filesystem.createBundle(adapter)
	const repository = strom.lib.repository.createBundle(filesystem)

	// initialize repository
	repository.init()

	describe('initial commit', function () {
		it('succeeds', function () {
			// add files
			repository.stage.addFiles([
				'setup-cinema4d/model_main.c4d',
				'setup-houdini/lighting_main.hip'
			])

			repository.commit('initial commit')

			const received = repository.head.files()
			const expected = {
				'setup-cinema4d/model_main.c4d': hashString(serialize('contents of model_main.c4d')),
				'setup-houdini/lighting_main.hip': hashString(serialize('contents of lighting_main.hip'))
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('remove from working directory', function () {
		it('succeeds', function () {
			// remove file from working directory
			filesystem.remove('setup-cinema4d/model_main.c4d')

			const received = repository.state()
			const expected = {
				untracked: [
					'setup-cinema4d/model_hair.c4d',
					'setup-cinema4d/tex/albedo.jpg',
					'setup-cinema4d/tex/specular.jpg',
					'setup-cinema4d/tex/roughness.jpg',
					'setup-cinema4d/tex/normal.jpg',
					'setup-cinema4d/tex/height.jpg',
					'setup-cinema4d/tex/sss.jpg',
					'setup-zbrush/sculpt_main.ztl',
					'setup-houdini/shading_main.hip'
				],
				modified: [],
				removed: [
					'setup-cinema4d/model_main.c4d'
				]
			}

			expect(received).to.deep.equal(expected)
		})
	})
})