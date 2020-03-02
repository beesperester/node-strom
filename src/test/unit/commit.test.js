// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'

describe('tests strom.lib.commit module', function () {
	describe('tests createCommit', function () {
		it('succeeds with expected arguments', function () {
			const author = strom.lib.author.createAuthor('Bernhard Esperester <bernhard@esperester.de>')
			const commits = []
			const message = 'initial commit'
			const stage = strom.lib.stage.createStage([
				'some/file.txt'
			])
			const received = strom.lib.commit.createCommit(author)(commits)(message)(stage)
			const expected = {
				author: {
					username: 'Bernhard Esperester <bernhard@esperester.de>'
				},
				commits: [],
				message: 'initial commit',
				stage: {
					files: [
						'some/file.txt'
					]
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('tests commit', function () {
		it('succeeds with expected arguments', function () {
			const author = strom.lib.author.createAuthor('Bernhard Esperester <bernhard@esperester.de>')
			const commits = []
			const message = 'initial commit'
			const stage = strom.lib.stage.createStage([
				'some/file.txt'
			])
			const commit = strom.lib.commit.createCommit(author)(commits)
			const 
		})
	})
})
