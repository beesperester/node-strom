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

export const getPreviousCommitFiles = (filesystem) => {
	const referenceBundle = createReferenceBundle(filesystem)
	const commitBundle = createCommitBundle(filesystem)

	let filesPreviousCommit = {}

	// get files from previous commit
	try {
		const head = referenceBundle.getHead()
		const commit = referenceBundle.resolve(head)

		filesPreviousCommit = commitBundle.getFiles(commit)
	} catch (e) {
		//
	}

	return filesPreviousCommit
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
		if (!filesA.includes(Object.keys(filesB))) {
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
	const filesWorkingdir = getWorkingDirFiles(filesystem)
	const filesPreviousCommit = getPreviousCommitFiles(filesystem)

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
			const filesPreviousCommit = getPreviousCommitFiles(filesystem)
			let filesAdd = {}

			// hash staged files
			stage.state().add.forEach((file) => {
				filesAdd[file] = filesystem.hash(file)
			})

			// copy staged files to hashed path
			Object.keys(filesAdd).forEach((file) => {
				commitBundle.copy(file)(filesAdd[file])
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

			return currentCommitTree
		},

		checkout: () => {

		}
	}
}