export const createAuthor = (name) => (email) => {
	return {
		name,
		email
	}
}

export const createBundle = (filesystem) => {
	return {
		create: createAuthor
	}
}