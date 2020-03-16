import path from 'path'
import { paths } from './config'
import { createBundle as createObjectBundle } from './object'
import { createBundle as createReferenceBundle } from './reference'
import { createBundle as createBranchBundle } from './branch'
import { createBundle as createStageBundle } from './stage'

export const buildRepositoryPath = (filesystem) => {
	return path.join(
		filesystem.getRootDirectory(),
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

	// initilaize object bundle
	const referenceBundle = createReferenceBundle(filesystem)

	referenceBundle.init()

	// initilaize branch bundle
	const branchBundle = createBranchBundle(filesystem)

	branchBundle.init()

	// initilaize stage bundle
	const stageBundle = createStageBundle(filesystem)

	stageBundle.init()
}

export const createBundle = (filesystem) => {
	return {
		/**
		 * Initialize repository by creating necessary 
		 * directory structure.
		 */
		init: () => initRepository(filesystem),

		/**
		 * Display state of repository by comparing head commit
		 * with working directory.
		 */
		state: () => { },

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
		stage: (files) => { },

		/**
		 * Unstage files.
		 */
		unstage: (files) => { },

		/** Commit files by creating a new commit from 
		 * staged files and head commit. 
		 */
		commit: (message) => { },

		/**
		 * Get head commit of repository by following the head reference path.
		 * This is sugar for usgin reference('head')
		 */
		head: () => { },

		/** 
		 * Get reference commit by following reference path.
		 */
		reference: (name) => { }
	}
}