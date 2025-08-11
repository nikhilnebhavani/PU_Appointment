const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const { ObjectId } = require('mongodb');
const moment = require("moment")


const dailyAvailabilityChange = (dailyAvailability, meetingDetail) => {
  function addMinutes(time, minutesToAdd) {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const newMinutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${newHours}:${newMinutes}`;
  }

  // Calculate the booking times without buffer
  let startTime = meetingDetail.time; // "09:30"
  startTime = moment(startTime, "HH:mm").subtract(15, "minutes").format("HH:mm");
  const durationMinutes = parseInt(meetingDetail.duration.split(":")[1], 10);
  const endTime = addMinutes(startTime, durationMinutes); // "10:30"

  // Function to merge free slots if meeting is within or adjacent to them
  function updateAvailability(dailyAvailability, meetingDetail) {
    const dateToUpdate = meetingDetail.date; // "2024-09-12"
    let startTime = meetingDetail.time;
    startTime = moment(startTime, "HH:mm").subtract(15, "minutes").format("HH:mm");
    const durationMinutes = parseInt(meetingDetail.duration.split(":")[1], 10);
    let endTime = addMinutes(startTime, durationMinutes);
    endTime = addMinutes(endTime, 15);


    dailyAvailability.forEach(day => {
      if (day.date === dateToUpdate) {
        // console.log(day.freeSlots)
        const newFreeSlots = [];
        let merged = false;

        day.freeSlots.push({ start: startTime, end: endTime })


        function timeToMinutes(time) {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        }

        function mergeTimeSlots(slots) {
          // Filter out slots with a null or NaN end time
          const filteredSlots = slots.filter(slot => slot.end !== null && !isNaN(Date.parse(`1970-01-01T${slot.end}:00`)));

          // Sort the slots by their start time
          filteredSlots.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

          const mergedSlots = [];

          for (let slot of filteredSlots) {
            // If there are no merged slots, or the current slot does not overlap with the last merged slot
            if (mergedSlots.length === 0 || timeToMinutes(mergedSlots[mergedSlots.length - 1].end) < timeToMinutes(slot.start)) {
              mergedSlots.push(slot); // Add the slot to the merged slots
            } else {
              // Otherwise, merge the current slot with the last merged slot
              mergedSlots[mergedSlots.length - 1].end = timeToMinutes(mergedSlots[mergedSlots.length - 1].end) > timeToMinutes(slot.end)
                ? mergedSlots[mergedSlots.length - 1].end
                : slot.end;
            }
          }

          return mergedSlots;
        }

        day.freeSlots = mergeTimeSlots(day.freeSlots);
      }
    });

    return dailyAvailability;
  }

  // Update the daily availability based on the meeting
  const updatedAvailability = updateAvailability(dailyAvailability, meetingDetail);

  // Output the updated availability
  // console.log(JSON.stringify(updatedAvailability, null, 2)); 
  return updatedAvailability
}

router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { meeting, reason, email } = data;
    let id = new ObjectId(meeting._id);
    let email2
    let data1, data2

    meeting.approval.map((e) => {
      if (e.email != email) {
        email2 = e.email
      }
    })

    if (meeting.status == "Upcoming") {

      const user1 = await db.collection("users").findOne({ email });

      if (user1) {
        let dailyAvailability = user1.dailyAvailability
        data1 = dailyAvailabilityChange(dailyAvailability, meeting)
        // res.status(200).json({ post: "Ok" });
      }
      else {
        res.status(404).json({ error: `${email}  not found` });
      }

      const user2 = await db.collection("users").findOne({ email: email2 });
      if (user2) {
        let dailyAvailability = user2.dailyAvailability
        data2 = dailyAvailabilityChange(dailyAvailability, meeting)
      }
      else {
        res.status(404).json({ error: `${email2} not found` });
      }

      if (user1 && user2) {
        const update1 = await db.collection("users").findOneAndUpdate(
          { email },
          { $set: { dailyAvailability: data1 } },
          { returnOriginal: false, returnDocument: 'after' }
        );
        const update2 = await db.collection("users").findOneAndUpdate(
          { email: email2 },
          { $set: { dailyAvailability: data2 } },
          { returnOriginal: false, returnDocument: 'after' }
        );
        if (update1 && update2) {
          let id = new ObjectId(meeting._id);

          const post = await db.collection("meetings").findOneAndUpdate(
            { _id: id },
            { $set: { status: "Cancelled", cancel_reason: reason, cancel_by: email } }
          );
          if (post) {
            res.status(200).json({ status: "canceled" });
          } else {
            console.log("Meeting not found:", id);
            res.status(404).json({ error: "Meeting not found" });
          }
        }
        else if (!update1) {
          res.status(404).json({ error: `${email} data not updated` });
        }
        else {
          res.status(404).json({ error: `${email2} data not updated` });
        }
      }

    }
    else {

      const post = await db.collection("meetings").findOneAndUpdate(
        { _id: id },
        { $set: { status: "Cancelled", cancel_reason: reason, cancel_by: email } }
      );

      if (post) {
        res.status(200).json({ post: post });
      } else {
        console.log("Meeting not found:", id);
        res.status(404).json({ error: "Meeting not found" });
      }

    }





  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
