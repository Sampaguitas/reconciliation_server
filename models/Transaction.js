const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const TransactionSchema = new Schema({
    importId: {
        type: mongoose.SchemaTypes.ObjectId,
        reference: 'importitems'
    },
    exportId: {
        type: mongoose.SchemaTypes.ObjectId,
        reference: 'exportitems'
    },
    pcs: {
        type: Number,
        required: true
    },
    mtr: {
        type: Number,
        default: 0
    }
});

TransactionSchema.post(['save', 'findOneAndUpdate', 'findOneAndDelete'], function(doc, next) {
    let importId = doc.importId;
    mongoose.model('transactions')
    .find({ importId: importId })
    .populate('importitem')
    .exec(function(errTransactions, resTransactions) {
        if (!!errTransactions || !resTransactions) {
            next();
        } else {
            let totals = resTransactions.reduce(function(acc, cur) {
                acc.assignedPcs += cur.pcs;
                acc.assignedMtr += cur.mtr;
                if (!acc.isClosed && acc.assignedPcs >= cur.importitem.pcs && acc.assignedMtr >= cur.importitem.mtr) {
                    acc.isClosed = true
                }
                return acc;
            }, { assignedPcs: 0, assignedMtr: 0, isClosed: false });
            let { assignedPcs, assignedMtr, isClosed } = totals;
            let update = { assignedPcs, assignedMtr, isClosed };
            let options = { new: true };
            mongoose.model('importitems').findByIdAndUpdate(importId, update, options, function (errDoc, resDoc) {
                if (!!errDoc || !resDoc) {
                    next();
                } else {
                    next();
                }
            });
        }
    });
});

TransactionSchema.post(['save', 'findOneAndUpdate', 'findOneAndDelete'], function(doc, next) {
    let exportId = doc.exportId;
    mongoose.model('transactions')
    .find({ exportId: exportId })
    .populate([
        {
            path: 'exportitem'
        },
        {
            path: 'importitem'
        }
    ])
    .exec(function(errTransactions, resTransactions) {
        if (!!errTransactions || !resTransactions) {
            next();
        } else {
            let totals = resTransactions.reduce(function(acc, cur) {
                acc.assignedPcs += cur.pcs;
                acc.assignedMtr += cur.mtr;
                acc.totalNetWeight += cur.importitem.totalNetWeight;
                acc.totalGrossWeight += cur.importitem.totalGrossWeight;
                if (!acc.isClosed && acc.assignedPcs >= cur.exportitem.pcs && acc.assignedMtr >= cur.exportitem.mtr) {
                    acc.isClosed = true
                }
                return acc;
            }, { assignedPcs: 0, assignedMtr: 0, totalNetWeight: 0, totalGrossWeight: 0, isClosed: false });
            let { assignedPcs, assignedMtr, totalNetWeight, totalGrossWeight, isClosed } = totals;
            let update = { assignedPcs, assignedMtr, totalNetWeight, totalGrossWeight, isClosed };
            let options = { new: true };
            mongoose.model('exportitems').findByIdAndUpdate(exportId, update, options, function (errDoc, resDoc) {
                if (!!errDoc || !resDoc) {
                    next();
                } else {
                    next();
                }
            });
        }
    });
});

TransactionSchema.virtual("importitem", {
    ref: 'importitems',
    localField: 'importId',
    foreignField: '_id',
    justOne: true
});

TransactionSchema.virtual("exportitem", {
    ref: 'exportitems',
    localField: 'exportId',
    foreignField: '_id',
    justOne: true
});

TransactionSchema.set('toJSON', { virtuals: true });

module.exports= Transaction = mongoose.model('transactions', TransactionSchema);