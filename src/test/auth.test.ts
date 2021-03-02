import httpServer from '../server';
import request from 'supertest';

let server: any;
beforeEach(() => {
  server = httpServer.listen(3003);
});

afterEach(() => {
  server.close();
});
describe('Auth', () => {
  describe('POST /auth/signup', () => {
    it('should create a new account', async () => {
      const res = await request(httpServer).post('/auth/signup').send({ username: '', password: '', email: '' });
      console.log(res);
    });
  });
});
