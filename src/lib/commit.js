import path from 'path'
import { getObject, setObject } from './object'
import { hashString } from './utilities/hashing'
import { deflate } from './utilities/map'
import { serialize } from './utilities/serialization'

export const getCommitFiles = (filesystem) => (id) => {
	// get all files from a commit as path: hash key value pairs
	if (id === null) {
		return {}
	}

	const commit = getObject(filesystem)(id)

	const unpackTree = (branch) => {
		const tree = {}

		Object.keys(branch).forEach((object) => {
			if (branch[object].startsWith('blob')) {
				tree[object] = path.basename(branch[object])
			} else if (branch[object].startsWith('tree')) {
				tree[object] = unpackTree(getObject(filesystem)(path.basename(branch[object])))
			}
		})

		return tree
	}

	const tree = commit.tree
		? unpackTree(getObject(filesystem)(commit.tree))
		: {}

	return deflate(tree)
}

export const createCommit = (filesystem) => (parents) => (message) => (tree) => {
	const hashTree = (branch) => {
		const tree = {}

		for (let key of Object.keys(branch)) {
			if (typeof branch[key] === 'object') {
				tree[key] = path.join('tree', hashTree(branch[key]))
			} else {
				tree[key] = path.join('blob', branch[key])
			}
		}

		const hash = hashString(serialize(tree))

		setObject(filesystem)(hash)(tree)

		return hash
	}

	const commit = {
		parents,
		message,
		tree: hashTree(tree)
	}

	const id = hashString(serialize(commit))

	setObject(filesystem)(id)(commit)

	return id
}

export const createBundle = (filesystem) => {
	return {
		getFiles: getCommitFiles(filesystem),

		create: createCommit(filesystem)
	}
}