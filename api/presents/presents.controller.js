const {PresentsModel} = require('./presents.model');
const {PersoneModel} = require('../persone/persone.model');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');


class PresentsController {

async getAllPresentsPersone(req,res){
try {
    const session = req.session;
      if (!session) {
        return res.status(404).send({ message: "Session was not found" });
      }

    const {userId} = req.params  // приймає в запросі _id User
    console.log("userId =", userId);

    const allPersoneByUser = await PersoneModel.find({
      idUser:userId
    })
    
    if(!allPersoneByUser){
      return res.status(401).send({message:'Not found User ID'})
    };
    // збирає всі idPresent по всіх виконавців в массив
    const allPresents = allPersoneByUser.reduce((acc,present)=>{
      present.presents.length > 0 ? acc.push(...present.presents): false;
      return acc
        },[]);
    //знаходимо всі pressent по id  
    const x = await PresentsModel.find({ _id: { $in: allPresents } })
  
    return res.status(201).send(x)
} catch (error) {
  console.log(error);
} 
}
  async addPresent(req, res, next) {
    try {
      const session = req.session;
      if (!session) {
        return res.status(404).send({ message: "Session was not found" });
      }
      const { perdoneId,title, reward } = req.body;
    
      const splitpatch = req.files ? req.files.map(e => (e.path)) : ""
      const imagePath = splitpatch ? `http://localhost:1717/`+`${splitpatch}`.split('\\').slice(3).join('/') : "";
      const newPresent = await PresentsModel.create({
        title,
        perdoneId,
        reward,
        image: imagePath,
        dateCreated: Date.now(),
      });
      await PersoneModel.findById(perdoneId,(err,persone)=>{
        if(err)  {
          return res.status(404).send({message:'Not Found Persone'})
        }
      persone.presents.push(newPresent._id)
      persone.save();
      res.status(200).send('Present added');
      })
    } catch (err) {
      next(err);
    }
  }
  // ДОРОБИТИ!!!
  async removePresent(req, res, next) {
    try {
      const session = req.session;
      if (!session) {
        return res.status(404).send({ message: "Session was not found" });
      }
      const { presentId } = req.params;
      const { personeId } = req.body;
      const Present = await PresentsModel.find({personeId: personeId});
      if (!Present) return res.status(404).send({ message: 'Not found persone' });
      const result = await PresentsModel.findByIdAndDelete(presentId);
      if (!result) return res.status(404).send({ message: 'Not found' });
      const newPresent = await PresentsModel.find({personeId: personeId});
      await PersoneModel.findByIdAndUpdate(personeId, {$set: {presents: newPresent}},{ upsert:true, returnNewDocument : true });
      return res.status(201).send("Present deleted"); 
    } catch (err) {
      next(err);
    }
  }

  async updatePresent(req, res, next) {
    try {
      !req.session && res.status(404).send({ message: "Session was not found" });
      const {_id,title,reward,personeId} = req.body
      const findIdPresent = await PresentsModel.findById(_id)
      !findIdPresent && res.status(404).send({ message: "Present was not found" });
      const updatePresent = await  PresentsModel.findByIdAndUpdate(_id, {
        title,
        personeId,
        reward,
        image:'',
        dateCreated: Date.now(),
      });
      !updatePresent && res.status(404).send({ message: "Not found Id" });
        res.status(200).send({message:'Present was Update'})
    }catch(error){
      console.log(error)
      next(error)
    };
  };

  async buyPresent(req, res, next) {
    try {
      const session = req.session;
      if (!session) {
        return res.status(404).send({ message: "Session was not found" });
      }
      const { presentId } = req.params;
      const { personeId } = req.body;  //Доробити!!!!
      const Present = await PresentsModel.findById(presentId);
      const Persone = await PersoneModel.findById(personeId);
      const rewardPersone = Persone.stars;
      const rewardPresent = Present.reward;
      if(rewardPersone >= rewardPresent){
        const newRewardPresent = rewardPersone - rewardPresent;
        await PersoneModel.findByIdAndUpdate(personeId, {$set: {stars: newRewardPresent}},{ upsert:true, returnNewDocument : true });
        return res.status(200).send('Present buy'); 
      } else {res.status(404).send({ message: "You don't have that much stars" })}
    } catch (err) {
      next(err);
    }
  }



  validPresent = (req, res, next) => {
    const validator = Joi.object({
      _id:Joi.string(),
      title: Joi.string(),
      personeId: Joi.string().required(),
      reward: Joi.number(),
      image: Joi.string(),
      dateCreated: Joi.date(),
    });
    const { error } = validator.validate(req.body);
    return error ? res.status(400).send(error.message) : next();
  };
}

module.exports = new PresentsController();
