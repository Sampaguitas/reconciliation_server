const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    let filter = { _id: data.id };
    let update = { userName: data.userName, name: data.name, email: data.email};
    let options = { new: true };

    User.findOneAndUpdate(filter, update, options, function (err, user) {
        console.log('user:', user);
        if (err) {
            return res.status(400).json({ message: 'An error has occured.'});
        } else if (!user) {
            return res.status(400).json({ message: 'User could not be updated.'});
        } else {
            return res.status(200).json({ message: 'User has successfully been updated.' });
        }
    });
});

module.exports = router;

//https://webapplog.com/express-js-and-mongoose-example-building-hackhall/