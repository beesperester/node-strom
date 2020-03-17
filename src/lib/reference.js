import path from 'path'
import * as branchModule from './branch'
import * as commitModule from './commit'
import { paths } from './config'
import * as repositoryModule from './repository'
import { deserialize, serialize } from './utilities/serialization'

export const referenceTypes = {
	branch: 'branch',
	commit: 'commit'
}

export const buildReferencePath = (filesystem) => {
	return path.join(
		repositoryModule.buildRepositoryPath(filesystem),
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
		branchModule.setBranch(filesystem)(head.reference)(id)
	} else if (head.type === referenceTypes.commit) {
		setHead(filesystem)(head.type)(id)
	}
}

export const getReferenceCommit = (filesystem) => (reference) => {
	const commitId = getReferenceCommitId(reference)

	return commitModule.getCommit(filesystem)(commitId)
}

export const getReferenceCommitId = (filesystem) => (reference) => {
	if (reference.type === 'branch') {
		return branchModule.getBranch(filesystem)(reference.reference).commit
	} else if (reference.type === 'commit') {
		return reference.reference
	}

	throw new Error('Unable to get referenced commit')
}