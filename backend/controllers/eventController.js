const Event = require('../models/Event');
const User = require('../models/User');

// Get all events
const getAllEvents = async (req, res) => {
    try {
        // console.log('🔍 Getting all events...');
        const events = await Event.find()
            .populate('postedBy', 'name email')
            .populate('likedBy', 'name')
            .sort({ postedAt: -1 });

        // console.log(`✅ Found ${events.length} events`);
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('❌ Error fetching events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events'
        });
    }
};

// Get single event
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        // console.log('🔍 Getting event by ID:', id);

        const event = await Event.findById(id)
            .populate('postedBy', 'name email')
            .populate('likedBy', 'name');

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        // console.log('✅ Event found:', event.title);
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('❌ Error fetching event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event'
        });
    }
};

// Create new event
const createEvent = async (req, res) => {
    try {
        const { title, description, image, date, time, location, organizer, category } = req.body;
        const postedBy = req.user.id;

        console.log('🔍 Creating event with data:', {
            title,
            description,
            image,
            date,
            time,
            location,
            organizer,
            category,
            postedBy
        });

        // Validate required fields
        if (!title || !description || !date || !time || !location || !organizer) {
            return res.status(400).json({
                success: false,
                error: 'All required fields must be provided'
            });
        }

        const event = new Event({
            title,
            description,
            image: image || '',
            date,
            time,
            location,
            organizer,
            category: category || 'workshop',
            postedBy
        });

        const savedEvent = await event.save();
        console.log('✅ Event created successfully:', savedEvent.title);

        // Populate the postedBy field
        await savedEvent.populate('postedBy', 'name email');

        res.status(201).json({
            success: true,
            data: savedEvent,
            message: 'Event created successfully'
        });
    } catch (error) {
        console.error('❌ Error creating event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create event'
        });
    }
};

// Update event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = req.user.id;

        console.log('🔍 Updating event:', id, 'by user:', userId);

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        // Check if user is the creator or admin
        if (event.postedBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this event'
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('postedBy', 'name email')
            .populate('likedBy', 'name');

        console.log('✅ Event updated successfully:', updatedEvent.title);
        res.json({
            success: true,
            data: updatedEvent,
            message: 'Event updated successfully'
        });
    } catch (error) {
        console.error('❌ Error updating event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update event'
        });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        console.log('🔍 Deleting event:', id, 'by user:', userId);

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        // Check if user is the creator or admin
        if (event.postedBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this event'
            });
        }

        await Event.findByIdAndDelete(id);
        console.log('✅ Event deleted successfully:', event.title);

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete event'
        });
    }
};

// Like/Unlike event
const likeEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        console.log('🔍 Liking event:', id, 'by user:', userId);

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        const isLiked = event.likedBy.includes(userId);

        if (isLiked) {
            // Unlike the event
            event.likedBy = event.likedBy.filter(id => id.toString() !== userId);
            event.likes = Math.max(0, event.likes - 1);
        } else {
            // Like the event
            event.likedBy.push(userId);
            event.likes += 1;
        }

        const updatedEvent = await event.save();
        await updatedEvent.populate('postedBy', 'name email');
        await updatedEvent.populate('likedBy', 'name');

        console.log('✅ Event like status updated:', updatedEvent.title, 'Likes:', updatedEvent.likes);

        res.json({
            success: true,
            data: updatedEvent,
            message: isLiked ? 'Event unliked successfully' : 'Event liked successfully'
        });
    } catch (error) {
        console.error('❌ Error liking event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to like event'
        });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    likeEvent
};
