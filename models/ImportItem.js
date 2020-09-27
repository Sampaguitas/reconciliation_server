const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const ImportItemSchema = new Schema({
    srNr: {
        type: Number,
        required: true
    },
    invNr: {
        type: String,
        required: true
    },
    poNr: {
        type: String,
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
    pcs: {
        type: Number,
        required: true
    },
    mtr: {
        type: Number,
        required: true
    },
    unitNetWeight: {
        type: Number,
        required: true
    },
    totalNetWeight: {
        type: Number,
        required: true
    },
    unitGrossWeight: {
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
    hsCode: {
        type: String,
        required: true
    },
    hsDesc: {
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
    },
});

ImportItemSchema.post(['save', 'findOneAndUpdate', 'findOneAndDelete'], function(doc, next) {
    let documentId = doc.documentId;
    mongoose.model('importitems').find({ documentId: documentId }, function(errItems, resItems) {
        if (!!errItems || !resItems) {
            next();
        } else {
            let totals = resItems.reduce(function(acc, cur) {
                if (!!cur.invNr && !acc.invNrs.includes(cur.invNr)) {
                    if(acc.invNrs == "") {
                        acc.invNrs = cur.invNr
                    } else {
                        acc.invNrs += `| ${cur.invNr}`
                    }
                }
                if (!!cur.poNr && !acc.poNrs.includes(cur.poNr)) {
                    if(acc.poNrs == "") {
                        acc.poNrs = cur.poNr
                    } else {
                        acc.poNrs += `| ${cur.poNr}`
                    }
                }
                acc.pcs += cur.pcs || 0;
                acc.mtr += cur.mtr || 0;
                acc.totalNetWeight += cur.totalNetWeight || 0;
                acc.totalGrossWeight += cur.totalGrossWeight || 0;
                acc.totalPrice += cur.totalPrice || 0;
                let found = acc.summary.find(element => _.isEqual(element.hsCode, cur.hsCode) && _.isEqual(element.country, cur.country) && _.isEqual(element.hsDesc, cur.hsDesc));
                if (_.isUndefined(found)) {
                    acc.summary.push({
                        hsCode: cur.hsCode,
                        hsDesc: cur.hsDesc,
                        country: cur.country,
                        pcs: cur.pcs,
                        mtr: !!cur.mtr ? cur.mtr : 0,
                        totalNetWeight: cur.totalNetWeight,
                        totalGrossWeight: cur.totalGrossWeight,
                        totalPrice: cur.totalPrice,
                    });
                } else {
                    found.pcs += cur.pcs;
                    if (!!cur.mtr) {
                        found.mtr += cur.mtr;
                    };
                    found.totalNetWeight += cur.totalNetWeight,
                    found.totalGrossWeight += cur.totalGrossWeight;
                    found.totalPrice += cur.totalPrice;
                }
                acc.assignedPcs += cur.assignedPcs || 0;
                acc.assignedMtr += cur.assignedMtr || 0;
                if (!acc.isClosed && acc.assignedPcs >= cur.pcs && acc.assignedMtr >= cur.mtr) {
                    acc.isClosed = true
                }
                return acc;
            }, { invNrs: "", poNrs: "", pcs: 0, mtr: 0, totalNetWeight: 0, totalGrossWeight: 0, totalPrice: 0, summary: [], assignedPcs: 0, assignedMtr: 0, isClosed: false });
            let { invNrs, poNrs, pcs, mtr, totalNetWeight, totalGrossWeight, totalPrice, summary, assignedPcs, assignedMtr, isClosed } = totals;
            let update = { invNrs, poNrs, pcs, mtr, totalNetWeight, totalGrossWeight, totalPrice, summary, assignedPcs, assignedMtr, isClosed };
            let options = { new: true };
            mongoose.model('importdocs').findByIdAndUpdate(documentId, update, options, function (errDoc, resDoc) {
                if (!!errDoc || !resDoc) {
                    next();
                } else {
                    next();
                }
            });
        }
    });
});


ImportItemSchema.virtual("srNrX").get(function() {
    return !_.isUndefined(this.srNr) ? this.srNr.toString() : "";
});

ImportItemSchema.virtual("pcsX").get(function() {
    return !_.isUndefined(this.pcs) ? this.pcs.toString() : "";
});

ImportItemSchema.virtual("mtrX").get(function() {
    return !_.isUndefined(this.mtr) ? this.mtr.toString() : "";
});

ImportItemSchema.virtual("remainingPcs").get(function() {
    return (this.pcs || 0) - (this.assignedPcs || 0);
});

ImportItemSchema.virtual("remainingMtr").get(function() {
    return (this.mtr || 0) - (this.assignedMtr || 0);
});

ImportItemSchema.virtual("remainingPcsX").get(function() {
    return ((this.pcs || 0) - (this.assignedPcs || 0)).toString();
});

ImportItemSchema.virtual("remainingMtrX").get(function() {
    return ((this.mtr || 0) - (this.assignedMtr || 0)).toString();
});

// ImportItemSchema.virtual("unitNetWeightX").get(function() {
//     return !_.isUndefined(this.unitNetWeight) ? this.unitNetWeight.toString() : "";
// });

ImportItemSchema.virtual("totalNetWeightX").get(function() {
    return !_.isUndefined(this.totalNetWeight) ? this.totalNetWeight.toString() : "";
});

// ImportItemSchema.virtual("unitGrossWeightX").get(function() {
//     return !_.isUndefined(this.unitGrossWeight) ? this.unitGrossWeight.toString() : "";
// });

ImportItemSchema.virtual("totalGrossWeightX").get(function() {
    return !_.isUndefined(this.totalGrossWeight) ? this.totalGrossWeight.toString() : "";
});

ImportItemSchema.virtual("unitPriceX").get(function() {
    return !_.isUndefined(this.unitPrice) ? this.unitPrice.toString() : "";
});

ImportItemSchema.virtual("totalPriceX").get(function() {
    return !_.isUndefined(this.totalPrice) ? this.totalPrice.toString() : "";
});

ImportItemSchema.virtual("importdoc", {
    ref: 'importdocs',
    localField: 'documentId',
    foreignField: '_id',
    justOne: true
});

ImportItemSchema.set('toJSON', { virtuals: true });

module.exports= ImportItem = mongoose.model('importitems', ImportItemSchema);