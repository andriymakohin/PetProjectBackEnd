### Google OAuth 2.0

### Тест відбувається через endpoint...

### зараз заглушки на http://localhost:1717/api/auth/....

# GET /api/auth/google --> перенаправляє на сервіс реєстрації через google

після реєстрації, сервіс дає нам код , для отримання токена. Повертає КОД и ТОКЕН на http://localhost:1717/api/auth/google/callback
після отримання токену, йде запит на отрисання даних користувача.


### СТАТТЯ

https://xsltdev.ru/nodejs/tutorial/authentication/#google-facebook
http://www.passportjs.org/

# Google

https://medium.com/authpack/easy-google-auth-with-node-js-99ac40b97f4c
https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow

# Facebook

https://medium.com/authpack/facebook-auth-with-node-js-c4bb90d03fc0
https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow?locale=ru_RU
