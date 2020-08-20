const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../../models/User');

router.put('/', (req, res) => {
    const _id = req.user._id;
    const oldPwd = decodeURI(req.body.oldPwd);
    const newPwd = decodeURI(req.body.newPwd);
    if (!_id){
        return res.status(400).json({message: 'User _id is missing.'});
    } else {
        User.findOne({ _id }, { password:1 }).then(user => {
            if (!user) {
                return res.status(400).json({ message: 'User does not exist.' });
            }
            bcrypt.compare(oldPwd, user.password).then(isMatch => {
                if (!isMatch) {
                    return res.status(400).json({message: 'Your old password is wrong'});
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err || !salt) {
                            return res.status(400).json({message: 'Error generating salt.'});
                        } else {
                            bcrypt.hash(newPwd, salt, (err, hash) => {
                                if (err) {
                                    return res.status(400).json({ message: 'Error generating hashed token.' });
                                }
                                const password = hash;
                                User.findByIdAndUpdate({_id: _id}, { $set: { password: password}} , function (err, pwd) {
                                    if (err || !pwd) {
                                        return res.status(400).json({ message: 'Password could not be updated.' });
                                    } else {
                                        return res.status(200).json({ message: 'Password has successfully been updated' });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
    }
});

module.exports = router;