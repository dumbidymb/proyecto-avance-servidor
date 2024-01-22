
const express = require('express');
const authRoutes = require('./authRoutes');

const router = express.Router();


router.get('/', (req, res) => {
  res.send('¡Bienvenido a la aplicación!');
});


router.use('/auth', authRoutes);

module.exports = router;
