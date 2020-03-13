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

export const createBundle = (filesystem) => {
	return {
		get: getCommit(filesystem),

		getDirectory: getCommitsDirectory
	}
}