/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Server, Socket } from 'socket.io';
import apiWrapper from './helper/api.wrapper';
import catchAsync from './helper/asyncHandler';

// controllers
import authController from './modules/Auth/auth.controller';
import chatController from './modules/Chat/chat.controller';

// services and helper
import ChatService from './modules/Chat/chat.service';
import AuthHelper from './helper/auth.helper';
import { OK, UNAUTHORIZED } from 'http-status';
import { Request, Response } from './helper/api.wrapper';
import usersController from './modules/Users/users.controller';

const PORT = process.env.PORT || 3001;

const app = apiWrapper;
const router = app.Router();

// instances
const chatService = new ChatService();
const authHelper = new AuthHelper();

// SOCKETS
const httpServer = app.server();
const io = new Server(httpServer);

let externalSocket: Socket;
io.on('connection', (socket: Socket) => {
  console.log('connection established', socket.id);
  const chatID = socket.handshake.query.chatID;
  socket.join(chatID as string);

  socket.on('disconnect', (socket: Socket) => {
    console.log(`Disconnected from ${socket.id}`);
  });

  socket.on('join', (room) => {
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
  });

  socket.on('chat', (data) => {
    const { message, room } = data;
    console.log(`msg: ${message}, room: ${room}`);
    io.to(room).emit('chat', message);
  });

  externalSocket = socket;
});

// ROUTES
router.post('/auth/signup', catchAsync(authController.createAccount.bind(authController)));
router.post('/auth/login', catchAsync(authController.loginIntoAccount.bind(authController)));
router.get('/messages/:from', catchAsync(chatController.fetchMessages.bind(chatController)));
router.patch('/messages/:messageId', catchAsync(chatController.updateMessage.bind(chatController)));
router.delete('/messages/:messageId', catchAsync(chatController.deleteMessage.bind(chatController)));
router.get('/users', catchAsync(usersController.getUserList.bind(usersController)));

// message handler
router.post(
  '/messages/send-message',
  catchAsync(async (req: Request, res: Response) => {
    const {
      body,
      headers: { authorization },
    } = req;

    // verify token
    const isValidToken = authHelper.verifyToken(authorization as string);
    if (isValidToken) {
      // @ts-ignore
      const result = await chatService.storeMessage({ ...body, from: isValidToken?.username });

      if (result.length > 0) {
        if (externalSocket) {
          console.log('send it to ', body.to);
          io.emit(body.to, body.message);
          externalSocket.in(body.to).emit('chat', JSON.stringify(result[0]));
        }
        return res.json({
          status: OK,
          message: 'message sent',
          result,
        });
      }
    }

    // respond to unauthenticated clients
    return res.json({
      status: UNAUTHORIZED,
      message: 'Please login to perform action',
    });
  }),
);

// START SERVER
httpServer.listen(PORT, async () => console.log(`App running on port ${PORT}`));
