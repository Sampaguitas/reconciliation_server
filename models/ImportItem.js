const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const ImportItemSchema = new Schema({
    srNr: {
        type: Number,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    poNr: {
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
    totWeight: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    totPrice: {
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
    return !_.isUndefined(this.srNr) ? this.srNr.toString() : "";
});

ImportItemSchema.virtual("qtyX").get(function() {
    return !_.isUndefined(this.qty) ? this.qty.toString() : "";
});

ImportItemSchema.virtual("unitWeightX").get(function() {
    return !_.isUndefined(this.unitWeight) ? this.unitWeight.toString() : "";
});

ImportItemSchema.virtual("totWeightX").get(function() {
    return !_.isUndefined(this.totWeight) ? this.totWeight.toString() : "";
});

ImportItemSchema.virtual("unitPriceX").get(function() {
    return !_.isUndefined(this.unitPrice) ? this.unitPrice.toString() : "";
});

ImportItemSchema.virtual("totPriceX").get(function() {
    return !_.isUndefined(this.totPrice) ? this.totPrice.toString() : "";
});

ImportItemSchema.set('toJSON', { virtuals: true });

module.exports= ImportItem = mongoose.model('importitems', ImportItemSchema);