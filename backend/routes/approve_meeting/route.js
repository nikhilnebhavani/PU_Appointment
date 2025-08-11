const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const { ObjectId } = require('mongodb');
const moment = require("moment")

// Function to update approval status in the meeting object
const setApproval = (meeting, email) => {
  let approval = meeting.approval;
  approval.forEach((e) => {
    if (e.email === email) {
      e.approval = true;
    }
  });
  let status = "Upcoming";
  return { approval, status };
};

const dailyAvailabilityChange = (dailyAvailability, meetingDetail) => {
  function addMinutes(time, minutesToAdd) {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const newMinutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${newHours}:${newMinutes}`;
  }
  // Calculate the booking times without buffer
  let startTime = meetingDetail.time; // "08:30"
  startTime = moment(startTime, "HH:mm").subtract(15, "minutes").format("HH:mm");
  const durationMinutes = parseInt(meetingDetail.duration.split(":")[1], 10); // 1 hour meeting
  let endTime = addMinutes(startTime, durationMinutes);
  endTime = addMinutes(endTime, 15);
  
  // Function to check if the meeting can be approved
  function canApproveMeeting(freeSlots, startTime, endTime) {
    // Check if the meeting time falls within any free slot
    return freeSlots.some(slot => slot.start <= startTime && slot.end >= endTime);
  }
  
  // Check if the meeting can be approved
  const dateToUpdate = meetingDetail.date; // "2024-09-12"
  const isMeetingApproved = dailyAvailability.some(day => {
    if (day.date === dateToUpdate) {
      return canApproveMeeting(day.freeSlots, startTime, endTime);
    }
    return false;
  });
  
  // Update meeting status based on availability
  if (isMeetingApproved) {
    meetingDetail.status = "Approved";  // Approve the meeting if it fits within the free slots
    console.log("Meeting Approved:", true);
  } else {
    meetingDetail.status = "Cancelled"; // Cancel the meeting if it does not fit within the free slots
    console.log("Meeting Approved:", false);
  }

  let updatedDailyAvailability = dailyAvailability
  if (isMeetingApproved) {
    updatedDailyAvailability = dailyAvailability.map(day => {
      if (day.date === dateToUpdate) {
        const newFreeSlots = [];
        
        day.freeSlots.forEach(slot => {
          // If the slot overlaps with the booking time, adjust it
          if (slot.start < endTime && slot.end > startTime) {
            // Slot before the meeting
            if (slot.start < startTime) {
              newFreeSlots.push({ start: slot.start, end: startTime });
            }
            // Slot after the meeting
            if (slot.end > endTime) {
              newFreeSlots.push({ start: endTime, end: slot.end });
            }
          } else {
            // Slot does not overlap with meeting time
            newFreeSlots.push(slot);
          }
        });
  
        // Update the day's free slots
        day.freeSlots = newFreeSlots;
      }
      return day;
    });
  }
  return {approval:isMeetingApproved, dailyAvailability: updatedDailyAvailability}
}

router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { meeting, email } = data;

    let approval1 = false
    let approval2 = false
    let email2
    let dailyAvailability1, dailyAvailability2
    let name1, name2

    meeting.approval.map((e)=>{
      if(e.email!=email){
        email2 = e.email
      }
    })
  

    const user1 = await db.collection("users").findOne({email});

    if (user1){
      let dailyAvailability = user1.dailyAvailability
      let data=dailyAvailabilityChange(dailyAvailability, meeting)
      approval1 = data.approval
      dailyAvailability1 = data.dailyAvailability
      name1 = user1.name
    }
    else{
      res.status(404).json({ error: `${email}  not found` });
    }

    const user2 = await db.collection("users").findOne({ email:email2 });
    if (user2) {
      let dailyAvailability = user2.dailyAvailability
      let data=dailyAvailabilityChange(dailyAvailability, meeting)
      approval2 = data.approval
      dailyAvailability2 = data.dailyAvailability
      name2 = user2.name
    }
    else{
      res.status(404).json({ error: `${email2} not found` });
    }

    if(approval1 && approval2){
      const update1 = await db.collection("users").findOneAndUpdate(
        { email },
        { $set: { dailyAvailability: dailyAvailability1} },
        { returnOriginal: false, returnDocument: 'after' }
      );
      const update2 = await db.collection("users").findOneAndUpdate(
        { email: email2 },
        { $set: { dailyAvailability: dailyAvailability2} },
        { returnOriginal: false, returnDocument: 'after' }
        );
        if(update1 && update2){
            let id = new ObjectId(meeting._id);

            const update = setApproval(meeting, email);
        
            const post = await db.collection("meetings").findOneAndUpdate(
              { _id: id },
              { $set: { status: update.status, approval: update.approval } }
            );  
            if (post) {
              res.status(200).json({ approval: true });
            } else {
              console.log("Meeting not found:", id);
              res.status(404).json({ error: "Meeting not found" });
            }
        }
        else if(!update1){
          res.status(404).json({ error: `${email} data not updated` });
        }
        else{
          res.status(404).json({ error: `${email2} data not updated` });
        }
    }
    else{
      let name = approval1 ? name2 + `'s` : "Your"
      res.status(200).json({ approval :false, name  });
    }
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
