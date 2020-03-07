import path from 'path'
import { hashString, hashPath } from './hash'
import { inflate } from './dict'
import { serialize } from './utilities'
import { paths } from './config'

export const createTree = (filesystem) => (stage) => {
	const fileHashes = {}

	stage.state().forEach((filePath) => {
		fileHashes[filePath] = hashString(filePath)
	})

	const tree = inflate(fileHashes)

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

		filesystem.write(path.join(paths.objects, hashPath(hash)))(tree)

		return hash
	}

	return hashTree(tree)
}