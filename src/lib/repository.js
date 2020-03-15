import { createBundle as createAuthorBundle } from './author'
import { createBundle as createBranchBundle } from './branch'
import { createBundle as createCommitBundle } from './commit'
import { createBundle as createObjectBundle } from './object'
import { createBundle as createReferenceBundle } from './reference'
import { createBundle as createStageBundle } from './stage'
import { filterMinimatchString } from './utilities/filtering'

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

export const getCommitByReferenceName = (filesystem) => (referenceName) => {
	const referenceBundle = createReferenceBundle(filesystem)
	const reference = referenceBundle.get(referenceName)

	// get previous commit from reference
	try {
		return referenceBundle.resolve(reference)
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

export const getRepositoryState = (filesystem) => {
	// get all files from working dir, except from repository directory
	const stage = createStageBundle(filesystem)
	const commitBundle = createCommitBundle(filesystem)
	const filesWorkingdir = getWorkingDirFiles(filesystem)
	const previousCommit = getCommitByReferenceName(filesystem)('head')
	const filesPreviousCommit = commitBundle.getFiles(previousCommit)

	// remove staged files from working directory list
	stage.state().add.forEach((file) => {
		if (Object.keys(filesWorkingdir).includes(file)) {
			delete filesWorkingdir[file]
		}
	})

	return diffFiles(filesWorkingdir)(filesPreviousCommit)
}

export const createRepository = (filesystem) => {
	const stage = createStageBundle(filesystem)

	const objectBundle = createObjectBundle(filesystem)
	const branchBundle = createBranchBundle(filesystem)
	const referenceBundle = createReferenceBundle(filesystem)
	const commitBundle = createCommitBundle(filesystem)
	const authorBundle = createAuthorBundle(filesystem)

	return {
		head: {
			files: () => {
				// get all files from head commit
				const commit = getCommitByReferenceName(filesystem)('head')

				return commitBundle.getFiles(commit)
			},

			commit: () => getCommitByReferenceName(filesystem)('head')
		},

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

		state: () => getRepositoryState(filesystem),

		stage: (file) => {
			// adds file to stage by checking which action needs to be taken
			// depending on untracked, modified or removed modifier

			const state = getRepositoryState(filesystem)

			if (state.untracked.includes(file) || stage.modified.includes(file)) {
				stage.stageAdded(file)
			} else if (stage.removed.includes(file)) {
				stage.stageRemoved(file)
			}
		},

		unstage: stage.unstage,

		commit: (message) => {
			const previousCommit = getCommitByReferenceName(filesystem)('head')
			const author = authorBundle.create('Bernhard Esperester')('bernhard@esperester.de')

			// create commit
			const id = commitBundle.create(
				previousCommit !== null
					? [previousCommit]
					: []
			)(author)(message)(stage)

			// update reference
			referenceBundle.updateHead(id)

			// reset stage
			stage.reset()

			return id
		},

		checkout: () => {

		}
	}
}