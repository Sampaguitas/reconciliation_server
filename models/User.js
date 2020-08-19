const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Setting = require('./Setting');
const _ = require('lodash');

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
});

UserSchema.post('findOneAndDelete', function(doc, next) {
    findSettings(doc._id).then( () => {
        next();
    });
});

function findSettings(userId) {
    return new Promise(function (resolve) {
        if (!userId) {
            resolve();
        } else {
            Setting.find({ userId: userId }, function (err, settings) {
                if (err || _.isEmpty(settings)) {
                    resolve();
                } else {
                    let myPromises = [];
                    settings.map(setting => myPromises.push(deleteSetting(setting._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteSetting(settingId) {
    return new Promise(function(resolve) {
        if (!settingId) {
            resolve();
        } else {
            Setting.findByIdAndDelete(settingId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports= User = mongoose.model('users', UserSchema);


