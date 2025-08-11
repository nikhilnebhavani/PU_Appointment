const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const { ObjectId } = require('mongodb');


const dailyAvailabilityChange = (dailyAvailability, meetingDetail) => {
  function addMinutes(time, minutesToAdd) {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const newMinutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${newHours}:${newMinutes}`;
  }
  
  // Calculate the booking times without buffer
  const startTime = meetingDetail.time; // "09:30"
  const durationMinutes = parseInt(meetingDetail.duration.split(":")[1], 10);
  const endTime = addMinutes(startTime, durationMinutes); // "10:30"
  
  // Function to merge free slots if meeting is within or adjacent to them
  function updateAvailability(dailyAvailability, meetingDetail) {
    const dateToUpdate = meetingDetail.date; // "2024-09-12"
    const startTime = meetingDetail.time;
    const durationMinutes = parseInt(meetingDetail.duration.split(":")[1], 10);
    const endTime = addMinutes(startTime, durationMinutes);
  
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
    const { slot, email } = data;
    let data1, my_slots


    const user1 = await db.collection("users").findOne({email});

    if (user1){
      let dailyAvailability = user1.dailyAvailability
      data1= dailyAvailabilityChange(dailyAvailability, slot)
      my_slots = user1.my_slots
    }
    else{
      res.status(404).json({ error: `${email}  not found` });
    }
    if(user1){
      let slots = my_slots.filter((e)=>(e.time!=slot.time && e.date!=slot.date))
      const update1 = await db.collection("users").findOneAndUpdate(
        { email },
        { $set: { dailyAvailability: data1, my_slots : slots} },
        { returnOriginal: false, returnDocument: 'after' }
      );
    if (update1) {

      res.status(200).json({ update1 });

    } else {
      console.log("Slot not found:");
      res.status(404).json({ error: "Slot not found" });
    }

    }

    


  
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
