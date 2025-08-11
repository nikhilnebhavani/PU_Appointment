const express = require("express");
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");
const { ObjectId } = require('mongodb');

const approval_data = (approval, email) => {
  approval.map((e)=>{
    if(e.email === email){
      e.approval = true
    }
    else{
      e.approval = false
    }
  })
  return approval
};

const dailyAvailabilityChange = (dailyAvailability, meetingDetail) => {
  function addMinutes(time, minutesToAdd) {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const newMinutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${newHours}:${newMinutes}`;
  }

  
  function updateAvailability(dailyAvailability, meetingDetail) {
    const dateToUpdate = meetingDetail.date; // "2024-09-12"
    const startTime = meetingDetail.time;
    const durationMinutes = parseInt(meetingDetail.duration.split(":")[1], 10);
    const endTime = addMinutes(startTime, durationMinutes);
  
    dailyAvailability.forEach(day => {
      if (day.date === dateToUpdate) {
     
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
        console.log(day.freeSlots)
        day.freeSlots = mergeTimeSlots(day.freeSlots);
        console.log(day.freeSlots)
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


router.post("/", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { email, meeting, date, time } = data;
    let id = new ObjectId(meeting._id);
    const approvalData = approval_data(meeting.approval, email);

    if (meeting.status == "Upcoming") {
      let data1, data2, email2;

      meeting.approval.map((e) => {
        if (e.email != email) {
          email2 = e.email;
        }
      });

      const user1 = await db.collection("users").findOne({ email });
      if (!user1) {
        return res.status(404).json({ error: `${email} not found` });
      }
      
      let dailyAvailability = user1.dailyAvailability;
      data1 = await dailyAvailabilityChange(dailyAvailability, meeting);

      const user2 = await db.collection("users").findOne({ email: email2 });
      if (!user2) {
        return res.status(404).json({ error: `${email2} not found` });
      }
      
      dailyAvailability = user2.dailyAvailability;
      data2 = await dailyAvailabilityChange(dailyAvailability, meeting);

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

      if (!update1) {
        return res.status(404).json({ error: `${email} data not updated` });
      }
      
      if (!update2) {
        return res.status(404).json({ error: `${email2} data not updated` });
      }

      let id = new ObjectId(meeting._id);
      const post = await db.collection("meetings").findOneAndUpdate(
        { _id: id },
        { $set: { status: "Pending", date: date, time: time, approval: approvalData } }
      );

      if (post) {
        return res.status(200).json({ status: "rescheduled" });
      } else {
        console.log("Meeting not found:", id);
        return res.status(404).json({ error: "Meeting not found" });
      }
    } else {
      console.log("Nothing");
      const post = await db.collection("meetings").findOneAndUpdate(
        { _id: id },
        { $set: { status: "Pending", date: date, time: time, approval: approvalData } }
      );

      if (post) {
        return res.status(200).json({ post });
      } else {
        return res.status(400).json({ error: "Something Went Wrong" });
      }
    }
  } catch (error) {
    console.error(error); // Log the error to see what went wrong
    return res.status(500).json({ error: error.message });
  }
});


module.exports = router;
