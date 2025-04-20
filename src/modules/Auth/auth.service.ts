// src/modules/Auth/auth.service.ts
import status from 'http-status';
import client from '../../database';
import { hashSync, compareSync } from 'bcrypt';
import { Response } from '../../helper/api.wrapper';

export interface IUser {
  username: string;
  password: string;
  email: string;
  fullName?: string;
  profilePic?: string;
}

const commonQueries = {
  checkUsernameSql: 'SELECT * FROM users WHERE username = $1',
  checkEmailSql: 'SELECT email FROM users WHERE email = $1',
};

const { CONFLICT } = status;

class AuthService {
  /**
   * Create a new user account
   */
  async createUserAccount(data: IUser) {
    try {
      const sql = `
        INSERT INTO users (
          username,
          password,
          email,
          full_name,
          profile_pic,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'offline', NOW(), NOW())
        RETURNING *
      `;

      const hashedPassword = hashSync(data.password, 12);

      await client.query('BEGIN');

      const res = await client.query(sql, [
        data.username,
        hashedPassword,
        data.email,
        data.fullName || null,
        data.profilePic || null,
      ]);

      await client.query('COMMIT');
      return res;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to create account:', error);
      throw new Error('Failed to create account');
    }
  }

  /**
   * Check if username or email already exists
   */
  async checkIfCredsExist(data: { username: string; email: string }, response: Response) {
    try {
      // Check if username exists
      const usernameExists = await client.query(commonQueries.checkUsernameSql, [data.username]);

      if (usernameExists.rows.length > 0) {
        return response.json({
          status: CONFLICT,
          message: 'Username already exists',
        });
      }

      // Check if email exists
      const emailExists = await client.query(commonQueries.checkEmailSql, [data.email]);

      if (emailExists.rows.length > 0) {
        return response.json({
          status: CONFLICT,
          message: 'Email already exists',
        });
      }

      // Neither exists, return nothing
      return null;
    } catch (error) {
      console.error('Error checking credentials:', error);
      throw error;
    }
  }

  /**
   * Validate login credentials
   */
  async validateAuthDetails(data: { username: string; password: string }) {
    try {
      const result = await client.query(commonQueries.checkUsernameSql, [data.username]);

      if (result.rows.length === 0) {
        return false;
      }

      const user = result.rows[0];
      const isPasswordValid = compareSync(data.password, user.password);

      if (!isPasswordValid) {
        return false;
      }

      // Update last login timestamp and status
      await this.updateLoginStatus(data.username);

      return user;
    } catch (error) {
      console.error('Error validating auth details:', error);
      throw error;
    }
  }

  /**
   * Update user's status to online and last login time
   */
  async updateLoginStatus(username: string) {
    const updateLoginSql = `
      UPDATE users
      SET
        status = 'online',
        last_login = NOW(),
        last_active = NOW()
      WHERE username = $1
    `;

    try {
      await client.query(updateLoginSql, [username]);
    } catch (error) {
      console.error('Error updating login status:', error);
      // Don't throw here, as login should still succeed
    }
  }

  /**
   * Update user's profile information
   */
  async updateUserProfile(
    username: string,
    data: {
      fullName?: string;
      profilePic?: string;
      email?: string;
    },
  ) {
    const updateProfileSql = `
      UPDATE users
      SET
        full_name = COALESCE($1, full_name),
        profile_pic = COALESCE($2, profile_pic),
        email = COALESCE($3, email),
        updated_at = NOW()
      WHERE username = $4
      RETURNING *
    `;

    try {
      const result = await client.query(updateProfileSql, [
        data.fullName || null,
        data.profilePic || null,
        data.email || null,
        username,
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Change user's password
   */
  async changePassword(username: string, currentPassword: string, newPassword: string) {
    try {
      // First verify current password
      const user = await client.query(commonQueries.checkUsernameSql, [username]);

      if (user.rows.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const isPasswordValid = compareSync(currentPassword, user.rows[0].password);

      if (!isPasswordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedPassword = hashSync(newPassword, 12);

      // Update password
      const updatePasswordSql = `
        UPDATE users
        SET
          password = $1,
          updated_at = NOW()
        WHERE username = $2
      `;

      await client.query(updatePasswordSql, [hashedPassword, username]);

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Set user status (online, offline, away, busy)
   */
  async setUserStatus(username: string, status: string) {
    const validStatuses = ['online', 'offline', 'away', 'busy'];

    if (!validStatuses.includes(status)) {
      return { success: false, message: 'Invalid status' };
    }

    const updateStatusSql = `
      UPDATE users
      SET
        status = $1,
        last_active = NOW()
      WHERE username = $2
      RETURNING username, status
    `;

    try {
      const result = await client.query(updateStatusSql, [status, username]);

      if (result.rows.length === 0) {
        return { success: false, message: 'User not found' };
      }

      return {
        success: true,
        message: 'Status updated successfully',
        user: result.rows[0],
      };
    } catch (error) {
      console.error('Error setting user status:', error);
      throw error;
    }
  }

  /**
   * Get user by username with profile info
   */
  async getUserByUsername(username: string) {
    const getUserSql = `
      SELECT
        id,
        username,
        email,
        email_verified,
        profile_pic,
        full_name,
        status,
        last_active,
        created_at
      FROM users
      WHERE username = $1
    `;

    try {
      const result = await client.query(getUserSql, [username]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  /**
   * Search users by username or full name
   */
  async searchUsers(searchTerm: string, limit = 10) {
    const searchUsersSql = `
      SELECT
        id,
        username,
        full_name,
        profile_pic,
        status
      FROM users
      WHERE
        username ILIKE $1 OR
        full_name ILIKE $1
      LIMIT $2
    `;

    try {
      const result = await client.query(searchUsersSql, [`%${searchTerm}%`, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Verify user's email
   */
  async verifyEmail(username: string) {
    const verifyEmailSql = `
      UPDATE users
      SET
        email_verified = TRUE,
        updated_at = NOW()
      WHERE username = $1
      RETURNING username, email, email_verified
    `;

    try {
      const result = await client.query(verifyEmailSql, [username]);

      if (result.rows.length === 0) {
        return { success: false, message: 'User not found' };
      }

      return {
        success: true,
        message: 'Email verified successfully',
        user: result.rows[0],
      };
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }
}

export default AuthService;
