const { Router } = require('express');
const router = Router();
const tokenController = require('./token.controller')

router.post('/token_refresh/',tokenController.refreshToken)
module.exports = router;
