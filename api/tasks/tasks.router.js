const { Router } = require('express');
const tasksController = require('./tasks.controller');
const loginController = require('../auth/login.controller');

const router = Router();

router.post(
  '/:personeId',
  loginController.authorize,
  tasksController.addTaskValidation,
  tasksController.addTask,
);
router.patch(
  '/:taskId',
  loginController.authorize,
  tasksController.updateTaskValidation,
  tasksController.updateTask,
);

router.patch(
  '/repeat/:taskId',
  loginController.authorize,
  tasksController.repeatTask,
);
router.patch(
  '/confirm/:taskId',
  loginController.authorize,
  tasksController.confirmTask,
);

router.delete(
  '/:taskId',
  loginController.authorize,
  tasksController.removeTask,
);

router.patch(
  '/notconfirm/:taskId',
  loginController.authorize,
  tasksController.notConfirmTask,
);

router.get('/', loginController.authorize, tasksController.getTasks);

module.exports = router;
