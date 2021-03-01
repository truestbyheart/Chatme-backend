"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var socket_io_1 = require("socket.io");
var api_wrapper_1 = __importDefault(require("./helper/api.wrapper"));
var asyncHandler_1 = __importDefault(require("./helper/asyncHandler"));
// controllers
var auth_controller_1 = __importDefault(require("./modules/Auth/auth.controller"));
var chat_controller_1 = __importDefault(require("./modules/Chat/chat.controller"));
// services and helper
var chat_service_1 = __importDefault(require("./modules/Chat/chat.service"));
var auth_helper_1 = __importDefault(require("./helper/auth.helper"));
var http_status_1 = require("http-status");
var users_controller_1 = __importDefault(require("./modules/Users/users.controller"));
var PORT = process.env.PORT || 3001;
var app = api_wrapper_1.default;
var router = app.Router();
// instances
var chatService = new chat_service_1.default();
var authHelper = new auth_helper_1.default();
// SOCKETS
var httpServer = app.server();
var io = new socket_io_1.Server(httpServer);
var externalSocket;
io.on('connection', function (socket) {
    console.log('connection established', socket.id);
    var chatID = socket.handshake.query.chatID;
    socket.join(chatID);
    socket.on('disconnect', function (socket) {
        console.log("Disconnected from " + socket.id);
    });
    socket.on('join', function (room) {
        console.log("Socket " + socket.id + " joining " + room);
        socket.join(room);
    });
    socket.on('chat', function (data) {
        var message = data.message, room = data.room;
        console.log("msg: " + message + ", room: " + room);
        io.to(room).emit('chat', message);
    });
    externalSocket = socket;
});
// ROUTES
router.post('/auth/signup', asyncHandler_1.default(auth_controller_1.default.createAccount.bind(auth_controller_1.default)));
router.post('/auth/login', asyncHandler_1.default(auth_controller_1.default.loginIntoAccount.bind(auth_controller_1.default)));
router.get('/messages/:from', asyncHandler_1.default(chat_controller_1.default.fetchMessages.bind(chat_controller_1.default)));
router.patch('/messages/:messageId', asyncHandler_1.default(chat_controller_1.default.updateMessage.bind(chat_controller_1.default)));
router.delete('/messages/:messageId', asyncHandler_1.default(chat_controller_1.default.deleteMessage.bind(chat_controller_1.default)));
router.get('/users', asyncHandler_1.default(users_controller_1.default.getUserList.bind(users_controller_1.default)));
// message handler
router.post('/messages/send-message', asyncHandler_1.default(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var body, authorization, isValidToken, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = req.body, authorization = req.headers.authorization;
                isValidToken = authHelper.verifyToken(authorization);
                if (!isValidToken) return [3 /*break*/, 2];
                return [4 /*yield*/, chatService.storeMessage(__assign(__assign({}, body), { from: isValidToken === null || isValidToken === void 0 ? void 0 : isValidToken.username }))];
            case 1:
                result = _a.sent();
                if (result.length > 0) {
                    if (externalSocket) {
                        console.log('send it to ', body.to);
                        io.emit(body.to, body.message);
                        externalSocket.in(body.to).emit('chat', JSON.stringify(result[0]));
                    }
                    return [2 /*return*/, res.json({
                            status: http_status_1.OK,
                            message: 'message sent',
                            result: result,
                        })];
                }
                _a.label = 2;
            case 2: 
            // respond to unauthenticated clients
            return [2 /*return*/, res.json({
                    status: http_status_1.UNAUTHORIZED,
                    message: 'Please login to perform action',
                })];
        }
    });
}); }));
// START SERVER
httpServer.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, console.log("App running on port " + PORT)];
}); }); });
