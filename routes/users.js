const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');

// Res Functions
function status200(res, msg) {
  res.status(200).json({ msg: msg });
}
function status400(res, msg) {
  res.status(400).json({ err: msg });
}
function status500(res, msg) {
  res.status(500).json({ err: `Server Error: ${msg}` });
}

// Routes
const routes = (app) => {
  // @name        Create User
  // @method      POST
  // @route       /users
  // @access      Public
  app.post('/users', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      let user;

      if (name && email && password.length > 5) {
        // check if user unique
        try {
          user = await User.findOne({ email });
        } catch (err) {
          return status400(res, `Invalid email.`);
        }

        if (user) {
          return status400(res, `User with email '${email}' already exists`);
        } else {
          // create user
          user = new User({ name, email, password });
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          // save to db
          try {
            await user.save();
            status200(res, `User '${user.name}' created.`);
          } catch (err) {
            return status500(res, err);
          }
        }
      } else {
        if (!name) {
          return status400(res, `Name field is empty.`);
        } else if (!email) {
          return status400(res, `Email field is empty.`);
        } else if (!password) {
          return status400(res, `Password field is empty.`);
        } else if (password.length < 6) {
          return status400(res, `Password should be 6 or more characters.`);
        }
      }
    } catch (err) {
      console.log(err);
      return status500(res, err);
    }
  });

  // @name        Get User
  // @method      GET
  // @route       /users/:id
  // @access      Public
  app.get('/users/:id', async (req, res) => {
    try {
      const id = req.params.id;
      let user;

      if (id) {
        // check if user exists
        try {
          user = await User.findById(id);
        } catch (err) {
          return status400(res, `Invalid ID.`);
        }

        if (user) {
          res.json(user);
        } else {
          return status400(res, `User does not exist.`);
        }
      } else {
        return status400(res, `Invalid ID.`);
      }
    } catch (err) {
      console.log(err);
      return status500(res, err);
    }
  });

  // @name        Login User
  // @method      POST
  // @route       /users/login
  // @access      Public
  app.post('/users/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      let user;

      if (email && password) {
        // check if user exists
        try {
          user = await User.findOne({ email });
        } catch (err) {
          return status400(res, `Invalid email.`);
        }

        if (user) {
          // check password
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            // return user ID when login successful
            return res.json(user._id);
          } else {
            return status400(res, `Password invalid.`);
          }
        } else {
          return status400(res, `User does not exist.`);
        }
      } else {
        if (!email) {
          return status400(res, `Email field is empty.`);
        } else if (!password) {
          return status400(res, `Password field is empty.`);
        }
      }
    } catch (err) {
      console.log(err);
      return status500(res, err);
    }
  });

  // @name        Update User
  // @method      PUT
  // @route       /users/:id
  // @access      Public
  app.put('/users/:id', async (req, res) => {
    try {
      const { name, email } = req.body;
      const id = req.params.id;
      let user;

      if (email) {
        // check if user exists
        try {
          user = await User.findOne({ email });
        } catch (err) {
          return status400(res, `Invalid email.`);
        }

        // Build new user object
        const newUserObject = {};
        if (name) newUserObject.name = name;
        if (email) newUserObject.email = email;

        if (user) {
          updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: newUserObject },
            { new: true }
          );
          res.json(updatedUser);
        } else {
          return status400(res, `User does not exist.`);
        }
      } else {
        return status400(res, `Email field is empty.`);
      }
    } catch (err) {
      console.log(err);
      return status500(res, err);
    }
  });

  // @name        Delete User
  // @method      DELETE
  // @route       /users/:id
  // @access      Public
  app.delete('/users/:id', async (req, res) => {
    try {
      const id = req.params.id;
      let user;

      // check if user exists
      try {
        user = await User.findById(id);
      } catch (err) {
        return status400(res, `Invalid ID.`);
      }

      if (user) {
        await User.findByIdAndRemove(id);
        status200(res, `User '${user.name}' deleted.`);
      } else {
        return status400(res, `User does not exist.`);
      }
    } catch (err) {
      console.log(err);
      return status500(res, err);
    }
  });
};

module.exports = routes;
