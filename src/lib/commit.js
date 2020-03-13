import path from 'path'
import { getRepositoryDirectory } from './repository'
import { deserialize } from './utilities/serialization'
import { hashPath } from './utilities/hashing'

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

export const getCommitFiles = (filesystem) => (commit) => {
	// get all files from a commit as path: hash key value pairs
	return {}
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

export const createBundle = (filesystem) => {
	return {
		get: getCommit(filesystem),

		getDirectory: getCommitsDirectory,

		getFiles: getCommitFiles(filesystem),

		copy: copy(filesystem)
	}
}