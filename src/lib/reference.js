import path from 'path'
import { getBranchesDirectory } from './branch'
import { getRepositoryDirectory } from './repository'
import { deserialize, serialize } from './utilities/serialization'

export const getReferencesDirectory = () => {
	return 'refs'
}

export const getHeadFile = () => {
	return path.join(getReferencesDirectory(), 'head')
}

export const initReferences = (filesystem) => {
	const referencesDirectory = path.join(
		getRepositoryDirectory(),
		getReferencesDirectory()
	)

	if (!filesystem.isDir(referencesDirectory)) {
		filesystem.mkdir(referencesDirectory)
	}

	try {
		getHead(filesystem)
	} catch (e) {
		createHead(filesystem)(path.join(
			getBranchesDirectory(),
			'master'
		))
	}
}

export const getHead = (filesystem) => {
	return deserialize(filesystem.read(path.join(
		getRepositoryDirectory(),
		getHeadFile()
	)))
}

export const createHead = (filesystem) => (ref) => {
	const head = {
		ref
	}

	filesystem.write(path.join(
		getRepositoryDirectory(),
		getHeadFile()
	))(serialize(head))
}

export const get = (filesystem) => (reference) => {
	return deserialize(filesystem.read(path.join(
		getRepositoryDirectory(),
		reference.ref
	)))
}