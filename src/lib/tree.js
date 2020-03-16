import path from 'path'
import { createBundle as createObjectBundle } from './object'
import { hashMap } from './utilities/hashing'

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

	return hashMap(branch)(getTreePath)(getBlobPath)((id, contents) => {
		objectBundle.set(id)(contents)
	})
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