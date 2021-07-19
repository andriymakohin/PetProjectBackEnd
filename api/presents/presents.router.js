const { Router } = require('express');
const presentsController = require('./presents.controller');
const LoginController = require('../auth/login.controller');
// const { multerMid } = require('../../helpers/multer-config');
const router = Router();

router.post(
  '/',
  LoginController.authorize,
  // multerMid.single('file'),
  presentsController.addPresentValidation,
  presentsController.addPresent,
);
router.patch(
  '/buy/:presentId',
  LoginController.authorize,
  presentsController.buyPresent,
);
router.delete(
  '/:presentId',
  LoginController.authorize,
  presentsController.removePresent,
);
router.patch(
  '/:presentId',
  LoginController.authorize,
  // multerMid.single('file'),
  presentsController.updatePresentValidation,
  presentsController.updatePresent,
);
router.get(
  '/',
  LoginController.authorize,
  presentsController.getAllPresentsPersone,
);

module.exports = router;
