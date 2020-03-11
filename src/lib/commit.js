import { deserialize } from "./utilities/serialization"
import { hashPath } from "./utilities/hashing"

export const getCommit = (filesystem) => (id) => {
	return deserialize(filesystem.read(hashPath(id)))
}