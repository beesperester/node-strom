export const createBranch = (name) => (commit) => {
	return {
		name,
		commit
	}
}