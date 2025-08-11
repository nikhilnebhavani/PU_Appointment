const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");
const moment = require('moment');

const createDayAvailability = (days, stime, etime) => {
  const dayAvailability = {};
  days.forEach(day => {
    dayAvailability[day.toUpperCase()] = { stime, etime };
  });
  return dayAvailability;
};

function generateAvailabilityData({ days, start, end, sdate, edate }) {
  const availabilityData = [];
  const currentDate = moment(sdate, "YYYY-MM-DD");
  const endDate = moment(edate, "YYYY-MM-DD");

  while (currentDate.isSameOrBefore(endDate)) {
    const weekday = currentDate.format('dddd').toUpperCase();

    if (days.includes(weekday)) {
      availabilityData.push({
        day: weekday,
        date: currentDate.format('YYYY-MM-DD'),
        start: start,
        end: end,
        freeSlots: [{ start: start, end: end }]
      });
    }

    currentDate.add(1, 'days');
  }

  return availabilityData;
}



router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { email, name, number, institute, department, position } = data;

    const date = new Date();
    const sdate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    date.setDate(date.getDate() + 30); // Add 30 days
    // Format the new date as DD-MM-YYYY
    const edate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    const daysDetail = createDayAvailability(days, "09:00", "17:00");
    const availabilityData = generateAvailabilityData({ days, start: "09:00", end: "17:00", sdate, edate });


    const post = await db.collection("users").insertOne({
      email,
      name,
      number,
      institute,
      department,
      position,
      days_detail: daysDetail,
      dailyAvailability: availabilityData,
      date_range: { start: sdate, end: edate },
      special_hours: [], block_times: [],
      level: 0,
      active: false
    });

    if (post.insertedId) {
      const token = CryptoJS.AES.encrypt(JSON.stringify(email), process.env.TOKEN_SECRET).toString();
      res.status(201).json({ token });
    } else {
      res.status(400).json({ error: "Something Went Wrong" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
