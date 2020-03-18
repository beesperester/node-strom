import * as objectModule from './object'
import * as stageModule from './stage'
import * as treeModule from './tree'
import { getFilesDifference } from './utilities/difference'
import { hashString } from './utilities/hashing'
import { deflate, inflate } from './utilities/map'
import { serialize } from './utilities/serialization'

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
				if (!parentFiles.includes(file)) {
					delete tree[file]
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