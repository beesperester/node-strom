import { hashString } from "./hash"
import { serialize } from "./utilities"

export const createCommit = (repository) => (message) => {
	const data = {
		parent: repository.head.commit,
		message
	}

	return {
		id: hashString(serialize(data)),
		...data
	}
}