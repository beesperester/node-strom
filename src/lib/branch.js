import path from 'path'
import { paths } from './config'

export const createBranch = (filesystem) => (name) => (commit) => {
	const branch = {
		commit: commit || null
	}

	filesystem.write(path.join(paths.branches, name))(branch)

	return name
}

export const getBranches = (filesystem) => {
	return filesystem.lsdir(paths.branches)
}

export const getBranch = (filesystem) => (name) => {
	return filesystem.read(path.join(paths.branches, name))
}

export const setBranch = (filesystem) => (name) => (commit) => {
	const branch = {
		...getBranch(filesystem)(name),
		commit
	}

	filesystem.write(path.join(paths.branches, name))(branch)

	return name
}