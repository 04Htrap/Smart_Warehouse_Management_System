const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

describe('Auth API', () => {

  it('should register a user', async () => {
    const email = `test${Date.now()}@example.com`;

    const res = await request(app).post('/auth/register').send({
      name: "Test User",
      email,
      password: "123456"
    });

    expect(res.statusCode).toBe(201);
  });

  it('should login user', async () => {
    const email = `test${Date.now()}@example.com`;

    await request(app).post('/auth/register').send({
      name: "Test User",
      email,
      password: "123456"
    });

    const res = await request(app).post('/auth/login').send({
      email,
      password: "123456"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

});

afterAll(async () => {
  await pool.end();
});