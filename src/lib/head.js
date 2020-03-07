import path from 'path'
import { createBranch } from './branch'
import { paths } from './config'

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

	return filesystem.read(path.join(paths.branches, branchName))
}

export const setHead = (filesystem) => (branch) => {
	filesystem.write(paths.head)(branch.name)

	return branch.name
}