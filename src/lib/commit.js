import path from 'path'
import { paths } from './config'
import { hashPath, hashString } from './hash'
import { serialize } from './utilities'

export const hashCommit = (commit) => hashString(serialize(commit))

export const createCommit = (filesystem) => (parentHash) => (treeHash) => (message) => {
	const commit = {
		parent: parentHash || null,
		tree: treeHash || null,
		message
	}

	const hash = hashCommit(commit)

	filesystem.write(path.join(paths.objects, hashPath(hash)))(commit)

	return hash
}

export const getCommit = (filesystem) => (hash) => {
	return filesystem.read(path.join(paths.objects, hashPath(hash)))
}