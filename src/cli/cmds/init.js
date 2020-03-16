export const command = 'init [directory]'

export const describe = ''

export const builder = (yargs) => {
	return yargs
		.positional('directory', {
			describe: 'directory to initialize repository in',
			type: 'string',
			defaut: '.'
		})
}

export const handler = (argv) => { }
