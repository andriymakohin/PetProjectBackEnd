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

personeRouter.get(
  "/allPersones",
  LoginController.authorize,
  personeController.getAllPersonesCurrentUser
)

module.exports = personeRouter;
