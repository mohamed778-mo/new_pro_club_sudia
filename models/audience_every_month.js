const mongoose = require('mongoose');

var attendanceRecordSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true,
    },
   
    players: [
        {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            user_name: {
                type: String,
                required: true
            },
            role: {
                type: String,
                required: true
            },
            present: {
                    type: Number,
                    default: 0
                },
                absent: {
                    type: Number,
                    default: 0
                }
            
        }
    ],
});

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
