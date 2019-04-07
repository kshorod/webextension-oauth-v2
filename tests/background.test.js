"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const background_1 = require("../src/background");
describe('calculate', function () {
    it('creates', function () {
        let strategy = new background_1.IdentitySignInStrategy();
        expect(strategy).toBeTruthy();
    });
});
//# sourceMappingURL=background.test.js.map