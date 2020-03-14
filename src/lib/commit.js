import path from 'path'
import { getObject } from './object'
import { getRepositoryDirectory } from './repository'
import { hashPath, hashString } from './utilities/hashing'
import { deflate } from './utilities/map'
import { deserialize, serialize } from './utilities/serialization'

export const getCommitsDirectory = () => {
	return 'objects'
}

export const getCommit = (filesystem) => (id) => {
	return deserialize(
		filesystem.read(
			path.join(
				getRepositoryDirectory(),
				getCommitsDirectory(),
				hashPath(id)
			)
		)
	)
}

export const setCommit = (filesystem) => (id) => (commit) => {
	filesystem.write(
		path.join(
			getRepositoryDirectory(),
			getCommitsDirectory(),
			hashPath(id)
		)
	)(serialize(commit))
}

export const getCommitFiles = (filesystem) => (id) => {
	// get all files from a commit as path: hash key value pairs
	if (id === null) {
		return {}
	}

	const commit = getCommit(filesystem)(id)

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

export const copy = (filesystem) => (file) => (hash) => {
	filesystem.copy(file)(
		path.join(
			getRepositoryDirectory(),
			getCommitsDirectory(),
			hashPath(hash)
		)
	)
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

		filesystem.write(
			path.join(
				getRepositoryDirectory(),
				getCommitsDirectory(),
				hashPath(hash)
			)
		)(serialize(tree))

		return hash
	}

	const commit = {
		parents,
		message,
		tree: hashTree(tree)
	}

	const id = hashString(serialize(commit))

	setCommit(filesystem)(id)(commit)

	return id
}

export const createBundle = (filesystem) => {
	return {
		get: getCommit(filesystem),

		getDirectory: getCommitsDirectory,

		getFiles: getCommitFiles(filesystem),

		copy: copy(filesystem),

		create: createCommit(filesystem)
	}
}