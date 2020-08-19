const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocField = require('./DocField');
const s3bucket = require('../middleware/s3bucket');
const _ = require('lodash');

const DocDefSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    field: {
        type: String,
    },
    description: {
        type: String,
    },
    row1: {
        type: Number,
    },
    col1: {
        type: Number,
    },
    worksheet1: {
        type: String,
    },
    worksheet2: {
        type: String,
    },
    worksheet3: {
        type: String,
    },
    row3: {
        type: Number,
    },
    col3: {
        type: Number,
    },
    doctypeId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'doctypes'
    },
});

DocDefSchema.virtual("doctypes", {
    ref: "doctypeId",
    localField: "doctypeId",
    foreignField: "_id",
    justOne: true
});

DocDefSchema.virtual("docfields", {
    ref: "docfields",
    localField: "_id",
    foreignField: "docdefId",
    justOne: false
});



DocDefSchema.virtual("name").get(function (){
    return this.description + ' (' + this.code + ')'; 
})

DocDefSchema.set('toJSON', { virtuals: true });

DocDefSchema.post('findOneAndDelete', function(doc, next) {
    
    let docdefId = doc._id;
    let fileName = doc.field;

    findDocFields(docdefId).then( () => {
        deleteFile(fileName).then( () => next());
    });
});

function deleteFile(fileName) {
    return new Promise(function(resolve) {
        s3bucket.deleteFile(fileName)
        .then( () => resolve());
    });
}

function findDocFields(docdefId) {
    return new Promise(function (resolve) {
        if (!docdefId) {
            resolve();
        } else {
            DocField.find({ docdefId: docdefId }, function (err, docfields) {
                if (err || _.isEmpty(docfields)) {
                    resolve();
                } else {
                    let myPromises = [];
                    docfields.map(docfield => myPromises.push(deleteDocField(docfield._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocField(docfieldId) {
    return new Promise(function(resolve) {
        if (!docfieldId) {
            resolve();
        } else {
            DocField.findByIdAndDelete(docfieldId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = DocDef = mongoose.model('docdefs',DocDefSchema);