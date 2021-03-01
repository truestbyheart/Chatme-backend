import UserService from './user.service';
import { Request, Response } from '../../helper/api.wrapper';
import { OK } from 'http-status';

class UserController {
  private _userService: UserService;

  constructor() {
    this._userService = new UserService();
  }

  async getUserList(req: Request, res: Response) {
    const {
      query: { offset = 0, limit = 25 },
    } = req;

    const users = await this._userService.getUsers(offset, limit);

    return res.json({
      status: OK,
      users,
    });
  }
}

export default new UserController();
