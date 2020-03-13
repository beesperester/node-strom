import path from 'path'
import { getBranch, getBranchesDirectory, setBranch } from './branch'
import { getCommit, getCommitsDirectory } from './commit'
import { getRepositoryDirectory } from './repository'
import { deserialize, serialize } from './utilities/serialization'

export const getReferencesDirectory = () => {
	return 'refs'
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
		getReference(filesystem)('head')
	} catch (e) {
		setReference(filesystem)('head')(
			path.join(
				getBranchesDirectory(),
				'master'
			)
		)
	}
}

export const getReferences = (filesystem) => {
	return filesystem.lsdir(
		path.join(
			getRepositoryDirectory(),
			getReferencesDirectory()
		)
	)
}

export const getReference = (filesystem) => (name) => {
	return deserialize(
		filesystem.read(
			path.join(
				getRepositoryDirectory(),
				getReferencesDirectory(),
				name
			)
		)
	)
}

export const setReference = (filesystem) => (name) => (referencePath) => {
	const contents = {
		reference: referencePath
	}

	filesystem.write(
		path.join(
			getRepositoryDirectory(),
			getReferencesDirectory(),
			name
		)
	)(serialize(contents))
}

export const updateReference = (filesystem) => (name) => (referencePath) => {
	const reference = getReference(filesystem)(name)

	if (reference.reference.startsWith(getBranchesDirectory())) {
		// reference points to a branch
		// update branch
		setBranch(filesystem)(path.basename(reference.reference))(referencePath)
	} else if (reference.reference.startsWith(getCommitsDirectory())) {
		// reference points to a commit
		// update reference
		setReference(filesystem)(name)(
			path.join(
				getCommitsDirectory(),
				referencePath
			)
		)
	}
}

export const resolve = (filesystem) => (reference) => {
	if (reference.reference.startsWith(getBranchesDirectory())) {
		// reference points to a branch
		return getBranch(filesystem)(path.basename(reference.reference)).commit
	} else if (reference.reference.startsWith(getCommitsDirectory())) {
		// reference points to a commit
		return path.basename(reference.reference)
	}

	throw new Error('Unable to resolve reference')
}

export const createBundle = (filesystem) => {
	return {
		init: () => initReferences(filesystem),

		getAll: () => getReferences(filesystem),

		get: getReference(filesystem),

		getHead: () => getReference(filesystem)('head'),

		resolve: resolve(filesystem),

		update: updateReference(filesystem),

		updateHead: updateReference(filesystem)('head')
	}
}