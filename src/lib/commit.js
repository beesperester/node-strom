import { createBundle as createObjectBundle } from './object'
import { createBundle as createTreeBundle } from './tree'
import { hashString } from './utilities/hashing'
import { deflate, inflate } from './utilities/map'
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

export const createCommit = (filesystem) => (parents) => (author) => (message) => (stage) => {
	const objectBundle = createObjectBundle(filesystem)
	const treeBundle = createTreeBundle(filesystem)

	let tree = {}

	// for each parent, apply changes
	parents.forEach((id, index) => {
		const parentCommit = objectBundle.get(id)
		const parentFiles = deflate(treeBundle.unpack(parentCommit.tree))

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
	stage.state().add.forEach((file) => {
		tree[file] = filesystem.hash(file)

		// copy file to objects
		objectBundle.copy(file)(tree[file])
	})

	// remove staged files from previous commit files
	stage.state().remove.forEach((file) => {
		if (Object.keys(tree).includes(file)) {
			delete tree[file]
		}
	})

	const commit = {
		parents,
		author,
		message,
		tree: treeBundle.pack(inflate(tree))
	}

	const id = hashString(serialize(commit))

	objectBundle.set(id)(commit)

	return id
}

export const createBundle = (filesystem) => {
	return {
		getFiles: getCommitFiles(filesystem),

		create: createCommit(filesystem),
	}
}