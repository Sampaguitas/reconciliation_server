const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const ExportItemSchema = new Schema({
    srNr: {
        type: Number,
        required: true
    },
    artNr: {
        type: String,
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
    pcs: {
        type: Number,
        required: true
    },
    mtr: {
        type: Number,
        required: true
    },
    totalNetWeight: {
        type: Number,
        required: true
    },
    totalGrossWeight: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    documentId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    }
});

ExportItemSchema.post(['save', 'findOneAndUpdate', 'findOneAndDelete'], function(doc, next) {
    let documentId = doc.documentId;
    mongoose.model('exportitems').find({ documentId: documentId }, function(errItems, resItems) {
        if (!!errItems || !resItems) {
            next();
        } else {
            let totals = resItems.reduce(function(acc, cur) {
                // if (!!cur.invNr && !acc.invNrs.includes(cur.invNr)) {
                //     if(acc.invNrs == "") {
                //         acc.invNrs = cur.invNr
                //     } else {
                //         acc.invNrs += `| ${cur.invNr}`
                //     }
                // }
                // if (!!cur.poNr && !acc.poNrs.includes(cur.poNr)) {
                //     if(acc.poNrs == "") {
                //         acc.poNrs = cur.poNr
                //     } else {
                //         acc.poNrs += `| ${cur.poNr}`
                //     }
                // }
                acc.pcs += cur.pcs || 0;
                acc.mtr += cur.mtr || 0;
                acc.totalNetWeight += cur.totalNetWeight || 0;
                acc.totalGrossWeight += cur.totalGrossWeight || 0;
                acc.totalPrice += cur.totalPrice || 0;
                // let found = acc.summary.find(element => _.isEqual(element.hsCode, cur.hsCode) && _.isEqual(element.country, cur.country) && _.isEqual(element.hsDesc, cur.hsDesc));
                // if (_.isUndefined(found)) {
                //     acc.summary.push({
                //         hsCode: cur.hsCode,
                //         hsDesc: cur.hsDesc,
                //         country: cur.country,
                //         pcs: cur.pcs,
                //         mtr: !!cur.mtr ? cur.mtr : 0,
                //         totalNetWeight: cur.totalNetWeight,
                //         totalGrossWeight: cur.totalGrossWeight,
                //         totalPrice: cur.totalPrice,
                //     });
                // } else {
                //     found.pcs += cur.pcs;
                //     if (!!cur.mtr) {
                //         found.mtr += cur.mtr;
                //     };
                //     found.totalNetWeight += cur.totalNetWeight,
                //     found.totalGrossWeight += cur.totalGrossWeight;
                //     found.totalPrice += cur.totalPrice;
                // }
                return acc;
            }, { pcs: 0, mtr: 0, totalNetWeight: 0, totalGrossWeight: 0, totalPrice: 0, summary: [] });
            let { pcs, mtr, totalNetWeight, totalGrossWeight, totalPrice, summary } = totals;
            let update = { pcs, mtr, totalNetWeight, totalGrossWeight, totalPrice, summary };
            let options = { new: true };
            mongoose.model('exportdocs').findByIdAndUpdate(documentId, update, options, function (errDoc, resDoc) {
                if (!!errDoc || !resDoc) {
                    next();
                } else {
                    next();
                }
            });
        }
    });
});


ExportItemSchema.virtual("srNrX").get(function() {
    return !_.isUndefined(this.srNr) ? this.srNr.toString() : "";
});

ExportItemSchema.virtual("pcsX").get(function() {
    return !_.isUndefined(this.pcs) ? this.pcs.toString() : "";
});

ExportItemSchema.virtual("mtrX").get(function() {
    return !_.isUndefined(this.mtr) ? this.mtr.toString() : "";
});

ExportItemSchema.virtual("totalNetWeightX").get(function() {
    return !_.isUndefined(this.totalNetWeight) ? this.totalNetWeight.toString() : "";
});

ExportItemSchema.virtual("totalGrossWeightX").get(function() {
    return !_.isUndefined(this.totalGrossWeight) ? this.totalGrossWeight.toString() : "";
});

ExportItemSchema.virtual("unitPriceX").get(function() {
    return !_.isUndefined(this.unitPrice) ? this.unitPrice.toString() : "";
});

ExportItemSchema.virtual("totalPriceX").get(function() {
    return !_.isUndefined(this.totalPrice) ? this.totalPrice.toString() : "";
});

ExportItemSchema.set('toJSON', { virtuals: true });

module.exports= ExportItem = mongoose.model('exportitems', ExportItemSchema);