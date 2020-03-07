import path from 'path'
import { createBranch, paths as branchPaths } from './branch'

export const paths = {
	head: 'refs/head'
}

export const createHead = (filesystem) => {
	try {
		getHead(filesystem)
	} catch (e) {
		const masterBranch = createBranch(filesystem)('master')()

		setHead(filesystem)(masterBranch)
	}
}

export const getHead = (filesystem) => {
	const branchName = filesystem.read(paths.head)

	return filesystem.read(path.join(branchPaths.branches, branchName))
}

export const setHead = (filesystem) => (branch) => {
	filesystem.write(paths.head)(branch.name)

	return branch.name
}