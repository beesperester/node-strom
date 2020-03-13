export const addFile = (stage) => (file) => {
	return stage.includes(file) ? stage : [
		...stage,
		file
	]
}

export const createStage = (filesystem) => {
	let stage = []

	return {
		state: () => stage,

		addFile: (file) => {
			stage = addFile(stage)(file)
		},

		addFiles: (files) => {
			files.forEach((file) => {
				stage = addFile(stage)(file)
			})
		},

		remove: (file) => {
			stage = [
				...stage.filter((x) => x !== file)
			]
		},

		includes: (file) => {
			return stage.includes(file)
		}
	}
}