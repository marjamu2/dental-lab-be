
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        } 
        user = new User({ email, password, role });
        await user.save();
        res.status(201).json({ msg: 'Usuario registrado exitosamente' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: user.toJSON() });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});


// @route   POST api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ msg: 'Por favor, proporcione la contraseña actual y la nueva.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ msg: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        // Find user by ID from token payload, and select the password field
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ msg: 'La contraseña actual es incorrecta.' });
        }

        user.password = newPassword;
        await user.save(); // The pre-save hook will hash the password

        res.json({ msg: 'Contraseña actualizada exitosamente.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});


module.exports = router;
