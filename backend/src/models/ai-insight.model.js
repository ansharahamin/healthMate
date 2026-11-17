import mongoose from 'mongoose'

const abnormalValueSchema = new mongoose.Schema({
    testName: {
        type: String,
        required: true,
        trim: true,
    },
    result: {
        type: String,
        required: true,
        trim: true,
    },
    referenceRange: {
        type: String,
        trim: true,
        default: '',
    },
    status: {
        type: String,
        required: true,
        enum: ['high', 'low', 'abnormal'],
    },
    explanation: {
        type: String,
        required: true,
        trim: true,
    },
}, { _id: false })

const aiInsightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true,
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'files',
        required: true,
        index: true,
    },
    summaryEnglish: {
        type: String,
        required: true,
        trim: true,
    },
    summaryRomanUrdu: {
        type: String,
        required: true,
        trim: true,
    },
    keyFindings: {
        type: [{ type: String, trim: true }],
        default: [],
    },
    recommendations: {
        type: [{ type: String, trim: true }],
        default: [],
    },
    abnormalValues: {
        type: [abnormalValueSchema],
        default: [],
    },
    doctorQuestions: {
        type: [String],
        default: [],
    },
    foodSuggestionsToAvoid: {
        type: [String],
        default: [],
    },
    foodSuggestionsToPrefer: {
        type: [String],
        default: [],
    },
    homeRemedies: {
        type: [String],
        default: [],
    },
    doctorNote: {
        type: String,
        required: true,
        default: 'Always consult your doctor before making any decision.',
    },
}, { timestamps: true })

aiInsightSchema.index({ userId: 1, createdAt: -1 })

const aiInsightModel = mongoose.model('ai-insights', aiInsightSchema, 'ai_insights')
export default aiInsightModel
