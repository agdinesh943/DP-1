const Competition = require('../models/Competition');
const User = require('../models/User');

// Create a new competition
exports.createCompetition = async (req, res) => {
    try {
        const {
            title,
            type,
            organizingBy,
            deadline,
            maxParticipants,
            prizePool,
            description,
            registrationLink
        } = req.body;

        // Validate required fields
        if (!title || !type || !organizingBy || !deadline || !description || !registrationLink) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Create new competition
        const competition = new Competition({
            title,
            type,
            organizingBy,
            deadline,
            maxParticipants,
            prizePool,
            description,
            registrationLink,
            postedBy: req.user.id
        });

        await competition.save();

        // Populate postedBy field
        await competition.populate('postedBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Competition created successfully',
            data: competition
        });

    } catch (error) {
        console.error('Error creating competition:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create competition',
            details: error.message
        });
    }
};

// Get all competitions
exports.getAllCompetitions = async (req, res) => {
    try {
        const { type, isActive, page = 1, limit = 10 } = req.query;

        const query = {};

        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const competitions = await Competition.find(query)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Competition.countDocuments(query);

        res.json({
            success: true,
            data: competitions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching competitions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch competitions'
        });
    }
};

// Get competition by ID
exports.getCompetitionById = async (req, res) => {
    try {
        const { id } = req.params;

        const competition = await Competition.findById(id)
            .populate('postedBy', 'name email');

        if (!competition) {
            return res.status(404).json({
                success: false,
                error: 'Competition not found'
            });
        }

        // Increment views
        competition.views += 1;
        await competition.save();

        res.json({
            success: true,
            data: competition
        });

    } catch (error) {
        console.error('Error fetching competition:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch competition'
        });
    }
};

// Update competition
exports.updateCompetition = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.postedBy;
        delete updateData.isVerified;
        delete updateData.views;
        delete updateData.registrations;

        const competition = await Competition.findById(id);

        if (!competition) {
            return res.status(404).json({
                success: false,
                error: 'Competition not found'
            });
        }

        // Check if user is the owner or admin
        if (competition.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this competition'
            });
        }

        const updatedCompetition = await Competition.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('postedBy', 'name email');

        res.json({
            success: true,
            message: 'Competition updated successfully',
            data: updatedCompetition
        });

    } catch (error) {
        console.error('Error updating competition:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update competition'
        });
    }
};

// Delete competition
exports.deleteCompetition = async (req, res) => {
    try {
        const { id } = req.params;

        const competition = await Competition.findById(id);

        if (!competition) {
            return res.status(404).json({
                success: false,
                error: 'Competition not found'
            });
        }

        // Check if user is the owner or admin
        if (competition.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this competition'
            });
        }

        await Competition.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Competition deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting competition:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete competition'
        });
    }
};

// Get competitions by user
exports.getCompetitionsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const competitions = await Competition.find({ postedBy: userId, isActive: true })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: competitions
        });

    } catch (error) {
        console.error('Error fetching user competitions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user competitions'
        });
    }
};

// Toggle competition status
exports.toggleCompetitionStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const competition = await Competition.findById(id);

        if (!competition) {
            return res.status(404).json({
                success: false,
                error: 'Competition not found'
            });
        }

        // Check if user is the owner or admin
        if (competition.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to modify this competition'
            });
        }

        competition.isActive = !competition.isActive;
        await competition.save();

        res.json({
            success: true,
            message: `Competition ${competition.isActive ? 'activated' : 'deactivated'} successfully`,
            data: competition
        });

    } catch (error) {
        console.error('Error toggling competition status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle competition status'
        });
    }
};
