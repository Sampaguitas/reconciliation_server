const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../../models/User');

router.put('/', (req, res) => {
    
    const userId = req.user._id;
    const newPassword = req.body.newPassword;

    if (!newPassword) {
        return res.status(400).json({ message: 'You need to provide a valid passowrd.'});
    } else {
        bcrypt.genSalt(10, (errSalt, salt) => {
            if (errSalt || !salt) {
                return res.status(400).json({ message: 'Error generating salt.' });
            } else {
                bcrypt.hash(newPassword, salt, (errHash, hash) => {
                    if (errHash || !hash) {
                        return res.status(400).json({ message: 'Error generating hash.' });                            
                    } else {
                        User.findByIdAndUpdate({_id: userId}, { $set: {password: hash} }, { new: true }, function (errUser, resUser) {
                            if (errUser || !resUser) {
                                return res.status(400).json({ message: 'Your password could not be updated.' });
                            } else {
                                return res.status(200).json({ message: 'Your password has successfully been updated.' });
                            }
                        });
                    }
                });
            }
        });
    }
});

module.exports = router;