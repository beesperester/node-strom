export const getFilesDifference = (filesA) => (filesB) => {
	const added = []
	const modified = []
	const removed = []

	// compare files from filesA with filesB
	Object.keys(filesA).forEach((file) => {
		if (!Object.keys(filesB).includes(file)) {
			// add removed file
			removed.push(file)
		} else if (filesA[file] !== filesB[file]) {
			// add modified file
			modified.push(file)
		}
	})

	// compare files from previous commit with files from working directory
	Object.keys(filesB).forEach((file) => {
		if (!Object.keys(filesA).includes(file)) {
			// add added file
			added.push(file)
		}
	})

	return {
		added,
		modified,
		removed
	}
}