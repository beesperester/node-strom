import { createBranch } from "./branch"

export const createRepository = (name) => {
	const master = createBranch('master')(null)

	return {
		name,
		branches: [
			master
		],
		history: [],
		head: master
	}
}

export const checkout = (repository) => (branchName) => {
	const branches = [
		...repository.branches
	]

	let branch = branches.find((branch) => branch.name === branchName)

	if (!branch) {
		// create new branch if not in existing branches
		branch = createBranch(branchName)(repository.head.commit)

		branches.push(branch)
	}

	return {
		...repository,
		branches,
		head: branch
	}
}

export const commit = (repository) => (commit) => {
	return {
		...repository,
		history: [
			...repository.history,
			commit
		],
		head: {
			...repository.head,
			commit: commit.id
		}
	}
}