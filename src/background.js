"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
;
function chromeApiFix(func) {
    return new Promise((resolve, reject) => {
        func(result => {
            if (typeof (chrome.runtime.lastError) !== 'undefined') {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(result);
        });
    });
}
function getTypedBrowserApi() {
    if (typeof (browser) !== "undefined") {
        return Object.assign({}, browser, { storage: Object.assign({}, browser.storage, { local: Object.assign({}, browser.storage.local, { getTyped(key) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const data = yield browser.storage.local.get(key);
                            return data[key];
                        });
                    } }) }) });
    }
    else if (typeof (chrome) !== "undefined") {
        return Object.assign({}, chrome, { storage: Object.assign({}, chrome.storage, { local: Object.assign({}, chrome.storage.local, { 
                    // error handling is not implemented for those
                    get: keys => new Promise(callback => chrome.storage.local.get(keys, callback)), getTyped(key) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const data = yield chromeApiFix(callback => chrome.storage.local.get(key, callback));
                            return data[key];
                            //return new Promise(callback => chrome.storage.local.get(key, callback)).then(model => model[key]);
                        });
                    }, 
                    //set: model => new Promise(callback => chrome.storage.local.set(model, callback)),
                    set: model => chromeApiFix(callback => chrome.storage.local.set(model, callback)), remove: keys => new Promise(callback => chrome.storage.local.remove(keys, callback)) }) }), tabs: Object.assign({}, chrome.tabs, { create: (createProperties) => new Promise(callback => chrome.tabs.create(createProperties, callback)) }), identity: Object.assign({}, chrome.identity, { 
                /** Check */
                launchWebAuthFlow: (params) => new Promise(callback => chrome.identity.launchWebAuthFlow(params, callback)) }), runtime: Object.assign({}, chrome.runtime, { 
                //sendMessage: (extensionId, message, options) => new Promise(callback => chrome.runtime.sendMessage(extensionId, message, options, callback))
                sendMessage: (extensionId, message, options) => chromeApiFix(callback => chrome.runtime.sendMessage(extensionId, message, options, callback)) }) });
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
class IdentitySignInStrategy {
    constructor() {
        this.browserApi = getTypedBrowserApi();
    }
    initLogIn(url, interactive) {
        return __awaiter(this, void 0, void 0, function* () {
            const redirectUrl = yield this.browserApi.identity.launchWebAuthFlow({ url, interactive });
            const responseParams = extractHashParametersFromUrl(redirectUrl);
            if (responseParams.error) {
                throw new Error('WebAuth error "' + responseParams.error + '": ' + responseParams.error_description);
            }
            else {
                // const state = await statePromise;
                // if (responseParams.state !== state) {
                //     throw new Error('WebAuth error "state_error": response state mismatch')
                // }
                // check state
                let expires_in = parseInt(responseParams.expires_in, 10);
                expires_in = isNaN(expires_in) ? 0 : expires_in;
                const tokenParams = Object.assign({}, responseParams, { expires_in, expires_at: Date.now() + expires_in * 1000 });
                return tokenParams;
            }
        });
    }
}
exports.IdentitySignInStrategy = IdentitySignInStrategy;
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
function extractHashParametersFromUrl(url) {
    const hash = url.split('#')[1];
    let data = {};
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
//# sourceMappingURL=background.js.map