import express from 'express';
import Simulation from '../../models/Simulation.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Route to save a simulation - requires authentication
router.post('/', authenticateToken, async (req, res) => {
    console.log("POST /api/simulations called");
    console.log("Request body:", req.body);
    console.log("User from token:", req.user);
    
    try {
        const { name, type, data } = req.body;
        
        // Validate required fields
        if (!name || !type || !data) {
            console.log("Missing required fields");
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, type, and data are required'
            });
        }
        
        // Validate simulation type
        const validTypes = ['process', 'disk', 'memory'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid simulation type. Must be one of: ${validTypes.join(', ')}`
            });
        }
        
        // Create new simulation
        const simulation = new Simulation({
            userId: req.user.id, // From the authenticated token
            name,
            type,
            data
        });
        
        console.log("About to save simulation:", simulation);
        
        // Save to database
        await simulation.save();
        
        console.log("Simulation saved successfully with ID:", simulation._id);
        
        res.status(201).json({
            success: true,
            message: 'Simulation saved successfully',
            simulationId: simulation._id
        });
    } catch (error) {
        console.error('Error saving simulation:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving simulation',
            error: error.message
        });
    }
});

// Route to get all simulations for the current user - requires authentication
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Find all simulations for this user
        const simulations = await Simulation.find({ 
            userId: req.user.id 
        }).sort({ updatedAt: -1 }); // Sort by most recently updated
        
        res.status(200).json({
            success: true,
            simulations: simulations.map(sim => ({
                id: sim._id,
                name: sim.name,
                type: sim.type,
                createdAt: sim.createdAt,
                updatedAt: sim.updatedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching simulations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching simulations',
            error: error.message
        });
    }
});

// Route to get a specific simulation by ID - requires authentication
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const simulation = await Simulation.findOne({
            _id: req.params.id,
            userId: req.user.id // Ensure it belongs to the current user
        });
        
        if (!simulation) {
            return res.status(404).json({
                success: false,
                message: 'Simulation not found'
            });
        }
        
        res.status(200).json({
            success: true,
            simulation: {
                id: simulation._id,
                name: simulation.name,
                type: simulation.type,
                data: simulation.data,
                createdAt: simulation.createdAt,
                updatedAt: simulation.updatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching simulation:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching simulation',
            error: error.message
        });
    }
});

// Route to delete a simulation - requires authentication
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await Simulation.deleteOne({
            _id: req.params.id,
            userId: req.user.id // Ensure it belongs to the current user
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Simulation not found or you do not have permission to delete it'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Simulation deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting simulation:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting simulation',
            error: error.message
        });
    }
});

export default router;
