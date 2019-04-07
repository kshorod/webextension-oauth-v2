import { IBrowserApi } from './types';

export class IdentitySignInStrategy {
    constructor(private browserApi: IBrowserApi) {
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

            this.browserApi.runtime.sendMessage("AUTH_SUCCESS");

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