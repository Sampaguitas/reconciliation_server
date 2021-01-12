const express = require('express');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const glob = require('glob');
const _ = require('lodash');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const fs = require('fs');

const app = express();

// app.use(cors());
var whitelist = ['http://localhost:8080', 'http://localhost:5555', 'https://reconciliation-client.herokuapp.com']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
        } else {
        callback(new Error('Not allowed by CORS'))
        }
    },
    maxAge: 600
}
app.use(cors(corsOptions));

//bodyParser middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Passport config file
app.use(passport.initialize());
require('./models/index');
require('./config/passport')(passport);

//DB config
const db = require('./config/keys').mongoURI;

//Connect to MongoDB
mongoose
.connect(db,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Listen on port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));

//exportdoc
app.use('/exportdoc/create', passport.authenticate('jwt', { session: false }), require('./routes/exportdoc/create'));
app.use('/exportdoc/delete', passport.authenticate('jwt', { session: false }), require('./routes/exportdoc/delete'));
app.use('/exportdoc/downloadFile', passport.authenticate('jwt', { session: false }), require('./routes/exportdoc/downloadFile'));
app.use('/exportdoc/downloadInvoice', passport.authenticate('jwt', { session: false }), require('./routes/exportdoc/downloadInvoice'));
app.use('/exportdoc/findAll', passport.authenticate('jwt', { session: false }), require('./routes/exportdoc/findAll'));
app.use('/exportdoc/findOne', passport.authenticate('jwt', { session: false }), require('./routes/exportdoc/findOne'));
app.use('/exportdoc/linkCandidates', passport.authenticate('jwt', { session: false }), require('./routes/exportdoc/linkCandidates'));
app.use('/exportdoc/update', passport.authenticate('jwt', { session: false }), require('./routes/exportdoc/update'));
app.use('/exportdoc/uploadFile', passport.authenticate('jwt', { session: false }), require('./routes/exportdoc/uploadFile'));
//exportitem
app.use('/exportitem/delete', passport.authenticate('jwt', { session: false }), require('./routes/exportitem/delete'));
app.use('/exportitem/downloadDuf', passport.authenticate('jwt', { session: false }), require('./routes/exportitem/downloadDuf'));
app.use('/exportitem/findCandidates', passport.authenticate('jwt', { session: false }), require('./routes/exportitem/findCandidates'));
app.use('/exportitem/update', passport.authenticate('jwt', { session: false }), require('./routes/exportitem/update'));
app.use('/exportitem/uploadDuf', passport.authenticate('jwt', { session: false }), require('./routes/exportitem/uploadDuf'));
//importdoc
app.use('/importdoc/create', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/create'));
app.use('/importdoc/delete', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/delete'));
app.use('/importdoc/downloadFile', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/downloadFile'));
app.use('/importdoc/downloadReport', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/downloadReport'));
app.use('/importdoc/findAll', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/findAll'));
app.use('/importdoc/findOne', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/findOne'));
app.use('/importdoc/linkCandidates', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/linkCandidates'));
app.use('/importdoc/update', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/update'));
app.use('/importdoc/uploadFile', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/uploadFile'));
//importitem
app.use('/importitem/delete', passport.authenticate('jwt', { session: false }), require('./routes/importitem/delete'));
app.use('/importitem/downloadDuf', passport.authenticate('jwt', { session: false }), require('./routes/importitem/downloadDuf'));
app.use('/importitem/update', passport.authenticate('jwt', { session: false }), require('./routes/importitem/update'));
app.use('/importitem/uploadDuf', passport.authenticate('jwt', { session: false }), require('./routes/importitem/uploadDuf'));
//user
app.use('/user/changePwd', passport.authenticate('jwt', { session: false }), require('./routes/user/changePwd'));
app.use('/user/create', passport.authenticate('jwt', { session: false }), require('./routes/user/create'));
app.use('/user/delete', passport.authenticate('jwt', { session: false }), require('./routes/user/delete'));
app.use('/user/findAll', passport.authenticate('jwt', { session: false }), require('./routes/user/findAll'));
app.use('/user/findOne', passport.authenticate('jwt', { session: false }), require('./routes/user/findOne'));
app.use('/user/login', require('./routes/user/login'));
app.use('/user/requestPwd', require('./routes/user/requestPwd'));
app.use('/user/resetPwd', require('./routes/user/resetPwd'));
app.use('/user/setAdmin', passport.authenticate('jwt', { session: false }), require('./routes/user/setAdmin'));
app.use('/user/update', passport.authenticate('jwt', { session: false }), require('./routes/user/update'));
app.use('/user/updatePwd', passport.authenticate('jwt', { session: false }), require('./routes/user/updatePwd'));
//transaction
app.use('/transaction/delete', passport.authenticate('jwt', { session: false }), require('./routes/transaction/delete'));
app.use('/transaction/update', passport.authenticate('jwt', { session: false }), require('./routes/transaction/update'));
app.use('/transaction/upsert', passport.authenticate('jwt', { session: false }), require('./routes/transaction/upsert'));