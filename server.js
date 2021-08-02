const express = require('express');
const connect = require('./db');
const path = require('path');
const app = express();

// Connect Database
connect();

// Allow node to use JSON
app.use(express.json({ extended: false }));

// Routes
require('./routes/users')(app);
require('./routes/blogs')(app);

// Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
//   // Set static folder
//   app.use(express.static('client/build'));

//   app.get('*', (req, res) =>
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
//   );
// }

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}.`));
