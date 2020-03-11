import * as branch from './branch'
import * as object from './object'
import * as reference from './reference'
import * as stage from './stage'
import { filterEqual, filterMinimatchString } from './utilities/filtering'

export const getRepositoryDirectory = () => {
	return '.strom'
}

export const createRepository = (filesystem) => {
	const currentStage = stage.createStage(filesystem)

	return {
		stage: currentStage,

		init: () => {
			// initialize objects structure if missing
			object.initObjects(filesystem)

			// initialize branches if missing
			branch.initBranches(filesystem)

			// initialize refs if missing
			reference.initReferences(filesystem)
		},

		status: () => {
			// get all files from working dir, except from repository directory
			const filesWorkingdir = filesystem.walk('').filter(filterMinimatchString([`!${getRepositoryDirectory()}/**`]))
			let filesPreviousCommit = {}

			// get head reference
			const head = reference.getHead(filesystem)
			let commit

			// get previous commit by branch reference
			if (head.ref.startsWith(branch.getBranchesDirectory())) {
				const referencedBranch = branch.getBranchByReference(filesystem)(head.ref)

				if (referencedBranch.commit) {
					commit = commit.getCommit(filesystem)(referencedBranch.commit)
				}
			}

			if (commit) {
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