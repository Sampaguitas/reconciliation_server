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
var whitelist = ['http://localhost:8080', 'http://localhost:5555', 'https://reconciliation-client.herokuapp.com/']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
        } else {
        callback(new Error('Not allowed by CORS'))
        }
    }
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

//user
const userChangePwd = require('./routes/user/changePwd');
app.put('/user/changePwd', passport.authenticate('jwt', { session: false }), userChangePwd);
const userDelete = require('./routes/user/delete');
app.delete('/user/delete', passport.authenticate('jwt', { session: false }), userDelete);
const userFindAll = require('./routes/user/findAll');
app.get('/user/findAll', passport.authenticate('jwt', { session: false }), userFindAll);
const userFindOne = require('./routes/user/findOne');
app.get('/user/findOne', passport.authenticate('jwt', { session: false }), userFindOne);
const userCreate = require('./routes/user/create');
app.post('/user/create', passport.authenticate('jwt', { session: false }), userCreate);
//open -> login
//open -> requestPwd
//open -> resetPwd

// Compile all routers   
var routeFolders = [],     
routePaths = "./routes"   
glob.sync('**/*', { cwd: routePaths }).forEach(route => {     
    var _isFolder = !_.endsWith(route, '.js')     
    route = '/' + route.replace(/\.[^/.]+$/, '')     
    if (!_.endsWith(route, 'index')) {       
        var _router = require(routePaths + route)       
        app.use(route, _router)       
        if (_isFolder) routeFolders.push(route)     }   })   
        routeFolders.forEach(route => {     var _pathDeindex = routePaths + route + '/deindex.js'     
        if (fs.existsSync(_pathDeindex))       
        app.use(route, require(_pathDeindex))   
    })