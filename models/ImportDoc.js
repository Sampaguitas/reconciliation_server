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
        type: Date,
        required: true,
    },
    totPrice: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: false
    }
});

module.exports= ImportDoc = mongoose.model('importdocs', ImportDocSchema);