import { IBrowserApi } from "./types";

export interface IAuthFlowResult {
    response: any;
}

export interface IOAuthResult {
    accessToken: string;
    idToken: string;
    expiration: Date;
    success: boolean;
    error: string | undefined;
    state: number;
}

export interface IAuthStorage {
    storeToken(response: IOAuthResult): Promise<void>;

}

export class WebExtensionAuthStorage implements IAuthStorage {
    constructor(private browserApi: IBrowserApi) {
    }

    public async storeToken(response: any): Promise<void> {
        await this.browserApi.storage.local.set({ token: response });
    }

}

export interface IAuthEventEmitter {
    logInSuccess(): Promise<void>;
}

// tslint:disable-next-line: max-classes-per-file
export class DefaultAuthEventEmitter implements IAuthEventEmitter {
    constructor(private browserApi: IBrowserApi) {
    }
    public async logInSuccess(): Promise<void> {
        await this.browserApi.runtime.sendMessage("AUTH_SUCCESS");
    }

}

export interface IAuthProvider {
    createRegularLogInUrl(redirectUrl: string, state: number): string;
    createSilentLogInUrl(redirectUrl: string, state: number): string;
    translateResult(result: IAuthFlowResult): IOAuthResult;
}

// tslint:disable-next-line: max-classes-per-file
export class MSAADAuthProvider implements IAuthProvider {

    constructor(private options: { baseUrl: string }) { }

    public translateResult(result: IAuthFlowResult): IOAuthResult {
        return {
            ...result.response,
        };
    }
    public createRegularLogInUrl(redirectUrl: string, state: number): string {
        throw new Error("Method not implemented.");
    }
    public createSilentLogInUrl(redirectUrl: string, state: number): string {
        const { baseUrl } = this.options;
        return `${baseUrl}?redirectUrl=${redirectUrl}&state=${state}&prompt=none`;
    }


}

export interface ISignInStrategy {
    launchSilentAuthFlow(url: string): Promise<IAuthFlowResult>;
    launchVisibleAuthFlow(): Promise<IAuthFlowResult>;
    getRedirectUrl(): string;
}

// tslint:disable-next-line: max-classes-per-file
export class IdentitySignInStrategy implements ISignInStrategy {

    constructor(private browserApi: IBrowserApi) {
    }

    public async launchSilentAuthFlow(url: string): Promise<IAuthFlowResult> {
        const redirectUrl = await this.browserApi.identity.launchWebAuthFlow({ url, interactive: false });
        const responseParams = extractHashParametersFromUrl(redirectUrl);
        return { response: responseParams };
    }
    public launchVisibleAuthFlow(): Promise<IAuthFlowResult> {
        throw new Error("Method not implemented.");
    }
    public getRedirectUrl(): string {
        return this.browserApi.identity.getRedirectUrl();
    }
}

class WebNavigationSignInStrategy {

}

class LogInServerSignInStrategy {

}

// tslint:disable-next-line: max-classes-per-file
export class OAuthService {
    constructor(private strategy: ISignInStrategy, private provider: IAuthProvider, private storage: IAuthStorage, private emitter: IAuthEventEmitter) {
    }

    public async LogInIntelligent() {
        const state = this.random();
        const url = this.provider.createSilentLogInUrl(this.strategy.getRedirectUrl(), state);
        const silentFlowResult = await this.strategy.launchSilentAuthFlow(url);
        const silentResult = this.provider.translateResult(silentFlowResult);
        if (!silentResult.success) {
            // fallback
            return this.LogIn();
        }
        if (silentResult.state !== state) {
            throw new Error("State mismatch");
        }

        await this.storage.storeToken(silentResult);
        await this.emitter.logInSuccess();
    }

    public async LogIn() {
        const regularResult = await this.strategy.launchVisibleAuthFlow();
    }

    private random(): number {
        return Math.floor((Math.random() * 900000) + 100000);
    }
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
    const hash = url.split("#")[1];
    const data: { [key: string]: any } = {};
    hash.split("&").forEach((item) => {
        const parts = item.split("=");
        data[parts[0]] = parts[1];
    });
    return data;
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