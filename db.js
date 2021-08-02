const mongoose = require('mongoose');
require('dotenv').config();

let connection_uri = process.env.mongo_db_connection_string;

const connect = async () => {
  try {
    await mongoose.connect(connection_uri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB (mongo).');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connect;
