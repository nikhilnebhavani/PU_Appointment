const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const { ObjectId } = require('mongodb');

const dailyAvailabilityChange = (dailyAvailability, date, time, duration) => {
  function addMinutes(time, minutesToAdd) {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const newMinutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${newHours}:${newMinutes}`;
  }
  // Calculate the booking times without buffer
  const startTime = time; // "08:30"
  const durationMinutes = parseInt(duration.split(":")[1], 10); // 1 hour meeting
  const endTime = addMinutes(startTime, durationMinutes); // "09:30"

  let updatedDailyAvailability = dailyAvailability
    updatedDailyAvailability = dailyAvailability.map(day => {
      if (day.date === date) {
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

  return updatedDailyAvailability
}

router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { email , name, time, date, duration, detail} = data;

    const user1 = await db.collection("users").findOne({email});

    if (user1){
      let dailyAvailability = user1.dailyAvailability
      let my_slots = user1.my_slots
      let data=dailyAvailabilityChange(dailyAvailability, date, time, duration)
      if(!Array.isArray(my_slots)){
        my_slots=[]
      }
      my_slots.push({name, date, time, duration, detail})
      const update1 = await db.collection("users").findOneAndUpdate(
        { email },
        { $set: { dailyAvailability: data, my_slots} },
        { returnOriginal: false, returnDocument: 'after' }
      );
      if(update1){
        res.status(200).json({  });
      }
    }
    else{
      res.status(404).json({ error: `${email}  not found` });
    }
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
