import * as errors from '../errors'
import { addLeaf, getLeaf, removeLeaf, deflate, copyDeep } from '../../utilities/map'
import { hashString } from '../../utilities/hashing'

export const createBundle = (storage) => {
	let clone = copyDeep(storage)

	return {
		state: () => copyDeep(clone),

		getRootDirectory: () => {
			return ''
		},

		walk: (file) => {
			return Object.keys(
				deflate(
					getLeaf(clone)(file)
				)
			)
		},

		write: (file) => (contents) => {
			clone = addLeaf(clone)(file)(contents)
		},

		read: (file) => {
			try {
				return getLeaf(clone)(file)
			} catch (e) {
				throw new errors.FileNotFound(file)
			}
		},

		copy: (file) => (newFile) => {
			clone = addLeaf(clone)(newFile)(getLeaf(clone)(file))
		},

		remove: (file) => {
			clone = removeLeaf(clone)(file)
		},

		hash: (file) => {
			return hashString(getLeaf(clone)(file))
		},

		isFile: (file) => {
			try {
				return typeof getLeaf(clone)(file) === 'string'
			} catch (e) {
				//
			}

			return false
		},

		mkdir: (directory) => {
			clone = addLeaf(clone)(directory)({})
		},

		lsdir: (directory) => {
			try {
				return Object.keys(getLeaf(clone)(directory))
			} catch (e) {
				throw new errors.DirNotFound(directory)
			}
		},

		rmdir: (directory) => {
			clone = removeLeaf(clone)(directory)
		},

		isDir: (directory) => {
			try {
				return typeof getLeaf(clone)(directory) === 'object'
			} catch (e) {
				//
			}

			return false
		}
	}
}