const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let user = req.body;
  // validate the user
  // hash the password
  const hash = bcrypt.hashSync(user.password, 8);
  // we override the password with the hash
  user.password = hash;
  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;
  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          res.status(200).json({ message: `Welcome ${user.username}!` });
        } else {
          res.status(401).json({ message: 'You cannot pass!!' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  } else {
    res.status(400).json({ message: 'please provide credentials' });
  }
});

server.get('/api/users', protected, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get('/hash', (req, res) => {
  const password = req.headers.authorization;
  const hash = bcrypt.hashSync(password, 8);
  res.status(200).json({hash})
});


// implement the protected middleware that will check for username and password
// in the headers and if valid provide access to the endpoint
function protected() {
  
}

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
