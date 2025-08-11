const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');
const https = require('https');
const app = express();

app.use(bodyParser.json());

const agent = new https.Agent({  
    rejectUnauthorized: false
});

const allowedOrigins = [
    'http://appointment.paruluniversity.ac.in',
    'https://appointment.paruluniversity.ac.in',
    'http://localhost:3000',
];

app.use(cors({
    origin: function (origin, callback) {
        // If no origin is provided (like in some requests such as server-to-server), allow it.
        if (!origin) return callback(null, true);

        // Check if the request's origin is in the allowed origins array
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

cron.schedule('0 2 * * *', async () => {
    try {
        console.log("Running auto_delete at 2 a.m.");
        await axios.post('http://localhost:3001/auto_delete');
        console.log("auto_delete completed successfully.");
    } catch (error) {
        console.error("Error running auto_delete:", error);
    }
});

cron.schedule('* * * * *', async () => {
    try {
        await axios.post('http://localhost:3001/auto_update');
        console.log("auto_update completed successfully.");
    } catch (error) {
        console.error("Error running auto_update:", error);
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Pu_Meeting Is Running');q
});

const loginRouter = require('./routes/login/route');
app.use('/login', loginRouter);

const registerRouter = require('./routes/register/route');
app.use('/register', registerRouter);

const getCheckRouter2 = require('./routes/check_email/route');
app.use('/check_email', getCheckRouter2);

const ProfileDetailsRouter = require('./routes/profile/route');
app.use('/profile', ProfileDetailsRouter);

const UpdateDetailsRouter = require('./routes/update/route');
app.use('/update', UpdateDetailsRouter);

const UpdateWorkingHoursRouter = require('./routes/workinghours/route');
app.use('/workinghours', UpdateWorkingHoursRouter);

const UpdateSpecialHoursRouter = require('./routes/special_hours/route');
app.use('/special_hours', UpdateSpecialHoursRouter);

const UpdateExtraHoursRouter = require('./routes/extra_hours/route');
app.use('/extra_hours', UpdateExtraHoursRouter);

const UpdateBlockTimeRouter = require('./routes/block_time/route');
app.use('/block_time', UpdateBlockTimeRouter);

const UpdateTimeOffRouter = require('./routes/time_off/route');
app.use('/time_off', UpdateTimeOffRouter);

const createMeeting2 = require('./routes/create_meeting2/route');
app.use('/create_meeting2', createMeeting2);

const getMeetings = require('./routes/meetings/route');
app.use('/meetings', getMeetings);

const getDetails = require('./routes/getDetails/route');
app.use('/getDetails', getDetails);

const approveMeetings = require('./routes/approve_meeting/route');
app.use('/approve_meeting', approveMeetings);

const cancelMeetings = require('./routes/cancel_meeting/route');
app.use('/cancel_meeting', cancelMeetings);

const cancelslot = require('./routes/cancel_slot/route');
app.use('/cancel_slot', cancelslot);

const rescheduleMeetingsDetail = require('./routes/rescheduleDateTime/route');
app.use('/rescheduleDateTime', rescheduleMeetingsDetail);

const rescheduleMeetings = require('./routes/reschedule_meeting/route');
app.use('/reschedule_meeting', rescheduleMeetings);

const deleteSpecialHour = require('./routes/deleteSpecialHour/route');
app.use('/deleteSpecialHour', deleteSpecialHour);

const email = require('./routes/email/route');
app.use('/email', email);

const newapp = require('./routes/newapp/route');
app.use('/newapp', newapp);

const add_slot = require('./routes/add_slot/route');
app.use('/add_slot', add_slot);

const auto_delete = require('./routes/auto_delete/route');
app.use('/auto_delete', auto_delete);

const auto_update = require('./routes/auto_update/route');
app.use('/auto_update', auto_update);

const check_admin = require('./routes/check_admin/route');
app.use('/check_admin', check_admin);

const get_admin_data = require('./routes/get_admin_data/route');
app.use('/get_admin_data', get_admin_data);

const approve = require('./routes/approve/route');
app.use('/approve', approve);

const level = require('./routes/level/route');
app.use('/level', level);

const user_delete = require('./routes/user_delete/route');
app.use('/user_delete', user_delete);