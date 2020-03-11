import * as errors from '../errors'
import { addLeaf, getLeaf, removeLeaf, deflate, copyDeep } from '../../dict'
import { serialize, deserialize } from '../../utilities/utilities'

export const createAdapter = (storage) => {
	let clone = deserialize(serialize(storage || {}))

	return {
		state: () => copyDeep(clone),

		walk: (path) => {
			return Object.keys(deflate(getLeaf(clone)(path))(''))
		},

		write: (path) => (contents) => {
			clone = addLeaf(clone)(path)(serialize(contents))

			return clone
		},

		read: (path) => {
			try {
				return deserialize(getLeaf(clone)(path))
			} catch (e) {
				throw new errors.FileNotFound(path)
			}
		},

		remove: (path) => {
			clone = removeLeaf(clone)(path)

			return clone
		},

		isFile: (path) => {
			try {
				return typeof getLeaf(clone)(path) === 'string'
			} catch (e) {
				//
			}

			return false
		},

		mkdir: (path) => {
			clone = addLeaf(clone)(path)({})

			return clone
		},

		lsdir: (path) => {
			try {
				return Object.keys(getLeaf(clone)(path))
			} catch (e) {
				throw new errors.DirNotFound(path)
			}
		},

		rmdir: (path) => {
			clone = removeLeaf(clone)(path)

			return clone
		},

		isDir: (path) => {
			try {
				return typeof getLeaf(clone)(path) === 'object'
			} catch (e) {
				//
			}

			return false
		}
	}
}