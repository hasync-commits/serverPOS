const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    userId: { type: String, required: true, unique: true }, 
    seq: { type: Number, required: true },     
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Manager', 'Cashier'], required: true },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
