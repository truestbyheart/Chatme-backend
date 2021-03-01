"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_status_1 = require("http-status");
var catchAsync = function (fn) { return function (req, res) {
    Promise.resolve(fn(req, res)).catch(function (err) {
        return res.json({
            status: http_status_1.INTERNAL_SERVER_ERROR,
            message: err.message,
        });
    });
}; };
exports.default = catchAsync;
