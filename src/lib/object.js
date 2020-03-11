import path from 'path'
import { getRepositoryDirectory } from './repository'

export const getObjectsDirectory = () => {
	return path.join(getRepositoryDirectory(), 'objects')
}

export const initObjects = (filesystem) => {
	const objectsDirectory = getObjectsDirectory()

	if (!filesystem.isDir(objectsDirectory)) {
		filesystem.mkdir(objectsDirectory)
	}
}