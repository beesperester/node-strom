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
  const pathParts = pathToArray('/')(path)

  const head = pathParts[0]
  const tail = pathParts.slice(1).join('/')

  if (branch[head] === undefined) {
    return branch
  }

  if (tail.length > 1) {
    const clone = Object.assign({}, branch)

    clone[head] = removeLeaf(branch[head])(tail)

    return clone
  } else {
    const clone = Object.assign({}, branch)
    
    delete clone[head]

    return clone
  }
}

export const inflate = (dict) => {
  let result = {}

  for (let key of Object.keys(dict)) {
    result = addLeaf(result)(key)(dict[key])
  }

  return result
}