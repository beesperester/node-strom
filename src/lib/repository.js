import path from 'path'
import { mkdirSync } from 'fs'

export const createRepository = (root) => {
	const config = {
		head: ''
	}

	return {
		root,
		repository: {
			'.strom': {
				blobs: {},
				'config.json': JSON.stringify(config, undefined, 2)
			}
		}
	}
}

export const getRepositoryDirectory = (repository) => path.join(repository.root, repository.repository)

export const getBlobsDirectory = (repository) => path.join(getRepositoryDirectory(repository), repository.blobs)

export const getConfigFile = (repository) => path.join(getRepositoryDirectory(repository), repository.config)

export const initializeRepository = (repository) => {
	const directories = [
		getRepositoryDirectory(repository),
		getBlobsDirectory(repository)
	]

	directories.forEach((directory) => {
		mkdirSync(directory)
	})
}