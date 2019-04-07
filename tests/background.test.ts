import { IdentitySignInStrategy } from '../src/background'

describe('IdentitySignInStrategy', function () {
    it('creates', function () {
        let strategy = new IdentitySignInStrategy();
        expect(strategy).toBeTruthy();
    });
});