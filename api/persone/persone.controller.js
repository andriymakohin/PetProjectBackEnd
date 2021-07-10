const { PersoneModel } = require('./persone.model');
const UserModel = require('../users/users.model');
const Joi = require('joi');

class Controllers {
  addPersone = async (req, res, next) => {
    try {
      req.body.idUser = req.user._id;
      const persone = await PersoneModel.create(req.body);
      let user = await UserModel.findById(req.body.idUser);
      if (!user) {
        res.status(400).send('No user');
      }
      user.persones.push(persone.id);
      user.save();

      return res
        .status(201)
        .send({ id: persone._id, name: persone.name, gender: persone.gender });
    } catch (err) {
      next(err.message);
    }
  };

  validPersone = (req, res, next) => {
    const validator = Joi.object({
      name: Joi.string().empty().max(30).required(),
      gender: Joi.string().empty().required(),
    });
    const { error } = validator.validate(req.body);
    return error
      ? res.status(400).send({ message: error.details[0].message })
      : next();
  };
}

module.exports = new Controllers();
