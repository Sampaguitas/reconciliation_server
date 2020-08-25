const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.post('/', (req, res) => {
    let { sort, filter } = req.body;
    User
    .find({
        userName : { $regex: new RegExp(filter.userName,'i') },
        name : { $regex: new RegExp(filter.name,'i') },
        email : { $regex: new RegExp(filter.email,'i') },
        isAdmin: { $in: filterBool(filter.isAdmin)},
    })
    .sort({
        [!!sort.name ? sort.name : 'name']: sort.isAscending === false ? 1 : -1
    })
    .skip(0)
    .limit(10)
    .exec(function (err, users) {
        if (err) {
            console.log(err);
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.json({users: users});
        }
    });
});

module.exports = router;

function filterBool(isAdmin) {
    switch (isAdmin) {
        case 'false': return [false];
        case 'true': return [true];
        default: return [true, false, undefined];
    }
}