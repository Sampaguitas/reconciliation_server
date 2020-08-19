const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FieldNameSchema = new Schema({
    align: {
        type: String,
        default: 'left',
    },
    edit: {
        type: Boolean,
        default: false,
    },
    forSelect:{
        type: Number,
    },
    forShow: {
        type: Number
    },
    screenId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'screens',
        required: true
    },
    fieldId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'fields',
        required: true  
    },
});

FieldNameSchema.virtual("fields", {
    ref: "fields",
    localField: "fieldId",
    foreignField: "_id",
    justOne: true
});

FieldNameSchema.set('toJSON', { virtuals: true });

module.exports = FieldName = mongoose.model('fieldnames',FieldNameSchema);