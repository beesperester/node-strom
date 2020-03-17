import path from 'path'
import * as authorModule from './author'
import * as branchModule from './branch'
import * as commitModule from './commit'
import { paths } from './config'
import * as objectModule from './object'
import * as referenceModule from './reference'
import * as stageModule from './stage'
import * as workingDirectoryModule from './workingDirectory'

export const buildRepositoryPath = (filesystem) => {
	return path.join(
		workingDirectoryModule.buildWorkingDirectoryPath(filesystem),
		paths.repository
	)
}

export const initRepository = (filesystem) => {
	/**
	 * initialize Repository structure.
	 * 
	 * @argument filesystem
	 * 
	 * @returns void
	*/

	objectModule.initObject(filesystem)

	referenceModule.initReference(filesystem)

	branchModule.initBranch(filesystem)

	stageModule.initStage(filesystem)
}

export const commitRepository = (filesystem) => (message) => {
	const parents = []
	const author = authorModule.createAuthor('Bernhard Esperester')('bernhard@esperester.de')

	const head = referenceModule.getHead(filesystem)

	try {
		const commitId = referenceModule.getCommitId(filesystem)(head)

		if (commitId) {
			parents.push(commitId)
		}
	} catch (e) {
		//
	}

	const id = commitModule.commit(filesystem)(parents)(author)(message)

	// update head to point to latest commit
	referenceModule.updateHead(filesystem)(id)

	return id
}