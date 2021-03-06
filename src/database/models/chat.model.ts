/**
 * handle unique errors
 * https://stackoverflow.com/questions/38945608/custom-error-messages-with-mongoose
 * https://stackoverflow.com/questions/13580589/mongoose-unique-validation-error-type
 */
import { mongoose } from '../initialization';
import uniqueValidator from 'mongoose-unique-validator';

import crypto from 'crypto';
import { nanoid } from 'nanoid';

import { checkIfStringIsEmpty } from '../../utils/check-if-string-is-empty.function';

export interface IChatSchema extends mongoose.Document {
  entry_key: string;
  name: string;
  owner: string;
  salt: string;
  password_hash: string;
  password: string;
  password_confirmation: string;
  user_IDs: any[];
  has_password: boolean;
}

const chatSchema: mongoose.Schema = new mongoose.Schema(
  {
    entry_key: {
    type: String,
      default: () => nanoid(20),
      unique: true,
      required: true
    },
    name: {
      type: String,
      trim: true,
      required: [true, 'Chat name is required!']
    },
    owner: {
      type: String,
      unique: true,
      required: [true, 'Chat requires owner!']
    },
    password_hash: {
      type: String,
      required: false
    },
    has_password: {
      type: Boolean,
      required: true
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
  },
  {
    autoIndex: true,
    versionKey: false,
    timestamps: true
  }
);

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
chatSchema.path('entry_key').validate(function () {
  const minLength = 20;
  // @ts-ignore
  if (this.entry_key < minLength) {
    // @ts-ignore
    this.invalidate('entry_key', `Entry key must be at least ${minLength}!`);
  }
});

// TODO: improve types!
chatSchema.path('name').validate(function () {
  const minLength = 4;
  // @ts-ignore
  if (this.name && this.name.length < minLength) {
    // @ts-ignore
    this.invalidate('name', `Name must be at least ${minLength} characters!`);
  }
});

// TODO: improve types!
chatSchema
  .virtual('password')
  // @ts-ignore
  .set(function (password) {
    const isPasswordEmpty = checkIfStringIsEmpty(password);
    if (isPasswordEmpty) {
      // @ts-ignore
      this.has_password = false;
      return;
    }

    // @ts-ignore
    this.has_password = true;
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
  .get(function () {
    // @ts-ignore
    return this._password;
  });

// TODO: improve types!
chatSchema
  .virtual('password_confirmation')
  // @ts-ignore
  .set(function (passwordConfirmation) {
    // @ts-ignore
    this._password_confirmation = passwordConfirmation;
  })
  .get(function () {
    // @ts-ignore
    return this._password_confirmation;
  });

// TODO: improve types!
chatSchema.path('password_hash').validate(function () {
  const minLength = 4;
  const isPasswordEmpty =
    // @ts-ignore
    this._password === '' ||
    // @ts-ignore
    this._password === undefined ||
    // @ts-ignore
    this._password.trim() === '' ||
    // @ts-ignore
    String(this._password).trim() === '' ||
    // @ts-ignore
    this._password.length <= 0;

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
});

// TODO: improve types!
// @ts-ignore
chatSchema.methods.verifyPassword = function (password) {
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

  const isPasswordValid =
    String(
      crypto.pbkdf2Sync(
        password,
        // @ts-ignore
        this.salt,
        pbkdf2SyncOptions.iterations,
        pbkdf2SyncOptions.keylen,
        pbkdf2SyncOptions.digest
      )
    // @ts-ignore
    ) === this.password_hash;

  return isPasswordValid;
};

// TODO: improve types!
// @ts-ignore
chatSchema.methods.toJSON = function (chat) {
  const chatObject = this.toObject(chat);

  chatObject.id = chatObject._id;
  delete chatObject._id;

  // @ts-ignore
  delete chatObject.salt;
  // @ts-ignore
  delete chatObject.password_hash;
  // @ts-ignore
  delete chatObject.password;
  // @ts-ignore
  delete chatObject.password_confirmation;

  // @ts-ignore
  chatObject.created_at = chatObject.createdAt;
  // @ts-ignore
  delete chatObject.createdAt;
  // @ts-ignore
  chatObject.updated_at = chatObject.updatedAt;
  // @ts-ignore
  delete chatObject.updatedAt;

  return chatObject;
};

export const ChatModel = mongoose.model<IChatSchema>('Chat', chatSchema);
