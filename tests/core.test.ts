import { expect } from 'chai';
import { IdentitySignInStrategy } from '../src/core'
import { IBrowserApi, IBrowserApiIdentity, IBrowserApiRuntime, IBrowserApiStorage, IBrowserApiTabs, ILaunchWebAuthFlowDetails } from '../src/types';

class FakeBrowserApi implements IBrowserApi {
    constructor(public storage: IBrowserApiStorage,
        public tabs: IBrowserApiTabs,
        public identity: IBrowserApiIdentity,
        public runtime: IBrowserApiRuntime) {

    }
}

// tslint:disable-next-line: max-classes-per-file
class FakeBrowserApiIdentity implements IBrowserApiIdentity {
    private redirectUrl: string;
    constructor(private succeeds: boolean) {
        this.redirectUrl = 'https://fools-errand.not.existing.website.local';
    }
    public getRedirectUrl() {
        return this.redirectUrl;
    }
    public launchWebAuthFlow(details: ILaunchWebAuthFlowDetails): Promise<string> {
        if (this.succeeds) {
            return new Promise((resolve, reject) => setTimeout(() => {
                resolve(`${this.redirectUrl}#access_token=access_token_value`);
            }, 10));
        } else {
            return new Promise((resolve, reject) => setTimeout(() => {
                resolve(`${this.redirectUrl}#error=error_value`);
            }, 10));
        }

    }
}

// tslint:disable-next-line: max-classes-per-file
class FakeBrowserRuntime implements IBrowserApiRuntime {

    private lastEventFired: any;

    constructor(private messageCallback?: (message: object) => void) {

    }
    public async sendMessage(message: any): Promise<object | void> {
        if (typeof (this.messageCallback) !== 'undefined') {
            this.messageCallback(message);
        }

    }

    public getLastEvent() {
        return this.lastEventFired;
    }
}

function createBrowserApi() {
    return new FakeBrowserApi(
        undefined as unknown as IBrowserApiStorage,
        undefined as unknown as IBrowserApiTabs,
        new FakeBrowserApiIdentity(true),
        new FakeBrowserRuntime(),
    );
}

function createErrorBrowserApi() {
    return new FakeBrowserApi(
        undefined as unknown as IBrowserApiStorage,
        undefined as unknown as IBrowserApiTabs,
        new FakeBrowserApiIdentity(false),
        new FakeBrowserRuntime(),
    );
}

function browserApi(options: { failAuth: boolean, messageCallback: (message: object) => void }) {
    return new FakeBrowserApi(
        undefined as unknown as IBrowserApiStorage,
        undefined as unknown as IBrowserApiTabs,
        new FakeBrowserApiIdentity(!options.failAuth),
        new FakeBrowserRuntime(options.messageCallback),
    );
}

describe('IdentitySignInStrategy', () => {
    it('creates', function () {
        let strategy = new IdentitySignInStrategy(createBrowserApi());
        expect(strategy).to.be.ok;
    });

    it('returnsDataOnSuccess', async () => {
        let strategy = new IdentitySignInStrategy(createBrowserApi());
        let result = await strategy.launchSilentAuthFlow('https://fake.log.in');
        expect(result.response).to.be.ok;
        expect(result.response.access_token).to.be.equal('access_token_value');
    });

    it('returnsErrorOnFailure', async () => {
        let strategy = new IdentitySignInStrategy(createErrorBrowserApi());
        let result = await strategy.launchSilentAuthFlow('https://fake.log.in');
        expect(result).to.be.ok;
        expect(result.response.error).to.be.equal('error_value');
    });

    it('eventFiredOnSuccess', async () => {
        let response: Object;
        const callback = (message: object) => {
            response = message;
        };
        let strategy = new IdentitySignInStrategy(browserApi({ failAuth: false, messageCallback: callback }));
        let result = await strategy.launchSilentAuthFlow('https://fake.log.in');

        return new Promise(resolve => setTimeout(() => {
            expect(response).to.be.ok;
            resolve();
        }, 50));
    });
});

