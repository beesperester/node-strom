import path from 'path'

export const paths = {
	branches: 'branches'
}

export const createBranch = (filesystem) => (name) => (commit) => {
	const branch = {
		name,
		commit: commit || null
	}

	filesystem.write(path.join(paths.branches, name))(branch)

	return branch
}

export const getBranches = (filesystem) => {
	return filesystem.lsdir(paths.branches)
}

export const getBranch = (filesystem) => (name) => {
	return filesystem.read(path.join(paths.branches, name))
}