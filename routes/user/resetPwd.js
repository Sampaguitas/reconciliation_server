const express = require('express');
const router = express.Router();
const User = require('../../models/User'); //
const ResetPassword = require('../../models/ResetPassword'); //
const bcrypt = require('bcrypt');

router.put('/', (req, res) => {

    const userId = req.body.userId;
    const token = decodeURI(req.body.token);
    const newPwd = req.body.newPwd;
    
    let query = {userId, token, status: 0, expiry: { "$lt": new Date() }}
    let update = { $set: {status: 1} }
    let options = {new : true, upsert: false }
    
    ResetPassword.findOneAndUpdate(query, update, options, function (errResetPassword, resResetPassword){
        if (errResetPassword) {
            return res.status(400).json({ message: 'An error has occured.'});
        } else if (!resResetPassword) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        } else {
            bcrypt.genSalt(10, (errSalt, salt) => {
                if (errSalt || !salt) {
                    return res.status(400).json({ message: 'Error generating salt.' });
                } else {
                    bcrypt.hash(newPwd, salt, (errHash, hash) => {
                        if (errHash || !hash) {
                            return res.status(400).json({ message: 'Error generating hash.' });                            
                        } else {
                            User.findByIdAndUpdate({_id: userId}, { $set: {password: hash} }, function (errUser, resUser) {
                                if (errUser || !resUser) {
                                    return res.status(400).json({ message: 'Error updating password.' });
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
});

module.exports = router;
