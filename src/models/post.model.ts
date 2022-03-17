import { Document, Schema, model } from 'mongoose'
import { nanoid } from 'nanoid'
import { UserDocument } from './user.model'

export interface PostDocument extends Document {
  userId: UserDocument['_id']
  title: string
  body?: string
  image?: string
  createAt: Date
  updateAt: Date
}

const postSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    postId: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(10)
    },
    title: { type: String, required: true },
    body: { type: String },
    image: { type: String }
  },
  { timestamps: true }
)

export default model<PostDocument>('post', postSchema)
