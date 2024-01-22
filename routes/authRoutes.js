   
        const express = require('express');
        const router = express.Router();
        const { loginUser, registerUser, home } = require('../controllers/authController');
        const { verificarAutenticacion } = require('../controllers/authController');


        router.post('/login', loginUser);
        router.post('/registro', registerUser);
        router.get('/home', home);
        router.get('/verificar-autenticacion', verificarAutenticacion);

        module.exports = router;

