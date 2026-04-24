const express = require('express');
const escape = require('escape-html');
const path = require('path');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    }
  },
  frameguard: { action: 'deny' },
  crossOriginEmbedderPolicy: true,
}));

// Cache-Control para evitar contenido cacheable sensible
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

const tickets = [
  { id: 1, title: 'Error al iniciar sesión', description: 'No puedo acceder con mi usuario' },
  { id: 2, title: 'Fallo en el panel', description: 'El dashboard carga lentamente' }
];

const comments = [];

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Mini Secure Tickets App</title></head>
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
          <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
        </form>
      </body>
    </html>
  `);
});

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
          <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
        </form>
        <p><a href="/">Volver</a></p>
      </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const username = escape(req.body.username || 'usuario');
  res.render('login-success', { username });
});

app.get('/tickets', (req, res) => {
  const items = tickets
    .map(t => `
      <li>
        <strong>${escape(t.title)}</strong><br/>
        ${escape(t.description)}
      </li>
    `)
    .join('');

  res.send(`
    <html>
      <head><title>Tickets</title></head>
      <body>
        <h1>Listado de tickets</h1>
        <ul>${items}</ul>
        <p><a href="/">Volver</a></p>
      </body>
    </html>
  `);
});

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
          <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
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

app.get('/search', (req, res) => {
  const q = req.query.q || '';
  const results = tickets.filter(t =>
    t.title.toLowerCase().includes(q.toLowerCase()) ||
    t.description.toLowerCase().includes(q.toLowerCase())
  );
  res.render('search', { q: escape(q), results });
});

app.post('/comment', (req, res) => {
  const { comment } = req.body;
  comments.push(escape(comment || ''));

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

app.get('/comments', (req, res) => {
  const items = comments.length
    ? comments.map(c => `<li>${escape(c)}</li>`).join('')
    : '<li>No hay comentarios todavía</li>';

  res.send(`
    <html>
      <head><title>Comentarios</title></head>
      <body>
        <h1>Comentarios</h1>
        <ul>${items}</ul>
        <p><a href="/">Volver</a></p>
      </body>
    </html>
  `);
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}`);
  });
}
