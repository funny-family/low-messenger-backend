import { mongoose } from '../initialization';

export interface IUserSchema extends mongoose.Document {
  name: string;
  avatar: string;
}

const userSchema: mongoose.Schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name is required!']
  },
  avatar: {
    type: String,
    default: 'avatar lol!', // need to create (random) avatar on server side latter!
    required: false
  }
}, {
  versionKey: false,
  timestamps: true
});

// TODO: improve types!
userSchema.path('name').validate(function() {
  const minLength = 4;
  // @ts-ignore
  if (this.name.length < minLength) {
    // @ts-ignore
    this.invalidate('name', `Name must be at least ${minLength} characters!`);
  }
});

// TODO: improve types!
// @ts-ignore
userSchema.methods.toJSON = function(user) {
  const userData = this.toObject(user);

  return userData;
}

export const UserModel = mongoose.model<IUserSchema>('User', userSchema);
