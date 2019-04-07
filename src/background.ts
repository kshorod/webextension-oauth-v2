/**
 * The type tabs.Tab contains information about a tab. This provides access to information about what content is in the tab, how large the content is, what special states or restrictions are in effect, and so forth.
 *
 * Note: In extension background scripts, the only properties that are available are tabId and windowId.
 */
interface ITab {
    active: boolean;
    attention: boolean;
    id: number;
    status: string;
    title: string;
    /**
     * Optional
     *
     * The URL of the document that the tab is displaying. Only present if the extension has the "tabs" permission.
     */
    url: string;
}

interface ITabs_CreateProperties {
    /**
     * Optional
     *
     * Whether the tab should become the active tab in the window. Does not affect whether the window is focused (see windows.update). Defaults to true.
     */
    active: boolean;
    cookieStoreId: string;
    index: number;
    openerTabId: number;
    openInReaderMode: boolean;
    pinned: boolean;
    selected: boolean;
    url: string
}

interface IStorageArea {
    get(keys: null | string | object | string[]): Promise<object | undefined>;
    getTyped<T>(key: string): Promise<T>;
    set(model: object): Promise<void>;
    remove(keys: string | string[]): Promise<void>;
}


interface IBrowserApi {
    storage: {
        local: IStorageArea,
    }
    tabs: {
        create(props: ITabs_CreateProperties): Promise<ITab>,
        remove(tabIds: number | number[]): Promise<void>
    },
    identity: {
        /**
         * Generates a URL that you can use as a redirect URL.
         */
        getRedirectUrl(): string,
        /**
         * Performs the first part of an OAuth2 flow, including user authentication and client authorization.
         * @param details Options for the flow
         * @returns A Promise. If the extension is authorized successfully, this will be fulfilled with a string containing the redirect URL. The URL will include a parameter that either is an access token or can be exchanged for an access token, using the documented flow for the particular service provider. 
         */
        launchWebAuthFlow(details: {
            url: string,
            interactive?: boolean
        }): Promise<string>
    },
    rumtime: {
        //connect(extensionId?: string, connectInfo?: object): any,
        /**
         * @param extensionId The ID of the extension to send the message to. Include this to send the message to a different extension. If the intended recipient has set an ID explicitly using the applications key in manifest.json, then extensionId should have that value. Otherwise it should have the ID that was generated for the intended recipient.
         * @param message An object that can be serialized to JSON.
         * @param options Optional
         */
        sendMessage(extensionId: string, message: any, options?: {}): Promise<object | void>,
        /**
         * @param message An object that can be serialized to JSON.
         * @param options Optional
         */
        sendMessage(message: any, options?: {}): Promise<object | void>
    }
};

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

function getTypedBrowserApi(): IBrowserApi {
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

// function getBrowserApi() {
//     if (window.browser) {
//         return browser;
//     } else if (window.chrome) {
//         return {
//             ...chrome,
//             storage: {
//                 ...chrome.storage,
//                 local: {
//                     ...chrome.storage.local,
//                     // error handling is not implemented for those
//                     get: keys => new Promise(callback => chrome.storage.local.get(keys, callback)),
//                     set: model => new Promise(callback => chrome.storage.local.set(model, callback)),
//                     remove: keys => new Promise(callback => chrome.storage.local.remove(keys, callback)),
//                 }
//             },
//             tabs: {
//                 ...chrome.tabs,
//                 create: (createProperties) => new Promise(callback => chrome.tabs.create(createProperties, callback))
//             },
//             identity: {
//                 ...chrome.identity,
//                 /** Check */
//                 launchWebAuthFlow: (params) => new Promise(callback => chrome.identity.launchWebAuthFlow(params, callback)),
//             }
//         };
//     }
//     throw new Error("unknown user agent");
// }
// const browserApi = getBrowserApi();


export class IdentitySignInStrategy {
    browserApi: IBrowserApi;
    constructor() {
        this.browserApi = getTypedBrowserApi();
    }

    async initLogIn(url: string, interactive: boolean) {
        const redirectUrl = await this.browserApi.identity.launchWebAuthFlow({ url, interactive });
        const responseParams = extractHashParametersFromUrl(redirectUrl);

        if (responseParams.error) {
            throw new Error('WebAuth error "' + responseParams.error + '": ' + responseParams.error_description);
        } else {
            // const state = await statePromise;
            // if (responseParams.state !== state) {
            //     throw new Error('WebAuth error "state_error": response state mismatch')
            // }
            // check state

            let expires_in: number = parseInt(responseParams.expires_in, 10);
            expires_in = isNaN(expires_in) ? 0 : expires_in;

            const tokenParams = {
                ...responseParams,
                expires_in,
                expires_at: Date.now() + expires_in * 1000,
            };

            return tokenParams;
        }
    }
}

class WebNavigationSignInStrategy {

}

class LogInServerSignInStrategy {

}


// browserApi.runtime.onMessage.addListener(function (message, sender, callback) {
//     switch (message.operation) {
//         case 'login':
//             return initLogIn(message.url);
//         case 'refresh':
//             return initSilentRefresh(message.url);
//     }
// });

// function initLogIn(url) {
//     const properties = {
//         url,
//         active: true,
//     };
//     browserApi.tabs.create(properties);
// }

// function initSilentRefresh(url) {
//     const properties = {
//         url,
//         active: false,
//     };
//     browserApi.tabs.create(properties);
// }

function extractHashParametersFromUrl(url: string): any {
    const hash = url.split('#')[1];
    let data: { [key: string]: any } = {};
    hash.split('&').forEach((item) => {
        let parts = item.split('=');
        data[parts[0]] = parts[1];
    });
    return data;
    // return hash.split('&').reduce((result, item) => {
    //     let parts = item.split('=');
    //     result[parts[0]] = parts[1];
    //     return result;
    // }, {});
}

// browserApi.webNavigation.onErrorOccurred.addListener(function (details) {
//     const result = extractHashParametersFromUrl(details.url);
//     if (result.error) {
//         // we have an error
//         const errorData = {
//             error: result.error,
//             description: result.error_description,
//             state: result.state
//         }
//         // since we have no error handling, don't do anything
//         return;
//     }

//     const data = {
//         token: result['id_token'], // or access_token
//         exp: new Date().toString(),
//         state: result.state
//     };

//     browserApi.storage.local.set(data).then(function () {
//         browserApi.runtime.sendMessage({ operation: 'loggedIn' });
//         // use settimeout for debugging, or the tab will be closed almost instantly
//         //setTimeout(function () {
//         browserApi.tabs.remove(details.tabId);
//         //}, 500);
//     });
// }, {
//         url: [{
//             hostEquals: 'random.not.existing.url.local.somewhere'
//         }]
//     });