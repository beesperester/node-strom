import fs from 'fs'
import crypto from 'crypto'

export const hashString = (string) => crypto.createHash('sha256').update(string).digest('hex')

export const hashFile = (chunkSize) => (file) => {
	const hash = crypto.createHash('sha256')
	const fd = fs.openSync(file, 'r')
	const length = fs.statSync(file).size
	let position = 0

	while (length > position) {
		const buffer = new Buffer(chunkSize)
		const bytesRead = fs.readSync(fd, buffer, 0, chunkSize, position)

		hash.update(buffer.slice(0, bytesRead))

		position = position + chunkSize

		if (bytesRead < chunkSize) {
			fs.closeSync(fd)

			break
		}
	}

	return hash.digest('hex')
}

export const pathFromHash = (length) => (depth) => (hash) => {
	const pathParts = []

	if (length * depth < hash.length) {
		for (let i = 0; i < depth; i++) {
			const start = i * length
			const end = start + length

			pathParts.push(hash.slice(start, end))
		}

		pathParts.push(hash.slice(length * depth))
	}

	return pathParts.join('/')
}