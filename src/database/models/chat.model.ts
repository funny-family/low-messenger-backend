/**
 * handle unique errors
 * https://stackoverflow.com/questions/38945608/custom-error-messages-with-mongoose
 * https://stackoverflow.com/questions/13580589/mongoose-unique-validation-error-type
 */
import { mongoose } from '../initialization';
import uniqueValidator from 'mongoose-unique-validator';

import crypto from 'crypto';

import { checkIfStringIsEmpty } from '../../utils/check-if-string-is-empty.function';

export interface IChatSchema extends mongoose.Document {
  id: string;
  name: string;
  owner_id: string;
  salt: string;
  password_hash: string;
  password: string;
  password_confirmation: string;
  user_IDs: any[];
}

const chatSchema: mongoose.Schema = new mongoose.Schema({
  id: {
    type: String,
    default: mongoose.Types.ObjectId(),
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: [true, 'Chat name is required!']
  },
  owner_id: {
    type: String,
    unique: true,
    // uniqueCaseInsensitive: true,
    // unique: 'Chat must have only one owner!',
    required: [true, 'Chat requires owner!']
  },
  password_hash: {
    type: String,
    required: false
  },
  salt: {
    type: String,
    required: false
  },
  user_IDs: {
    type: Array,
    default: [],
    required: true
  }
}, {
  autoIndex: true,
  versionKey: false,
  timestamps: true
});

chatSchema.plugin(uniqueValidator, {
  type: 'mongoose-unique-validator',
  message: 'Chat must have only one owner!'
});

const pbkdf2SyncOptions = {
  iterations: 100,
  keylen: 100,
  digest: 'sha512'
};

// TODO: improve types!
chatSchema.path('name').validate(function() {
  const minLength = 4;
  // @ts-ignore
  if (this.name && this.name.length < minLength) {
    // @ts-ignore
    this.invalidate('name', `Name must be at least ${minLength} characters!`);
  }
});

// TODO: improve types!
chatSchema.virtual('password')
  // @ts-ignore
  .set(function(password) {
    const isPasswordEmpty = checkIfStringIsEmpty(password);
    if (isPasswordEmpty) {
      return;
    }

    // @ts-ignore
    this._password = password;
    // @ts-ignore
    this.salt = crypto.randomBytes(256).toString('base64');
    // @ts-ignore
    this.password_hash = crypto.pbkdf2Sync(
      password,
      // @ts-ignore
      this.salt,
      pbkdf2SyncOptions.iterations,
      pbkdf2SyncOptions.keylen,
      pbkdf2SyncOptions.digest
    );
  })
  .get(function() {
    // @ts-ignore
    return this._password;
  });

// TODO: improve types!
chatSchema.virtual('password_confirmation')
  // @ts-ignore
  .set(function(passwordConfirmation) {
    // @ts-ignore
    this._password_confirmation = passwordConfirmation;
  })
  .get(function() {
    // @ts-ignore
    return this._password_confirmation;
  });

// TODO: improve types!
chatSchema.path('password_hash').validate(function() {
  const minLength = 4;
  const isPasswordEmpty = (
    // @ts-ignore
    this._password === '' ||
    // @ts-ignore
    this._password === undefined ||
    // @ts-ignore
    this._password.trim() === '' ||
    // @ts-ignore
    String(this._password).trim() === '' ||
    // @ts-ignore
    this._password.length <= 0
  );

  // @ts-ignore
  if (!isPasswordEmpty && this._password.length < minLength) {
    // @ts-ignore
    this.invalidate('password', `Password must be at lest ${minLength} characters!`);
  }

  // @ts-ignore
  if (!isPasswordEmpty && !this._password_confirmation) {
    // @ts-ignore
    this.invalidate('password_confirmation', 'Password confirmation is required!');
  }

  // @ts-ignore
  if (!isPasswordEmpty && this._password !== this._password_confirmation) {
    // @ts-ignore
    this.invalidate('password_confirmation', 'Passwords must match!');
  }
// // @ts-ignore
// }, null);
});

// TODO: improve types!
// @ts-ignore
chatSchema.methods.checkPassword = function(password) {
  if (!password) {
    return false;
  }

  // @ts-ignore
  if (!this.password_hash) {
    return false;
  }

  // @ts-ignore
  if (!password || !password.trim() || !String(password).trim() || !this.password_hash) {
    return false;
  }

  const isPasswordValid = String(crypto.pbkdf2Sync(
    password,
    // @ts-ignore
    this.salt,
    pbkdf2SyncOptions.iterations,
    pbkdf2SyncOptions.keylen,
    pbkdf2SyncOptions.digest
    // @ts-ignore
  )) === this.password_hash;

  return isPasswordValid;
};

// TODO: improve types!
// @ts-ignore
chatSchema.methods.toJSON = function(chat) {
  const chatObject = this.toObject(chat);

  // // @ts-ignore
  // console.log('password', chatObject.password);

  // @ts-ignore
  delete chatObject.salt;
  // @ts-ignore
  delete chatObject.password_hash;
  // @ts-ignore
  delete chatObject.password;
  // @ts-ignore
  delete chatObject.password_confirmation;

  return chatObject;
};

export const ChatModel = mongoose.model<IChatSchema>('Chat', chatSchema);
