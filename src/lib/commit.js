import * as objectModule from './object'
import * as stageModule from './stage'
import * as treeModule from './tree'
import { getFilesDifference } from './utilities/difference'
import { hashString } from './utilities/hashing'
import { deflate, inflate } from './utilities/map'
import { serialize } from './utilities/serialization'
import moment from 'moment'
import { sortMoment } from './utilities/sorting'

export const getCommitFiles = (filesystem) => (commit) => {
	// get all files from a commit as path: hash key value pairs
	const tree = treeModule.unpackTree(filesystem)(commit.tree)

	return deflate(tree)
}

export const commit = (filesystem) => (parents) => (author) => (message) => {
	const stage = stageModule.getStage(filesystem)

	if (stage.add.length === 0 && stage.remove.length === 0) {
		throw new Error('Nothing to commit')
	}

	let tree = {}

	// for each parent, apply changes
	parents.forEach((id, index) => {
		const parentCommit = getCommit(filesystem)(id)
		const parentFiles = deflate(treeModule.unpackTree(filesystem)(parentCommit.tree))

		// remove files from tree if not in parent
		if (index > 0) {
			Object.keys(tree).forEach((file) => {
				if (!Object.keys(parentFiles).includes(file)) {
					// delete tree[file]
				}
			})
		}

		// add files from parent
		Object.keys(parentFiles).forEach((file) => {
			tree[file] = parentFiles[file]
		})
	})

	// hash staged files and add to tree
	stage.add.forEach((file) => {
		tree[file] = filesystem.hash(file)

		// copy file to objects
		objectModule.storeObject(filesystem)(file)(tree[file])
	})

	// remove staged files from previous commit files
	stage.remove.forEach((file) => {
		if (Object.keys(tree).includes(file)) {
			delete tree[file]
		}
	})

	const commit = {
		parents,
		author,
		message,
		created: moment(new Date()).toISOString(true),
		tree: treeModule.packTree(filesystem)(inflate(tree))
	}

	const id = hashString(serialize(commit))

	// store commit
	setCommit(filesystem)(id)(commit)

	// reset stage after successfull commit
	stageModule.resetStage(filesystem)

	return id
}

export const getCommit = (filesystem) => (id) => {
	if (id === null) {
		throw new Error('Invalid commit id')
	}

	return objectModule.getObject(filesystem)(id)
}

export const setCommit = (filesystem) => (id) => (contents) => {
	return objectModule.setObject(filesystem)(id)(contents)
}

export const compare = (filesystem) => (commitIdA) => (commitIdB) => {
	const commitA = getCommit(filesystem)(commitIdA)
	const commitB = getCommit(filesystem)(commitIdB)

	const filesA = getCommitFiles(filesystem)(commitA)
	const filesB = getCommitFiles(filesystem)(commitB)

	return getFilesDifference(filesA)(filesB)
}

export const getCommitHistory = (filesystem) => (commit) => {
	const getCommitHistoryRecursirve = (currentCommit) => {
		let history = []

		currentCommit.parents.forEach((parentCommitId) => {
			const parentCommit = getCommit(filesystem)(parentCommitId)

			history.push({
				...parentCommit,
				id: parentCommitId
			})

			// get parent commit history
			const parentHistory = getCommitHistoryRecursirve(parentCommit)

			parentHistory.forEach((parentHistoryCommit) => {
				if (!history.map((x) => x.id).includes(parentHistoryCommit.id)) {
					history.push(parentHistoryCommit)
				}
			})
		})

		return history
	}

	const commitHistory = getCommitHistoryRecursirve(commit)

	return commitHistory.sort((a, b) => sortMoment(a.created, b.created)).map((x) => x.id)
}

export const mergeCommit = (filesystem) => (commitIdA) => (commitIdB) => {
	// get commits
	const commitA = getCommit(filesystem)(commitIdA)
	const commitB = getCommit(filesystem)(commitIdB)

	// get commit histories
	const commitHistoryA = getCommitHistory(filesystem)(commitA)
	const commitHistoryB = getCommitHistory(filesystem)(commitB)

	if (commitHistoryB.includes(commitIdA)) {
		// case 1: commitB is a direct descendant of commitA
		// while commitA has not been modified
		// simply fast forward head to nextBranch commit

		return commitIdB
	} else {
		// case 2: currentBranch and nextBranch have common ancestors

		for (let commitIdHistoryA of commitHistoryA) {
			if (commitHistoryB.includes(commitIdHistoryA)) {
				// found the common ancestor

				// compare commitIdA with common ancestor commitIdHistoryA
				const compareCommitA = compare(filesystem)(commitIdHistoryA)(commitIdA)

				// compare commitIdB with common ancestor commitIdHistoryA
				const compareCommitB = compare(filesystem)(commitIdHistoryA)(commitIdB)

				// check for merge conflicts in added files
				compareCommitA.added.forEach((file) => {
					if (compareCommitB.added.includes(file)) {
						throw new Error(`Merge conflict for added file ${file}`)
					}
				})

				// check for merge conflicts in modified files
				compareCommitA.modified.forEach((file) => {
					if (compareCommitB.modified.includes(file)) {
						throw new Error(`Merge conflict for modified file ${file}`)
					}
				})

				// get files of commits
				const commitFilesA = getCommitFiles(filesystem)(commitA)
				const commitFilesB = getCommitFiles(filesystem)(commitB)

				const mergedCommitFiles = {
					...commitFilesA
				}

				// restore added files
				compareCommitB.added.forEach((file) => {
					mergedCommitFiles[file] = commitFilesB[file]
				})

				// restore modified files
				compareCommitB.modified.forEach((file) => {
					mergedCommitFiles[file] = commitFilesB[file]
				})

				// apply deletions
				compareCommitB.removed.forEach((file) => {
					delete mergedCommitFiles[file]
				})

				const parents = [
					commitIdA,
					commitIdB
				]

				const author = {
					name: 'Bernhard Esperester',
					email: 'bernhard@esperester.de'
				}

				const message = `merges ${commitIdA.substring(0, 6)} with ${commitIdB.substring(0, 6)}`

				const commit = {
					parents,
					author,
					message,
					created: moment(new Date()).toISOString(true),
					tree: treeModule.packTree(filesystem)(inflate(mergedCommitFiles))
				}

				const mergedCommitId = hashString(serialize(commit))

				// store commit
				setCommit(filesystem)(mergedCommitId)(commit)

				return mergedCommitId
			}
		}

		throw new Error('foo')
	}
}