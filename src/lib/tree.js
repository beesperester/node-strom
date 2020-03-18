import path from 'path'
import * as objectModule from './object'
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
	return hashMap(branch)(getTreePath)(getBlobPath)((id, contents) => {
		objectModule.setObject(filesystem)(id)(contents)
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

	const unpackTreeRecursive = (branch) => {
		const tree = {}

		Object.keys(branch).forEach((object) => {
			if (branch[object].startsWith('blob')) {
				tree[object] = idFromBlobPath(branch[object])
			} else if (branch[object].startsWith('tree')) {
				tree[object] = unpackTreeRecursive(
					objectModule.getObject(filesystem)(
						idFromTreePath(branch[object])
					)
				)
			}
		})

		return tree
	}

	const branch = objectModule.getObject(filesystem)(id)

	return unpackTreeRecursive(branch)
}