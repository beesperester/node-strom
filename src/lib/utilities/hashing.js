import fs from 'fs'
import crypto from 'crypto'
import { serialize } from './serialization'

export const hashString = (string) => crypto.createHash('sha256').update(string).digest('hex')

export const hashFile = (chunkSize) => (file) => {
	const hash = crypto.createHash('sha256')
	const fd = fs.openSync(file, 'r')
	const length = fs.statSync(file).size
	let position = 0

	while (length > position) {
		const buffer = new Buffer(chunkSize)
		const bytesRead = fs.readSync(fd, buffer, 0, chunkSize, position)

		hash.update(buffer.slice(0, bytesRead))

		position = position + chunkSize

		if (bytesRead < chunkSize) {
			fs.closeSync(fd)

			break
		}
	}

	return hash.digest('hex')
}

export const pathFromHash = (length) => (depth) => (hash) => {
	const pathParts = []

	if (length * depth < hash.length) {
		for (let i = 0; i < depth; i++) {
			const start = i * length
			const end = start + length

			pathParts.push(hash.slice(start, end))
		}

		pathParts.push(hash.slice(length * depth))
	}

	return pathParts.join('/')
}

export const hashPath = pathFromHash(2)(2)

export const hashMap = (branch) => (mapBranch) => (mapLeaf) => (callback) => {
	const hashMapRecursive = (branch) => {
		const tree = {}

		for (let key of Object.keys(branch)) {
			if (typeof branch[key] === 'object') {
				tree[key] = mapBranch(hashMapRecursive(branch[key]))
			} else {
				tree[key] = mapLeaf(branch[key])
			}
		}

		const hash = hashString(serialize(tree))

		callback.call(undefined, hash, tree)

		return hash
	}

	return hashMapRecursive(branch)
}