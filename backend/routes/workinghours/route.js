const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");
const moment = require('moment');


function generateAvailabilityData(dailyAvailability,removedDays, changedDays, days_detail, date_range) {
  const startDate = moment(date_range.start);
  const endDate = moment(date_range.end);

  // Filter dailyAvailability to only include dates within the specified range
  dailyAvailability = dailyAvailability.filter(data => {
    const date = moment(data.date);
    return date.isBetween(startDate, endDate, undefined, '[]');
  });

  removedDays.forEach(day=>{
    dailyAvailability = dailyAvailability.filter(data => {
      return data.day !== day;
      });
  })

  let currentDate = startDate.clone();
  while (currentDate.isSameOrBefore(endDate)) {
    let date = currentDate
    let t = true
    dailyAvailability.forEach(data => {
        let fd = date.format("YYYY-MM-DD");
        if( data.date == fd ){
          t = false
        }
    });

    if(t){
      const weekday = currentDate.format('dddd').toUpperCase();
      if (days_detail.hasOwnProperty(weekday))  {
        dailyAvailability.push({
          day: weekday,
          date: currentDate.format('YYYY-MM-DD'),
          start: days_detail[weekday].stime,
          end: days_detail[weekday].etime,
          freeSlots: [{ start: days_detail[weekday].stime, end: days_detail[weekday].etime }],
        });
      }

    }
    currentDate = currentDate.add(1, 'day');
  }


  changedDays.forEach(day => {
    dailyAvailability.forEach(data => {
      if( data.day == day ){
        data.start = days_detail[day].stime,
        data.end = days_detail[day].etime

        if(data.freeSlots.length==1){
          data.freeSlots[0].start = days_detail[day].stime
          data.freeSlots[0].end = days_detail[day].etime
        }
        else if(data.freeSlots.length>1){
          data.freeSlots[0].start = days_detail[day].stime
          data.freeSlots[data.freeSlots.length - 1].end = days_detail[day].etime
        }
      }
    });
  });

  // dailyAvailability=[]
  dailyAvailability.sort((a, b) => new Date(a.date) - new Date(b.date));

  return dailyAvailability;
}





router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const days_detail = data.days_details;
    const old_detail = data.old_details;
    const date_range = data.date_range;
    const dailyAvailability = data.dailyAvailablity;
    const bytes = CryptoJS.AES.decrypt(data.token, process.env.TOKEN_SECRET);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    const user_data = JSON.parse(originalText);
    const changedDays = Object.keys(old_detail).filter(day => {
      if(days_detail[day] && old_detail[day]){
      return days_detail[day].stime !== old_detail[day].stime ||
             days_detail[day].etime !== old_detail[day].etime;
      }
    });

    const removedDays = Object.keys(old_detail).filter(day => !Object.keys(days_detail).includes(day));
    
    const updatedDailyAvailability = generateAvailabilityData(dailyAvailability,removedDays, changedDays, days_detail, date_range);

    const user = await db.collection("users").findOneAndUpdate(
      { email: user_data },
      { $set: { days_detail, dailyAvailability: updatedDailyAvailability, date_range } },
      { returnDocument: 'after' }
    );

    if (user) {
      res.status(200).json({ "Status": "Ok" });
    } else {
      res.status(400).json(user_data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
