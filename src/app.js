const express = require('express');
const escape = require('escape-html');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// "Base de datos" en memoria
const tickets = [
  { id: 1, title: 'Error al iniciar sesión', description: 'No puedo acceder con mi usuario' },
  { id: 2, title: 'Fallo en el panel', description: 'El dashboard carga lentamente' }
];

const comments = [];

// Página principal
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Mini Secure Tickets App</title>
      </head>
      <body>
        <h1>Mini Secure Tickets App</h1>
        <p>Aplicación de ejemplo para prácticas DevSecOps.</p>

        <ul>
          <li><a href="/login">Login</a></li>
          <li><a href="/tickets">Ver tickets</a></li>
          <li><a href="/ticket/new">Crear ticket</a></li>
          <li><a href="/comments">Ver comentarios</a></li>
        </ul>

        <h2>Buscar tickets</h2>
        <form action="/search" method="GET">
          <input type="text" name="q" placeholder="Buscar..." />
          <button type="submit">Buscar</button>
        </form>

        <h2>Añadir comentario</h2>
        <form action="/comment" method="POST">
          <textarea name="comment" rows="4" cols="50" placeholder="Escribe un comentario"></textarea><br/>
          <button type="submit">Guardar comentario</button>
        </form>
      </body>
    </html>
  `);
});

// Login simple
app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head><title>Login</title></head>
      <body>
        <h1>Login</h1>
        <form action="/login" method="POST">
          <label>Usuario:</label>
          <input type="text" name="username" /><br/><br/>
          <label>Contraseña:</label>
          <input type="password" name="password" /><br/><br/>
          <button type="submit">Entrar</button>
        </form>
        <p><a href="/">Volver</a></p>
      </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.send(`
    <html>
      <head><title>Bienvenido</title></head>
      <body>
        <h1>Bienvenido, ${escape(username) || 'usuario'}</h1>
        <p>Login simulado correctamente.</p>
        <p><a href="/">Ir al inicio</a></p>
      </body>
    </html>
  `);
});

// Listado de tickets
app.get('/tickets', (req, res) => {
  const items = tickets
    .map(
      (t) => `
        <li>
          <strong>${t.title}</strong><br/>
          ${t.description}
        </li>
      `
    )
    .join('');

  res.send(`
    <html>
      <head><title>Tickets</title></head>
      <body>
        <h1>Listado de tickets</h1>
        <ul>${escape(items)}</ul>
        <p><a href="/">Volver</a></p>
      </body>
    </html>
  `);
});

// Formulario nuevo ticket
app.get('/ticket/new', (req, res) => {
  res.send(`
    <html>
      <head><title>Nuevo ticket</title></head>
      <body>
        <h1>Crear ticket</h1>
        <form action="/ticket/new" method="POST">
          <label>Título:</label>
          <input type="text" name="title" /><br/><br/>
          <label>Descripción:</label><br/>
          <textarea name="description" rows="4" cols="50"></textarea><br/><br/>
          <button type="submit">Guardar ticket</button>
        </form>
        <p><a href="/">Volver</a></p>
      </body>
    </html>
  `);
});

app.post('/ticket/new', (req, res) => {
  const { title, description } = req.body;

  tickets.push({
    id: tickets.length + 1,
    title: title || 'Sin título',
    description: description || 'Sin descripción'
  });

  res.send(`
    <html>
      <head><title>Ticket guardado</title></head>
      <body>
        <h1>Ticket guardado correctamente</h1>
        <p><a href="/tickets">Ver tickets</a></p>
      </body>
    </html>
  `);
});

// Búsqueda
app.get('/search', (req, res) => {
  const q = req.query.q || '';

  const results = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(q.toLowerCase()) ||
      t.description.toLowerCase().includes(q.toLowerCase())
  );

  const items = results.length
    ? results
        .map(
          (t) => `
            <li>
              <strong>${t.title}</strong><br/>
              ${t.description}
            </li>
          `
        )
        .join('')
    : '<li>No se encontraron resultados</li>';

  res.send(`
    <html>
      <head><title>Búsqueda</title></head>
      <body>
        <h1>Resultados de búsqueda para: ${escape(q)}</h1>
        <ul>${escape(items)}</ul>
        <p><a href="/">Volver</a></p>
      </body>
    </html>
  `);
});

// Guardar comentario
app.post('/comment', (req, res) => {
  const { comment } = req.body;

  comments.push(comment || '');

  res.send(`
    <html>
      <head><title>Comentario guardado</title></head>
      <body>
        <h1>Comentario guardado</h1>
        <p><a href="/comments">Ver comentarios</a></p>
      </body>
    </html>
  `);
});

// Ver comentarios
app.get('/comments', (req, res) => {
  const items = comments.length
    ? comments.map((c) => `<li>${c}</li>`).join('')
    : '<li>No hay comentarios todavía</li>';

  res.send(`
    <html>
      <head><title>Comentarios</title></head>
      <body>
        <h1>Comentarios</h1>
        <ul>${escape(items)}</ul>
        <p><a href="/">Volver</a></p>
      </body>
    </html>
  `);
});

// Exportamos app para tests
module.exports = app;

// Solo escucha si se ejecuta directamente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}`);
  });
}
