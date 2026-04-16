const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {

  it('should hit register route', async () => {
    const res = await request(app).post('/auth/register').send({
      name: "Test",
      email: `test${Date.now()}@example.com`,
      password: "123456"
    });

    expect(res.statusCode).toBeDefined();
  });

  it('should hit login route', async () => {
    const res = await request(app).post('/auth/login').send({
      email: "dummy@example.com",
      password: "123456"
    });

    expect(res.statusCode).toBeDefined();
  });

});
