/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CONFLICT, OK, UNAUTHORIZED } from 'http-status';
import { Request, Response } from '../../helper/api.wrapper';
import AuthHelper from '../../helper/auth.helper';
import ChatService from './chat.service';

class ChatController {
  private _chatService: ChatService;
  private _authHelper: AuthHelper;

  constructor() {
    this._chatService = new ChatService();
    this._authHelper = new AuthHelper();
  }

  async fetchMessages(req: Request, res: Response) {
    const {
      params: { from },
      headers: { authorization },
    } = req;
    // verify token
    const isValidToken = this._authHelper.verifyToken(authorization as string);
    if (isValidToken) {
      // @ts-ignore
      const result = await this._chatService.getMessages(from, isValidToken.username as string);

      return res.json({
        status: OK,
        result,
      });
    }

    return res.json({
      status: UNAUTHORIZED,
      message: 'Please login to perform action',
    });
  }

  async updateMessage(req: Request, res: Response) {
    const {
      params: { messageId },
      body: { message },
      headers: { authorization },
    } = req;

    // verify token
    const isValidToken = this._authHelper.verifyToken(authorization as string);
    if (isValidToken) {
      // @ts-ignore
      const result = await this._chatService.updateMessage(messageId, message);
      if (result === 1) {
        return res.json({
          status: OK,
          message: 'message updated successfully',
        });
      } else {
        return res.json({
          status: CONFLICT,
          message: "message doesn't exist",
        });
      }
    }

    // respond to unauthenticated clients
    return res.json({
      status: UNAUTHORIZED,
      message: 'Please login to perform action',
    });
  }

  async deleteMessage(req: Request, res: Response) {
    const {
      params: { messageId },
      headers: { authorization },
    } = req;

    // verify token
    const isValidToken = this._authHelper.verifyToken(authorization as string);
    if (isValidToken) {
      // @ts-ignore
      const result = await this._chatService.deleteMessage(messageId);
      if (result === 1) {
        return res.json({
          status: OK,
          message: 'message deleted successfully',
        });
      } else {
        return res.json({
          status: CONFLICT,
          message: "message doesn't exist",
        });
      }
    }

    // respond to unauthenticated clients
    return res.json({
      status: UNAUTHORIZED,
      message: 'Please login to perform action',
    });
  }
}

export default new ChatController();
