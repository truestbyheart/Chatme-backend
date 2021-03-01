"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = require("jsonwebtoken");
var AuthHelper = /** @class */ (function () {
    function AuthHelper() {
    }
    AuthHelper.prototype.createToken = function (data) {
        return jsonwebtoken_1.sign(data, process.env.TOKEN_SECRET);
    };
    AuthHelper.prototype.verifyToken = function (token) {
        return jsonwebtoken_1.verify(token, process.env.TOKEN_SECRET);
    };
    return AuthHelper;
}());
exports.default = AuthHelper;
