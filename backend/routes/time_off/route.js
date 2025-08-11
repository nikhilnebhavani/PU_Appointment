const express = require("express");
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");
const moment = require("moment");

function generateAvailabilityData(dailyAvailability, sdate, edate, timming) {
  const start = moment(sdate);
  const end = moment(edate);

  for (let currentDate = start.clone(); currentDate.isSameOrBefore(end); currentDate.add(1, 'days')) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    const weekday = currentDate.format('dddd').toUpperCase();
    
    let currentStime, currentEtime;

    if (currentDate.isSame(start, 'day') && currentDate.isSame(end, 'day')) {
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
      existingEntry.freeSlots = existingEntry.freeSlots.flatMap(slot => {
        const slotStart = moment(slot.start, 'HH:mm');
        const slotEnd = moment(slot.end, 'HH:mm');
        const stime = moment(currentStime, 'HH:mm');
        const etime = moment(currentEtime, 'HH:mm');
        
        if (!(slotStart.isBefore(etime) && slotEnd.isAfter(stime))) {
          return [slot]; // Keep slots that don't overlap with the new timing
        } else {
          const newSlots = [];
          if (slot.start < currentStime) {
            newSlots.push({ start: slot.start, end: currentStime });
          }
          if (slot.end > currentEtime) {
            newSlots.push({ start: currentEtime, end: slot.end });
          }
          return newSlots; // Adjusted slots that don't overlap with the new timing
        }
      });
    } else {
      dailyAvailability.push({
        day: weekday,
        date: dateStr,
        start: currentStime,
        end: currentEtime,
        freeSlots: [{ start: currentStime, end: currentEtime }],
        meetings: []
      });
    }
  }

  return dailyAvailability;
}

router.post("/", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { token, all_day, sdate, edate, reason } = data;
    const dailyAvailability = data.dailyAvailablity;
    let timming = { stime: "00:00", etime: "23:59" };
    if (!all_day) {
      const { stime, etime } = data;
      timming = { stime, etime };
    }
    const updatedDailyAvailability = generateAvailabilityData(
      dailyAvailability,
      sdate,
      edate,
      timming
    );

    const bytes = CryptoJS.AES.decrypt(token, process.env.TOKEN_SECRET);
    const email = await JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    const block_time_entry = { all_day, sdate, edate, reason };
    if (!all_day) {
      block_time_entry.stime = timming.stime;
      block_time_entry.etime = timming.etime;
    }

    const post = await db.collection("users").findOneAndUpdate(
      { email },
      {
        $set: { dailyAvailability: updatedDailyAvailability },
        $push: { block_time: block_time_entry },
      },
      { returnOriginal: false }
    );

    if (post) {
      res.status(200).json({ post: post });
    } else {
      console.log("User not found:", email);
      res.status(400).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
