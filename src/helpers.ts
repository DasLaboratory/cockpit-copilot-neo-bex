import browser, { Runtime } from 'webextension-polyfill';

function debugLogOnHost(message: unknown) {
	browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
		if (!tab.id) return;

		browser.scripting.executeScript({
			target: { tabId: tab.id },
			func: message => {
				const messageArray = Array.isArray(message) ? message : [message];
				console.warn('[EXTENSION] ', ...messageArray);
			},
			args: [message]
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

function initAutoReload() {
	browser.tabs.onUpdated.addListener(reloadExtension);

	browser.runtime.onInstalled.addListener(reloadExtensionOnInstalled);

	function reloadExtensionOnInstalled() {
		browser.tabs
			.query({
				url: ['*://*.video-cockpit.com/*', '*://*.simpleshow-cockpit.com/*']
			})
			.then(result => {
				result.forEach(function (tab) {
					if (tab.id) reloadExtension(tab.id, {}, tab);
				});
			});
	}

	function reloadExtension(tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType, tab: browser.Tabs.Tab) {
		if (tab.status === 'complete' && tab.url) {
			console.log('Reloading extension for tab:', tabId, tab, tab.url, changeInfo);
			if (tab.url.includes('video-cockpit.com') || tab.url.includes('simpleshow-cockpit.com')) {
				browser.tabs.get(tabId).then(tab => {
					if (tab.discarded) {
						// if tab is discarded
						browser.tabs.reload(tabId).then(() => {
							// reload tab
							executeScript(tabId); // then execute script
						});
					} else {
						executeScript(tabId); // if tab is not discarded, execute script directly
					}
				});
			} else {
				setIcon('idle', tabId);
			}
		}

		function executeScript(tabId: number) {
			setIcon('on', tabId);

			browser.scripting
				.executeScript({
					target: { tabId: tabId },
					func: functionToExecute,
					args: [browser.runtime.id]
				})
				.then(() => {
					if (browser.runtime.lastError) {
						console.error(browser.runtime.lastError.message, tab.url);
						debugLogOnHost([browser.runtime.lastError.message, tab.url]);
					}
				});

			function functionToExecute(id: Runtime.Static['id']) {
				document.body.classList.add('copilot');
				document.body.setAttribute('data-copilot-id', id);
				console.log('Copilot extension is active');
			}
		}
	}
}

export { debugLogOnHost, initAutoReload, setIcon };
