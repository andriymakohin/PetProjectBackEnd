const userModel = require('../users/users.model');
const sessionModel = require('../session/session.model');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class TokenController {
  async refreshToken(req, res) {
    try {
      // if we use the authorize middleware, then we do't use the Bearer Token verification code
      const authHeader = req.get('Authorization');
      let token;

      token = !authHeader
        ? res.status(401, 'Unauthorized').send({ message: 'Not authorized ' })
        : authHeader.split(' ')[1];

      //
      const sessionId = await jwt.verify(token, process.env.TOKEN_SECRET).sid;
       console.log(sessionId);
      if (!sessionId) {
        res.status('Unauthorized', 401).send('not found session');
      }
      const session = await sessionModel.findById(sessionId);
      if (!session) {
        res.status(400).send({ message: 'not found session' });
      };

      const user = await userModel.findById(session.sid);
      if (!user) {
        return res.status(400).send({ message: 'Not Found User' });
      }
      //delete session 
      await sessionModel.findByIdAndDelete(session._id);
      // new session
      const newSession = await sessionModel.create({
        sid: user.id || user._id,
      });

      const accessToken = await jwt.sign(
        {
          uid: user.id || user._id,
          sid:newSession._id,
        },
        process.env.TOKEN_SECRET,
        {
          expiresIn: '30d',
        },
      );

      // const refreshToken = await jwt.sign(
      //   {
      //     uid: user.id || user._id,
      //     sid:newSession._id,
      //   },
      //   process.env.TOKEN_SECRET,
      //   {
      //     expiresIn: '30d',
      //   },
      // );

      return res.status(200).json({
        accessToken
        // refreshToken,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new TokenController();
