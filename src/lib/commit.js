export const createCommit = (author) => (commits) => (message) => (stage) => {
	return {
		author,
		commits,
		message,
		stage
	}
}

export const commit = () => {}