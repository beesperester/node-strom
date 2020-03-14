import path from 'path'
import { getRepositoryDirectory } from './repository'
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
			path.join(
				getRepositoryDirectory(),
				getStageFile()
			)
		)
	)
}

export const setStage = (filesystem) => (state) => {
	filesystem.write(
		path.join(
			getRepositoryDirectory(),
			getStageFile()
		)
	)(serialize(state))
}

export const getStageFile = () => {
	return 'stage'
}

export const stageIncludes = (filesystem) => (file) => {
	return getStage(filesystem).includes(file)
}

export const initStage = (filesystem) => {
	const stageFile = path.join(
		getRepositoryDirectory(),
		getStageFile()
	)

	if (!filesystem.isFile(stageFile)) {
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

		addFile: addFile(filesystem),

		addFiles: (files) => {
			files.forEach((file) => {
				addFile(filesystem)(file)
			})
		},

		remove: removeFile(filesystem),

		includes: stageIncludes(filesystem)
	}
}