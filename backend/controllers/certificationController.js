const Certification = require('../models/Certification');
const User = require('../models/User');

// Create a new certification
exports.createCertification = async (req, res) => {
    try {
        const {
            title,
            provider,
            type,
            duration,
            cost,
            description,
            applicationLink
        } = req.body;

        // Validate required fields
        if (!title || !provider || !type || !description || !applicationLink) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Create new certification
        const certification = new Certification({
            title,
            provider,
            type,
            duration,
            cost,
            description,
            applicationLink,
            postedBy: req.user.id
        });

        await certification.save();

        // Populate postedBy field
        await certification.populate('postedBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Certification created successfully',
            data: certification
        });

    } catch (error) {
        console.error('Error creating certification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create certification',
            details: error.message
        });
    }
};

// Get all certifications
exports.getAllCertifications = async (req, res) => {
    try {
        const { type, isActive, page = 1, limit = 10 } = req.query;

        const query = {};

        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const certifications = await Certification.find(query)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Certification.countDocuments(query);

        res.json({
            success: true,
            data: certifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching certifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch certifications'
        });
    }
};

// Get certification by ID
exports.getCertificationById = async (req, res) => {
    try {
        const { id } = req.params;

        const certification = await Certification.findById(id)
            .populate('postedBy', 'name email');

        if (!certification) {
            return res.status(404).json({
                success: false,
                error: 'Certification not found'
            });
        }

        // Increment views
        certification.views += 1;
        await certification.save();

        res.json({
            success: true,
            data: certification
        });

    } catch (error) {
        console.error('Error fetching certification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch certification'
        });
    }
};

// Update certification
exports.updateCertification = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.postedBy;
        delete updateData.isVerified;
        delete updateData.views;
        delete updateData.applications;

        const certification = await Certification.findById(id);

        if (!certification) {
            return res.status(404).json({
                success: false,
                error: 'Certification not found'
            });
        }

        // Check if user is the owner or admin
        if (certification.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this certification'
            });
        }

        const updatedCertification = await Certification.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('postedBy', 'name email');

        res.json({
            success: true,
            message: 'Certification updated successfully',
            data: updatedCertification
        });

    } catch (error) {
        console.error('Error updating certification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update certification'
        });
    }
};

// Delete certification
exports.deleteCertification = async (req, res) => {
    try {
        const { id } = req.params;

        const certification = await Certification.findById(id);

        if (!certification) {
            return res.status(404).json({
                success: false,
                error: 'Certification not found'
            });
        }

        // Check if user is the owner or admin
        if (certification.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this certification'
            });
        }

        await Certification.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Certification deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting certification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete certification'
        });
    }
};

// Get certifications by user
exports.getCertificationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const certifications = await Certification.find({ postedBy: userId, isActive: true })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: certifications
        });

    } catch (error) {
        console.error('Error fetching user certifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user certifications'
        });
    }
};

// Toggle certification status
exports.toggleCertificationStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const certification = await Certification.findById(id);

        if (!certification) {
            return res.status(404).json({
                success: false,
                error: 'Certification not found'
            });
        }

        // Check if user is the owner or admin
        if (certification.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to modify this certification'
            });
        }

        certification.isActive = !certification.isActive;
        await certification.save();

        res.json({
            success: true,
            message: `Certification ${certification.isActive ? 'activated' : 'deactivated'} successfully`,
            data: certification
        });

    } catch (error) {
        console.error('Error toggling certification status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle certification status'
        });
    }
};
