import browser from 'webextension-polyfill';

// This content script gets injected into the website and listens for messages from the website.
// It then passes these messages to the background script and returns the result to the website.

// Listen for messages from the website
window.addEventListener('message', function (event) {
	// A security measure to ensure that the event listener only processes messages
	// that originate from the same window. This helps to prevent potential
	// cross-scripting attacks by ignoring messages from other extensions or scripts
	// running in the same environment.
	if (event?.source !== window) return;

	// Awaiting message 'CAPTURE_TAB_REQUEST' from the website and pass it to the background script.
	// When we get a result from the background script we returning the data URLs of the captured
	// tab back to the website.
	if (event.data === 'CAPTURE_TAB_REQUEST') {
		console.log('[🥷CS] received message:', event.data);

		// Sending message 'CAPTURE_TAB_REQUEST' to the background script and when we get a result...
		browser.runtime.sendMessage('CAPTURE_TAB_REQUEST').then(response => {
			console.log('[🥷CS] CAPTURE_TAB_REQUEST response', response);

			// ... we can finally send the response, including the screenshot data, back to the website.
			window.postMessage({ type: 'CAPTURE_TAB_RESPONSE', ...response }, '*');
		});
	}
});
