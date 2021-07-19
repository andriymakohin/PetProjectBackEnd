const { PresentsModel } = require('./presents.model');
const { PersoneModel } = require('../persone/persone.model');
// const { uploadImage } = require('../../helpers/multer-config');
const Joi = require('joi');

class PresentsController {
  async getAllPresentsPersone(req, res) {
    try {
      const session = req.session;
      if (!session) {
        return res.status(404).send({ message: 'Session was not found' });
      }

      const userId = req.user.id;

      const allPersoneByUser = await PersoneModel.find({
        idUser: userId,
      });

      if (!allPersoneByUser) {
        return res.status(401).send({ message: 'Not found User ID' });
      }
      
      const allPresents = allPersoneByUser.reduce((acc, present) => {
        present.presents.length > 0 ? acc.push(...present.presents) : false;
        return acc;
      }, []);
      //находим всех pressent по id
      const x = await PresentsModel.find({ _id: { $in: allPresents } });

      return res.status(201).send(x);
    } catch (error) {
      console.log(error);
    }
  }
  async addPresent(req, res, next) {
    console.log(req.body)
    try {
      const session = req.session;
      if (!session) {
        return res.status(404).send({ message: 'Session was not found' });
      }
      const { personeId, title, reward } = req.body;

      // const presentImg = req.file;

      const imagePath = '';

      const newPresent = await PresentsModel.create({
        title,
        personeId,
        reward,
        image: imagePath,
        dateCreated: Date.now(),
      });
      await PersoneModel.findById(personeId, (err, persone) => {
        if (err) {
          return res.status(404).send({ message: 'Not Found persone' });
        }
        persone.presents.push(newPresent._id);
        persone.save();
        res.status(201).send(newPresent);
      });
    } catch (err) {
      next(err);
    }
  }

  async removePresent(req, res, next) {
    try {
      const session = req.session;
      if (!session) {
        return res.status(404).send({ message: 'Session was not found' });
      }
      const { presentId } = req.params;

      const present = await PresentsModel.findById(presentId);
      if (!present) {
        return res.status(404).send({ message: 'Present was not found' });
      }

      const personeToUpdate = await PersoneModel.findByIdAndUpdate(
        present.personeId,
        { $pull: { presents: presentId } },
        { new: true },
      );
      if (!personeToUpdate) {
        return res.status(404).send({ message: 'Persone was not found' });
      }

      await PresentsModel.findByIdAndDelete(presentId);

      return res
        .status(200)
        .send({ message: 'Present was deleted successful' });
    } catch (err) {
      next(err);
    }
  }

  async updatePresent(req, res, next) {
    try {
      !req.session &&
        res.status(404).send({ message: 'Session was not found' });

      const { presentId } = req.params;

      const presentImg = req.file;

      const imageURL = await uploadImage(presentImg);
      imageURL ? (req.body.image = imageURL) : null;

      const updatedPresent = await PresentsModel.findByIdAndUpdate(
        presentId,
        {
          ...req.body,
          dateCreated: Date.now(),
        },
        { new: true },
      );

      return updatedPresent
        ? res.status(200).send(updatedPresent)
        : res.status(404).send({ message: 'Present was not found' });
    } catch (error) {
      next(error);
    }
  }

  async buyPresent(req, res, next) {
    try {
      const session = req.session;
      if (!session) {
        return res.status(404).send({ message: 'Session was not found' });
      }
      const { presentId } = req.params;

      const present = await PresentsModel.findById(presentId);
      const persone = await PersoneModel.findById(present.personeId);

      const rewardPersone = persone.stars;
      const rewardPresent = present.reward;

      if (rewardPersone >= rewardPresent) {
        const newRewardPresent = rewardPersone - rewardPresent;
        await PersoneModel.findByIdAndUpdate(
          present.personeId,
          { stars: newRewardPresent },
          { new: true },
        );
        const perosneToUpdate = await PersoneModel.findByIdAndUpdate(
          present.personeId,
          { $pull: { presents: presentId } },
          { new: true },
        );
        if (!perosneToUpdate) {
          return res.status(404).send({ message: 'Persone was not found' });
        }
        await PresentsModel.findByIdAndDelete(presentId);
        return res.status(200).send({ message: 'Present was bought' });
      } else {
        res.status(404).send({ message: "You don't have that much stars" });
      }
    } catch (err) {
      next(err);
    }
  }

  addPresentValidation(req, res, next) {
    const addSchemaValidator = Joi.object({
      _id: Joi.string(),
      title: Joi.string(),
      personeId: Joi.string().required(),
      reward: Joi.number(),
      image: Joi.string(),
      dateCreated: Joi.date(),
    });

    PresentsController.checkValidationError(addSchemaValidator, req, res, next);
  }

  updatePresentValidation(req, res, next) {
    const updateSchemaRules = Joi.object({
      title: Joi.string(),
      personeId: Joi.string(),
      reward: Joi.number(),
      image: Joi.string(),
    });

    PresentsController.checkValidationError(updateSchemaRules, req, res, next);
  }

  static checkValidationError(schema, req, res, next) {
    const { error } = schema.validate(req.body);

    if (error) {
      const { message } = error.details[0];
      return res.status(400).send({ error: message });
    }
    next();
  }
}

module.exports = new PresentsController();
