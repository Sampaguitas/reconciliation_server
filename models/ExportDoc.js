const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const ExportDocSchema = new Schema({
    invNr: {
        type: String,
        required: true
    },
    decNr: {
        type: String,
        required: false
    },
    boeNr: {
        type: String,
        required: false
    },
    boeDate: {
        type: Date,
        required: false
    },
    totWeight:{
        type: Number,
        required: true,
    },
    totPrice: {
        type: Number,
        required: true,
    }
});

module.exports= ExportDoc = mongoose.model('exportdocs', ExportDocSchema);