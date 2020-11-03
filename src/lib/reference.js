import path from 'path'
import * as branchModule from './branch'
import * as commitModule from './commit'
import { paths } from './config'
import { deserialize, serialize } from './utilities/serialization'

export const referenceTypes = {
	branch: 'branch',
	commit: 'commit'
}

export const initReference = (filesystem) => {
	const referenceDirectories = [
		paths.reference,
		paths.tag
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
	return filesystem.lsdir(paths.tag)
}

export const getTag = (filesystem) => (name) => {
	return deserialize(
		filesystem.read(
			paths.tag,
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
			paths.tag,
			name
		)
	)(serialize(contents))
}

export const getHead = (filesystem) => {
	return deserialize(
		filesystem.read(paths.head)
	)
}

export const setHead = (filesystem) => (referenceType) => (referencePath) => {
	const contents = {
		type: referenceType,
		reference: referencePath
	}

	filesystem.write(paths.head)(serialize(contents))
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