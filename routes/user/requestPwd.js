const express = require('express');
const router = express.Router();
const User = require('../../models/User'); //
const ResetPassword = require('../../models/ResetPassword'); //
const crypto = require('crypto');
const moment = require('moment');
const nodemailer = require("nodemailer");
const keys = require('../../config/keys');

let transporter = nodemailer.createTransport({
    host: keys.mailerHost,
    port: keys.mailerPort,
    secure: false,
    auth: {
      user: keys.mailerAuthUser, 
      pass: keys.mailerAuthPass
    }
  });

router.post('/', (req, res) => {
    const email = req.body.email.toLowerCase();
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    } else {
        User.findOne({email}, function(err, user) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.' });
            } else if (!user) {
                return res.status(400).json({ message: 'User does not exist.' });
            } else {
                let token = crypto.randomBytes(32).toString('hex');
                let query = { userId: user._id, status: 0 }
                let update = {token: token, expire: moment.utc().add(3600, 'seconds')}
                let options = {new: true, upsert: true}
                ResetPassword.findOneAndUpdate(query, update, options, function (errResetPassword, resResetPassword) {
                    if (errResetPassword || !resResetPassword) {
                        return res.status(400).json({message: 'Error generating hashed token.'});
                    } else {
                        let mailOptions = {
                            from: keys.myName + ' <' + keys.mailerAuthUser + '>',
                            to: user.email,
                            subject: 'Reset your account password',
                            html: '<h2>Reconciliation Database (RDB)</h2>' +
                            '<p>Hi,</p>' +
                            `<p>Please click on the following <a href=${keys.apiUrl}/resetpwd?id=${user._id}&token=${encodeURI(token)}>link</a> within the next hour to reset your password,</p>` +
                            '<p>If you have not requested for a new password, call me on the follwoing number: <a href="tel:' + keys.myPhone + '">' + keys.myPhone +'</a></p>' +
                            '<p>Thanks,</p>' +
                            '<br/>' +
                            '<p>' + keys.myName + '</p>' +
                            '<p>' + keys.myPosition + '</p>' +
                            '<b>Van Leeuwen Pipe and Tube</b>'
                        };
                        transporter.sendMail(mailOptions, (errSendMail, resSendMail) => {
                            if (errSendMail || !resSendMail) {
                                return res.status(400).json({ message: 'We where not able to send the verificatin link.' });                                            
                            } else {
                                return res.status(200).json({ message: 'Check your email to reset your password.' });
                            }
                        });
                    }
                });
            }
        });
    }   
});

module.exports = router;
