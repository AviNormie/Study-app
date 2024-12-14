const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },
    studyTime: { type: Number, default: 0 }
});

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
