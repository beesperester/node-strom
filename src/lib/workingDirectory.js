import path from 'path'
import * as repositoryModule from './repository'
import { filterMinimatchString } from './utilities/filtering'
import cache from './utilities/cache'
import * as referenceModule from './reference'
import * as commitModule from './commit'
import { getFilesDifference } from './utilities/difference'

export const buildWorkingDirectoryPath = (filesystem) => {
	return filesystem.getRootDirectory()
}

export const getWorkingDirectoryFiles = (filesystem) => {
	return cache.get('getWorkingDirectoryFiles')(() => {
		const workingDirFiles = filesystem.walk('')
			.filter(
				filterMinimatchString(
					[
						`!${repositoryModule.buildRepositoryPath(filesystem)}/**`
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
	const head = referenceModule.getHead(filesystem)
	const workingDirectoryFiles = getWorkingDirectoryFiles(filesystem)
	let commitFiles = {}

	try {
		const commit = referenceModule.getCommit(filesystem)(head)

		commitFiles = commitModule.getFiles(filesystem)(commit)
	} catch (e) {
		//
	}

	return getFilesDifference(workingDirectoryFiles)(commitFiles)
}