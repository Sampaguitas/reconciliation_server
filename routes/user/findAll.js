const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.post('/', (req, res) => {
    let { sort, filter, pageSize } = req.body;
    let nextPage = req.body.nextPage || 1;
    console.log('nextPage:', nextPage);
    console.log('pageSize:', pageSize);
    if (!pageSize) {
        res.status(400).json({message: 'pageSize should be greater than 0.'});
    } else {
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
        .skip((nextPage - 1) * pageSize)
        // .limit(pageSize)
        .exec(function (err, users) {
            if (err) {
                console.log(err);
                return res.status(400).json({ message: 'An error has occured.' });
            } else {
                return res.json({
                    users: users.slice(0, pageSize -1),
                    currentPage: nextPage,
                    totalItems: users.length,
                    pageLast: Math.ceil(users.length / pageSize)
                });
            }
        });
    } 
});

module.exports = router;

function filterBool(isAdmin) {
    switch (isAdmin) {
        case 'false': return [false];
        case 'true': return [true];
        default: return [true, false, undefined];
    }
}