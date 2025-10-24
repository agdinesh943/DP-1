const ProblemStatement = require('../models/ProblemStatement');
const { protect, authorize } = require('../middleware/auth');

// @desc    Create a new problem statement
// @route   POST /api/problem-statements
// @access  Private (Admin only)
const createProblemStatement = async (req, res) => {
    try {
        const { title, description, objectives, requirements, deadline } = req.body;

        // Validate required fields
        if (!title || !description || !objectives || !requirements) {
            return res.status(400).json({
                success: false,
                error: 'Title, description, objectives, and requirements are required'
            });
        }

        // Create problem statement
        const problemStatement = new ProblemStatement({
            title,
            description,
            objectives,
            requirements,
            deadline: deadline ? new Date(deadline) : null,
            createdBy: req.user.id
        });

        await problemStatement.save();

        // Populate the createdBy field
        await problemStatement.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            data: problemStatement,
            message: 'Problem statement created successfully'
        });
    } catch (error) {
        console.error('Error creating problem statement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create problem statement'
        });
    }
};

// @desc    Get all problem statements
// @route   GET /api/problem-statements
// @access  Public
const getAllProblemStatements = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        // Build filter object
        const filter = {};
        if (status) {
            filter.status = status;
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get problem statements with pagination
        const problemStatements = await ProblemStatement.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Get total count for pagination
        const total = await ProblemStatement.countDocuments(filter);

        res.json({
            success: true,
            data: problemStatements,
            pagination: {
                current: pageNum,
                pages: Math.ceil(total / limitNum),
                total
            }
        });
    } catch (error) {
        console.error('Error fetching problem statements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch problem statements'
        });
    }
};

// @desc    Get a single problem statement
// @route   GET /api/problem-statements/:id
// @access  Public
const getProblemStatement = async (req, res) => {
    try {
        const problemStatement = await ProblemStatement.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!problemStatement) {
            return res.status(404).json({
                success: false,
                error: 'Problem statement not found'
            });
        }

        res.json({
            success: true,
            data: problemStatement
        });
    } catch (error) {
        console.error('Error fetching problem statement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch problem statement'
        });
    }
};

// @desc    Update a problem statement
// @route   PUT /api/problem-statements/:id
// @access  Private (Admin only)
const updateProblemStatement = async (req, res) => {
    try {
        const { title, description, objectives, requirements, deadline, status } = req.body;

        const problemStatement = await ProblemStatement.findById(req.params.id);

        if (!problemStatement) {
            return res.status(404).json({
                success: false,
                error: 'Problem statement not found'
            });
        }

        // Update fields
        if (title) problemStatement.title = title;
        if (description) problemStatement.description = description;
        if (objectives) problemStatement.objectives = objectives;
        if (requirements) problemStatement.requirements = requirements;
        if (deadline !== undefined) problemStatement.deadline = deadline ? new Date(deadline) : null;
        if (status) problemStatement.status = status;

        problemStatement.updatedAt = new Date();

        await problemStatement.save();
        await problemStatement.populate('createdBy', 'name email');

        res.json({
            success: true,
            data: problemStatement,
            message: 'Problem statement updated successfully'
        });
    } catch (error) {
        console.error('Error updating problem statement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update problem statement'
        });
    }
};

// @desc    Delete a problem statement
// @route   DELETE /api/problem-statements/:id
// @access  Private (Admin only)
const deleteProblemStatement = async (req, res) => {
    try {
        const problemStatement = await ProblemStatement.findById(req.params.id);

        if (!problemStatement) {
            return res.status(404).json({
                success: false,
                error: 'Problem statement not found'
            });
        }

        await ProblemStatement.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Problem statement deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting problem statement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete problem statement'
        });
    }
};

// @desc    Get problem statements for admin dashboard
// @route   GET /api/problem-statements/admin/all
// @access  Private (Admin only)
const getAdminProblemStatements = async (req, res) => {
    try {
        const problemStatements = await ProblemStatement.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: problemStatements
        });
    } catch (error) {
        console.error('Error fetching admin problem statements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch problem statements'
        });
    }
};

module.exports = {
    createProblemStatement,
    getAllProblemStatements,
    getProblemStatement,
    updateProblemStatement,
    deleteProblemStatement,
    getAdminProblemStatements
};
