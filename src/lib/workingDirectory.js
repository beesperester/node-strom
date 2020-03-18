import path from 'path'
import * as commitModule from './commit'
import { paths } from './config'
import * as repositoryModule from './repository'
import cache from './utilities/cache'
import { getFilesDifference } from './utilities/difference'
import { filterMinimatchString } from './utilities/filtering'

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
	// invalidate cache
	cache.invalidate('getWorkingDirectoryFiles')


}

export const getWorkingDirectoryFile = (filesystem) => (file) => {
	return cache.get(path.join(
		'getWorkingDirectoryFile',
		file
	))(() => {
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