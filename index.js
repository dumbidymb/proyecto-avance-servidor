const express = require('express');
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');

const mysql = require('mysql2');
const bodyParser = require('body-parser');
const routes =  require('./routes')
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const connectedClients = new Set();
const port = 3000;
 
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'joseluis',
  database: 'calendario'
});


db.connect(err => {
  if (err) {
    console.error('Error de conexión a MySQL:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

app.use(cors());
app.use('/api', routes);


app.use(bodyParser.json());

app.use(session({
  secret: 'tu_secreto',
  resave: false,
  saveUninitialized: true,
}));

server.on('upgrade', (request, socket, head) => {
  const sessionMiddleware = session({
    secret: 'tu_secreto',
    resave: false,
    saveUninitialized: true,
  });

  sessionMiddleware(request, {}, () => {

    if (!request.session.usuario) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
});

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');

  ws.on('message', (message) => {
    console.log(`Mensaje WebSocket recibido: ${message}`);
  });

 
  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
  });
});
app.post('/enviar-mensaje', (req, res) => {
  const mensaje = req.body.mensaje;


  connectedClients.forEa  ((client) => {
    client.send(mensaje);
  });

  res.json({ success: true, message: 'Mensaje enviado a todos los clientes.' });
});

app.get('/', (req, res) => {
  res.send('¡Bienvenido a tu servidor Express!');
});

app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).send('Error interno del servidor');
    } else {
      res.json(result);
    }
  });
});

app.post('/registrar', (req, res) => {
  const { username, password, email } = req.body;


  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }


  db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], (err, result) => {
    if (err) {
      console.error('Error al registrar usuario:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      console.log('Usuario registrado correctamente');
      res.json({ success: true });
    }
  });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Sesión actual:', req.session);


  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('Error al realizar la consulta:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    console.log('Resultado de la consulta:', result);

    if (result.length > 0) {
    
      req.session.usuario = username;

 
      res.json({ success: true });


      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('Usuario autenticado');
        }
      });
    } else {
      res.json({ success: false });
    }
  });
});


app.listen(port, () => {
  console.log(`Servidor Express iniciado en http://localhost:${port}`);
});
