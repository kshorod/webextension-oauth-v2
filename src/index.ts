import { IdentitySignInStrategy } from './core';
import { getTypedBrowserApi } from './browser-api';

const strategy = new IdentitySignInStrategy(getTypedBrowserApi());

console.log(strategy);
