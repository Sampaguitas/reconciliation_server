const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');
const _ = require('lodash');

router.delete('/', async (req, res) => {
    const documentId = req.body.documentId;

    if (_.isEmpty(documentId)) {
        return res.status(400).json({message: 'documentId is missing.'});
    } else {
        ImportDoc.findByIdAndDelete(documentId, function (err, doc) {
            if (!!err || !doc) {
                return res.status(400).json({message: 'Document could not be deleted.'});
            } else {
                return res.status(400).json({message: 'Document has successfully been deleted.'});
            }
        });
    }
});

module.exports = router;