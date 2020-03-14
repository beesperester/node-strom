import path from 'path'
import { createBundle as createObjectBundle } from './object'
import { hashString } from './utilities/hashing'
import { serialize } from './utilities/serialization'

export const getTreePath = (id) => {
	return path.join(
		'tree',
		id
	)
}

export const getBlobPath = (id) => {
	return path.join(
		'blob',
		id
	)
}

export const packTree = (filesystem) => (branch) => {
	const objectBundle = createObjectBundle(filesystem)

	const hashTreeRecursive = (branch) => {
		const tree = {}

		for (let key of Object.keys(branch)) {
			if (typeof branch[key] === 'object') {
				tree[key] = getTreePath(hashTreeRecursive(branch[key]))
			} else {
				tree[key] = getBlobPath(branch[key])
			}
		}

		const hash = hashString(serialize(tree))

		// store tree in objects
		objectBundle.set(hash)(tree)

		return hash
	}

	return hashTreeRecursive(branch)
}

export const idFromTreePath = (treePath) => {
	return path.basename(treePath)
}

export const idFromBlobPath = (blobPath) => {
	return path.basename(blobPath)
}

export const unpackTree = (filesystem) => (id) => {
	if (id === null) {
		return {}
	}

	const objectBundle = createObjectBundle(filesystem)

	const unpackTreeRecursive = (branch) => {
		const tree = {}

		Object.keys(branch).forEach((object) => {
			if (branch[object].startsWith('blob')) {
				tree[object] = idFromBlobPath(branch[object])
			} else if (branch[object].startsWith('tree')) {
				tree[object] = unpackTreeRecursive(
					objectBundle.get(
						idFromTreePath(branch[object])
					)
				)
			}
		})

		return tree
	}

	const branch = objectBundle.get(id)

	return unpackTreeRecursive(branch)
}

export const createBundle = (filesystem) => {
	return {
		unpack: unpackTree(filesystem),

		pack: packTree(filesystem)
	}
}