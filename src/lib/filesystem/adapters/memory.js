import * as errors from '../errors'
import { addLeaf, getLeaf, removeLeaf, deflate, copyDeep } from '../../utilities/map'
import { hashString } from '../../utilities/hashing'

export const createAdapter = (storage) => {
	let clone = copyDeep(storage)

	return {
		state: () => copyDeep(clone),

		walk: (path) => {
			return Object.keys(deflate(getLeaf(clone)(path))(''))
		},

		write: (path) => (contents) => {
			clone = addLeaf(clone)(path)(contents)

			return clone
		},

		read: (path) => {
			try {
				return getLeaf(clone)(path)
			} catch (e) {
				throw new errors.FileNotFound(path)
			}
		},

		remove: (path) => {
			clone = removeLeaf(clone)(path)

			return clone
		},

		hash: (path) => {
			return hashString(getLeaf(clone)(path))
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