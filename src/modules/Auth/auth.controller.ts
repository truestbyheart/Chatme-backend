// src/modules/Auth/auth.controller.ts
import status from 'http-status';
import { Request, Response } from '../../helper/api.wrapper';
import AuthService, { IUser } from './auth.service';
import AuthHelper, { TokenPayload } from '../../helper/auth.helper';

const { OK, UNAUTHORIZED, BAD_REQUEST, NOT_FOUND } = status;

class AuthController {
  private _authService: AuthService;
  private _authHelper: AuthHelper;

  constructor() {
    this._authService = new AuthService();
    this._authHelper = new AuthHelper();
  }

  /**
   * Create a new user account
   */
  async createAccount(req: Request, res: Response) {
    try {
      const { body } = req;

      // Validate required fields
      if (!body.username || !body.password || !body.email) {
        return res.status(BAD_REQUEST).json({
          status: BAD_REQUEST,
          message: 'Username, password, and email are required',
        });
      }

      // Check if username or email already exists
      const existingCheck = await this._authService.checkIfCredsExist(
        { username: body.username, email: body.email },
        res,
      );

      // If checkIfCredsExist returned a response, it found a conflict
      if (existingCheck) return existingCheck;

      // Create user account
      const userData: IUser = {
        username: body.username,
        password: body.password,
        email: body.email,
        fullName: body.fullName,
        profilePic: body.profilePic,
      };

      const result = await this._authService.createUserAccount(userData);

      if (result.rowCount === 1) {
        const payload: TokenPayload = {
          user_id: result.rows[0].id,
          username: result.rows[0].username,
          email: result.rows[0].email,
        };

        const token = this._authHelper.createToken(payload);

        return res.json({
          status: OK,
          message: 'Account created successfully',
          user: {
            id: result.rows[0].id,
            username: result.rows[0].username,
            email: result.rows[0].email,
            fullName: result.rows[0].full_name,
            profilePic: result.rows[0].profile_pic,
          },
          token,
        });
      } else {
        return res.status(BAD_REQUEST).json({
          status: BAD_REQUEST,
          message: 'Failed to create account',
        });
      }
    } catch (error) {
      console.error('Create account error:', error);
      return res.status(BAD_REQUEST).json({
        status: BAD_REQUEST,
        message: 'Error creating account',
      });
    }
  }

  /**
   * Login to an existing account
   */
  async loginIntoAccount(req: Request, res: Response) {
    try {
      const { body } = req;

      // Validate required fields
      if (!body.username || !body.password) {
        return res.status(BAD_REQUEST).json({
          status: BAD_REQUEST,
          message: 'Username and password are required',
        });
      }

      const user = await this._authService.validateAuthDetails(body);

      if (!user) {
        return res.status(UNAUTHORIZED).json({
          status: UNAUTHORIZED,
          message: 'Invalid username or password',
        });
      }

      const payload: TokenPayload = {
        user_id: user.id,
        email: user.email,
        username: user.username,
      };

      const token = this._authHelper.createToken(payload);

      return res.json({
        status: OK,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          profilePic: user.profile_pic,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(BAD_REQUEST).json({
        status: BAD_REQUEST,
        message: 'Error during login',
      });
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      const { user } = req;

      // Get user data
      const current_user = await this._authService.getUserByUsername(user.username);

      if (!current_user) {
        return res.status(NOT_FOUND).json({
          status: NOT_FOUND,
          message: 'User not found',
        });
      }

      return res.json({
        status: OK,
        user: {
          id: current_user.id,
          username: current_user.username,
          email: current_user.email,
          fullName: current_user.full_name,
          profilePic: current_user.profile_pic,
          status: current_user.status,
          lastActive: current_user.last_active,
          createdAt: current_user.created_at,
        },
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(BAD_REQUEST).json({
        status: BAD_REQUEST,
        message: 'Error fetching user data',
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const {
        body,
        user
      } = req;

      // Update profile
      const updatedUser = await this._authService.updateUserProfile(user.username, {
        fullName: body.fullName,
        profilePic: body.profilePic,
        email: body.email,
      });

      if (!updatedUser) {
        return res.status(NOT_FOUND).json({
          status: NOT_FOUND,
          message: 'User not found',
        });
      }

      return res.json({
        status: OK,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          fullName: updatedUser.full_name,
          profilePic: updatedUser.profile_pic,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(BAD_REQUEST).json({
        status: BAD_REQUEST,
        message: 'Error updating profile',
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response) {
    try {
      const {
        body: { currentPassword, newPassword },
        user,
      } = req;

      // Validate inputs
      if (!currentPassword || !newPassword) {
        return res.status(BAD_REQUEST).json({
          status: BAD_REQUEST,
          message: 'Current password and new password are required',
        });
      }

      // Change password
      const result = await this._authService.changePassword(user.username, currentPassword, newPassword);

      if (!result.success) {
        return res.status(BAD_REQUEST).json({
          status: BAD_REQUEST,
          message: result.message,
        });
      }

      return res.json({
        status: OK,
        message: result.message,
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(BAD_REQUEST).json({
        status: BAD_REQUEST,
        message: 'Error changing password',
      });
    }
  }

  /**
   * Update user status
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const {
        body: { status },
        user
      } = req;

      // Validate inputs
      if (!status) {
        return res.status(BAD_REQUEST).json({
          status: BAD_REQUEST,
          message: 'Status is required',
        });
      }

      // Update status
      const result = await this._authService.setUserStatus(user.username, status);

      if (!result.success) {
        return res.status(BAD_REQUEST).json({
          status: BAD_REQUEST,
          message: result.message,
        });
      }

      return res.json({
        status: OK,
        message: result.message,
        user: result.user,
      });
    } catch (error) {
      console.error('Update status error:', error);
      return res.status(BAD_REQUEST).json({
        status: BAD_REQUEST,
        message: 'Error updating status',
      });
    }
  }

  /**
   * Search users
   */
  async searchUsers(req: Request, res: Response) {
    try {
      const {
        query: { q, limit = '10' },
      } = req;

      // Validate search query
      if (!q) {
        return res.status(BAD_REQUEST).json({
          status: BAD_REQUEST,
          message: 'Search query is required',
        });
      }

      // Search users
      const users = await this._authService.searchUsers(q as string, parseInt(limit as string, 10));

      return res.json({
        status: OK,
        users,
      });
    } catch (error) {
      console.error('Search users error:', error);
      return res.status(BAD_REQUEST).json({
        status: BAD_REQUEST,
        message: 'Error searching users',
      });
    }
  }
}

export default new AuthController();
