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