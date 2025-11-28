import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const ensureLeadingSlash = (path) => {
	if (!path) return '';
	return path.startsWith('/') ? path : `/${path}`;
};
const isDev = process.argv.includes('dev');
const basePath = process.env.BASE_PATH ?? '/RuConText-Bench-Web';
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base: isDev ? '' : ensureLeadingSlash(basePath)
		},
	}
};

export default config;
