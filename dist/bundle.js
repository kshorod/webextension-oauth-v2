/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/background.ts":
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\n;\r\nfunction chromeApiFix(func) {\r\n    return new Promise((resolve, reject) => {\r\n        func(result => {\r\n            if (typeof (chrome.runtime.lastError) !== 'undefined') {\r\n                reject(chrome.runtime.lastError);\r\n                return;\r\n            }\r\n            resolve(result);\r\n        });\r\n    });\r\n}\r\nfunction getTypedBrowserApi() {\r\n    if (typeof (browser) !== \"undefined\") {\r\n        return Object.assign({}, browser, { storage: Object.assign({}, browser.storage, { local: Object.assign({}, browser.storage.local, { getTyped(key) {\r\n                        return __awaiter(this, void 0, void 0, function* () {\r\n                            const data = yield browser.storage.local.get(key);\r\n                            return data[key];\r\n                        });\r\n                    } }) }) });\r\n    }\r\n    else if (typeof (chrome) !== \"undefined\") {\r\n        return Object.assign({}, chrome, { storage: Object.assign({}, chrome.storage, { local: Object.assign({}, chrome.storage.local, { \r\n                    // error handling is not implemented for those\r\n                    get: keys => new Promise(callback => chrome.storage.local.get(keys, callback)), getTyped(key) {\r\n                        return __awaiter(this, void 0, void 0, function* () {\r\n                            const data = yield chromeApiFix(callback => chrome.storage.local.get(key, callback));\r\n                            return data[key];\r\n                            //return new Promise(callback => chrome.storage.local.get(key, callback)).then(model => model[key]);\r\n                        });\r\n                    }, \r\n                    //set: model => new Promise(callback => chrome.storage.local.set(model, callback)),\r\n                    set: model => chromeApiFix(callback => chrome.storage.local.set(model, callback)), remove: keys => new Promise(callback => chrome.storage.local.remove(keys, callback)) }) }), tabs: Object.assign({}, chrome.tabs, { create: (createProperties) => new Promise(callback => chrome.tabs.create(createProperties, callback)) }), identity: Object.assign({}, chrome.identity, { \r\n                /** Check */\r\n                launchWebAuthFlow: (params) => new Promise(callback => chrome.identity.launchWebAuthFlow(params, callback)) }), runtime: Object.assign({}, chrome.runtime, { \r\n                //sendMessage: (extensionId, message, options) => new Promise(callback => chrome.runtime.sendMessage(extensionId, message, options, callback))\r\n                sendMessage: (extensionId, message, options) => chromeApiFix(callback => chrome.runtime.sendMessage(extensionId, message, options, callback)) }) });\r\n    }\r\n    throw new Error(\"unknown user agent\");\r\n}\r\n// function getBrowserApi() {\r\n//     if (window.browser) {\r\n//         return browser;\r\n//     } else if (window.chrome) {\r\n//         return {\r\n//             ...chrome,\r\n//             storage: {\r\n//                 ...chrome.storage,\r\n//                 local: {\r\n//                     ...chrome.storage.local,\r\n//                     // error handling is not implemented for those\r\n//                     get: keys => new Promise(callback => chrome.storage.local.get(keys, callback)),\r\n//                     set: model => new Promise(callback => chrome.storage.local.set(model, callback)),\r\n//                     remove: keys => new Promise(callback => chrome.storage.local.remove(keys, callback)),\r\n//                 }\r\n//             },\r\n//             tabs: {\r\n//                 ...chrome.tabs,\r\n//                 create: (createProperties) => new Promise(callback => chrome.tabs.create(createProperties, callback))\r\n//             },\r\n//             identity: {\r\n//                 ...chrome.identity,\r\n//                 /** Check */\r\n//                 launchWebAuthFlow: (params) => new Promise(callback => chrome.identity.launchWebAuthFlow(params, callback)),\r\n//             }\r\n//         };\r\n//     }\r\n//     throw new Error(\"unknown user agent\");\r\n// }\r\n// const browserApi = getBrowserApi();\r\nclass IdentitySignInStrategy {\r\n    constructor() {\r\n        this.browserApi = getTypedBrowserApi();\r\n    }\r\n    initLogIn(url, interactive) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            const redirectUrl = yield this.browserApi.identity.launchWebAuthFlow({ url, interactive });\r\n            const responseParams = extractHashParametersFromUrl(redirectUrl);\r\n            if (responseParams.error) {\r\n                throw new Error('WebAuth error \"' + responseParams.error + '\": ' + responseParams.error_description);\r\n            }\r\n            else {\r\n                // const state = await statePromise;\r\n                // if (responseParams.state !== state) {\r\n                //     throw new Error('WebAuth error \"state_error\": response state mismatch')\r\n                // }\r\n                // check state\r\n                let expires_in = parseInt(responseParams.expires_in, 10);\r\n                expires_in = isNaN(expires_in) ? 0 : expires_in;\r\n                const tokenParams = Object.assign({}, responseParams, { expires_in, expires_at: Date.now() + expires_in * 1000 });\r\n                return tokenParams;\r\n            }\r\n        });\r\n    }\r\n}\r\nexports.IdentitySignInStrategy = IdentitySignInStrategy;\r\nclass WebNavigationSignInStrategy {\r\n}\r\nclass LogInServerSignInStrategy {\r\n}\r\n// browserApi.runtime.onMessage.addListener(function (message, sender, callback) {\r\n//     switch (message.operation) {\r\n//         case 'login':\r\n//             return initLogIn(message.url);\r\n//         case 'refresh':\r\n//             return initSilentRefresh(message.url);\r\n//     }\r\n// });\r\n// function initLogIn(url) {\r\n//     const properties = {\r\n//         url,\r\n//         active: true,\r\n//     };\r\n//     browserApi.tabs.create(properties);\r\n// }\r\n// function initSilentRefresh(url) {\r\n//     const properties = {\r\n//         url,\r\n//         active: false,\r\n//     };\r\n//     browserApi.tabs.create(properties);\r\n// }\r\nfunction extractHashParametersFromUrl(url) {\r\n    const hash = url.split('#')[1];\r\n    let data = {};\r\n    hash.split('&').forEach((item) => {\r\n        let parts = item.split('=');\r\n        data[parts[0]] = parts[1];\r\n    });\r\n    return data;\r\n    // return hash.split('&').reduce((result, item) => {\r\n    //     let parts = item.split('=');\r\n    //     result[parts[0]] = parts[1];\r\n    //     return result;\r\n    // }, {});\r\n}\r\n// browserApi.webNavigation.onErrorOccurred.addListener(function (details) {\r\n//     const result = extractHashParametersFromUrl(details.url);\r\n//     if (result.error) {\r\n//         // we have an error\r\n//         const errorData = {\r\n//             error: result.error,\r\n//             description: result.error_description,\r\n//             state: result.state\r\n//         }\r\n//         // since we have no error handling, don't do anything\r\n//         return;\r\n//     }\r\n//     const data = {\r\n//         token: result['id_token'], // or access_token\r\n//         exp: new Date().toString(),\r\n//         state: result.state\r\n//     };\r\n//     browserApi.storage.local.set(data).then(function () {\r\n//         browserApi.runtime.sendMessage({ operation: 'loggedIn' });\r\n//         // use settimeout for debugging, or the tab will be closed almost instantly\r\n//         //setTimeout(function () {\r\n//         browserApi.tabs.remove(details.tabId);\r\n//         //}, 500);\r\n//     });\r\n// }, {\r\n//         url: [{\r\n//             hostEquals: 'random.not.existing.url.local.somewhere'\r\n//         }]\r\n//     });\r\n\n\n//# sourceURL=webpack:///./src/background.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst background_1 = __webpack_require__(/*! ./background */ \"./src/background.ts\");\r\nconsole.log('test');\r\nlet something = new background_1.IdentitySignInStrategy();\r\n\n\n//# sourceURL=webpack:///./src/index.ts?");

/***/ })

/******/ });