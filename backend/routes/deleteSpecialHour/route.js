const express = require("express");
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const moment = require('moment');

function removeSpecialHours(dailyAvailability, sdate, edate, stime, etime) {
  const start = moment(sdate);
  const end = moment(edate);

  for (let currentDate = start.clone(); currentDate.isSameOrBefore(end); currentDate.add(1, 'days')) {
      const dateStr = currentDate.format('YYYY-MM-DD');

      let existingEntry = dailyAvailability.find(entry => entry.date === dateStr);
      if (existingEntry) {
          const stimeMoment = moment(stime, 'HH:mm');
          const etimeMoment = moment(etime, 'HH:mm');

          // Filter out the special hours without affecting regular hours
          existingEntry.freeSlots = existingEntry.freeSlots.filter(slot => {
              const slotStart = moment(slot.start, 'HH:mm');
              const slotEnd = moment(slot.end, 'HH:mm');

              // Remove special hour if it falls entirely within the special time range
              if (slotStart.isSameOrAfter(stimeMoment) && slotEnd.isSameOrBefore(etimeMoment)) {
                  return false;
              }

              // Adjust slots that partially overlap with the special hour
              if (slotStart.isBefore(stimeMoment) && slotEnd.isAfter(stimeMoment) && slotEnd.isSameOrBefore(etimeMoment)) {
                  slot.end = stime; // Adjust the end time of the slot
              }

              if (slotStart.isSameOrAfter(stimeMoment) && slotStart.isBefore(etimeMoment) && slotEnd.isAfter(etimeMoment)) {
                  slot.start = etime; // Adjust the start time of the slot
              }

              return true;
          });

          // Optionally remove the entry if no free slots are left
          if (existingEntry.freeSlots.length === 0) {
              dailyAvailability = dailyAvailability.filter(entry => entry.date !== dateStr);
          }
      }
  }

  return dailyAvailability;
}


router.post("/", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const email = data.email;
    const specialhour = data.specialhour;
    let listOfSpecial = data.listOfSpecial;
    const dailyAvailability = data.dailyAvailability;
    const sdate = specialhour.sdate;
    const edate = specialhour.edate;
    const stime = specialhour.stime;
    const etime = specialhour.etime;

    let a = removeSpecialHours(
      dailyAvailability,
      sdate,
      edate,
      stime,
      etime
    );
    
    listOfSpecial = listOfSpecial.filter(e => JSON.stringify(e) !== JSON.stringify(specialhour));


    console.log(listOfSpecial)

    console.log(JSON.stringify(a, null, 2));

    const user = await db
      .collection("users")
      .findOneAndUpdate(
        { email },
        {
          $set: {
            // dailyAvailability: a,
          },
        },
        { returnDocument: "after" }
      );

    if (user) {
        res.status(200).json({ message: "Special Hour deleted successfully" });
    } else {
      res.status(400).json({ error: "Something Went Wrong" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error)
  }
});

module.exports = router;
