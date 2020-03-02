import S from 'sanctuary'
import path from 'path'
import { addLeaf } from './dict'
import { walk } from './filesystem'
import { hashFile, hashFileOld } from './hash'
import { minimatchFilter, attempt } from './utilities'
import { inflate } from './dict'

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
		result[path] = hashFile(path)
	})

	return result
}

const directory = '/Users/bernhardesperester/git/node-strom/data'

console.log(hashFile(1024)('/Users/bernhardesperester/git/node-strom/data/asset/setup-cinema4d/tex/normal.png'))

const test = hashFileOld('/Users/bernhardesperester/git/node-strom/data/asset/setup-cinema4d/tex/normal.png')

test.then(console.log)

// console.log(S.pipe([
// 	S.encase(filesFromDirectory),
// 	S.chain(
// 		S.encase(minimatchFilter(['**/*.png']))
// 	),
// 	S.chain(
// 		S.encase(hashFiles)
// 	)
// ])(directory))