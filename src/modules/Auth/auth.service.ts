import { CONFLICT } from 'http-status';
import client from '../../database';
import { hashSync, compareSync } from 'bcrypt';
import { Response } from '../../helper/api.wrapper';

export interface IUser {
    username: string,
    password: string,
    email: string
}

const commonQueries = {
    checkUsernameSql: 'SELECT * FROM users WHERE username = $1',
    checkEmailSql: 'SELECT email FROM users WHERE email = $1'
}

class AuthService {
    async createUserAccount(data: IUser) {
        try {
            const sql = `INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *`;
            const hashedPassword = hashSync(data.password, 12);
            await client.query('BEGIN');
            const res = await client.query(sql, [data.username, hashedPassword, data.email]);
            await client.query('COMMIT');
            return res;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error('failed to create account');
        }
    }

    async checkIfCredsExist(data: { username: string, email: string }, response: Response) {
        let creds: { username: string, email: string } = { username: '', email: '' };

        // check if username and email exists
        const usernameExists = await client.query(commonQueries.checkUsernameSql, [data.username]);
        const emailExists = await client.query(commonQueries.checkEmailSql, [data.email]);

        // add the duplicate fild to creds object
        if (usernameExists.rows.length > 0) creds.username = usernameExists.rows[0].username;
        if (emailExists.rows.length > 0) creds.email = emailExists.rows[0].email;

        if (usernameExists.rows.length > 0 || emailExists.rows.length > 0) {
            return response.json({
                status: CONFLICT,
                message: 'user creds already exists',
                properties: creds
            });
        }
    }

    async validateAuthDetails(data:{ username:string, password:string}) {
        const result = await client.query(commonQueries.checkUsernameSql, [data.username]);
        console.log(result.rows);
        if(result.rows.length > 0) {
            const isAMatch = compareSync(data.password, result.rows[0].password)
            if(isAMatch) return result.rows[0];
            return false;
        }
        return false;
    }
}

export default AuthService;
