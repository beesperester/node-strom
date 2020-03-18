import path from 'path'
import * as commitModule from './commit'
import { paths } from './config'
import * as repositoryModule from './repository'
import * as objectModule from './object'
import { getFilesDifference } from './utilities/difference'
import { filterMinimatchString } from './utilities/filtering'
import { inflate } from './utilities/map'

export const getWorkingDirectoryFiles = (filesystem) => {
	return filesystem.walk('')
		.filter(
			filterMinimatchString(
				[
					`!${paths.repository}/**`
				]
			)
		)
}

export const getWorkingDirectoryFilesHashed = (filesystem) => {
	const workingDirFiles = getWorkingDirectoryFiles(filesystem)
	const workingDirFilesHashed = {}

	workingDirFiles.forEach((file) => {
		workingDirFilesHashed[file] = filesystem.hash(file)
	})

	return workingDirFilesHashed
}

export const removeWorkingDirectoryFiles = (filesystem) => (files) => {
	// remove files from working directory
	const removeRecursive = (branch) => (dirname) => {
		Object.keys(branch).forEach((node) => {
			const nextPath = path.join(dirname, node)

			if (typeof branch[node] === 'object') {
				// remove directory
				removeRecursive(branch[node])(nextPath)

				filesystem.rmdir(nextPath)
			} else {
				// remove file
				filesystem.remove(nextPath)
			}
		})
	}

	removeRecursive(inflate(files))('')
}

export const setWorkingDirectoryFiles = (filesystem) => (files) => {
	const currentFiles = getWorkingDirectoryFilesHashed(filesystem)

	removeWorkingDirectoryFiles(filesystem)(currentFiles)

	// copy commit files from objects to working directory
	Object.keys(files).forEach((file) => {
		objectModule.restoreObject(filesystem)(files[file])(file)
	})
}

export const getWorkingDirectoryFile = (filesystem) => (file) => {
	const files = getWorkingDirectoryFiles(filesystem)

	if (files.includes(file)) {
		return file
	}

	throw new Error(`Unable to retrieve file ${file}`)
}

export const getWorkingDirectoryFileHashed = (filesystem) => (file) => {
	const files = getWorkingDirectoryFilesHashed(filesystem)

	if (Object.keys(files).includes(file)) {
		return {
			[file]: files[file]
		}
	}

	throw new Error(`Unable to retrieve file ${file}`)
}

export const getState = (filesystem) => {
	/**
	 * Get state of repository by comparing head commit
	 * with working directory.
	 * 
	 * @argument filesystem
	 * 
	 * @returns object
	*/

	// get head reference
	const workingDirectoryFiles = getWorkingDirectoryFilesHashed(filesystem)
	let commitFiles = {}

	const commitId = repositoryModule.getRepositoryCommitId(filesystem)

	if (commitId) {
		const commit = commitModule.getCommit(filesystem)(commitId)

		commitFiles = commitModule.getCommitFiles(filesystem)(commit)
	}

	return getFilesDifference(commitFiles)(workingDirectoryFiles)
}