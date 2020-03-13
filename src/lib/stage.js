import path from 'path'
import { getRepositoryDirectory } from './repository'
import { serialize, deserialize } from './utilities/serialization'

export const addFile = (filesystem) => (file) => {
	const state = getStageState(filesystem)

	const nextState = state.add.includes(file)
		? state
		: {
			add: [
				...state.add,
				file
			],
			remove: state.remove
		}

	setStageState(filesystem)(nextState)
}

export const removeFile = (filesystem) => (file) => {
	const state = getStageState(filesystem)

	const nextState = state.remove.includes(file)
		? {
			remove: [
				...state.remove.filter((x) => x !== file)
			],
			add: state.add
		}
		: state

	setStageState(filesystem)(nextState)
}

export const getStageState = (filesystem) => {
	return deserialize(
		filesystem.read(
			path.join(
				getRepositoryDirectory(),
				getStageFile()
			)
		)
	)
}

export const setStageState = (filesystem) => (state) => {
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
	return getStageState(filesystem).includes(file)
}

export const initStage = (filesystem) => {
	const stageFile = path.join(
		getRepositoryDirectory(),
		getStageFile()
	)

	if (!filesystem.isFile(stageFile)) {
		setStageState(filesystem)({
			add: [],
			remove: []
		})
	}
}

export const createBundle = (filesystem) => {
	return {
		init: () => initStage(filesystem),

		state: () => getStageState(filesystem),

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