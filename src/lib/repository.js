import path from 'path'
import { createBundle as createBranchBundle } from './branch'
import { createBundle as createCommitBundle } from './commit'
import { paths } from './config'
import { createBundle as createObjectBundle } from './object'
import { createBundle as createReferenceBundle } from './reference'
import { createBundle as createStageBundle } from './stage'
import { createBundle as createAuthorBundle } from './author'
import { getFilesDifference } from './utilities/difference'
import { buildWorkingDirectoryPath, createBundle as createWorkingDirectoryBundle } from './workingDirectory'

export const buildRepositoryPath = (filesystem) => {
	return path.join(
		buildWorkingDirectoryPath(filesystem),
		paths.repository
	)
}

export const initRepository = (filesystem) => {
	/**
	 * Initilaize Repository structure.
	 * 
	 * @argument filesystem
	 * 
	 * @returns void
	 */

	// initilaize object bundle
	const objectBundle = createObjectBundle(filesystem)

	objectBundle.init()

	// initilaize reference bundle
	const referenceBundle = createReferenceBundle(filesystem)

	referenceBundle.init()

	// initilaize branch bundle
	const branchBundle = createBranchBundle(filesystem)

	branchBundle.init()

	// initilaize stage bundle
	const stageBundle = createStageBundle(filesystem)

	stageBundle.init()
}

export const getRepositoryState = (filesystem) => {
	/**
	 * Get state of repository by comparing head commit
	 * with working directory.
	 * 
	 * @argument filesystem
	 * 
	 * @returns object
	*/

	// initilaize bundles
	const referenceBundle = createReferenceBundle(filesystem)
	const workingDirectoryBundle = createWorkingDirectoryBundle(filesystem)

	// get head reference
	const head = referenceBundle.getHead()
	const workingDirectoryFiles = workingDirectoryBundle.getFiles()
	let commitFiles = {}

	try {
		const commit = referenceBundle.getCommit(head)
		const commitBundle = createCommitBundle(filesystem)

		commitFiles = commitBundle.getFiles(commit)
	} catch (e) {
		//
	}

	return getFilesDifference(workingDirectoryFiles)(commitFiles)
}

export const commitRepository = (filesystem) => (message) => {
	// initilaize stage bundle
	const stageBundle = createStageBundle(filesystem)

	// initilaize reference bundle
	const referenceBundle = createReferenceBundle(filesystem)

	// initilaize commit bundle
	const commitBundle = createCommitBundle(filesystem)

	// initiliaze author bundle
	const authorBundle = createAuthorBundle(filesystem)

	const parents = []
	const author = authorBundle.create('Bernhard Esperester')('bernhard@esperester.de')

	const head = referenceBundle.getHead()

	try {
		const commitId = referenceBundle.getCommitId(head)

		if (commitId) {
			parents.push(commitId)
		}
	} catch (e) {
		//
	}

	const id = commitBundle.commit(parents)(author)(message)(stageBundle.state())

	// update head to point to latest commit
	referenceBundle.updateHead(id)

	// reset stage after successfull commit
	stageBundle.reset()

	return id
}

export const stageRepository = (filesystem) => (files) => {
	// adds file to stage by checking which action needs to be taken
	// depending on added, modified or removed modifier

	// initilaize stage bundle
	const stageBundle = createStageBundle(filesystem)

	const state = getRepositoryState(filesystem)

	files.forEach((file) => {
		if (state.added.includes(file) || state.modified.includes(file)) {
			stageBundle.add(file)
		} else if (state.removed.includes(file)) {
			stageBundle.remove(file)
		}
	})
}

export const createBundle = (filesystem) => {
	// initilaize stage bundle
	const stageBundle = createStageBundle(filesystem)

	// initilaize reference bundle
	const referenceBundle = createReferenceBundle(filesystem)

	return {
		/**
		 * Initialize repository by creating necessary 
		 * directory structure.
		 */
		init: () => initRepository(filesystem),

		/**
		 * Get state of repository by comparing head commit
		 * with working directory.
		 */
		getState: () => getRepositoryState(filesystem),

		/**
		 * Checkout branch by name / create branch by name.
		 * New branch should point to head commit.
		 * Update head accordingly.
		 */
		checkout: (branchName) => { },

		/**
		 * Stage files by getting latest state and 
		 * adding / removing files accordingly.
		 */
		stage: stageRepository(filesystem),

		/**
		 * Unstage files.
		 */
		unstage: stageBundle.unstage,

		/** Commit files by creating a new commit from 
		 * staged files and head commit. 
		 */
		commit: commitRepository(filesystem),

		/**
		 * Get head commit of repository by following the head reference path.
		 * This is sugar for usgin reference('head')
		 */
		getHead: referenceBundle.getHead,

		/** 
		 * Get commit by tag.
		 */
		getTag: referenceBundle.getTag,

		buildPath: () => buildRepositoryPath(filesystem)
	}
}