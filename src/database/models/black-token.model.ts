import { mongoose } from '../initialization';

interface IBlackTokenSchema extends mongoose.Document {
  token: string;
  creation_date: Date;
}

const blackTokenSchema: mongoose.Schema = new mongoose.Schema(
  {
    token: {
      type: String
    },
    creation_date: {
      type: Date,
      default: Date.now,
      expires: 30
    }
  },
  {
    id: false,
    versionKey: false
  }
);

export const BlackTokenModel = mongoose.model<IBlackTokenSchema>('BlackToken', blackTokenSchema);
