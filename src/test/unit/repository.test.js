// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'

describe('tests strom.lib.repository module', function () {
	describe('tests createRepository', function () {
		it('succeeds with expected arguments', function () {
			const received = strom.lib.repository.createRepository('test')
			const expected = {
				name: 'test',
				branches: [
					{
						name: 'master',
						commit: null
					}
				],
				history: [],
				head: {
					name: 'master',
					commit: null
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('tests checkout', function () {
		it('succeeds with expected arguments', function () {
			const repository = strom.lib.repository.createRepository('test')
			const received = strom.lib.repository.checkout(repository)('development')
			const expected = {
				name: 'test',
				branches: [
					{
						name: 'master',
						commit: null
					},
					{
						name: 'development',
						commit: null
					}
				],
				history: [],
				head: {
					name: 'development',
					commit: null
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('tests commit', function () {
		it('succeeds with expected arguments', function () {
			const repository = strom.lib.repository.createRepository('test')
			const commit = strom.lib.commit.createCommit(repository)('initial commit')
			const received = strom.lib.repository.commit(repository)(commit)
			const expected = {
				name: 'test',
				branches: [
					{
						name: 'master',
						commit: null
					}
				],
				history: [
					{
						id: '114017fd47121550446f06d57a16830104b665559d29e10e5c442b73c1a1327e',
				parent: null,
				message: 'initial commit'
					}
				],
				head: {
					name: 'master',
					commit: '114017fd47121550446f06d57a16830104b665559d29e10e5c442b73c1a1327e'
				}
			}

			expect(received).to.deep.equal(expected)
		})

		it('succeeds with second commit', function () {
			const repository = strom.lib.repository.createRepository('test')
			const firstCommit = strom.lib.commit.createCommit(repository)('initial commit')
			const repositoryAfterFirstCommit = strom.lib.repository.commit(repository)(firstCommit)
			const secondCommit = strom.lib.commit.createCommit(repositoryAfterFirstCommit)('adds some stuff')
			const received = strom.lib.repository.commit(repositoryAfterFirstCommit)(secondCommit)
			const expected = {
				name: 'test',
				branches: [
					{
						name: 'master',
						commit: null
					}
				],
				history: [
					{
						id: '114017fd47121550446f06d57a16830104b665559d29e10e5c442b73c1a1327e',
				parent: null,
				message: 'initial commit'
					},
					{
						id: '3b91bc953cf8f49ac50f7a7d9ebef1428d9dac0d1ee7a01d751ff8907a04bba7',
				parent: '114017fd47121550446f06d57a16830104b665559d29e10e5c442b73c1a1327e',
				message: 'adds some stuff'
					}
				],
				head: {
					name: 'master',
					commit: '3b91bc953cf8f49ac50f7a7d9ebef1428d9dac0d1ee7a01d751ff8907a04bba7'
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})
})
