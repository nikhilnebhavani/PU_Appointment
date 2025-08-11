const express = require("express");
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");
const moment = require("moment");

function generateAvailabilityData(
  dailyAvailability,
  block_date,
  all_day,
  timming,
   reason
) {
  if (all_day) {
    dailyAvailability = dailyAvailability.filter((entry) => entry.date !== block_date);
    dailyAvailability.push({
      date: block_date,
      freeSlots: [],
      block_time: [
        {
          all_day,
          reason
        }
      ]
    });
  } else {
    dailyAvailability.forEach((entry) => {
      if (entry.date === block_date) {
        if (!entry.block_time) {
          entry.block_time = [];
        }
        entry.block_time.push({
          all_day,
          reason,
          stime: timming.stime,
          etime: timming.etime
        });
        entry.freeSlots.forEach((slot, index) => {
          const slotStart = moment(slot.start, "HH:mm");
          const slotEnd = moment(slot.end, "HH:mm");
          const stime = moment(timming.stime, "HH:mm");
          const etime = moment(timming.etime, "HH:mm");

          if (slotStart.isSame(stime) && slotEnd.isSame(etime)) {
            entry.freeSlots.splice(index, 1);
          } 
          else if (slotStart.isBefore(etime) && slotEnd.isAfter(stime)) {
            if (slotStart.isBefore(stime)) {
              entry.freeSlots.splice(index, 1, {
                start: slot.start,
                end: timming.stime,
              });
              entry.freeSlots.splice(index + 1, 0, {
                start: timming.etime,
                end: slot.end,
              });
            } else {
              entry.freeSlots.splice(index, 1, {
                start: timming.etime,
                end: slot.end,
              });
              entry.freeSlots.splice(index, 0, {
                start: slot.start,
                end: timming.stime,
              });
            }
          }
        });
      }
    });
  }

  return dailyAvailability;
}

router.post("/", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { token, all_day, sdate, reason } = data;
    const dailyAvailability = data.dailyAvailablity;
    let timming = { stime: "00:00", etime: "23:00" };
    if (!all_day) {
      const { stime, etime } = data;
      timming = { stime, etime };
    }
    const updatedDailyAvailability = generateAvailabilityData(
      dailyAvailability,
      block_date=sdate,
      all_day,
      timming,
      reason
    );

    const bytes = CryptoJS.AES.decrypt(token, process.env.TOKEN_SECRET);
    const email = await JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (all_day) {
      const post = await db.collection("users").findOneAndUpdate(
        { email },
        {
          $set: { dailyAvailability: updatedDailyAvailability }
        },

        { returnOriginal: false }
      );
      if (post) {
        res.status(200).json({ post: post });
      } else {
        console.log("User not found:", email);
        res.status(400).json({ error: "User not found" });
      }
    } else {
      const post = await db
        .collection("users")
        .findOneAndUpdate(
          { email },
          {
            $set: { dailyAvailability: updatedDailyAvailability }
          },
          { returnOriginal: false }
        );
      if (post) {
        res.status(200).json({ post: post });
      } else {
        console.log("User not found:", email);
        res.status(400).json({ error: "User not found" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
