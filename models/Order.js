const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const workOrderSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    items: [orderItemSchema],
    dueDate: { type: Date, required: true },
    status: { type: String, required: true },
    notes: { type: String }
});

workOrderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        // El frontend espera Ids como strings
        if (ret.items) {
            ret.items.forEach(item => {
                if(item.productId) item.productId = item.productId.toString();
            });
        }
        if (ret.clientId) ret.clientId = ret.clientId.toString();
    }
});


module.exports = mongoose.model('WorkOrder', workOrderSchema);