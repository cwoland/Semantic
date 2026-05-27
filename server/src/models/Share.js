import mongoose from 'mongoose'

const shareSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     { type: String, enum: ['word', 'streak', 'session'], required: true },
  data: {
    word:        String,
    translation: String,
    example:     String,
    language:    String,
    streakCount: Number,
    correct:     Number,
    total:       Number,
    deckName:    String,
  },
  slug:      { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Share', shareSchema)