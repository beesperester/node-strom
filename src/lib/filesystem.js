export const adapter = {
	write: (path) => (contents) => {
		
	}
}

export const createFilesystem = (adapter) => {
	return {
		write: (path) => (contents) => {
			adapter.write(path)(contents)
		}
	}
}