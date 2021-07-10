const { Router } = require('express');
const router = Router();

const LoginController = require('./login.controller');
const { googleOAuth, initUser } = require('./auth.controller');
const SignUpController = require('../users/users.controller');

//google auth
router.get('/google', googleOAuth.formQueryString.bind(googleOAuth));
router.get(
  '/google/callback',
  googleOAuth.loginFormGoogle.bind(googleOAuth),
  initUser.bind(),
);

//Register
router.get('/verify/:verificationToken', SignUpController.verificationEmail);
router.post(
  '/register',
  SignUpController.validateCreateUser,
  SignUpController.register,
);

//Login, logout & current
router.post('/login', LoginController.validateUserLogin, LoginController.login);
router.get(
  '/current',
  LoginController.authorize,
  LoginController.getCurrentUser,
);
router.delete('/logout', LoginController.authorize, LoginController.logout);

module.exports = router;
