const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    clinic: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
});

// Transforma _id a id para compatibilidad con el frontend
clientSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Client', clientSchema);