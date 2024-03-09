import browser from 'webextension-polyfill';

console.log('Hello from the background!');

browser.runtime.onInstalled.addListener(details => console.log('Extension installed:', details));

self.addEventListener('activate', event => console.log('Service Worker activating.', event));
