import path from 'path'
import { paths } from './config'
import { buildRepositoryPath } from './repository'
import { deserialize, serialize } from './utilities/serialization'
import { createBundle as createBranchBundle } from './branch'
import { createBundle as createCommitBundle } from './commit'

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
		setHead(filesystem)(referenceTypes.branch)('master')
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

export const updateHead = (filesystem) => (id) => {
	const head = getHead(filesystem)

	if (head.type === referenceTypes.branch) {
		const branchBundle = createBranchBundle(filesystem)

		branchBundle.set(head.reference)(id)
	} else if (head.type === referenceTypes.commit) {
		setHead(filesystem)(head.type)(id)
	}
}

export const getReferenceCommit = (filesystem) => (reference) => {
	const commitBundle = createCommitBundle(filesystem)
	const commitId = getReferenceCommitId(reference)

	return commitBundle.get(commitId)
}

export const getReferenceCommitId = (filesystem) => (reference) => {
	if (reference.type === 'branch') {
		const branchBundle = createBranchBundle(filesystem)

		return branchBundle.get(reference.reference).commit
	} else if (reference.type === 'commit') {
		return reference.reference
	}

	throw new Error('Unable to get referenced commit')
}

export const createBundle = (filesystem) => {
	return {
		init: () => initReference(filesystem),

		getTags: () => getTags(filesystem),

		getTag: getTag(filesystem),

		setTag: setTag(filesystem),

		getHead: () => getHead(filesystem),

		setHead: setHead(filesystem),

		updateHead: updateHead(filesystem),

		getCommit: getReferenceCommit(filesystem),

		getCommitId: getReferenceCommitId(filesystem),

		buildPath: () => buildReferencePath(filesystem),

		buildHeadPath: () => buildHeadPath(filesystem),

		buildTagPath: () => buildTagPath(filesystem)
	}
}