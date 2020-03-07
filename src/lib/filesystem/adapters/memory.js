import { addLeaf, getLeaf, removeLeaf } from '../../dict'

export const createAdapter = (storage) => {
	let clone = Object.assign({}, storage)

	return {
		write: (path) => (contents) => {
			clone = addLeaf(clone)(path)(contents)

			return clone
		},

		read: (path) => {
			return getLeaf(clone)(path)
		},

		remove: (path) => {
			clone = removeLeaf(clone)(path)

			return clone
		},

		mkdir: (path) => {
			clone = addLeaf(clone)(path)({})

			return clone
		},

		lsdir: (path) => {
			return Object.keys(getLeaf(clone)(path))
		},

		rmdir: (path) => {
			clone = removeLeaf(clone)(path)

			return clone
		}
	}
}