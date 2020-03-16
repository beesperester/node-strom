import { buildRepositoryPath } from './repository'
import { filterMinimatchString } from './utilities/filtering'
import cache from './utilities/cache'

export const buildWorkingDirectoryPath = (filesystem) => {
	return filesystem.getRootDirectory()
}

export const getWorkingDirectoryFiles = (filesystem) => {
	const signature = cache.createSignature('getWorkingDirectoryFiles')

	return cache.get(signature)(() => {
		const workingDirFiles = filesystem.walk('')
			.filter(
				filterMinimatchString(
					[
						`!${buildRepositoryPath(filesystem)}/**`
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

export const getWorkingDirectoryFile = (filesystem) => (file) => {
	const files = getWorkingDirectoryFiles(filesystem)

	if (Object.keys(files).includes(file)) {
		return {
			[file]: files[file]
		}
	}

	throw new Error(`Unable to retrieve file ${file}`)
}

export const createBundle = (filesystem) => {
	return {
		buildPath: () => buildWorkingDirectoryPath(filesystem),

		getFiles: () => getWorkingDirectoryFiles(filesystem),

		getFile: getWorkingDirectoryFile(filesystem)
	}
}