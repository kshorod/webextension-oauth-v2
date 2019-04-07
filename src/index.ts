import { getTypedBrowserApi } from "./browser-api";
import { DefaultAuthEventEmitter, IdentitySignInStrategy, MSAADAuthProvider, OAuthService, WebExtensionAuthStorage } from "./core";

const browserApi = getTypedBrowserApi();
const strategy = new IdentitySignInStrategy(browserApi);
const provider = new MSAADAuthProvider({ baseUrl: "https://login.microsoftonline.com" });
const storage = new WebExtensionAuthStorage(browserApi);
const emitter = new DefaultAuthEventEmitter(browserApi);

const service = new OAuthService(strategy, provider, storage, emitter);

console.log(service);
