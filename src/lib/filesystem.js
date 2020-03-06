import { addLeaf, getLeaf, removeLeaf } from './dict'

export const adapter = (storage) => {
  let clone = Object.assign({}, storage)

	return {
    write: (path) => (contents) => {
      clone = addLeaf(clone)(path)(contents)

      return clone
    },

    read: (path) => {
      clone = getLeaf(clone)(path)

      return clone
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
      return Object.keys(getLeaf(storage)(path))
    },

    rmdir: (path) => {
      clone = removeLeaf(storage)(path)

      return clone
    }
  }
}

export const createFilesystem = (adapter) => {
	return {
		write: (path) => (contents) => {
			return adapter.write(path)(contents)
		},

    read: (path) => {
      return adapter.read(path)
    },

    remove: (path) => {
      return adapter.remove(path)
    },

    mkdir: (path) => {
      return adapter.mkdir(path)
    },

    lsdir: (path) => {
      return adapter.lsdir(path)
    },

    rmdir: (path) => {
      return adapter.rmdir(path)
    }
	}
}