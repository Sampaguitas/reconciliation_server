const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const _ = require('lodash');

router.post('/', (req, res) => {
    let { sort, filter, pageSize } = req.body;
    let nextPage = req.body.nextPage || 1;
    if (!pageSize) {
        res.status(400).json({message: 'pageSize should be greater than 0.'});
    } else {
        User
        .find({
            userName : { $regex: new RegExp(escape(filter.userName),'i') },
            name : { $regex: new RegExp(escape(filter.name),'i') },
            email : { $regex: new RegExp(escape(filter.email),'i') },
            isAdmin: { $in: filterBool(filter.isAdmin)},
        })
        .sort({
            [!!sort.name ? sort.name : 'name']: sort.isAscending === false ? -1 : 1
        })
        // .skip((nextPage - 1) * pageSize)
        // .limit(pageSize)
        .exec(function (err, users) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.' });
            } else {
                let pageLast = Math.ceil(users.length / pageSize) || 1;
                let sliced = users.slice((nextPage - 1) * pageSize, ((nextPage - 1) * pageSize) + pageSize);
                let firstItem = !_.isEmpty(sliced) ? ((nextPage - 1) * pageSize) + 1 : 0;
                let lastItem = !_.isEmpty(sliced) ? firstItem + sliced.length - 1 : 0;
                return res.json({
                    users: sliced,
                    currentPage: nextPage,
                    firstItem: firstItem,
                    lastItem: lastItem,
                    pageItems: sliced.length,
                    pageLast: pageLast,
                    totalItems: users.length,
                    first: nextPage < 4 ? 1 : (nextPage === pageLast) ? nextPage - 2 : nextPage - 1,
                    second: nextPage < 4 ? 2 : (nextPage === pageLast) ? nextPage - 1 : nextPage,
                    third: nextPage < 4 ? 3 : (nextPage === pageLast) ? nextPage : nextPage + 1,
                });
            }
        });
    } 
});

module.exports = router;

function filterBool(element) {
    switch (element) {
        case 'false': return [false];
        case 'true': return [true];
        default: return [true, false, undefined];
    }
}

function escape(string) {
    if (!_.isUndefined(string)) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    } else {
        return '';
    }
}