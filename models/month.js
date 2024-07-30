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
     finish: {
        type: Boolean,
         default:false
    }
    ,
    days: [
        {
            day: {
                type: String
            },
            date: {
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
            present: {
                type: Number,
                default: 0,
            },
            absent: {
                type: Number,
                default: 0,
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
                    },
                    present: {
                        type: Number,
                        default: 0,
                    },
                    absent: {
                        type: Number,
                        default: 0,
                    },
                }
            ],
        }
    ],
});

module.exports = mongoose.model('Month', monthSchema);
