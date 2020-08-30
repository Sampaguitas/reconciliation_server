const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.post('/', (req, res) => {
    let { sort, filter, pageSize } = req.body;
    let nextPage = req.body.nextPage || 1;
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
                return res.status(400).json({ message: 'An error has occured.' });
            } else {
                let pageLast = Math.ceil(users.length / pageSize);
                return res.json({
                    users: users.slice(0, pageSize -1),
                    currentPage: nextPage,
                    totalItems: users.length,
                    pageLast: pageLast,
                    first: nextPage < 4 ? 1 : (nextPage === pageLast) ? nextPage - 2 : nextPage - 1,
                    second: nextPage < 4 ? 2 : (nextPage === pageLast) ? nextPage - 1 : nextPage,
                    third: nextPage < 4 ? 3 : (nextPage === pageLast) ? nextPage : nextPage + 1,
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