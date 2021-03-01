import { OK, UNAUTHORIZED } from 'http-status';
import { Request, Response } from '../../helper/api.wrapper';
import AuthService from './auth.service';
import AuthHelper, { TokenPayload } from '../../helper/auth.helper';

class AuthController {
    private _authService: AuthService;
    private _authHelper: AuthHelper;

    constructor() {
        this._authService = new AuthService();
        this._authHelper = new AuthHelper();
    }

    async createAccount(req: Request, res: Response) {
        const { body } = req;
        // check if creds exist
        await this._authService.checkIfCredsExist({ username: body.username, email: body.email }, res);

        const result = await this._authService.createUserAccount(body);

        if (result.rowCount === 1) {
            const payload: TokenPayload = {
                user_id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email
            }
            const token = this._authHelper.createToken(payload);
            return res.json({
                status: OK,
                username: result.rows[0].username,
                token,
            });
        }
    }

    async loginIntoAccount(req: Request, res: Response) {
        const { body } = req;

        const result = await this._authService.validateAuthDetails(body);
        if (!result) {
            return res.json({
                status: UNAUTHORIZED,
                message: 'username/password is incorrect'
            })
        }

        const payload: TokenPayload = {
            user_id: result.id,
            email: result.email,
            username: result.username,
        }
        const token = this._authHelper.createToken(payload);
        return res.json({
            status: OK,
            username: result.username,
            token
        })
    }
}

export default new AuthController();
