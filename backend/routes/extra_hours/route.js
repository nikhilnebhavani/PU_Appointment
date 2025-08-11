const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");
const moment = require('moment');


function generateAvailabilityData(dailyAvailability, date, stime, etime, extra_hour) {
  const extra_hours = extra_hour || []

    let existingEntry = dailyAvailability.find(entry => entry.date === date);

    if (existingEntry) {

      const slotStart = moment(stime, 'HH:mm');
      const slotEnd = moment(etime, 'HH:mm');

      // We need to adjust existing freeSlots based on the new time
      const newFreeSlots = [];


      existingEntry.freeSlots.forEach(slot => {
        const existingSlotStart = moment(slot.start, 'HH:mm');
        const existingSlotEnd = moment(slot.end, 'HH:mm');

        if(slotStart.isBefore(existingSlotStart) && slotEnd.isAfter(existingSlotEnd)){
          newFreeSlots.push({ start: stime, end : slot.start })
          newFreeSlots.push({ start: slot.start, end : slot.end })
          newFreeSlots.push({ start: slot.end, end : etime })
          extra_hours.push({ date, stime:stime, etime: slot.start})
          extra_hours.push({ date, stime:slot.end, etime: etime})

        }
        else if(slotStart.isBefore(existingSlotStart) && slotEnd.isAfter(existingSlotStart) && slotEnd.isBefore(existingSlotEnd)){
          newFreeSlots.push({ start: stime, end : slot.start })
          newFreeSlots.push({ start: slot.start, end : slot.end })
          extra_hours.push({ date, stime:stime, etime: slot.start})

        }
        else if(slotStart.isAfter(existingSlotStart) && slotStart.isBefore(existingSlotEnd) && slotEnd.isAfter(existingSlotEnd)){
          newFreeSlots.push({ start: slot.start, end : slot.end })
          newFreeSlots.push({ start: slot.end, end : etime })
          extra_hours.push({ date, stime:slot.end, etime: etime})

        }
        else if (slotEnd.isBefore(existingSlotStart) || slotStart.isAfter(existingSlotEnd)) {
          newFreeSlots.push({start: stime, end:etime});
          newFreeSlots.push(slot)
          extra_hours.push({ date, stime:stime, etime: etime})
        }
        else if(slotStart.isBefore(existingSlotStart) && slotEnd.isSame(existingSlotStart)){
          newFreeSlots.push({ start: stime, end : slot.start })
          newFreeSlots.push({ start: slot.start, end : slot.end })
          extra_hours.push({ date, stime:stime, etime: slot.start})
        }
        else if(slotEnd.isAfter(existingSlotEnd) && slotStart.isSame(existingSlotEnd)){
          newFreeSlots.push({ start: slot.start, end : slot.end })
          newFreeSlots.push({ start: slot.end, end : etime })
          extra_hours.push({ date, stime:slot.end, etime: etime})
        }
        else{
          newFreeSlots.push(slot)
        } 
      });

      newFreeSlots.sort((a, b) => moment(a.start, 'HH:mm').isBefore(moment(b.start, 'HH:mm')) ? -1 : 1);

      existingEntry.freeSlots = newFreeSlots;

    } else {
      let a = moment(date)
      const weekday = a.format('dddd').toUpperCase();

      dailyAvailability.push({
        day: weekday,
        date: date,
        start: stime,
        end: etime,
        freeSlots: [{ start: stime, end: etime }],
      });
      extra_hours.push({ date, stime, etime})
    }
  

  return {dailyAvailability, extra_hours};
}


router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { email, date, time, duration, dailyAvailability, extra_hours } = data;

    function addMinutes(time, minutesToAdd) {
      const [hours, minutes] = time.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + minutesToAdd;
      const newHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
      const newMinutes = (totalMinutes % 60).toString().padStart(2, "0");
      return `${newHours}:${newMinutes}`;
    }
    const stime = time; 
    const durationMinutes = parseInt(duration.split(":")[1], 10); 
    const etime = addMinutes(stime, durationMinutes); 
    let extra_hour = extra_hours

    const updatedDailyAvailability = generateAvailabilityData(dailyAvailability, date,stime, etime, extra_hour);
    
      const post = await db.collection("users").findOneAndUpdate(
      { email },
      { $set: {  dailyAvailability: updatedDailyAvailability.dailyAvailability,  extra_hours: updatedDailyAvailability.extra_hours } },
      { returnOriginal: false }
    );
    if (post) {
      res.status(200).json({ post: post });
    }else {
      console.log("User not found:", email); 
      res.status(400).json({ error: "User not found" });
    }

    
    
  } catch (error) {
    res.status(500).json({ error: error.message + "ok" });
    console.log(error)
  }
});

module.exports = router;
