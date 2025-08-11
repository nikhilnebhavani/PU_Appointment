const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");
const moment = require('moment');


function generateAvailabilityData(dailyAvailability, sdate, edate, timming, reason, all_day, specialhours) {
  const start = moment(sdate);
  const end = moment(edate);

  for (let currentDate = start.clone(); currentDate.isSameOrBefore(end); currentDate.add(1, 'days')) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    const weekday = currentDate.format('dddd').toUpperCase();

    let currentStime, currentEtime;

    if (start.isSame(end, 'day')) {
      // Special case: startDate and endDate are the same
      currentStime = timming.stime;
      currentEtime = timming.etime;
    } else if (currentDate.isSame(start, 'day')) {
      // First day in the range
      currentStime = timming.stime;
      currentEtime = '23:59';
    } else if (currentDate.isSame(end, 'day')) {
      // Last day in the range
      currentStime = '00:00';
      currentEtime = timming.etime;
    } else {
      // Intermediate days
      currentStime = '00:00';
      currentEtime = '23:59';
    }

    let existingEntry = dailyAvailability.find(entry => entry.date === dateStr);

    if (existingEntry) {
      const slotStart = moment(currentStime, 'HH:mm');
      const slotEnd = moment(currentEtime, 'HH:mm');

      // We need to adjust existing freeSlots based on the new time
      const newFreeSlots = [];


      existingEntry.freeSlots.forEach(slot => {
        const existingSlotStart = moment(slot.start, 'HH:mm');
        const existingSlotEnd = moment(slot.end, 'HH:mm');

        if(slotStart.isBefore(existingSlotStart) && slotEnd.isAfter(existingSlotEnd)){
          newFreeSlots.push({ start: currentStime, end : slot.start })
          newFreeSlots.push({ start: slot.start, end : slot.end })
          newFreeSlots.push({ start: slot.end, end : currentEtime })
          specialhours.push({all_day, sdate:dateStr, edate:dateStr, stime:currentStime, etime: slot.start, reason})
          specialhours.push({all_day, sdate:dateStr, edate:dateStr, stime:slot.end, etime: currentEtime, reason})
        }
        else if(slotStart.isBefore(existingSlotStart) && slotEnd.isAfter(existingSlotStart) && slotEnd.isBefore(existingSlotEnd)){
          newFreeSlots.push({ start: currentStime, end : slot.start })
          newFreeSlots.push({ start: slot.start, end : slot.end })
          specialhours.push({all_day, sdate:dateStr, edate:dateStr, stime:currentStime, etime: slot.start, reason})
        }
        else if(slotStart.isAfter(existingSlotStart) && slotStart.isBefore(existingSlotEnd) && slotEnd.isAfter(existingSlotEnd)){
          newFreeSlots.push({ start: slot.start, end : slot.end })
          newFreeSlots.push({ start: slot.end, end : currentEtime })
          specialhours.push({all_day, sdate:dateStr, edate:dateStr, stime:slot.end, etime: currentEtime, reason})
        }
        else if (slotEnd.isBefore(existingSlotStart) || slotStart.isAfter(existingSlotEnd)) {
          newFreeSlots.push({start: currentStime, end:currentEtime});
          newFreeSlots.push(slot)
          specialhours.push({all_day, sdate:dateStr, edate:dateStr, stime:currentStime, etime: currentEtime, reason})
        }
        else if(slotStart.isBefore(existingSlotStart) && slotEnd.isSame(existingSlotStart)){
          newFreeSlots.push({ start: currentStime, end : slot.start })
          newFreeSlots.push({ start: slot.start, end : slot.end })
          specialhours.push({all_day, sdate:dateStr, edate:dateStr, stime:currentStime, etime: slot.start, reason})
        }
        else if(slotEnd.isAfter(existingSlotEnd) && slotStart.isSame(existingSlotEnd)){
          newFreeSlots.push({ start: slot.start, end : slot.end })
          newFreeSlots.push({ start: slot.end, end : currentEtime })
          specialhours.push({all_day, sdate:dateStr, edate:dateStr, stime:slot.end, etime: currentEtime, reason})
        }
        else{
          newFreeSlots.push(slot)
        } 
      });

      // If the new slot exactly matches an existing slot, we need to split it into two
      // if (existingEntry.freeSlots.length === 1) {
      //   const existingSlot = existingEntry.freeSlots[0];
      //   const existingSlotStart = moment(existingSlot.start, 'HH:mm');
      //   const existingSlotEnd = moment(existingSlot.end, 'HH:mm');

      //   if (slotStart.isSame(existingSlotStart) && slotEnd.isSame(existingSlotEnd)) {
      //     newFreeSlots.push({ start: existingSlot.start, end: currentStime });
      //     newFreeSlots.push({ start: currentEtime, end: existingSlot.end });
      //   } else {
      //     // Otherwise, add the new slot normally
      //     newFreeSlots.push({ start: currentStime, end: currentEtime });
      //   }
      // } else {
      //   // Add the new slot for the special hour
      //   newFreeSlots.push({ start: currentStime, end: currentEtime });
      // }

      // Sort the slots to maintain order
      newFreeSlots.sort((a, b) => moment(a.start, 'HH:mm').isBefore(moment(b.start, 'HH:mm')) ? -1 : 1);

      existingEntry.freeSlots = newFreeSlots;

    } else {
      dailyAvailability.push({
        day: weekday,
        date: dateStr,
        start: currentStime,
        end: currentEtime,
        freeSlots: [{ start: currentStime, end: currentEtime }],
      });
      specialhours.push({all_day, sdate:dateStr, edate:dateStr, stime:currentStime, etime: currentEtime, reason})

    }
  }

  return {dailyAvailability, specialhours};
}







router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { token, all_day, sdate, edate, reason } = data;
    const dailyAvailability = data.dailyAvailablity;
    const specialhours = data.listOfSpecial
    let timming = {stime:"00:00", etime:"23:59"};
    if(!all_day){
      const  {stime, etime} = data;
      timming = {stime, etime}
    }
    const updatedDailyAvailability = generateAvailabilityData(dailyAvailability, sdate, edate, timming, reason, all_day, specialhours);

    
    const bytes = CryptoJS.AES.decrypt(token, process.env.TOKEN_SECRET);
    const email = await JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    
      const post = await db.collection("users").findOneAndUpdate(
      { email },
      { $set: {  dailyAvailability: updatedDailyAvailability.dailyAvailability , special_hours: updatedDailyAvailability.specialhours } },
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
