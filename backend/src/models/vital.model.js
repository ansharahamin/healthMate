import mongoose from 'mongoose'

const vitalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: [
            'blood-pressure',
            'blood-sugar',
            'weight',
            'height',
            'heart-rate',
            'temperature',
            'oxygen-saturation',
            'other',
        ],
    },
    value: {
        type: Number,
        min: 0,
        required() {
            return this.type !== 'blood-pressure'
        },
    },
    systolic: {
        type: Number,
        min: 0,
        required() {
            return this.type === 'blood-pressure'
        },
    },
    diastolic: {
        type: Number,
        min: 0,
        required() {
            return this.type === 'blood-pressure'
        },
    },
    unit: {
        type: String,
        trim: true,
        required() {
            return this.type !== 'blood-pressure'
        },
        default() {
            return this.type === 'blood-pressure' ? 'mmHg' : undefined
        },
    },
    recordedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    notes: {
        type: String,
        trim: true,
    },
}, { timestamps: true })

vitalSchema.index({ userId: 1, recordedAt: -1 })

const vitalModel = mongoose.model('vitals', vitalSchema, 'vitals')
export default vitalModel
