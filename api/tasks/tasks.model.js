const { Schema, Types, model } = require('mongoose');

const TaskModel = new Schema({
  title: String,
  reward: Number,
  daysToDo: Number,
  startDay: Date,
  finishDay: Date,
  personeId: Types.ObjectId,
  isCompleted: {
    type: String,
    enum: ['active', 'done', 'undone'],
    default: 'active',
  },
});

module.exports = model('Tasks', TaskModel);
