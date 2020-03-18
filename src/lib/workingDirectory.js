import path from 'path'
import * as commitModule from './commit'
import { paths } from './config'
import * as repositoryModule from './repository'
import * as objectModule from './object'
import cache from './utilities/cache'
import { getFilesDifference } from './utilities/difference'
import { filterMinimatchString } from './utilities/filtering'
import { inflate } from './utilities/map'

export const getWorkingDirectoryFiles = (filesystem) => {
	return cache.get('getWorkingDirectoryFiles')(() => {
		const workingDirFiles = filesystem.walk('')
			.filter(
				filterMinimatchString(
					[
						`!${paths.repository}/**`
					]
				)
			)
		const workingDirFilesHashed = {}

		workingDirFiles.forEach((file) => {
			workingDirFilesHashed[file] = filesystem.hash(file)
		})

		return workingDirFilesHashed
	})
}

export const setWorkingDirectoryFiles = (filesystem) => (files) => {
	const currentFiles = getWorkingDirectoryFiles(filesystem)

	// remove current files from working directory
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

	removeRecursive(inflate(currentFiles))('')

	// invalidate cache
	cache.invalidate('getWorkingDirectoryFiles')

	// copy commit files from objects to working directory
	Object.keys(files).forEach((file) => {
		objectModule.restoreObject(filesystem)(files[file])(file)
	})
}

export const getWorkingDirectoryFile = (filesystem) => (file) => {
	return cache.get(
		path.join(
			'getWorkingDirectoryFile',
			file
		)
	)(() => {
		const files = getWorkingDirectoryFiles(filesystem)

		if (Object.keys(files).includes(file)) {
			return {
				[file]: files[file]
			}
		}

		throw new Error(`Unable to retrieve file ${file}`)
	})
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
	const workingDirectoryFiles = getWorkingDirectoryFiles(filesystem)
	let commitFiles = {}

	const commitId = repositoryModule.getRepositoryCommitId(filesystem)

	if (commitId) {
		const commit = commitModule.getCommit(filesystem)(commitId)

		commitFiles = commitModule.getCommitFiles(filesystem)(commit)
	}

	return getFilesDifference(workingDirectoryFiles)(commitFiles)
}