const mongoose = require('mongoose');

var monthSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true,
    },
    start: {
        type: String,
        required: true,
    },
    end: {
        type: String,
        required: true,
    },
    note: {
        type: String,
    },
    days: [
        {
            day: {
                type: String
            },
            date: {
                type: String
            },
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
            },
            user_name: {
                type: String
            },
            role: {
                type: String
            },
            audience_player: {
                type: Boolean,
                default: false
            },
            audience_coach: {
                type: Boolean,
                default: false
            },
            attendees: [
                {
                    user_id: {
                        type: mongoose.Schema.Types.ObjectId,
                        
                    },
                    user_name: {
                        type: String
                    },
                    role: {
                        type: String
                    }
                }
            ]
        }
    ],
});

module.exports = mongoose.model('Month', monthSchema);
