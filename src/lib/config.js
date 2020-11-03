import path from 'path'

export const repositoryName = '.strom'

export const paths = {
	repository: repositoryName,
	object: path.join(repositoryName, 'objects'),
	reference: path.join(repositoryName, 'references'),
	branch: path.join(repositoryName, 'branches'),
	head: path.join(repositoryName, 'references', 'head'),
	tag: path.join(repositoryName, 'references', 'tags'),
	stage: path.join(repositoryName, 'stage')
}