const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const SessionModel = require('../session/session.model');
const UserModel = require('../users/users.model.js');

class LoginController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).send({ message: 'User was not found' });
      }
      const id = ObjectId(user._id);
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.send({ message: 'Authentefication failed.' });
      }

      if (user.status != 'verified') {
        return res.send({ message: 'User was not verified' });
      }
      const parseId = ObjectId(user._id);
      const session = await SessionModel.findOne({ sid: parseId });
      if (session) {
        return res.send({ message: 'Session is already created' });
      }
      const createSession = await SessionModel.create({
        sid: parseId,
      });
      const accessToken = await jwt.sign(
        { uid: createSession.sid, sid: createSession._id },
        process.env.TOKEN_SECRET ? process.env.TOKEN_SECRET : 'planer',
        { expiresIn: '1h' },
      );
      const refreshToken = await jwt.sign(
        { sid: createSession._id, uid: createSession.sid },
        process.env.TOKEN_SECRET ? process.env.TOKEN_SECRET : 'planer',
        { expiresIn: '30d' },
      );
      return res.send({
        name: user.username,
        email: user.email,
        avatarURL: user.avatarURL,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (err) {
      next(err);
    }
  }

  async authorize(req, res, next) {
    try {
      const authorizationHeader = req.get('Authorization') || '';
      let token;

      if (authorizationHeader) {
        token = authorizationHeader.split(' ')[1];
      } else {
        res.status(400).send({ message: 'missing token' });
      }
  
      let verify;
      try {
        verify = await jwt.verify(token, process.env.TOKEN_SECRET);
      } catch (err) {
        res.status(401).send({ message: 'Unauthorized' });
      }
 
      try {
        const session = await SessionModel.findOne({ sid: verify.uid });
        if (!session) {
          return res.status(404).send({ message: 'Session was not found' });
        }
        const user = await UserModel.findById(verify.uid);
        if (user._id != verify.uid) {
          return res.status(404).send({ message: 'User was not found' });
        }
        req.user = user;
        req.session = session;
      } catch (err) {
        next(err);
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = req.user;
      const session = req.session;
      if (!session) {
      }
      res.send({
        name: user.username,
        avatarURL: user.avatarURL,
        persone: user.persones,
        email: user.email,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      await SessionModel.findByIdAndDelete(req.session._id);
      return res.send({ message: 'success' });
    } catch (err) {
      next(err);
    }
  }

  validateUserLogin(req, res, next) {
    const validateSchema = Joi.object({
      email: Joi.string().email().empty().max(50).required(),
      password: Joi.string().empty().max(50).required(),
    });
    LoginController.checkValidationError(validateSchema, req, res, next);
  }

  static checkValidationError(schema, req, res, next) {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    next();
  }
}

module.exports = new LoginController();
