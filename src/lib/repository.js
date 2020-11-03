import * as authorModule from './author'
import * as branchModule from './branch'
import * as commitModule from './commit'
import * as objectModule from './object'
import * as referenceModule from './reference'
import * as stageModule from './stage'

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

export const getRepositoryCommitId = (filesystem) => {
	const head = referenceModule.getHead(filesystem)

	return referenceModule.getReferenceCommitId(filesystem)(head)
}

export const commitRepository = (filesystem) => (message) => {
	const parents = []
	const author = authorModule.createAuthor('Bernhard Esperester')('bernhard@esperester.de')

	const commitId = getRepositoryCommitId(filesystem)

	if (commitId) {
		parents.push(commitId)
	}

	const id = commitModule.stageCommit(filesystem)(parents)(author)(message)

	// update head to point to latest commit
	referenceModule.updateHead(filesystem)(id)

	return id
}