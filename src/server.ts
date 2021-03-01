import { Server, Socket } from "socket.io";
import apiWrapper from './helper/api.wrapper';
import catchAsync from './helper/asyncHandler';

// controllers 
import authController from './modules/Auth/auth.controller';
import chatController from './modules/Chat/chat.controller';

// services and helper
import ChatService from './modules/Chat/chat.service';
import AuthHelper from './helper/auth.helper'
import { OK, UNAUTHORIZED } from "http-status";
import { Request, Response } from './helper/api.wrapper';

const PORT = process.env.PORT || 3001;

const app = apiWrapper;
const router = app.Router();

// SOCKETS
const io = new Server(app.server());
io.on('connection', (socket: Socket) => {
    console.log('connection established', socket.id);
});

// ROUTES
router.post('/auth/signup', catchAsync(authController.createAccount.bind(authController)));
router.post('/auth/login', catchAsync(authController.loginIntoAccount.bind(authController)));
router.get('/messages/:from', catchAsync(chatController.fetchMessages.bind(chatController)));
router.patch('/messages/:messageId', catchAsync(chatController.updateMessage.bind(chatController)));
router.delete('/messages/:messageId', catchAsync(chatController.deleteMessage.bind(chatController)));


//message handler
router.post('/messages/send-message', catchAsync(async (req: Request, res: Response) => {
    const { body, headers: { authorization } } = req;

    // instances
    const chatService = new ChatService();
    const authHelper = new AuthHelper();
    
    // verify token 
    const isValidToken = authHelper.verifyToken(authorization as string);
    if (isValidToken) {
        // @ts-ignore
        const result = await chatService.storeMessage({ ...body, from: isValidToken?.username });

        if (result.length > 0) {
            io.on('connect', () => {
                io.emit(body.to, result);
            });

            return res.json({
                status: OK,
                message: 'message sent',
                result,
            })
        }
    }

    // respond to unauthenticated clients
    return res.json({
        status: UNAUTHORIZED,
        message: 'Please login to perform action',
    })
}))

// START SERVER
app.listen(PORT, async () => console.log(`App running on port ${PORT}`));
