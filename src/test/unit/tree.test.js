// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'
import { serialize } from '../../lib/utilities'

describe.skip('tests strom.lib.tree module', function () {
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

			const expectedAdapterState = {
				objects: {
					'01': {
						'ba': {
							'049ae33a8b77b98f41a534123d4924428c98282e8749b65b85db040e945c': serialize({
								'file.txt': 'blob/6dd8c71c604018f434e97bbd464a7198dc46122daf3dac92e6f4a12218c33370'
							})
						}
					},
					'91': {
						'cd': {
							'dab30d238eaf380b1722fdb32d37bfc6d485ee2c539dea19f9d44fc506ef': serialize({
								some: 'tree/01ba049ae33a8b77b98f41a534123d4924428c98282e8749b65b85db040e945c',
								'another_file.txt': 'blob/4c0048e9b83ce0496539c46fbc234b526629f30bda18ab479d439e75b378b425'
							})
						}
					},
					'e8': {
						'66': {
							'abfd1d30d73590dee02958a91620a49c01d9279eea2b4a7a9e77855349a4': serialize({
								to: 'tree/91cddab30d238eaf380b1722fdb32d37bfc6d485ee2c539dea19f9d44fc506ef'
							})
						}
					},
					'ff': {
						'1b': {
							'e787140a50e7571fe01e26b2e1ea6e0d0c8a4aa467c4f5c282301c7a11ba': serialize({
								path: 'tree/e866abfd1d30d73590dee02958a91620a49c01d9279eea2b4a7a9e77855349a4'
							})
						}
					}
				}
			}

			expect(adapter.state()).to.deep.equal(expectedAdapterState)
		})
	})
})
