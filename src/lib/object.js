import path from 'path'
import { getRepositoryDirectory } from './repository'
import { hashPath } from './utilities/hashing'
import { deserialize } from './utilities/serialization'

export const getObjectsDirectory = () => {
	return 'objects'
}

export const initObjects = (filesystem) => {
	const objectsDirectory = path.join(
		getRepositoryDirectory(),
		getObjectsDirectory()
	)

	if (!filesystem.isDir(objectsDirectory)) {
		filesystem.mkdir(objectsDirectory)
	}
}

export const getObject = (filesystem) => (id) => {
	const state = filesystem.adapter.state()

	return deserialize(filesystem.read(
		path.join(
			getRepositoryDirectory(),
			getObjectsDirectory(),
			hashPath(id)
		)
	))
}

export const createBundle = (filesystem) => {
	return {
		init: () => initObjects(filesystem),

		getDirectory: getObjectsDirectory
	}
}