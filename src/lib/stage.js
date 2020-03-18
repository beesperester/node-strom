import { paths } from './config'
import { deserialize, serialize } from './utilities/serialization'
import * as workingDirectoryModule from './workingDirectory'

export const addFile = (filesystem) => (file) => {
	const state = getStage(filesystem)

	const nextState = state.add.includes(file)
		? state
		: {
			add: [
				...state.add,
				file
			],
			remove: state.remove
		}

	setStage(filesystem)(nextState)
}

export const unstageFile = (filesystem) => (file) => {
	const state = getStage(filesystem)

	const nextState = {
		add: [
			...state.add.filter((x) => x !== file)
		],
		remove: [
			...state.remove.filter((x) => x !== file)
		]
	}

	setStage(filesystem)(nextState)
}

export const unstageFiles = (filesystem) => (files) => {
	files.forEach(unstageFile(filesystem))
}

export const stageFile = (filesystem) => (file) => {
	// adds file to stage by checking which action needs to be taken
	// depending on added, modified or removed modifier

	const state = workingDirectoryModule.getState(filesystem)

	if (state.added.includes(file) || state.modified.includes(file)) {
		addFile(filesystem)(file)
	} else if (state.removed.includes(file)) {
		removeFile(filesystem)(file)
	}
}

export const stageFiles = (filesystem) => (files) => {
	files.forEach(stageFile(filesystem))
}

export const removeFile = (filesystem) => (file) => {
	const state = getStage(filesystem)

	const nextState = state.remove.includes(file)
		? {
			remove: [
				...state.remove.filter((x) => x !== file)
			],
			add: state.add
		}
		: state

	setStage(filesystem)(nextState)
}

export const getStage = (filesystem) => {
	return deserialize(
		filesystem.read(
			paths.stage
		)
	)
}

export const setStage = (filesystem) => (state) => {
	filesystem.write(
		paths.stage
	)(serialize(state))
}

export const initStage = (filesystem) => {
	if (!filesystem.isFile(paths.stage)) {
		resetStage(filesystem)
	}
}

export const resetStage = (filesystem) => {
	setStage(filesystem)({
		add: [],
		remove: []
	})
}