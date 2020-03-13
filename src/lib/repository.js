import { createBundle as createBranchBundle } from './branch'
import { createBundle as createObjectBundle } from './object'
import { createBundle as createReferenceBundle } from './reference'
import { createBundle as createStageBundle } from './stage'
import { filterMinimatchString } from './utilities/filtering'

export const getRepositoryDirectory = () => {
	return '.strom'
}

export const createRepository = (filesystem) => {
	const stage = createStageBundle(filesystem)

	const object = createObjectBundle(filesystem)
	const branch = createBranchBundle(filesystem)
	const reference = createReferenceBundle(filesystem)

	return {
		stage,

		init: () => {
			// initialize objects structure if missing
			object.init()

			// initialize branches if missing
			branch.init()

			// initialize refs if missing
			reference.init()

			// initialize stage if missing
			stage.init()
		},

		status: () => {
			// get all files from working dir, except from repository directory
			const filesWorkingdir = filesystem.walk('').filter(filterMinimatchString([`!${getRepositoryDirectory()}/**`]))
			let filesPreviousCommit = {}

			// get head reference
			const head = reference.getHead()

			try {
				const commit = reference.resolve(head)
			} catch (e) {
				//
			}

			const untracked = []
			const modified = []
			const removed = []

			// compare files from working directory with files from previous commit
			filesWorkingdir.forEach((file) => {
				if (!Object.keys(filesPreviousCommit).includes(file)) {
					// add untracked file
					untracked.push(file)
				} else if (filesystem.hash(file) !== filesPreviousCommit[file]) {
					// add modified file
					modified.push(file)
				}
			})

			// compare files from previous commit with files from working directory
			Object.keys(filesPreviousCommit).forEach((file) => {
				if (!filesWorkingdir.includes(Object.keys(filesPreviousCommit))) {
					// add removed file
					removed.push(file)
				}
			})

			return {
				untracked,
				modified,
				removed
			}
		},

		commit: () => {

		},

		checkout: () => {

		}
	}
}