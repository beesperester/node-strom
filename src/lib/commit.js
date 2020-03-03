export const createCommit = (commit) => (message) => {
	return {
		parent: commit || null,
		message
	}
}