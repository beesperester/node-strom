import { createFilesystem, adapters } from './filesystem'
import { inflate } from './utilities/map'
import { serialize } from './utilities/serialization'

export const workingDirectory = inflate({
	'setup-cinema4d/model_main.c4d': serialize('contents of model_main.c4d'),
	'setup-cinema4d/model_hair.c4d': serialize('contents of model_hair.c4d'),
	'setup-cinema4d/tex/albedo.jpg': serialize('contents of albedo.jpg'),
	'setup-cinema4d/tex/specular.jpg': serialize('contents of specular.jpg'),
	'setup-cinema4d/tex/roughness.jpg': serialize('contents of roughness.jpg'),
	'setup-cinema4d/tex/normal.jpg': serialize('contents of normal.jpg'),
	'setup-cinema4d/tex/height.jpg': serialize('contents of height.jpg'),
	'setup-cinema4d/tex/sss.jpg': serialize('contents of sss.jpg'),
	'setup-zbrush/sculpt_main.ztl': serialize('contents of sculpt_main.ztl'),
	'setup-houdini/lighting_main.hip': serialize('contents of lighting_main.hip'),
	'setup-houdini/shading_main.hip': serialize('contents of shading_main.hip')
})

export const adapter = adapters.memory.createAdapter(workingDirectory)

export const filesystem = createFilesystem(adapter)