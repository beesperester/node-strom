import adapters from './adapters'

export const createFilesystem = (adapter) => {
	return {
		adapter,

		walk: (path) => {
			return adapter.walk(path)
		},

		write: (path) => (contents) => {
			return adapter.write(path)(contents)
		},

		read: (path) => {
			return adapter.read(path)
		},

		remove: (path) => {
			return adapter.remove(path)
		},

		hash: (path) => {
			return adapter.hash(path)
		},

		isFile: (path) => {
			return adapter.isFile(path)
		},

		mkdir: (path) => {
			return adapter.mkdir(path)
		},

		lsdir: (path) => {
			return adapter.lsdir(path)
		},

		rmdir: (path) => {
			return adapter.rmdir(path)
		},

		isDir: (path) => {
			return adapter.isDir(path)
		}
	}
}

export {
	adapters
}