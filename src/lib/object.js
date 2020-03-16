import path from 'path'
import { getRepositoryDirectory } from './repository.old'
import { hashPath } from './utilities/hashing'
import { deserialize, serialize } from './utilities/serialization'

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
	return deserialize(filesystem.read(
		path.join(
			getRepositoryDirectory(),
			getObjectsDirectory(),
			hashPath(id)
		)
	))
}

export const setObject = (filesystem) => (id) => (content) => {
	filesystem.write(
		path.join(
			getRepositoryDirectory(),
			getObjectsDirectory(),
			hashPath(id)
		)
	)(serialize(content))
}

export const copyObject = (filesystem) => (file) => (id) => {
	filesystem.copy(file)(
		path.join(
			getRepositoryDirectory(),
			getObjectsDirectory(),
			hashPath(id)
		)
	)
}

export const createBundle = (filesystem) => {
	return {
		init: () => initObjects(filesystem),

		get: getObject(filesystem),

		set: setObject(filesystem),

		getDirectory: getObjectsDirectory,

		copy: copyObject(filesystem)
	}
}