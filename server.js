const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const { expressjwt } = require('express-jwt'); 
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const port = 3000;

const secretkey = 'My super secret key';

const jwtMW = expressjwt({
    secret: secretkey,
    algorithms: ['HS256']
});

let users = [
    { id: 1, username: 'admin', password: 'admin' },
    { id: 2, username: 'user', password: 'user' }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    let foundUser = null;

    for (let user of users) {
        if (user.username === username && user.password === password) {
            foundUser = user;
            break;
        }
    }

    if (foundUser) {
        let token = jwt.sign(
            { id: foundUser.id, username: foundUser.username },
            secretkey,
            { expiresIn: '3m' } // Token expires in 3 minutes
        );
        res.json({ success: true, err: null, token });
    } else {
        res.status(401).json({ success: false, err: 'Username or password is incorrect' });
    }
}); 

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({ success: true, myContent: 'Secret content that only logged in people can see!!!' });
});

app.get('/api/settings', jwtMW, (req, res) => { // Protected /api/settings with JWT
    res.json({ success: true, myContent: 'Secret settings content!!!' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function err(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ success: false, officialError: err, err: 'Unauthorized access' });
    } else {
        next(err);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
