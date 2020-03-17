import path from 'path'
import { paths } from './config'
import * as referenceModule from './reference'
import * as repositoryModule from './repository'
import { deserialize, serialize } from './utilities/serialization'
import * as workingDirectoryModule from './workingDirectory'

export const buildBranchPath = (filesystem) => {
	return path.join(
		repositoryModule.buildRepositoryPath(filesystem),
		paths.branch
	)
}

export const initBranch = (filesystem) => {
	const branchesDirectory = buildBranchPath(filesystem)

	if (!filesystem.isDir(branchesDirectory)) {
		filesystem.mkdir(branchesDirectory)
	}

	try {
		getBranch(filesystem)('master')
	} catch (e) {
		setBranch(filesystem)('master')(null)
	}
}

export const getBranches = (filesystem) => {
	return filesystem.lsdir(buildBranchPath(filesystem))
}

export const getBranch = (filesystem) => (name) => {
	return deserialize(
		filesystem.read(
			path.join(
				buildBranchPath(filesystem),
				name
			)
		)
	)
}

export const setBranch = (filesystem) => (name) => (id) => {
	const branch = {
		commit: id || null
	}

	filesystem.write(
		path.join(
			buildBranchPath(filesystem),
			name
		)
	)(serialize(branch))

	return name
}

export const checkoutBranch = (filesystem) => (branchName) => {
	let commitId

	if (getBranches(filesystem).includes(branchName)) {
		const branch = getBranch(filesystem)(branchName)

		commitId = branch.commit

		// test if files from branch commit conflict with working directory
		const state = workingDirectoryModule.getState(filesystem)

		if (state.added.length > 0 || state.modified.length > 0 || state.removed.length > 0) {
			throw new Error('You have uncommitted changes in your working directory')
		}
	} else {
		const head = referenceModule.getHead(filesystem)
		commitId = referenceModule.getReferenceCommitId(filesystem)(head)

		setBranch(filesystem)(branchName)(commitId)
	}

	// update working directory with files from commit
	workingDirectoryModule.setWorkingDirectoryFiles(filesystem)({})

	// update head
	referenceModule.setHead(filesystem)(referenceModule.referenceTypes.branch)(branchName)
}