const request = require('supertest');
// Deshabilita CSRF para tests
jest.mock('csurf', () => () => (req, res, next) => {
  req.csrfToken = () => 'test-token';
  next();
});
const app = require('../src/app');

describe('Mini Secure Tickets App', () => {
  test('GET / debe devolver 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Mini Secure Tickets App');
  });

  test('GET /tickets debe devolver 200', async () => {
    const res = await request(app).get('/tickets');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Listado de tickets');
  });

  test('POST /ticket/new debe crear ticket', async () => {
    const res = await request(app)
      .post('/ticket/new')
      .type('form')
      .send({ title: 'Ticket de prueba', description: 'Descripción de prueba' });

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Ticket guardado correctamente');
  });
});
