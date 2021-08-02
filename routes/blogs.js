const bcrypt = require('bcryptjs');

// Models
const Blog = require('../models/Blogs');
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
  // @name        Create Blog
  // @method      POST
  // @route       /blogs
  // @access      Public
  app.post('/blogs', async (req, res) => {
    try {
      const { title, body } = req.body;
      let user_id = req.header('x-auth-user');
      let userObject;

      // check if user exists
      try {
        userObject = await User.findById(user_id);
      } catch (err) {
        return status400(res, `Invalid ID.`);
      }

      const newBlog = new Blog({
        title,
        body,
        user: userObject,
      });

      const blog = await newBlog.save();
      res.json(blog);
    } catch (err) {
      console.log(err);
      return status500(res, err);
    }
  });

  // @name        Get Blogs
  // @method      GET
  // @route       /blogs
  // @access      Public
  app.get('/blogs', async (req, res) => {
    try {
      const blogs = await Blog.find();
      res.json(blogs);
    } catch (err) {
      console.log(err);
      return status500(res, err);
    }
  });

  // @name        Update Blog
  // @method      PUT
  // @route       /blogs/:id
  // @access      Public
  app.put('/blogs/:id', async (req, res) => {
    try {
      const { title, body } = req.body;
      const blog_id = req.params.id;
      let user_id = req.header('x-auth-user');
      let userObject;
      let blog;

      try {
        userObject = await User.findById(user_id);

        blog = await Blog.findOne({
          _id: blog_id,
          user: userObject,
        });
        if (blog) {
          // build new blog object
          const newBlogObject = {};
          if (title) newBlogObject.title = title;
          if (body) newBlogObject.body = body;

          const updatedBlog = await Blog.findByIdAndUpdate(
            blog_id,
            { $set: newBlogObject },
            { new: true }
          );

          res.json(newBlogObject);
        } else {
          return status400(res, `Blog not found or User does not own blog.`);
        }
      } catch (err) {
        if (!userObject) {
          return status400(res, `Invalid user ID.`);
        }
      }
    } catch (err) {
      console.log(err);
      return status500(res, err);
    }
  });

  // @name        Delete Blog
  // @method      DELETE
  // @route       /blogs/:id
  // @access      Public
  app.delete('/blogs/:id', async (req, res) => {
    try {
      const blog_id = req.params.id;
      let user_id = req.header('x-auth-user');

      try {
        userObject = await User.findById(user_id);

        blog = await Blog.findOne({
          _id: blog_id,
          user: userObject,
        });
        if (blog) {
          await Blog.findByIdAndDelete(blog_id);
          status200(res, `Blog with id '${blog_id}' deleted.`);
        } else {
          return status400(res, `Blog not found or User does not own blog.`);
        }
      } catch (err) {
        if (!userObject) {
          return status400(res, `Invalid user ID.`);
        }
      }
    } catch (err) {
      console.log(err);
      return status500(res, err);
    }
  });
};

module.exports = routes;
