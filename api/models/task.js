const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: { type: String, required: true, minlength: 1, trim: true},
    _listId: {type: mongoose.Types.ObjectId, required: true},
    completed:{type: Boolean, default: false}
});

module.exports = mongoose.model('task', taskSchema);