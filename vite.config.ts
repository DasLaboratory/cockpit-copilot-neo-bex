import { defineConfig } from 'vite';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';

const target = process.env.TARGET || 'chrome';

function generateManifest() {
	const manifest =
		target === 'chrome'
			? readJsonFile('src/manifest/manifest.chrome.json')
			: readJsonFile('src/manifest/manifest.firefox.json');
	const pkg = readJsonFile('package.json');
	return {
		name: pkg.name,
		description: pkg.description,
		version: pkg.version,
		...manifest
	};
}

export default defineConfig({
	plugins: [
		webExtension({
			manifest: generateManifest,
			watchFilePaths: ['package.json', 'src/manifest/manifest.chrome.json', 'src/background/background.ts'],
			webExtConfig: {
				startUrl: 'http://video-cockpit.com/laboratory/#/bex',
				args: ['--start-maximized', '--auto-open-devtools-for-tabs']
			}
		})
	]
});
