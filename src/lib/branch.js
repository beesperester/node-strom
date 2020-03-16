import path from 'path'
import { getRepositoryDirectory } from './repository.old'
import { serialize, deserialize } from './utilities/serialization'

export const getBranchesDirectory = () => {
	return 'branches'
}

export const initBranches = (filesystem) => {
	const branchesDirectory = path.join(
		getRepositoryDirectory(),
		getBranchesDirectory()
	)

	if (!filesystem.isDir(branchesDirectory)) {
		filesystem.mkdir(branchesDirectory)
	}

	try {
		getBranch(filesystem)('master')
	} catch (e) {
		setBranch(filesystem)('master')(null)
	}
}

export const getBranches = (filesystem) => {
	return filesystem.lsdir(path.join(
		getRepositoryDirectory(),
		getBranchesDirectory()
	))
}

export const getBranch = (filesystem) => (name) => {
	return deserialize(filesystem.read(path.join(
		getRepositoryDirectory(),
		getBranchesDirectory(),
		name
	)))
}

export const getBranchByReference = (filesystem) => (referencePath) => {
	return deserialize(filesystem.read(path.join(
		getRepositoryDirectory(),
		referencePath
	)))
}

export const setBranch = (filesystem) => (name) => (id) => {
	const branch = {
		commit: id || null
	}

	filesystem.write(path.join(
		getRepositoryDirectory(),
		getBranchesDirectory(),
		name
	))(serialize(branch))

	return name
}

export const createBundle = (filesystem) => {
	return {
		init: () => initBranches(filesystem),

		getAll: () => getBranches(filesystem),

		get: getBranch(filesystem),

		set: setBranch(filesystem),

		getDirectory: getBranchesDirectory
	}
}