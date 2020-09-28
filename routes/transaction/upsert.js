const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');
const ImportItem = require('../../models/ImportItem');
const ExportItem = require('../../models/ExportItem');

router.post('/', (req, res) => {

    const { importId, exportId } = req.body;

    if (!importId ) {
        return res.status(400).json({ message: 'importId is required.' });
    } else if (!exportId) {
        return res.status(400).json({ message: 'exportId is required.' });
    } else {
        ExportItem.findById(exportId, function(errExport, exportitem) {
            if (!!errExport || !exportitem) {
                res.status(400).json({message: 'Could not retreive exportItem information.'});
            } else {
                ImportItem.findById(importId, function(errImport, importitem) {
                    if (!!errImport || !importitem) {
                        res.status(400).json({message: 'Could not retreive impotItem information.'});
                    } else {
                        let exportRemPcs = Math.max(exportitem.pcs - (exportitem.assignedPcs || 0), 0);
                        let exportRemMtr = Math.max(exportitem.mtr - (exportitem.assignedMtr || 0), 0);
                        let importRemPcs = Math.max(importitem.pcs - (importitem.assignedPcs || 0), 0);
                        let importRemMtr = Math.max(importitem.mtr - (importitem.assignedMtr || 0), 0);
                        let pcs = Math.min(exportRemPcs, importRemPcs);
                        let mtr = Math.min(exportRemMtr, importRemMtr);
                        if (pcs == 0 && mtr == 0) {
                            return res.status(400).json({ message: 'It seems that all quantities have already been imported.'});
                        } else {
                            let conditions = { importId, exportId };
                            let update = { $inc: { pcs, mtr } };
                            options = { new: true, upsert: true };
                            
                            Transaction.findOneAndUpdate(conditions, update, options, function(err, doc) {
                                if (err) {
                                    return res.status(400).json({ message: 'An error has occured.' });
                                } else if (!doc) {
                                    return res.status(400).json({ message: 'transaction could not be created.' });
                                } else {
                                    return res.status(200).json({ message: 'Transaction successfully created.' });
                                }
                            });
                        }
                    }
                });
            }
        })
    }
});

module.exports = router;