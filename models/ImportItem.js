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
    qty: {
        type: Number,
        required: true
    },
    desc: {
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
    }
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
                acc.qty += cur.qty || 0;
                acc.totWeight += cur.totWeight || 0;
                acc.totPrice += cur.totPrice || 0;
                let found = acc.summary.find(element => _.isEqual(element.hsCode, cur.hsCode) && _.isEqual(element.country, cur.country) && _.isEqual(element.hsDesc, cur.hsDesc));
                if (_.isUndefined(found)) {
                    acc.summary.push({
                        hsCode: cur.hsCode,
                        hsDesc: cur.hsDesc,
                        country: cur.country,
                        totPrice: cur.totPrice,
                    });
                } else {
                    found.totPrice += cur.totPrice;
                }
                return acc;
            }, { invNrs: "", poNrs: "", qty: 0, totWeight: 0, totPrice: 0, summary: [] });
            let { invNrs, poNrs, qty, totWeight, totPrice, summary } = totals;
            let update = { invNrs, poNrs, qty, totWeight, totPrice, summary };
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