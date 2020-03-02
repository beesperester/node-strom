import S from 'sanctuary'
import path from 'path'
import fs from 'fs'
import { addLeaf } from './dict'
import { walk } from './filesystem'
import { hashFile, pathFromHash, hashString } from './hash'
import { minimatchFilter, filterEmpty } from './utilities'
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
		const blobFile = path.join(directory, '.strom', 'blobs', hashPath(hash))

		if (!fs.existsSync(blobFile)) {
			fs.mkdirSync(path.dirname(blobFile), { recursive: true })
			fs.copyFileSync(file, blobFile)
		}
	})

	return files
}

export const formatHash = (type) => (hash) => [type, hash].join('/')

export const formatBranchHash = formatHash('branch')

export const formatFileHash = formatHash('file')

export const hashPath = pathFromHash(2)(2)

export const hashBranch = (branch) => {
	const current = {}

	Object.keys(branch).forEach((key) => {
		if (typeof branch[key] === 'object') {
			const hash = hashBranch(branch[key])

			current[key] = formatBranchHash(hash)
		} else {
			current[key] = formatFileHash(branch[key])
		}
	})

	const content = JSON.stringify(current, undefined, 2)
	const hash = hashString(content)

	// store hash
	const blobFile = path.join(directory, '.strom', 'blobs', hashPath(hash))

	if (!fs.existsSync(blobFile)) {
		fs.mkdirSync(path.dirname(blobFile), { recursive: true })
		fs.writeFileSync(blobFile, content)
	}

	return hash
}

const directory = '/Users/bernhardesperester/git/node-strom/data'

const tree = S.pipe([
	S.encase(filesFromDirectory),
	S.map(S.map((x) => x.replace(directory, '').split('/').filter(filterEmpty).join('/'))),
	S.chain(
		S.encase(minimatchFilter(['!.strom/**', '!**/*.DS_Store']))
	),
	S.map(S.map((x) => path.join(directory, x))),
	S.chain(
		S.encase(hashFiles)
	),
	S.chain(
		S.encase(localize)
	),
	S.map((files) => {
		const result = {}

		Object.keys(files).forEach((key) => {
			result[key.replace(directory, '')] = files[key]
		})

		return result
	}),
	S.chain(
		S.encase(inflate)
	),
	S.chain(
		S.encase(hashBranch)
	)
])(directory)

console.log(JSON.stringify(tree.value, undefined, 2))