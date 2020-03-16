import path from 'path'
import { paths } from './config'
import { buildRepositoryPath } from './repository'
import { serialize, deserialize } from './utilities/serialization'

export const buildBranchPath = (filesystem) => {
	return path.join(
		buildRepositoryPath(filesystem),
		paths.branch
	)
}

export const initBranch = (filesystem) => {
	const branchesDirectory = buildBranchPath(filesystem)

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
	return filesystem.lsdir(buildBranchPath(filesystem))
}

export const getBranch = (filesystem) => (name) => {
	return deserialize(
		filesystem.read(
			path.join(
				buildBranchPath(filesystem),
				name
			)
		)
	)
}

export const setBranch = (filesystem) => (name) => (id) => {
	const branch = {
		commit: id || null
	}

	filesystem.write(
		path.join(
			buildBranchPath(filesystem),
			name
		)
	)(serialize(branch))

	return name
}

export const createBundle = (filesystem) => {
	return {
		init: () => initBranch(filesystem),

		getAll: () => getBranches(filesystem),

		get: getBranch(filesystem),

		set: setBranch(filesystem),

		buildPath: () => buildBranchPath(filesystem)
	}
}