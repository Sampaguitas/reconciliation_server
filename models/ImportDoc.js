const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');
var aws = require('aws-sdk');
var path = require('path');
const accessKeyId = require('../config/keys').accessKeyId;
const secretAccessKey = require('../config/keys').secretAccessKey;
const region = require('../config/keys').region;
const awsBucketName = require('../config/keys').awsBucketName;

aws.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
});

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
    totWeight:{
        type: Number,
        default: 0,
    },
    totPrice: {
        type: Number,
        default: 0,
    },
    poNrs: {
        type: String,
        default: "",
    },
    invNrs: {
        type: String,
        default: "",
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    fileName: {
        type: String,
        default: ''
    }
});

ImportDocSchema.virtual("items", {
    ref: "importitems",
    localField: "_id",
    foreignField: "documentId",
    justOne: false
});

ImportDocSchema.set('toJSON', { virtuals: true });

ImportDocSchema.post('findOneAndDelete', function(doc, next) {
    let documentId = doc._id;
    findItems(documentId).then( () => {
        deleteFile(documentId).then( () => next());
    });
});

function findItems(documentId) {
    return new Promise(function (resolve) {
        if (!documentId) {
            resolve();
        } else {
            mongoose.model('importitems').find({ documentId: documentId }, function (err, items) {
                if (err || _.isEmpty(items)) {
                    resolve();
                } else {
                    let myPromises = [];
                    items.map(item => myPromises.push(deleteItem(item._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteItem(itemId) {
    return new Promise(function(resolve) {
        if (!itemId) {
            resolve();
        } else {
            mongoose.model('importitems').findByIdAndDelete(itemId, function (err, res) {
                if (!!err || !res) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function deleteFile(documentId) {
    return new Promise(function(resolve) {
        if (!documentId) {
            resolve();
        } else {
            var s3 = new aws.S3();
            var params = {
                Bucket: awsBucketName,
                Key: path.join('import', String(documentId)),
            };

            s3.deleteObject(params, function(err, data) {
                if (!!err || !data) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}



module.exports= ImportDoc = mongoose.model('importdocs', ImportDocSchema);