const { Schema, model } = require('mongoose');

const PresentsSchema = new Schema({
  title:{ type: String, required: true },
  personeId: { type: String, required: true },
  reward: { type: Number, required: true },
  image: { type: String, },
  dateCreated: Date,
});

exports.PresentsModel = model('Presents', PresentsSchema);
exports.PresentsSchema = PresentsSchema;