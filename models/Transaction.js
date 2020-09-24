const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const TransactionSchema = new Schema({
    importId: {
        type: mongoose.SchemaTypes.ObjectId,
        reference: 'importitems'
    },
    exportId: {
        type: mongoose.SchemaTypes.ObjectId,
        reference: 'exportitems'
    },
    pcs: {
        type: Number,
        required: true
    },
    mtr: {
        type: Number,
        default: 0
    }
});

TransactionSchema.virtual("importitem", {
    ref: 'importitems',
    localField: 'exportId',
    foreignField: '_id',
    justOne: true
});

TransactionSchema.set('toJSON', { virtuals: true });

module.exports= Transaction = mongoose.model('transactions', TransactionSchema);