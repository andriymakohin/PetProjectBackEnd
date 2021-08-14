const queryString = require('query-string');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const userModel = require('../users/users.model');
const sessionModel = require('../session/session.model');
const bcrypt = require('bcrypt');
const defaultAvatar =
  'https://code-is-poetry.ru/wp-content/plugins/all-in-one-seo-pack-pro/images/default-user-image.png';
require('dotenv').config();

class GoogleOAuthController {
  //OpenId url
  formQueryString(req, res) {
    try {
      const urlGoogle = this.googleGetCodeLogin();
      res.redirect(urlGoogle);
    } catch (error) {
      console.log(error);
    }
  }

  async loginFormGoogle(req, res, next) {
    try {
      //get code from Google Service
      // get token
      const token = await this.getAccessTokenFromCode(req.query.code);
      if (!token) {
        res.status(404).send({ message: 'Not found token' });
      }
      //get userProfile
      const user = await this.getGoogleDriveFiles(token);
      if (!user) {
        res.status(404).send({ message: 'Not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  }

  googleGetCodeLogin() {
    const params = queryString.stringify({
      client_id:
      "103633925093-sa06hnpgi4s7v6okn3c01t464lcdebnf.apps.googleusercontent.com", //  Заглушка , тут буде id сервіса
      redirect_uri: `https://thawing-inlet-66513.herokuapp.com/api/auth/google/callback`, //  Заглушка url сервіса /api/auth/google/callback
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });
    const googleUrlReq = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    return googleUrlReq;
  }

  //  делаем запрос с параметрами  сервису Google на получения токена
  async getAccessTokenFromCode(code) {
    return await axios
      .post('https://oauth2.googleapis.com/token', {
        client_id:
        "103633925093-sa06hnpgi4s7v6okn3c01t464lcdebnf.apps.googleusercontent.com", //  Заглушка
        client_secret: 'VM0kvschNbwDjhIIcyGxcouF', //  Заглушка
        redirect_uri: `https://thawing-inlet-66513.herokuapp.com/api/auth/google/callback`, //  Заглушка url /api/auth/google/callback
        grant_type: 'authorization_code',
        code,
      })
      .then((data) => data.data.access_token)
      .catch((error) => console.log(error));
  }

  // витягуємо дані з сервіса
  async getGoogleDriveFiles(access_token) {
    return await axios
      .get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((data) => data.data)
      .catch((error) => console.log(error));
  }
}

exports.initUser = async function initifacationUser(req, res) {
  try {
    const findUserEmail = await userModel.findOne({ email: req.user.email });

    const user =
      findUserEmail === null ? await newUser(req.user) : findUserEmail;

    const session = await sessionModel.create({
      sid: user.id || user._id,
    });

    const access_token = await jwt.sign(
      {
        uid: user.id || user._id,
        sid:session._id,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: '30d',
      },
    );
    // const refreshToken = await jwt.sign(
    //   {
    //     uid: user.id || user._id,
    //     sid: session._id,
    //   },
    //   process.env.TOKEN_SECRET,
    //   {
    //     expiresIn: '30d',
    //   },
    // );
    //  openID

    return res
      .status(200)
      .redirect(
        `http://localhost:3000/login?token=${access_token}&refreshToken=${access_token}`,
        // &refreshToken=${refreshToken}`,
      );
  } catch (error) {
    console.log(error);
  }
};

async function newUser(user) {
  const hashPassword = await bcrypt.hash('hashPassword', 5);

  const newUser = await userModel.create({
    status: 'verified',
    username: user.name,
    password: hashPassword,
    email: user.email,
    avatarURL: user.picture || defaultAvatar,
  });
  return newUser;
}

exports.googleOAuth = new GoogleOAuthController();
