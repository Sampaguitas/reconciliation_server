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
        type: String,
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

ImportItemSchema.virtual("srNrX").get(function() {
    return this.srNr.toString();
});

ImportItemSchema.virtual("unitWeightX").get(function() {
    return this.unitWeight.toString();
});

ImportItemSchema.virtual("unitPriceX").get(function() {
    return this.unitPrice.toString();
});

ImportItemSchema.set('toJSON', { virtuals: true });

module.exports= ImportItem = mongoose.model('importitems', ImportItemSchema);