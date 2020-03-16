import path from 'path'
import { paths } from './config'
import { buildRepositoryPath } from './repository'
import { hashPath } from './utilities/hashing'
import { deserialize, serialize } from './utilities/serialization'

export const buildObjectPath = (filesystem) => {
	return path.join(
		buildRepositoryPath(filesystem),
		paths.object
	)
}

export const initObject = (filesystem) => {
	const objectsDirectory = buildObjectPath(filesystem)

	if (!filesystem.isDir(objectsDirectory)) {
		filesystem.mkdir(objectsDirectory)
	}
}

export const getObject = (filesystem) => (id) => {
	return deserialize(filesystem.read(
		path.join(
			buildObjectPath(filesystem),
			hashPath(id)
		)
	))
}

export const setObject = (filesystem) => (id) => (content) => {
	filesystem.write(
		path.join(
			buildObjectPath(filesystem),
			hashPath(id)
		)
	)(serialize(content))
}

export const copyObject = (filesystem) => (file) => (id) => {
	filesystem.copy(file)(
		path.join(
			buildObjectPath(filesystem),
			hashPath(id)
		)
	)
}

export const createBundle = (filesystem) => {
	return {
		init: () => initObject(filesystem),

		get: getObject(filesystem),

		set: setObject(filesystem),

		copy: copyObject(filesystem)
	}
}