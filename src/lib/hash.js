import fs from 'fs'
import crypto from 'crypto'

export const hashFileOld = (file) => {
	const hash = crypto.createHash('sha256')

	return new Promise((resolve, reject) => {
		const input = fs.createReadStream(file);

		input.on('readable', () => {
			const data = input.read();

			if (data)
				hash.update(data);
			else {
				resolve(hash.digest('hex'))
			}
		})

		input.on('error', reject)
	})
}

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