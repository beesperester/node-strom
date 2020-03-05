import { addLeaf, getLeaf, removeLeaf } from './dict'

export const adapter = (storage) => {
	return {
    write: (path) => (contents) => {
      return addLeaf(storage)(path)(contents)
    },

    read: (path) => {
      return getLeaf(storage)(path)
    },

    remove: (path) => {
      return removeLeaf(storage)(path)
    },

    mkdir: (path) => {
      return addLeaf(storage)(path)({})
    },

    lsdir: (path) => {
      return Object.keys(getLeaf(storage)(path))
    },

    rmdir: (path) => {
      return removeLeaf(storage)(path)
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