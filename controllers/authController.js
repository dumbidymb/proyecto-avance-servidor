
const db = require('../index'); 
const mysql = require('mysql2/promise');
const { promisify } = require('util');


const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'joseluis',
  database: 'calendario',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});




const verificarAutenticacion = (req, res) => {

  if (req.session.usuario) {
    res.json({ autenticado: true, usuario: req.session.usuario });
  } else {
    res.json({ autenticado: false });
  }
};


const query = promisify(pool.query).bind(pool);

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);

   
    if (rows.length > 0 && rows[0].password === password) {
   
      req.session.usuario = username;
      res.json({ success: true });
    } else {
  
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};


const registerUser = (req, res) => {
  
};

const home = (req, res) => {

};

module.exports = {
  loginUser,
  registerUser,
  home,
  verificarAutenticacion, 
};

