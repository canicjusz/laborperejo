import adapter from '@sveltejs/adapter-node';
import preprocessor from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocessor(),
	kit: {
		adapter: adapter({ out: 'build' })
	},
	onwarn: (warning, handler) => {
		if (warning.code === 'css-unused-selector') {
			return;
		}
		handler(warning);
	}
};

export default config;
