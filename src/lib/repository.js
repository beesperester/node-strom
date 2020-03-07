import path from 'path'
import { createHead, setHead, getHead } from './head'
import { createBranch, getBranches } from './branch'

export const paths = {
	branches: 'branches',
	head: 'refs/head'
}

export const createRepository = (filesystem) => {
	createHead(filesystem)

	return {
		filesystem
	}
}

export const checkout = (filesystem) => (name) => {
	const branches = getBranches(filesystem)

	if (name in branches) {
		return setHead(filesystem)(name)
	} else {
		const head = getHead(filesystem)
		const newBranch = createBranch(filesystem)(name)(head ? head.commit : null)

		return setHead(filesystem)(newBranch)
	}
}