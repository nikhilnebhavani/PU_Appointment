const express = require("express");
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");


router.post("/", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const meetingsCollection = db.collection('meetings');

    const now = new Date();

    const today = now.toISOString().split('T')[0];


        const todayMeetings = await meetingsCollection.find({
            date: today
        }).toArray();

        let result = [];
        for (const meeting of todayMeetings) {

          const [hour, minute] = meeting.time.split(":").map(Number);
          const meetingDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

          const [durationHours, durationMinutes] = meeting.duration.split(":").map(Number);
          const durationInMilliseconds = (durationHours * 60 + durationMinutes) * 60 * 1000;
          const meetingEndTime = new Date(meetingDateTime.getTime() + durationInMilliseconds);

            if (meeting.status === "Pending" && meetingDateTime <= now) {
                await meetingsCollection.updateOne(
                    { _id: meeting._id },
                    { $set: { status: "Cancelled" } }
                );
                console.log(`Meeting ${meeting._id} cancelled as it's within 2 hours.`);
                result.push(meeting);
            } 
            else if (meeting.status === "Upcoming" && meetingDateTime <= now && now < meetingEndTime) {
                await meetingsCollection.updateOne(
                    { _id: meeting._id },
                    { $set: { status: "Running" } }
                );
                console.log(`Meeting ${meeting._id} is now running.`);
                result.push(meeting);
            }
            else if (meeting.status === "Running" && now >= meetingEndTime) {
              await meetingsCollection.updateOne(
                  { _id: meeting._id },
                  { $set: { status: "Completed" } }
              );
              console.log(`Meeting ${meeting._id} is now complete.`);
              result.push(meeting);
          }
        }
    
    
      res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
