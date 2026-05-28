import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-z0-9_]+$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  avatar: {
    url:      { type: String, default: null },
    publicId: { type: String, default: null },
  },
  bio: {
    type: String,
    maxlength: 160,
    default: '',
  },
  targetLanguage: { type: String, default: '' },
  nativeLanguage: { type: String, default: 'en' },
  refreshToken: { type: String, select: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    this.updatedAt = Date.now()
    next()
  } catch (err) {
    next(err)
  }
})

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toPublicJSON = function () {
  return {
    id:             this._id,
    name:           this.name,
    username:       this.username,
    email:          this.email,
    avatar:         this.avatar,
    bio:            this.bio,
    targetLanguage: this.targetLanguage,
    nativeLanguage: this.nativeLanguage,
    createdAt:      this.createdAt,
  }
}

export default mongoose.model('User', userSchema)