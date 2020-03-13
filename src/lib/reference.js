import path from 'path'
import { getBranchByReference, getBranchesDirectory } from './branch'
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

export const resolve = (filesystem) => (reference) => {
	if (reference.reference.startsWith(getBranchesDirectory())) {
		// reference points to a branch
		const branch = getBranchByReference(reference.reference)

		if (branch.commit) {
			return getCommit(filesystem)(branch.commit)
		}
	} else if (reference.reference.startsWith(getCommitsDirectory())) {
		// reference points to a commit
		return getCommit(filesystem)(reference.reference)
	}

	throw new Error('Unable to resolve reference')
}

export const createBundle = (filesystem) => {
	return {
		init: () => initReferences(filesystem),

		getAll: () => getReferences(filesystem),

		get: getReference(filesystem),

		getHead: () => getReference(filesystem)('head'),

		resolve: resolve(filesystem)
	}
}