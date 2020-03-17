// Test related imports.
import { expect } from 'chai'
import 'chai/register-expect'
import { describe, it } from 'mocha'
import strom from '../../index'
import { getFilesystem, workingDirectory } from '../setup'
import { hashString } from '../../lib/utilities/hashing'

describe('unit/branch', function () {
	const { filesystem } = getFilesystem()

	strom.lib.repository.initRepository(filesystem)

	describe('checkoutBranch', function () {
		strom.lib.branch.checkoutBranch(filesystem)('development')

		it('head is changed to development', function () {
			const received = strom.lib.reference.getHead(filesystem)
			const expected = {
				type: 'branch',
				reference: 'development'
			}

			expect(received).to.deep.equal(expected)
		})

		it('working directory is unchanged', function () {
			const received = strom.lib.workingDirectory.getWorkingDirectoryFiles(filesystem)
			const expected = Object.keys(workingDirectory).reduce((previousValue, currentValue) => {
				previousValue[currentValue] = hashString(workingDirectory[currentValue])

				return previousValue
			}, {})

			expect(received).to.deep.equal(expected)
		})
	})
})