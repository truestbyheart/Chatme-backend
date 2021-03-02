import client from '../../database';

class UserService {
  async getUsers(offset: number, limit: number) {
    const getUsersSql = 'SELECT id, username FROM users LIMIT ' + limit + ' OFFSET ' + offset;
    return (await client.query(getUsersSql)).rows;
  }
}

export default UserService;
