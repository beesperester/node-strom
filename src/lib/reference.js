import path from 'path'
import { getBranchesDirectory } from './branch'
import { paths } from './config'
import { buildRepositoryPath } from './repository'
import { deserialize, serialize } from './utilities/serialization'

export const referenceTypes = {
	branch: 'branch',
	commit: 'commit'
}

export const buildReferencePath = (filesystem) => {
	return path.join(
		buildRepositoryPath(filesystem),
		paths.reference
	)
}

export const buildTagPath = (filesystem) => {
	return path.join(
		buildReferencePath(filesystem),
		paths.tag
	)
}

export const buildHeadPath = (filesystem) => {
	return path.join(
		buildReferencePath(filesystem),
		paths.head
	)
}

export const initReference = (filesystem) => {
	const referenceDirectories = [
		buildReferencePath(filesystem),
		buildTagPath(filesystem)
	]

	referenceDirectories.forEach((directory) => {
		if (!filesystem.isDir(directory)) {
			filesystem.mkdir(directory)
		}
	})

	try {
		getHead(filesystem)
	} catch (e) {
		setHead(filesystem)(referenceTypes.branch)(
			path.join(
				getBranchesDirectory(),
				'master'
			)
		)
	}
}

export const getTags = (filesystem) => {
	return filesystem.lsdir(
		buildTagPath(filesystem)
	)
}

export const getTag = (filesystem) => (name) => {
	return deserialize(
		filesystem.read(
			buildTagPath(filesystem),
			name
		)
	)
}

export const setTag = (filesystem) => (name) => (id) => {
	const contents = {
		type: referenceTypes.commit,
		reference: id
	}

	filesystem.write(
		path.join(
			buildTagPath(filesystem),
			name
		)
	)(serialize(contents))
}

export const getHead = (filesystem) => {
	return deserialize(
		filesystem.read(
			buildHeadPath(filesystem)
		)
	)
}

export const setHead = (filesystem) => (referenceType) => (referencePath) => {
	const contents = {
		type: referenceType,
		reference: referencePath
	}

	filesystem.write(
		buildHeadPath(filesystem)
	)(serialize(contents))
}

export const createBundle = (filesystem) => {
	return {
		init: () => initReference(filesystem),

		getTags: () => getTags(filesystem),

		getTag: getTag(filesystem),

		setTag: setTag(filesystem),

		getHead: () => getHead(filesystem),

		setHead: setHead(filesystem)
	}
}