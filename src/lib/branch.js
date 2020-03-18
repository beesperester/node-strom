import path from 'path'
import * as branchModule from './branch'
import * as commitModule from './commit'
import { paths } from './config'
import * as referenceModule from './reference'
import { deserialize, serialize } from './utilities/serialization'
import * as workingDirectoryModule from './workingDirectory'
import * as objectModule from './object'
import * as stageModule from './stage'
import * as repositoryModule from './repository'

export const initBranch = (filesystem) => {
	if (!filesystem.isDir(paths.branch)) {
		filesystem.mkdir(paths.branch)
	}

	try {
		getBranch(filesystem)('master')
	} catch (e) {
		setBranch(filesystem)('master')(null)
	}
}

export const getBranches = (filesystem) => {
	return filesystem.lsdir(paths.branch)
}

export const getBranch = (filesystem) => (name) => {
	return deserialize(
		filesystem.read(
			path.join(
				paths.branch,
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
			paths.branch,
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

		if (commitId) {
			if (state.added.length > 0 || state.modified.length > 0 || state.removed.length > 0) {
				throw new Error('You have uncommitted changes in your working directory')
			} else {
				// working directory has no added, modified or removed 
				// uncommited changes so the files from the commit can
				// be added

				// get files belonging to commit
				const commit = commitModule.getCommit(filesystem)(commitId)
				const commitFiles = commitModule.getCommitFiles(filesystem)(commit)

				// update working directory with files from commit
				workingDirectoryModule.setWorkingDirectoryFiles(filesystem)(commitFiles)
			}
		}
	} else {
		const head = referenceModule.getHead(filesystem)
		commitId = referenceModule.getReferenceCommitId(filesystem)(head)

		setBranch(filesystem)(branchName)(commitId)
	}

	// update head
	referenceModule.setHead(filesystem)(referenceModule.referenceTypes.branch)(branchName)
}

export const merge = (filesystem) => (branchName) => (message) => {
	// get current branch
	const head = referenceModule.getHead(filesystem)

	if (head.type == referenceModule.referenceTypes.branch) {
		// current head points to a branch

		if (head.reference === branchName) {
			// head points to branch that should be merged
			throw new Error('Unable to merge branch onto itself')
		} else {
			// merge branch

			// find last common commit
			const currentBranch = branchModule.getBranch(filesystem)(head.reference)
			const nextBranch = branchModule.getBranch(filesystem)(branchName)

			const currentCommitId = currentBranch.commit
			const nextCommitId = nextBranch.commit

			const currentCommit = commitModule.getCommit(filesystem)(currentCommitId)
			const nextCommit = commitModule.getCommit(filesystem)(nextCommitId)

			const currentHistory = commitModule.getCommitHistory(filesystem)(currentCommit)
			const nextHistory = commitModule.getCommitHistory(filesystem)(nextCommit)

			if (nextHistory.includes(currentCommitId)) {
				// case 1: nextBranch is a direct descendant 
				// while currentBranch has not been modified
				// simply fast forward head to nextBranch commit

				setBranch(filesystem)(head.reference)(nextCommitId)
			} else {
				// case 2: currentBranch and nextBranch have common ancestors

				for (let commitId of currentHistory) {
					if (nextHistory.includes(commitId)) {
						// found the common ancestor
						const compareCurrentCommit = commitModule.compare(filesystem)(commitId)(currentCommitId)
						const compareNextCommit = commitModule.compare(filesystem)(commitId)(nextCommitId)

						// check for merge conflicts in added files
						compareCurrentCommit.added.forEach((file) => {
							if (compareNextCommit.added.includes(file)) {
								throw new Error(`Merge conflict for added file ${file}`)
							}
						})

						// check for merge conflicts in modified files
						compareCurrentCommit.modified.forEach((file) => {
							if (compareNextCommit.modified.includes(file)) {
								throw new Error(`Merge conflict for modified file ${file}`)
							}
						})

						// apply changes
						// update working directory with files from commit
						const nextCommitFiles = commitModule.getCommitFiles(filesystem)(nextCommit)

						const filesToStage = []

						// restore added files
						compareNextCommit.added.forEach((file) => {
							if (Object.keys(nextCommitFiles).includes(file)) {
								objectModule.restoreObject(filesystem)(nextCommitFiles[file])(file)

								filesToStage.push(file)
							}
						})

						// restore modified files
						compareNextCommit.modified.forEach((file) => {
							if (Object.keys(nextCommitFiles).includes(file)) {
								objectModule.restoreObject(filesystem)(nextCommitFiles[file])(file)

								filesToStage.push(file)
							}
						})

						// apply deletions
						compareNextCommit.removed.forEach((file) => {
							workingDirectoryModule.removeWorkingDirectoryFile(filesystem)(file)

							filesToStage.push(file)
						})

						// stage changes
						stageModule.stageFiles(filesystem)(filesToStage)

						const parents = [
							currentCommitId,
							nextCommitId
						]
						const author = {
							name: 'Bernhard Esperester',
							email: 'bernhard@esperester.de'
						}

						const mergedCommitId = commitModule.commit(filesystem)(parents)(author)(message)

						setBranch(filesystem)(head.reference)(mergedCommitId)

						break
					}
				}
			}
		}
	} else {
		throw new Error('Head does not reference a branch')
	}
}