const {
  Schema,
  model,
  Types: { ObjectId },
} = require('mongoose');


const PersoneSchema = new Schema({
  idUser: { type: String, required: true },
  name: { type: String },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female'],
  },
  stars: { type: Number, default: 0 },
  tasks: [{ type: ObjectId, ref: 'Tasks' }],
  presents: [{ type: ObjectId, ref: 'Presents' }],
});

exports.PersoneModel = model('Persone', PersoneSchema);
