"use client";
import styles from "./newapp.module.css";
import Image from "next/image";
import Navbar from "../../components/navbar/page";
import React, { useEffect, useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
const moment = require("moment");

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#EFF2F5",
    border: "none",
    outline: "0px",
    cursor: "pointer",
  }),
  menu: (provided) => ({
    ...provided,
    padding: "1% 1%",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "black" : "#EFF2F5",
    color: state.isSelected ? "white" : "black",
    borderRadius: "10px",
    margin: "2% 0",
    "&:hover": {
      backgroundColor: "black",
      cursor: "pointer",
      color: "white",
    },
  }),
};

function mergeFreeSlots(freeSlots) {
  if (!freeSlots || freeSlots.length === 0) return [];

  // Sort free slots by start time
  freeSlots.sort((a, b) =>
    moment(a.start, "HH:mm").diff(moment(b.start, "HH:mm"))
  );

  const mergedSlots = [freeSlots[0]];

  for (let i = 1; i < freeSlots.length; i++) {
    const lastMergedSlot = mergedSlots[mergedSlots.length - 1];
    const currentSlot = freeSlots[i];

    if (
      moment(lastMergedSlot.end, "HH:mm").isSameOrAfter(
        moment(currentSlot.start, "HH:mm")
      )
    ) {
      // Merge slots
      lastMergedSlot.end = moment
        .max(
          moment(lastMergedSlot.end, "HH:mm"),
          moment(currentSlot.end, "HH:mm")
        )
        .format("HH:mm");
    } else {
      // No overlap, push current slot
      mergedSlots.push(currentSlot);
    }
  }

  return mergedSlots;
}


function generateAllowedTimes(
  detail,
  member_detail,
  priority,
  selectedDate,
  meetingDuration,
  preBuffer
) {
  // Filter slots based on priority
  const getSlots = (data) =>
    data.find((e) => e.date === selectedDate)?.freeSlots || [];

  let freeSlots = [];
  if (priority === "me") {
    freeSlots = getSlots(detail);
  } else if (priority === "member") {
    freeSlots = getSlots(member_detail);
  } else if (priority === "both") {
    const mySlots = getSlots(detail);
    const memberSlots = getSlots(member_detail);
  
    freeSlots = [];
  
    mySlots.forEach((mySlot) => {
      memberSlots.forEach((memberSlot) => {
        const start = moment.max(
          moment(mySlot.start, "HH:mm"),
          moment(memberSlot.start, "HH:mm")
        );
        const end = moment.min(
          moment(mySlot.end, "HH:mm"),
          moment(memberSlot.end, "HH:mm")
        );
  
        if (start.isBefore(end)) {
          freeSlots.push({
            start: start.format("HH:mm"),
            end: end.format("HH:mm"),
          });
        }
      });
    });
  }

  const mergedSlots = mergeFreeSlots(freeSlots);
  const allowedTimes = [];
  const durationMinutes = moment.duration(meetingDuration).asMinutes();
  const preBufferMinutes = moment.duration(preBuffer).asMinutes();

  const totalMeetingTime =
    durationMinutes + preBufferMinutes;
  console.log(durationMinutes)
  const isToday = moment().isSame(selectedDate, "day");
  let currentTime = moment().add(2, "hours");

  mergedSlots.forEach((slot) => {
    let slotStart = moment(slot.start, "HH:mm");
    const slotEnd = moment(slot.end, "HH:mm");

    while (
      slotStart.clone().add(totalMeetingTime, "minutes").isSameOrBefore(slotEnd)
    ) {
      const meetingStart = slotStart.clone().add(preBufferMinutes, "minutes");

      if (!isToday || (isToday && meetingStart.isAfter(currentTime))) {
        allowedTimes.push(meetingStart.toDate());
      }
      slotStart.add(15, "minutes");
    }
  });

  return allowedTimes;
}




export default function newapp() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const router = useRouter()
  const [value, onChange] = useState("10:00");
  const [options, setOptions] = useState([]);
  const [date, setDate] = useState(() => {
    const formattedDate = today.toISOString().split("T")[0];
    return formattedDate;
  });
  const [specificDates, setDates] = useState([new Date()]);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);
  const [time, setTime] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0)
  );
  const [allowedTimes, setAllowedTimes] = useState([
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), // 9:00 AM
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0), // 12:00 PM
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), // 3:00 PM
  ]);
  const [member, setMember] = useState("");
  const [member_name, setMemberName] = useState("");
  const [member_email, setMemberEmail] = useState("");
  const [member_phone, setMemberPhone] = useState("");
  const [member_detail, setMemberDetail] = useState([]);
  const [detail, setDetail] = useState([]);
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formattedTime, setFormattedTime] = useState("");
  const [duration, setDuration] = useState("00:15");
  const [mode, setMode] = useState("offline");
  const [time_pop, setTimePop] = useState(false);
  const [priority, setPriority] = useState("both");


  useEffect(() => {
    const token = Cookies.get("token");
    const fetchData = async () => {
      if (token != null) {
        const user = { tokens:token };
        try {
          const response = await fetch(`${apiUrl}/newapp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
          });
          if (response.status != 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const result = await response.json();
          if(result.a.length>0){
            let temp =[]
            result.a.map((e)=>{
              temp.push({label:e.name, value:e.id, detail:e.datesAndtimes, email:e.email, number:e.number})
            })
            setOptions(temp)
          }
          setDetail(result.datesAndtimes);
          setName(result.name);
          setPhone(result.phone);
          setEmail(result.email);
        } catch (error) {
          alert(error);
        }
      }
    };
    fetchData();
  }, []);



  useEffect(() => {
    const processDates = (items) =>
      items.map((e) => new Date(e.date)).filter((date) => date >= today);
  
    let dates = [];
    if (priority === "me") {
      dates = processDates(detail);
    } else if (priority === "both") {
      const detailDates = processDates(detail);
      const memberDates = processDates(member_detail);
  
      // Find common dates
      dates = detailDates.filter((date) =>
        memberDates.some((memberDate) => date.getTime() === memberDate.getTime())
      );
    } else {
      dates = processDates(member_detail);
    }
  
    setDates(dates);
  
    if (dates.length > 0) {
      const a = dates[0].toISOString().split("T")[0];
      setDate(a);
    } else {
      console.error("No dates available.");
    }
  
  }, [detail, priority, member_detail, today]);

  useEffect(() => {
    const updateAllowedTimes = () => {
      const times = generateAllowedTimes(
        detail,
        member_detail,
        priority,
        date,
        duration,
        "00:15", // preBuffer
      );
      setAllowedTimes(times);
    };
  
    updateAllowedTimes();
  
    const intervalId = setInterval(() => {
      updateAllowedTimes();
    }, 60000);
  
    return () => clearInterval(intervalId);
  }, [date, detail, member_detail, priority, duration]);
  
  useEffect(() => {
    if (allowedTimes[0]) {
      const startTime = moment(allowedTimes[0]);
      const endTime = startTime.clone().add(duration, "minutes");
  
      setTime(allowedTimes[0]); // Keep the original start time
      setFormattedTime(`${startTime.format("HH:mm")} to ${endTime.format("HH:mm")}`);
    } else {
      setFormattedTime(""); // Clear the formatted time if no allowed times
    }
  }, [allowedTimes, duration]);
  
  


  const handleCreate = async () => {
    const user = {
      duration,
      mode,
      priority,
      date,
      time: formattedTime,
      booked_by: { email, name, phone },
      booked_to: { member_email, member_name, member_phone},
      detail: details
    };
    try {
      const response = await fetch(`${apiUrl}/create_meeting2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        const result = await response.json()
        emailSend();
        alert("Meeting Requent Sent !");
        router.push(`/mymeeting?${result.id}`)
      } else {
        const err = await response.json();
        alert(err.error);
        console.log(err);
      }
    } catch (error) {
      alert(error);
    }
  };

  const emailSend = async () => {
    const user = {
      email_type: "request",
      date,
      time: formattedTime,
      booked_by: { email, name, phone },
      booked_to: { member_email, member_name, member_phone},
      mode,
      detail: details,
    };
    try {
      const response = await fetch(`${apiUrl}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        
      } else {
        const err = await response.json();
        alert(err.error);
        console.log(err);
      }
    } catch (error) {
      alert(error);
    }
  };


  const formatTime = (time) => {
    const startTime = moment(time);
    const endTime = startTime.clone().add(duration, "minutes");

    return `${startTime.format("HH:mm")} to ${endTime.format("HH:mm")}`;
  };

  const isDateIncluded = (date) => {
    return specificDates.some(specificDate => specificDate.getTime() === date.getTime());
  };

  return (
    <main className={styles.main}>
      <Navbar />

      <div className={styles.mcontainer}>

        <div className={styles.boxes}>
          <div className={styles.container}>
            <div className={styles.member} onClick={() => { setTimePop(false) }}>
              <p>Meeting With</p>
              <Select
                options={options}
                value={options.find((option) => option.value === value)}
                onChange={(selectedOption) => {
                  // Handle onChange logic
                  const newValue = selectedOption ? selectedOption.value : "";
                  onChange(newValue);
                  setMember(newValue);
                  setMemberName(selectedOption.label)
                  setMemberEmail(selectedOption.email)
                  setMemberPhone(selectedOption.number)
                  setMemberDetail(selectedOption.detail || [])
                }}
                isClearable
                placeholder="Select a Person..."
                styles={customStyles}
                className={styles.dn}
              />
            </div>
            <div className={styles.service} onClick={() => { setTimePop(false) }}>
              <p>Duration</p>
              <select
                name="duration"
                id="duration"
                onChange={(e) => {
                  setDuration(e.target.value);
                }}
              >
                <option value="00:15">15 minutes</option>
                <option value="00:30">30 minutes</option>
                <option value="00:45">45 minutes</option>
                <option value="01:00">1 hour</option>
                <option value="01:30">1 hour 30 minutes</option>
                <option value="02:00">2 hours</option>
                <option value="03:00">3 hours</option>
                <option value="04:00">4 hours</option>
              </select>
            </div>

            <div className={styles.service} onClick={() => { setTimePop(false) }}>
              <p>Priority</p>
              <select
                name="priority"
                id="priority"
                onChange={(e) => {
                  setPriority(e.target.value);
                }}
              >
                <option value="both">Both</option>
                <option value="me">Me</option>
                <option value="member">Meeting with person</option>
              </select>
            </div>

            <div className={styles.service} onClick={() => { setTimePop(false) }}>
              <p>Mode</p>
              <select
                name="mode"
                id="mode"
                onChange={(e) => {
                  setMode(e.target.value);
                }}
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div className={styles.date} onClick={() => { setTimePop(false) }}>
              <p>Date</p>
              <div className={styles.dt}>
                <DatePicker
                  id="datePicker"
                  selected={date}
                  onChange={(date) => {
                    const formattedDate = date.toISOString().split("T")[0];
                    setDate(formattedDate);
                  }}
                  dateFormat="yyyy-MM-dd"
                  minDate={today}
                  maxDate={maxDate}
                  includeDates={specificDates}
                  className={styles.DatePicker}
                />
              </div>
            </div>

            <div className={styles.time}>
              <p>Time</p>
              <div className={styles.timePickerContainer}>
                <div className={styles.selectedTimeDisplay} onClick={() => { setTimePop(!time_pop) }}>
                  {time ? (
                    <h4>{formatTime(time)}</h4>
                  ) : (<h4>No Slots</h4>)}
                </div>
                <div className={styles.timeGrid} style={time_pop ? { transform: "scale(1)" } : {}}>
                  {allowedTimes.map((t, index) => (
                    <button
                      key={index}
                      className={`${styles.timeSlot} ${time === t ? styles.selected : ''
                        }`}
                      onClick={() => {
                        setTime(t)
                        setFormattedTime(moment(t).format("HH:mm"))
                        setTimePop(false)
                      }}
                    >
                      {formatTime(t)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.des} onClick={() => { setTimePop(false) }}>
              <p>Detail</p>
              <textarea
                value={details}
                onChange={(e) => {
                  setDetails(e.target.value);
                }}
                placeholder="Meeting Description"
                rows="5"
                cols="60 name=description"
              ></textarea>
            </div>


            <button
              className={styles.btn}
              onClick={() => {
                if (
                  member != "" 
                ) {
                  isDateIncluded(new Date(date)) ? handleCreate() : alert("Date is not valid !")
                } else {
                  alert("Enter all needed details..");
                }
              }}
            >
              Create
            </button>
          </div>


        </div>
      </div>
    </main>
  );
}
