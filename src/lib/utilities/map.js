import { filterEmptyString } from './filtering'

export class NotFound extends Error { }

export const copy = (map) => Object.assign({}, map)

export const copyDeep = (map) => JSON.parse(JSON.stringify(map))

export const deflate = (map) => (namespace) => {
	const namespaceParts = namespace.split('/').filter(filterEmptyString)
	const result = {}

	for (let key of Object.keys(map)) {
		const currentNamespaceParts = [...namespaceParts, key]
		const currentNamespace = currentNamespaceParts.join('/')
		const next = map[key]

		if (typeof next === 'object') {
			Object.assign(
				result,
				deflate(map[key])(currentNamespace)
			)
		} else {
			Object.assign(
				result,
				{
					[currentNamespace]: map[key]
				}
			)
		}
	}

	return result
}

export const inflate = (map) => {
	let result = {}

	for (let key of Object.keys(map)) {
		result = addLeaf(result)(key)(map[key])
	}

	return result
}

export const pathToArray = (delimiter) => (path) => {
	return String(path).split(delimiter).filter(filterEmptyString)
}

export const addLeaf = (branch) => (path) => (leaf) => {
	const pathParts = pathToArray('/')(path)

	const addLeafRecursive = (branch) => (parts) => (leaf) => (index) => {
		const clone = Object.assign({}, branch)
		let head = parts[index]

		if (parts.length > index) {
			clone[head] = addLeafRecursive(branch[head] !== undefined ? branch[head] : {})(parts)(leaf)(index + 1)

			return clone
		}

		return leaf
	}

	return addLeafRecursive(branch)(pathParts)(leaf)(0)
}

export const getLeaf = (branch) => (path) => {
	const pathParts = pathToArray('/')(path)

	for (let part of pathParts) {
		if (branch === undefined || typeof branch !== 'object') {
			throw new NotFound(`Unable to find ${path}`)
		}

		branch = branch[part]
	}

	return branch
}

export const removeLeaf = (branch) => (path) => {
	const pathParts = pathToArray('/')(path)

	const removeLeafRecursive = (branch) => (parts) => (index) => {
		const clone = Object.assign({}, branch)
		let head = parts[index]

		if (branch[head] === undefined) {
			return branch
		}

		if (parts.length - 1 > index) {
			clone[head] = removeLeafRecursive(branch[head])(parts)(index + 1)

			return clone
		}

		delete clone[head]

		return clone
	}

	return removeLeafRecursive(branch)(pathParts)(0)
}