import browser from 'webextension-polyfill';

const cockpitURLs = ['*://*.video-cockpit.com/*', '*://*.simpleshow-cockpit.com/*'];

browser.runtime.onInstalled.addListener(() => handleExtensionReload());

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status === 'complete') handleExtensionReload(tabId);
});

browser.runtime.onMessage.addListener(async (msg, sender) => {
	console.log('[🤴BG] received message', msg, 'from', sender);

	// Awaiting message 'CAPTURE_TAB_REQUEST' from the content script
	// and returning the data URLs of the captured tab back to the content script
	if (msg === 'CAPTURE_TAB_REQUEST') {
		// Capture as JPEG
		const jpegCapture = browser.tabs.captureVisibleTab(undefined, { format: 'jpeg' });
		// Capture as PNG
		const pngCapture = browser.tabs.captureVisibleTab(undefined, { format: 'png' });

		// Wait for both captures to complete...
		return Promise.all([jpegCapture, pngCapture]).then(([jpeg, png]) => {
			// ...and send the data URLs of the captured tab back to the content script
			return { jpeg, png };
		});
	}

	return;
});

function handleExtensionReload(tabId?: number) {
	browser.tabs.query({ url: cockpitURLs }).then(tabs => {
		tabs.forEach(tab => {
			if (tab.id) {
				if (tab.status === 'complete') setIcon('on', tab.id);
				else if (tab.id === tabId) setIcon('idle', tab.id);
			}
		});
	});
}

function setIcon(type: string, tabId: number) {
	browser.action.setIcon({
		path: {
			16: `/icons/${type}/icon-16x16.png`,
			32: `/icons/${type}/icon-32x32.png`,
			48: `/icons/${type}/icon-48x48.png`,
			96: `/icons/${type}/icon-96x96.png`,
			128: `/icons/${type}/icon-128x128.png`
		},
		tabId
	});
}
