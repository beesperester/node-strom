export const createStage = () => {
	let stage = []

	return {
		state: () => stage,

		add: (path) => {
			stage = [
				...stage,
				path
			]

			return stage
		},

		remove: (path) => {
			stage = [
				...stage.filter((x) => x !== path)
			]

			return stage
		},

		includes: (path) => {
			return stage.includes(path)
		}
	}
}