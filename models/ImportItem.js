const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const ImportItemSchema = new Schema({
    srNr: {
        type: Number,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    invNr: {
        type: String,
        required: true
    },
    unitWeight: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    hsCode: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    documentId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    }
});

module.exports= ImportItem = mongoose.model('importitems', ImportItemSchema);