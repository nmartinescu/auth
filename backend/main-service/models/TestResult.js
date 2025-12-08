import mongoose from 'mongoose';

const TestResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    config: {
        includeScheduling: { type: Boolean, required: true },
        includeMemory: { type: Boolean, required: true },
        includeDisk: { type: Boolean, required: true },
        numQuestions: { type: Number, required: true },
        difficulty: { 
            type: String, 
            required: true,
            enum: ['easy', 'medium', 'hard']
        }
    },
    questions: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    userAnswers: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },
    summary: {
        totalQuestions: { type: Number, required: true },
        answeredQuestions: { type: Number, required: true },
        correctAnswers: { type: Number, required: true },
        totalScore: { type: Number, required: true },
        percentage: { type: Number, required: true }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
TestResultSchema.index({ userId: 1, createdAt: -1 });

const TestResult = mongoose.model('TestResult', TestResultSchema);

export default TestResult;
