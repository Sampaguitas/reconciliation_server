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
    },
    assignedPcs: {
        type: Number,
        requied: true
    },
    assignedMtr: {
        type: Number,
        requied: true
    },
    isClosed: {
        type: Boolean,
        default: false
    }
});

ExportItemSchema.post(['save', 'findOneAndUpdate', 'findOneAndDelete'], function(doc, next) {
    let documentId = doc.documentId;
    mongoose.model('exportitems')
    .find({ documentId: documentId })
    .populate({
        path: 'transactions',
        populate: {
            path: 'importitem'
        }
    })
    .exec(function(errItems, resItems) {
        if (!!errItems || !resItems) {
            next();
        } else {
            let totals = resItems.reduce(function(acc, cur) {
                acc.pcs += cur.pcs || 0;
                acc.mtr += cur.mtr || 0;
                acc.totalNetWeight += cur.totalNetWeight || 0;
                acc.totalGrossWeight += cur.totalGrossWeight || 0;
                acc.totalPrice += cur.totalPrice || 0;
                cur.transactions.forEach(transaction => {
                    let found = acc.summary.find(element => _.isEqual(element.hsCode, transaction.importitem.hsCode) && _.isEqual(element.country, transaction.importitem.country) && _.isEqual(element.hsDesc, transaction.importitem.hsDesc));
                    if (_.isUndefined(found)) {
                        acc.summary.push({
                            hsCode: transaction.importitem.hsCode,
                            hsDesc: transaction.importitem.hsDesc,
                            country: transaction.importitem.country,
                            pcs: transaction.pcs || 0,
                            mtr: transaction.mtr || 0,
                            totalNetWeight: transaction.importitem.unitNetWeight * transaction.pcs || 0,
                            totalGrossWeight: transaction.importitem.unitGrossWeight * transaction.pcs || 0,
                            totalPrice: cur.unitPrice * transaction.pcs,
                        });
                    } else {
                        found.pcs += transaction.pcs || 0;
                        found.mtr += transaction.mtr || 0;
                        found.totalNetWeight += (transaction.importitem.unitNetWeight * transaction.pcs) || 0;
                        found.totalGrossWeight += transaction.importitem.unitGrossWeight * transaction.pcs || 0;
                        found.totalPrice += cur.unitPrice * transaction.pcs;
                    }
                });
                acc.assignedPcs += cur.assignedPcs || 0;
                acc.assignedMtr += cur.assignedMtr || 0;
                if (!acc.isClosed && acc.assignedPcs >= cur.pcs && acc.assignedMtr >= cur.mtr) {
                    acc.isClosed = true
                }
                return acc;
            }, { pcs: 0, mtr: 0, totalNetWeight: 0, totalGrossWeight: 0, totalPrice: 0, summary: [], assignedPcs: 0, assignedMtr: 0, isClosed: false });
            let { pcs, mtr, totalNetWeight, totalGrossWeight, totalPrice, summary, assignedPcs, assignedMtr, isClosed } = totals;
            let update = { pcs, mtr, totalNetWeight, totalGrossWeight, totalPrice, summary, assignedPcs, assignedMtr, isClosed };
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

ExportItemSchema.virtual("remainingPcs").get(function() {
    return (this.pcs || 0) - (this.assignedPcs || 0);
});

ExportItemSchema.virtual("remainingMtr").get(function() {
    return (this.mtr || 0) - (this.assignedMtr || 0);
});

ExportItemSchema.virtual("remainingPcsX").get(function() {
    return ((this.pcs || 0) - (this.assignedPcs || 0)).toString();
});

ExportItemSchema.virtual("remainingMtrX").get(function() {
    return ((this.mtr || 0) - (this.assignedMtr || 0)).toString();
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

ExportItemSchema.virtual("transactions", {
    ref: 'transactions',
    localField: '_id',
    foreignField: 'exportId',
    justOne: false
});

ExportItemSchema.set('toJSON', { virtuals: true });

module.exports= ExportItem = mongoose.model('exportitems', ExportItemSchema);