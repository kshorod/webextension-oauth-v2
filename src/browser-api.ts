import { IBrowserApi } from './types';

declare const browser: any;
declare const chrome: any;

function chromeApiFix<T>(func: (callback: (result: T) => void) => void) {
    return new Promise((resolve, reject) => {
        func(result => {
            if (typeof (chrome.runtime.lastError) !== 'undefined') {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(result);
        })
    });
}

export function getTypedBrowserApi(): IBrowserApi {
    if (typeof (browser) !== "undefined") {
        return <IBrowserApi>{
            ...browser,
            storage: {
                ...browser.storage,
                local: {
                    ...browser.storage.local,
                    async getTyped<T>(key: string): Promise<T> {
                        const data = <{ [index: string]: T }>await browser.storage.local.get(key);
                        return data[key];
                    }
                }
            }
        };
    } else if (typeof (chrome) !== "undefined") {
        return <IBrowserApi>{
            ...chrome,
            storage: {
                ...chrome.storage,
                local: {
                    ...chrome.storage.local,
                    // error handling is not implemented for those
                    get: keys => new Promise(callback => chrome.storage.local.get(keys, callback)),
                    async getTyped<T>(key: string): Promise<T> {
                        const data = <{ [index: string]: T }>await chromeApiFix(callback => chrome.storage.local.get(key, callback));
                        return data[key];
                        //return new Promise(callback => chrome.storage.local.get(key, callback)).then(model => model[key]);
                    },
                    //set: model => new Promise(callback => chrome.storage.local.set(model, callback)),
                    set: model => chromeApiFix(callback => chrome.storage.local.set(model, callback)),
                    remove: keys => new Promise(callback => chrome.storage.local.remove(keys, callback)),
                }
            },
            tabs: {
                ...chrome.tabs,
                create: (createProperties) => new Promise(callback => chrome.tabs.create(createProperties, callback))
            },
            identity: {
                ...chrome.identity,
                /** Check */
                launchWebAuthFlow: (params) => new Promise(callback => chrome.identity.launchWebAuthFlow(params, callback)),
            },
            runtime: {
                ...chrome.runtime,
                //sendMessage: (extensionId, message, options) => new Promise(callback => chrome.runtime.sendMessage(extensionId, message, options, callback))
                sendMessage: (extensionId: number, message: string, options: object) =>
                    chromeApiFix(callback => chrome.runtime.sendMessage(extensionId, message, options, callback))
            }
        };
    }
    throw new Error("unknown user agent");
}