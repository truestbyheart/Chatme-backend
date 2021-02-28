import { Server, Socket } from "socket.io";
import apiWrapper from './helper/api.wrapper';
import catchAsync from './helper/asyncHandler';

// controllers 
import authController from './modules/Auth/auth.controller';
import chatController from './modules/Chat/chat.controller';

const PORT = process.env.PORT || 3001;

const app = apiWrapper;
const router = app.Router();

// SOCKETS
const io = new Server(app.server());
io.on('connection', (socket: Socket) => {
    console.log('connection established', socket.id);
    io.emit('From Api', 'Daniel');
});

// ROUTES
router.post('/auth/signup', catchAsync(authController.createAccount.bind(authController)));
router.post('/auth/login', catchAsync(authController.loginIntoAccount.bind(authController)));
router.get('/messages/:from', catchAsync(chatController.fetchMessages.bind(chatController)));
router.patch('/messages/:messageId', catchAsync(chatController.updateMessage.bind(chatController)));
router.delete('/messages/:messageId', catchAsync(chatController.deleteMessage.bind(chatController)));

// START SERVER
app.listen(PORT, async () => console.log(`App running on port ${PORT}`));
