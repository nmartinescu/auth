import mongoose from 'mongoose';

const SimulationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Index for faster querying by userId
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['process', 'disk', 'memory'], // Simulation types
    },
    data: {
        type: mongoose.Schema.Types.Mixed, // To store any type of data
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the 'updatedAt' field on save
SimulationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Simulation = mongoose.model('Simulation', SimulationSchema);

export default Simulation;
