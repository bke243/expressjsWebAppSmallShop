const express = require('express');

const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [
    body('password', "Please enter a password with nly numbers and text which contains at least 5 characters").isAlphanumeric().isLength({ min: 5 }).trim(),
    body('email', "Please enter a vaild email").isEmail().normalizeEmail()
], authController.postLogin);

router.post('/signup', [check('email').isEmail().withMessage('Please enter a valid email.').custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
            if (userDoc) {
                return Promise.reject('Email exisist already, please pick a new one');
            }
        });
    }).normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text with at least 5 chareacters').isLength({ min: 5 }).isAlphanumeric().trim(),
    body('confirmPassword').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password have to match!');
        }
        return true;
    })

], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getRest);

router.post('/reset', authController.postRest);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);
module.exports = router;