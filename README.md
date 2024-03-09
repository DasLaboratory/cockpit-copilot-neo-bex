# 𝕯𝖆𝖘 𝕷𝖆𝖇𝖔𝖗𝖆𝖙𝖔𝖗𝖞® Cockpit Copilot™

![Data flow](/assets/data-flow.svg)

`[🌐 Web site]` ➜ _"CAPTURE_TAB_REQUEST"_ ➜ `[📄 BEX content script]` ➜ _"CAPTURE_TAB_REQUEST"_ ➜ `[🤖 BEX background script]`

`[🤖 BEX background script]` ➜ _'browser.tabs.captureVisibleTab()'_

`[🤖 BEX background script]` ➜ _'{ jpeg, png }'_ ➜ `[📄 BEX content script]` ➜ _'{ type: "CAPTURE_TAB_RESPONSE", jpeg, png }'_ ➜ `[🌐 Web site]`

## Data flow

##### 1. [ 🌐 Web site ] ➜ `CAPTURE_TAB_REQUEST` ➜ [ 📄 BEX content script ]

```js
/* 🌐 InteractiveScreenshotPopUp.vue: */

window.postMessage('CAPTURE_TAB_REQUEST', '*');

/* 📄 content.ts: */

window.addEventListener('message', function (event) {
	if (event.data === 'CAPTURE_TAB_REQUEST') // ...
});
```

##### 2. [ 📄 BEX content script ] ➜ `CAPTURE_TAB_REQUEST` ➜ [ 🤖 BEX background script ]

```js
/* 📄 content.ts: */

browser.runtime.sendMessage('CAPTURE_TAB_REQUEST').then(response => {
	// ...
});

/* 🤖 background.ts: */

browser.runtime.onMessage.addListener(async (msg, sender) => {
	if (msg === 'CAPTURE_TAB_REQUEST') // ...
});
```

##### 3. [ 🤖 BEX background script ] ➜ `browser.tabs.captureVisibleTab()` ➜ `{ jpeg, png }` ➜ [ 📄 BEX content script ]

```js
/* 🤖 background.ts: */

//	browser.runtime.onMessage.addListener(async (msg, sender) => {
//		if (msg === 'CAPTURE_TAB_REQUEST') {
const jpegCapture = browser.tabs.captureVisibleTab(undefined, { format: 'jpeg' });
const pngCapture = browser.tabs.captureVisibleTab(undefined, { format: 'png' });

return Promise.all([jpegCapture, pngCapture]).then(([jpeg, png]) => ({ jpeg, png }));
//		}
//		return;
//	});
```

##### 4. [ 📄 BEX content script ] ➜ `{ type: 'CAPTURE_TAB_RESPONSE', jpeg, png }` ➜ [ 🌐 Web site ]

```js
/* 📄 content.ts: */

//	browser.runtime.sendMessage('CAPTURE_TAB_REQUEST').then(response => {
window.postMessage({ type: 'CAPTURE_TAB_RESPONSE', ...response }, '*');
//	});

/* 🌐 InteractiveScreenshotPopUp.vue: */

window.addEventListener('message', ({ data: { type, jpeg, png } }) => {
	if (type === 'CAPTURE_TAB_RESPONSE') {
		// Handle the response here...
	}
});
```

## Data flow with popup script

![Data flow 2](/assets/flowchart.png)

[_Chrome Extension Tutorial: How to Pass Messages from a Page's Context_](https://www.freecodecamp.org/news/chrome-extension-message-passing-essentials/)
