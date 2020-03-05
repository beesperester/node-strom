import { filterEmpty } from "./utilities"

export const deflate = (dict) => (namespace) => {
	const namespaceParts = namespace.split('/').filter(filterEmpty)
	const result = {}

	for (let key of Object.keys(dict)) {
		const currentNamespaceParts = [...namespaceParts, key]
		const currentNamespace = currentNamespaceParts.join('/')
		const next = dict[key]

		if (typeof next === 'object') {
			Object.assign(
				result,
				deflate(dict[key])(currentNamespace)
			)
		} else {
			Object.assign(
				result,
				{
					[currentNamespace]: dict[key]
				}
			)
		}
	}

	return result
}

export const addLeaf = (branch) => (path) => (leaf) => {
	const pathParts = path.split('/').filter(filterEmpty)

	if (pathParts.length > 0) {
		const head = pathParts[0]
		const tail = pathParts.slice(1).join('/')

		if (pathParts.length > 1) {
			if (!(head in branch)) {
				branch[head] = {}
			}

			addLeaf(branch[head])(tail)(leaf)
		} else {
			branch[head] = leaf
		}
	}

	return branch
}

export const getLeaf = (branch) => (path) => {
	const pathParts = path.split('/').filter(filterEmpty)

	if (pathParts.length > 0) {
		const head = pathParts[0]
		const tail = pathParts.slice(1).join('/')

		if (pathParts.length > 1) {
			if (head in branch) {
				return getLeaf(branch[head])(tail)
			}
		} else {
			return branch[head]
		}
	}

  throw new Error(`Unable to find ${path}`)
}

export const removeLeaf = (branch) => (path) => {
	const pathParts = path.split('/').filter(filterEmpty)

	if (pathParts.length > 0) {
		const head = pathParts[0]
		const tail = pathParts.slice(1).join('/')

		if (pathParts.length > 1) {
			if (head in branch) {
				removeLeaf(branch[head])(tail)
			}
		} else {
			delete branch[head]
		}
	}

  return branch
}

export const inflate = (dict) => {
	const result = {}

	for (let key of Object.keys(dict)) {
		addLeaf(result)(key)(dict[key])
	}

	return result
}