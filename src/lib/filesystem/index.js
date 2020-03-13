import adapters from './adapters'

export const createFilesystem = (adapter) => {
	return {
		adapter,

		walk: (file) => {
			return adapter.walk(file)
		},

		write: (file) => (contents) => {
			return adapter.write(file)(contents)
		},

		read: (file) => {
			return adapter.read(file)
		},

		copy: (file) => (newFile) => {
			return adapter.copy(file)(newFile)
		},

		remove: (file) => {
			return adapter.remove(file)
		},

		hash: (file) => {
			return adapter.hash(file)
		},

		isFile: (file) => {
			return adapter.isFile(file)
		},

		mkdir: (directory) => {
			return adapter.mkdir(directory)
		},

		lsdir: (directory) => {
			return adapter.lsdir(directory)
		},

		rmdir: (directory) => {
			return adapter.rmdir(directory)
		},

		isDir: (directory) => {
			return adapter.isDir(directory)
		}
	}
}

export {
	adapters
}