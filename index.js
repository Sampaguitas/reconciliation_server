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

app.use(cors());
// var whitelist = ['http://localhost:8080', 'http://localhost:5555', 'https://reconciliation-client.herokuapp.com/']
// var corsOptions = {
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1) {
//         callback(null, true)
//         } else {
//         callback(new Error('Not allowed by CORS'))
//         }
//     }
// }
// app.use(cors(corsOptions));

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
//importdoc
app.use('/importdoc/findAll', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/findAll'));
app.use('/importdoc/create', passport.authenticate('jwt', { session: false }), require('./routes/importdoc/create'));