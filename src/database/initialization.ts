import mongoose, { ConnectOptions } from 'mongoose';

mongoose.Promise = global.Promise;

const mongooseUris = 'mongodb://localhost:27017';
const mongooseConnectOptions: ConnectOptions = {
  dbName: 'low-messenger',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
};

const mongooseConfig = {
  uris: mongooseUris,
  options: mongooseConnectOptions
};

mongoose.connect(mongooseConfig.uris, mongooseConfig.options)
  .then((data) => {
    // console.log(data);
  })
  .catch((err) => {
    console.error(err);
  });

mongoose.connection.on('connected', () => {
  console.info('\x1b[32m', `Connected to ${mongooseConfig.options.dbName} db`);
});

mongoose.connection.on('error', () => {
  console.error('\x1b[31m', `Cannot connect to ${mongooseConfig.options.dbName} db`);
});

export {
  mongoose
};
