const express = require('express');
const personeRouter = express.Router();
const personeController = require('./persone.controller');
const LoginController = require('../auth/login.controller');

personeRouter.post(
  '/addpersone',
  LoginController.authorize,
  personeController.validPersone,
  personeController.addPersone,
);

module.exports = personeRouter;
