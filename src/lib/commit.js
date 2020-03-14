import { createBundle as createObjectBundle } from './object'
import { createBundle as createTreeBundle } from './tree'
import { hashString } from './utilities/hashing'
import { deflate } from './utilities/map'
import { serialize } from './utilities/serialization'

export const getCommitFiles = (filesystem) => (id) => {
	// get all files from a commit as path: hash key value pairs
	const objectBundle = createObjectBundle(filesystem)
	const treeBundle = createTreeBundle(filesystem)

	if (id === null) {
		return {}
	}

	const commit = objectBundle.get(id)

	const tree = treeBundle.unpack(commit.tree)

	return deflate(tree)
}

export const createCommit = (filesystem) => (parents) => (message) => (tree) => {
	const objectBundle = createObjectBundle(filesystem)
	const treeBundle = createTreeBundle(filesystem)

	const commit = {
		parents,
		message,
		tree: treeBundle.pack(tree)
	}

	const id = hashString(serialize(commit))

	objectBundle.set(id)(commit)

	return id
}

export const createBundle = (filesystem) => {
	return {
		getFiles: getCommitFiles(filesystem),

		create: createCommit(filesystem)
	}
}