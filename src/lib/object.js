import path from 'path'
import { paths } from './config'
import { hashPath } from './utilities/hashing'
import { deserialize, serialize } from './utilities/serialization'

export const initObject = (filesystem) => {
	if (!filesystem.isDir(paths.object)) {
		filesystem.mkdir(paths.object)
	}
}

export const getObject = (filesystem) => (id) => {
	return deserialize(filesystem.read(
		path.join(
			paths.object,
			hashPath(id)
		)
	))
}

export const setObject = (filesystem) => (id) => (content) => {
	filesystem.write(
		path.join(
			paths.object,
			hashPath(id)
		)
	)(serialize(content))
}

export const copyObject = (filesystem) => (file) => (id) => {
	filesystem.copy(file)(
		path.join(
			paths.object,
			hashPath(id)
		)
	)
}