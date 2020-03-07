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

export const pathToArray = (delimiter) => (path) => {
  return String(path).split(delimiter).filter(filterEmpty)
}

export const addLeaf = (branch) => (path) => (leaf) => {
  const pathParts = pathToArray('/')(path)

  const head = pathParts[0]
  const tail = pathParts.slice(1).join('/')

  if (pathParts.length > 0) {
    const clone = Object.assign({}, branch)

    clone[head] = addLeaf(branch[head] !== undefined ? branch[head] : {})(tail)(leaf)

    return clone
  } else {
    return leaf
  }
}

export const getLeaf = (branch) => (path) => {
  const pathParts = pathToArray('/')(path)

  for (let part of pathParts) {
    if (branch === undefined || typeof branch !== 'object') {
      return branch
    }

    branch = branch[part]
  }

  return branch
}

export const removeLeaf = (branch) => (path) => {
  const pathParts = pathToArray('/')(path)

  const removeLeafRecursive = (branch) => (parts) => (index) => {
    const clone = Object.assign({}, branch)
    let head = parts[index];

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

export const inflate = (dict) => {
  let result = {}

  for (let key of Object.keys(dict)) {
    result = addLeaf(result)(key)(dict[key])
  }

  return result
}