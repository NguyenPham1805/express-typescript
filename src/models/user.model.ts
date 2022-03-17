import { Document, Schema, model } from 'mongoose'

export interface UserDocument extends Document {
  displayName: string
  username: string
  email: string
  password: string
  photoUrl?: string
  createdAt: Date
  updateAt: Date
}

const userSchema = new Schema(
  {
    displayName: { type: String, require: true, minlength: 6, maxlength: 30 },
    username: { type: String, require: true, minlength: 6 },
    password: { type: String, require: true, minlength: 8 },
    email: { type: String, require: true },
    photoUrl: { type: String }
  },
  { timestamps: true }
)

export default model<UserDocument>('user', userSchema)
