export const createFilesystem = (adapter) => {
	return {
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