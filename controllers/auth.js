const User = require('../models/user');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridtransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');

const transporter = nodemailer.createTransport(sendgridtransport({
    auth: {
        api_key: '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'
    }
}));

exports.getLogin = (req, res, next) => {

    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false,
        errorMessage: message,
        oldInput: { email: '', password: '', confirmPassword: '' },
        validationErrors: []
    });
};


exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'login',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    isAuthenticated: false,
                    errorMessage: 'Invalid email or password',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                });
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        isAuthenticated: false,
                        errorMessage: 'Invalid email or password',
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: { email: email, password: password, confirmPassword: req.body.confirmPassword },
            validationErrors: errors.array()
        });
    }
    bcrypt.hash(password, 12).then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save();
        }).then(resut => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: "shop@node-complete.com",
                subject: 'Signup succeded',
                html: '<h1>You successfully signed up <h1>'
            });

        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getRest = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/rest',
        pageTitle: 'Reset Password',
        errorMessage: message
    })
};

exports.postRest = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');

        User.findOne({ email: req.body.email }).then(user => {
                if (!user) {
                    req.flash('error', 'No account with the email found');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.restTokenExpiration = Date.now() + 3600000;
                return user.save();
            }).then(result => {
                res.redirect('/');
                transporter.sendMail({
                    to: req.body.email,
                    from: "shop@node-complete.com",
                    subject: 'Link for password reset',
                    html: `
                    <p>  You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}"> Link</> to set new passwrod </p>
                    `
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                next(error);
            })
    });
};


exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, restTokenExpiration: { $gt: Date.now() } }).then(user => {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    })
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const token = req.body.token;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({ resetToken: passwordToken, restTokenExpiration: { $gt: Date.now() }, _id: userId }).then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        }).then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.restTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(succes => {
            res.redirect('/login');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        })

}