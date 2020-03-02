import fs from 'fs'
import path from 'path'

export function* walk(directory) {
	for (let tail of fs.readdirSync(directory)) {
		const next = path.join(directory, tail)

		if (fs.statSync(next).isDirectory()) {
			for (let item of walk(next)) {
				yield item
			}
		} else {
			yield next
		}
	}
}