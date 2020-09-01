const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const ImportDocSchema = new Schema({
    decNr: {
        type: String,
        required: true
    },
    boeNr: {
        type: String,
        required: true
    },
    boeDate: {
        type: Date,
        required: true
    },
    decDate: {
        type: Date,
        required: true,
    },
    grossWeight:{
        type: Number,
        required: true,
    },
    totPrice: {
        type: Number,
        required: true,
    },
    isCloded: {
        type: Boolean,
        required: false,
        default: false
    }
});

module.exports= ImportDoc = mongoose.model('importdocs', ImportDocSchema);