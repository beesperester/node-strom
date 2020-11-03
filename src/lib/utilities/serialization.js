export const serialize = (data) => JSON.stringify(data, undefined, 2)

export const deserialize = (string) => JSON.parse(string)