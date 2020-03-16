import path from 'path'
import { paths } from './config'
import { buildRepositoryPath } from './repository'
import { serialize, deserialize } from './utilities/serialization'

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
			buildStagePath(filesystem)
		)
	)
}

export const setStage = (filesystem) => (state) => {
	filesystem.write(
		buildStagePath(filesystem)
	)(serialize(state))
}

export const buildStagePath = (filesystem) => {
	return path.join(
		buildRepositoryPath(filesystem),
		paths.stage
	)
}

export const initStage = (filesystem) => {
	if (!filesystem.isFile(buildStagePath(filesystem))) {
		resetStage(filesystem)
	}
}

export const resetStage = (filesystem) => {
	setStage(filesystem)({
		add: [],
		remove: []
	})
}

export const createBundle = (filesystem) => {
	return {
		init: () => initStage(filesystem),

		state: () => getStage(filesystem),

		reset: () => resetStage(filesystem),

		add: addFile(filesystem),

		unstage: unstageFile(filesystem),

		remove: removeFile(filesystem),

		buildPath: () => buildStagePath(filesystem)
	}
}