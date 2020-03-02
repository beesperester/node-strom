import S from 'sanctuary'
import path from 'path'
import fs from 'fs'
import { addLeaf } from './dict'
import { walk } from './filesystem'
import { hashFile, pathFromHash } from './hash'
import { minimatchFilter } from './utilities'
import { inflate } from './dict'
import { fstat } from 'fs'

export const filesFromDirectory = (directory) => {
	const files = []

	for (let item of walk(directory)) { 
		files.push(item)
	}

	return files
}

export const treeFromFiles = async (directory) => {
	const root = {}

	for (let item of walk(directory)) {
		addLeaf(root)(item)(await hashFile(path.join(directory, item)))
	}

	return root
}

export const hashFiles = (files) => {
	const result = {}

	files.forEach((path) => {
		result[path] = hashFile(4096)(path)
	})

	return result
}

export const localize = (files) => {
	Object.keys(files).forEach((file) => {
		const hash = files[file]
		const blobFile = path.join(directory, '.strom', 'blobs', pathFromHash(2)(2)(hash))

		if (!fs.existsSync(blobFile)) {
			fs.mkdirSync(path.dirname(blobFile), { recursive: true })
			fs.copyFileSync(file, blobFile)
		}
	})

	return files
}

const directory = '/Users/bernhardesperester/git/node-strom/data'

const tree = S.pipe([
	S.encase(filesFromDirectory),
	S.chain(
		S.encase(minimatchFilter(['!.strom', '**/*.png']))
	),
	S.chain(
		S.encase(hashFiles)
	),
	S.chain(
		S.encase(localize)
	)
	// S.map((files) => {
	// 	const result = {}

	// 	Object.keys(files).forEach((key) => {
	// 		result[key.replace(directory, '')] = files[key]
	// 	})

	// 	return result
	// }),
	// S.chain(
	// 	S.encase(inflate)
	// )
])(directory)

console.log(JSON.stringify(tree.value, undefined, 2))