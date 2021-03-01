"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/ban-ts-comment */
var http_1 = require("http");
var route_parser_1 = __importDefault(require("route-parser"));
var qs_1 = __importDefault(require("qs"));
var APIWrapper = /** @class */ (function () {
    /**
     * @constructor
     * @description initialize the route array
     */
    function APIWrapper() {
        this.routes = [];
    }
    /**
     * add route to the route array list
     * @param method
     * @param url
     * @param handler
     */
    APIWrapper.prototype.addToRoute = function (method, url, handler) {
        this.routes.push({ method: method, url: new route_parser_1.default(url), handler: handler });
    };
    /**
     * check if the url is in the route list array
     * @param method HTTP method
     * @param url
     */
    APIWrapper.prototype.findRoute = function (method, url) {
        var route = this.routes.find(function (r) { return r.method === method && r.url.match(url); });
        if (!route)
            return null;
        return { handler: route.handler, params: route.url.match(url), query: qs_1.default.parse(url.split('?')[1]) };
    };
    /**
     * server instance and routing logic
     */
    APIWrapper.prototype.server = function () {
        var _this = this;
        return http_1.createServer(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var method, url, found;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        method = req.method;
                        url = req.url;
                        found = this.findRoute(method, url);
                        // setting up cors
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                        res.setHeader('Access-Control-Max-Age', 2592000);
                        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                        res.setHeader('Access-Control-Allow-Credentials', 'true');
                        if (req.method === 'OPTIONS') {
                            res.writeHead(204);
                            res.end();
                            return [2 /*return*/];
                        }
                        if (!found) return [3 /*break*/, 2];
                        // @ts-ignore
                        req.params = found.params;
                        // @ts-ignore
                        req.query = found.query;
                        // body-parser
                        return [4 /*yield*/, new Promise(function (resolve, _reject) {
                                var data = '';
                                req.on('data', function (chunk) {
                                    data += chunk.toString();
                                });
                                req.on('end', function () {
                                    // @ts-ignore
                                    req.body = data ? JSON.parse(data) : null;
                                    resolve(true);
                                });
                            })];
                    case 1:
                        // body-parser
                        _a.sent();
                        // @ts-ignore
                        res.send = function (content) {
                            res.setHeader('content-type', 'text/plain');
                            res.write(content);
                            return res.end();
                        };
                        // @ts-ignore
                        res.json = function (content) {
                            res.setHeader('content-type', 'application/json');
                            // res.statusCode = content.status | 200;
                            res.writeHead(content.status || 200);
                            res.write(JSON.stringify(content));
                            return res.end();
                        };
                        return [2 /*return*/, found.handler(req, res)];
                    case 2:
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Route not found.');
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Start the server on the particular port
     * @param port port to run the app
     * @param cb the calstringl back function
     */
    APIWrapper.prototype.listen = function (port, cb) {
        this.server().listen(port, cb);
    };
    APIWrapper.prototype.Router = function () {
        var _this = this;
        // GET request handler
        var get = function (url, handler) {
            return _this.addToRoute('GET', url, handler);
        };
        // POST request handler
        var post = function (url, handler) {
            return _this.addToRoute('POST', url, handler);
        };
        // PUT request handler
        var put = function (url, handler) {
            return _this.addToRoute('PUT', url, handler);
        };
        // PATCH request handler
        var patch = function (url, handler) {
            return _this.addToRoute('PATCH', url, handler);
        };
        // DELETE request handler
        var del = function (url, handler) {
            return _this.addToRoute('DELETE', url, handler);
        };
        return { get: get, post: post, patch: patch, put: put, delete: del };
    };
    return APIWrapper;
}());
exports.default = new APIWrapper();
