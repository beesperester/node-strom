import path from 'path'
import { createBundle as createBranchBundle } from './branch'
import { createBundle as createCommitBundle } from './commit'
import { createBundle as createObjectBundle } from './object'
import { createBundle as createReferenceBundle } from './reference'
import { createBundle as createStageBundle } from './stage'
import { filterMinimatchString } from './utilities/filtering'
import { addLeaf, copyDeep, removeLeaf } from './utilities/map'

export const getRepositoryDirectory = () => {
	return '.strom'
}

export const getWorkingDirFiles = (filesystem) => {
	const workingDirFiles = filesystem.walk('')
		.filter(
			filterMinimatchString(
				[
					`!${getRepositoryDirectory()}/**`
				]
			)
		)
	const workingDirFilesHashed = {}

	workingDirFiles.forEach((file) => {
		workingDirFilesHashed[file] = filesystem.hash(file)
	})

	return workingDirFilesHashed
}

export const getPreviousCommit = (filesystem) => {
	const referenceBundle = createReferenceBundle(filesystem)

	// get previous commit from head
	try {
		const head = referenceBundle.getHead()
		const id = referenceBundle.resolve(head)

		return id
	} catch (e) {
		//
	}

	return null
}

export const diffFiles = (filesA) => (filesB) => {
	const untracked = []
	const modified = []
	const removed = []

	// compare files from working directory with files from previous commit
	Object.keys(filesA).forEach((file) => {
		if (!Object.keys(filesB).includes(file)) {
			// add untracked file
			untracked.push(file)
		} else if (filesA[file] !== filesB[file]) {
			// add modified file
			modified.push(file)
		}
	})

	// compare files from previous commit with files from working directory
	Object.keys(filesB).forEach((file) => {
		if (!Object.keys(filesA).includes(file)) {
			// add removed file
			removed.push(file)
		}
	})

	return {
		untracked,
		modified,
		removed
	}
}

export const getRepositoryStatus = (filesystem) => {
	// get all files from working dir, except from repository directory
	const commitBundle = createCommitBundle(filesystem)
	const filesWorkingdir = getWorkingDirFiles(filesystem)
	const previousCommit = getPreviousCommit(filesystem)
	const filesPreviousCommit = commitBundle.getFiles(previousCommit)

	return diffFiles(filesWorkingdir)(filesPreviousCommit)
}

export const createRepository = (filesystem) => {
	const stage = createStageBundle(filesystem)

	const objectBundle = createObjectBundle(filesystem)
	const branchBundle = createBranchBundle(filesystem)
	const referenceBundle = createReferenceBundle(filesystem)
	const commitBundle = createCommitBundle(filesystem)

	return {
		stage,

		init: () => {
			// initialize objects structure if missing
			objectBundle.init()

			// initialize branches if missing
			branchBundle.init()

			// initialize refs if missing
			referenceBundle.init()

			// initialize stage if missing
			stage.init()
		},

		status: () => getRepositoryStatus(filesystem),

		commit: (message) => {
			const head = referenceBundle.getHead()
			const previousCommit = getPreviousCommit(filesystem)
			const filesPreviousCommit = commitBundle.getFiles(previousCommit)
			let filesAdd = {}

			// hash staged files
			stage.state().add.forEach((file) => {
				filesAdd[file] = filesystem.hash(file)
			})

			// copy staged files to hashed path
			Object.keys(filesAdd).forEach((file) => {
				objectBundle.copy(file)(filesAdd[file])
			})

			// add staged files to previous commit files
			let currentCommitTree = copyDeep(filesPreviousCommit)

			Object.keys(filesAdd).forEach((file) => {
				currentCommitTree = addLeaf(currentCommitTree)(file)(filesAdd[file])
			})

			// remove staged files from previous commit files
			stage.state().remove.forEach((file) => {
				currentCommitTree = removeLeaf(currentCommitTree)(file)
			})

			// create commit
			const id = commitBundle.create(
				previousCommit !== null
					? [previousCommit]
					: []
			)(message)(currentCommitTree)

			// update reference
			referenceBundle.updateHead(id)

			return id
		},

		checkout: () => {

		}
	}
}