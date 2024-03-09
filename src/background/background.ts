import browser from 'webextension-polyfill';

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
