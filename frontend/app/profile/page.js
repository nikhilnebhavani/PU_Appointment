"use client";
import Image from "next/image";
import styles from "./profile.module.css";
import Navbar from "../../components/navbar/page";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const moment = require('moment');
import { signOut, useSession } from 'next-auth/react';

function institute_short(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    throw new Error("Invalid input");
  }

  const parts = fullName.split(' - ');

  const generatePartAcronym = (part) => {
    const words = part.split(' ');
    const commonWords = ['of', 'and', 'the', 'for'];
    return words
      .filter(word => word && !commonWords.includes(word.toLowerCase()))
      .map(word => word[0].toUpperCase())
      .join('');
  };

  const acronym = parts.map((part, index) => {
    if (index === parts.length - 1 && part.split(' ').length === 1) {
      return part;
    }
    return generatePartAcronym(part);
  }).join('-');

  return acronym;
}

export default function profile() {

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const router = useRouter()


  const { data: session } = useSession();

  const institutes = [
    "Parul Institute Of Physiotherapy  ",
    "Parul Institute Of Management And Research - MBA",
    "Parul Institute Of Paramedical And Health Sciences ",
    "Parul Institute Paramedical Education And Research ",
    "College Of Agricuiture ",
    "Parul Institute Of Homoeopathy & Research ",
    "Parul Institute Of Technology ",
    "Parul Institute Of Business Administration ",
    "Institute Of Pharmaceutical Sciences",
    "Parul Polytechnic Institute ",
    "Parul Institute Of Nursing ",
    "Parul Institute Of Engineering & Technology ",
    "Parul Institute Of Engineering and Technology (DS)",
    "School Of Pharmacy ",
    "Parul Institute Of Pharmacy and Research ",
    "Parul Institute Of Computer Application (BCA)",
    "Parul Institute Of Commerce",
    "Parul Institute Of Social Work ",
    "Parul Institute Of Law ",
    "Parul Institute Of Hotel Management & Catering Technology ",
    "Parul Institute Of Arts ",
    "Parul Institute Of Archiecature & Research ",
    "Jawaharlal Nehru Homoeopathic Medical College ",
    "Parul Institute Of Pharmacy ",
    "Parul Institute Of Applied Sciences ",
    "Parul Institute Of  Ayurved ",
    "Parul Institute Of Ayurveda & Research ",
    "Parul Institute Of Design ",
    "Parul Institute Of Public Health ",
    "Parul College Of Pharmacy And Research Ahmedabad ",
    "Ahmedabad Homoeopathic Medical College ",
    "Rajkot Homoeopathic Medical College ",
    "Parul Institute Of Applied Sciences Ahmedabad ",
    "PIPT",
    "Ahmedabad Pysiotheraphy College ",
    "Parul Institute Of Physiotherapy And Research ",
    "Parul Institute Of Nursing And Research ",
    "PIMSR",
  ];
  const positions = [
    "Director",
    "Dean",
    "Principal",
    "Vice principal",
    "Academic director",
    "Professor",
    "Associate professor",
    "Assistant professor",
  ];
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [number, setNumber] = useState("");
  const [institute, setInstitute] = useState("");
  const [department, setDepartment] = useState("");
  const [dailyAvailablity, setDaiilyAvailability] = useState([]);
  const [daydetails, setDayDetails] = useState({});
  const [role, setRole] = useState("");
  const [edit, setEdit] = useState(false);
  const [personal, setPersonal] = useState(true);
  const [customize_hours_popup, setPopup1] = useState(false);
  const [special_hours_popup, setPopup2] = useState(false);
  const [Add_Additional_Availability_popup, setPopup3] = useState(false);
  const [value1, setVal1] = useState("Disabled");
  const [radio_value, setVal2] = useState(true);
  const [a, setA] =useState(true)
  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  const [daydetail_update, setUpdateDayDetail] = useState({});
  const [all_day, setAllDay] = useState(false);
  const today = new Date();
  const [special_sdate, setSpecialSDate] = useState(() => {const formattedDate = today.toISOString().split("T")[0];
    return formattedDate;
  });
  const [special_edate, setSpecialEDate] = useState(() => {const formattedDate = today.toISOString().split("T")[0];
  return formattedDate;
});
const [range_sdate, setRangeSDate] = useState(() => {const formattedDate = today.toISOString().split("T")[0];
  return formattedDate;
});
const [range_edate, setRangeEDate] = useState(() => {const formattedDate = today.toISOString().split("T")[0];
return formattedDate;
});
  const [special_stime, setSpecialSTime] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0)
  );
  const [formated_special_stime, setFormatedSpecialSTime] = useState(
    moment(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0)).format("HH:mm")
  );

  const [special_etime, setSpecialETime] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0));
  const [formated_special_etime, setFormatedSpecialETime] = useState(
    moment(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0)).format("HH:mm")
  );
  const [special_reason, setSpecialReason] = useState("");

  const [block_all_day, setBlockAllDay] = useState(false);
  const [block_sdate, setBlockSDate] = useState(() => {const formattedDate = today.toISOString().split("T")[0];
    return formattedDate;
  });
  const [block_edate, setBlockEDate] = useState(() => {const formattedDate = today.toISOString().split("T")[0];
  return formattedDate;
});
  const [block_stime, setBlockSTime] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0)
  );;
  const [block_etime, setBlockETime] = useState("15:00");
  const [block_reason, setBlockReason] = useState("");

  const [listOfSpecial, setListOfSpecial] = useState([]);
  const [listOfBlock, setListOfBlock] = useState([]);



  const handleSpecialDeleteHour = async (e)=>{
    const user = {specialhour:e, email, dailyAvailability:dailyAvailablity, listOfSpecial}
    console.log(user)
    try {
      const response = await fetch(`${apiUrl}/deleteSpecialHour`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        alert("Data is Updated");
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (error) {
      alert(error);
    }
  }

  useEffect(() => {
    const tokens = Cookies.get("token");

    // let tokens = "U2FsdGVkX1/BCfZq1B2Lal7wmzF/PPOhhKGlaAywq84zY+idBIZeUwCozs90HFRz"

    setToken(tokens);
    const fetchData = async () => {
      if (tokens != null) {
        const user = { tokens };
        try {
          const response = await fetch(`${apiUrl}/profile`, {
          // const response = await fetch("http://172.20.10.14:3001/profile", {

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

          setName(result.post.name);
          setNumber(result.post.number);
          setEmail(result.post.email);
          setRole(result.post.position);
          setInstitute(result.post.institute);
          setDepartment(result.post.department);
          setDayDetails(result.post.days_detail);
          setUpdateDayDetail(result.post.days_detail);
          setDaiilyAvailability(result.post.dailyAvailability);
          setListOfSpecial(result.post.special_hours);
          setListOfBlock(result.post.block_times);
          setRangeSDate(result.post.date_range.start);
          setRangeEDate(result.post.date_range.end);
        } catch (error) {
          alert(error);
        }
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async () => {
    const user = { token, name, number, department, role, institute };
    try {
      const response = await fetch(`${apiUrl}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        alert("Data is Updated");
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleCheckboxChange = (day, isChecked) => {
    setUpdateDayDetail((prevDetails) => {
      const updatedDetails = { ...prevDetails };
      if (isChecked) {
        // If the checkbox is checked, set default start and end times
        updatedDetails[day] = {
          stime: "09:00",
          etime: "15:00",
        };
      } else {
        // If the checkbox is unchecked, remove the day from details
        delete updatedDetails[day];
      }
      return updatedDetails;
    });
  };

  const handleStartTimeChange = (day, startTime) => {
    setUpdateDayDetail((prevDetails) => ({
      ...prevDetails,
      [day]: {
        ...prevDetails[day],
        stime: startTime,
      },
    }));
  };

  const handleEndTimeChange = (day, endTime) => {
    setUpdateDayDetail((prevDetails) => ({
      ...prevDetails,
      [day]: {
        ...prevDetails[day],
        etime: endTime,
      },
    }));
  };

  const generateTimeOptions = (d) => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = `${i < 10 ? "0" + i : i}`;
        const minute = `${j === 0 ? "00" : j}`;
        options.push(`${hour}:${minute}`);
      }
    }
    return options.map((time) => (
      <option key={time} selected={time == d}>
        {time}
      </option>
    ));
  };

  const handleUpdateWorkingHours = async () => {
    const user = {
      token,
      days_details: daydetail_update,
      old_details: daydetails,
      dailyAvailablity,
      date_range : {start : range_sdate, end: range_edate}
    };
    try {
      const response = await fetch(`${apiUrl}/workinghours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        alert("Data is Updated");
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleSpecialHour = async () => {
    const user = {
      token,
      all_day,
      dailyAvailablity,
      sdate: special_sdate,
      edate: special_edate,
      reason : special_reason,
      stime: formated_special_stime,
      etime: formated_special_etime,
      listOfSpecial
    };
    try {
      const response = await fetch(`${apiUrl}/special_hours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        alert("Data is Updated");
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleBlockTimeOFf = async () => {
    if(!radio_value){
      const user = {
        token,
        all_day: block_all_day,
        dailyAvailablity,
        sdate: block_sdate,
        block_reason,
        stime: block_stime,
        etime: block_etime,
      };
      try {
        const response = await fetch(`${apiUrl}/block_time`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });
  
        if (response.status === 200) {
          alert("Data is Updated");
          window.location.reload();
        } else {
          const err = await response.json();
          alert(err.error);
        }
      } catch (error) {
        alert(error);
      }
    }
    else{
      const user = {
        token,
        all_day: block_all_day,
        dailyAvailablity,
        sdate: block_sdate,
        edate :block_edate,
        block_reason,
        stime: block_stime,
        etime: block_etime,
      };
      try {
        const response = await fetch(`${apiUrl}/time_off`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });
  
        if (response.status === 200) {
          alert("Data is Updated");
          window.location.reload();
        } else {
          const err = await response.json();
          alert(err.error);
        }
      } catch (error) {
        alert(error);
      }
    }
  }

  return (
    <main className={styles.main}>
     <Navbar/>

      <div className={styles.all_parts}>
        <div className={styles.left_part}>
          <div className={styles.profile_pic}>
          {session ? (
        <>
         <Image
              width={1000}
              height={1000}
              src={session.user.image}
              alt="profile logo"
            />
          
        </>
      ) : (
        <Image
              width={1000}
              height={1000}
              src="/profile_image.png"
              alt="profile logo"
            />
      )}

            <br></br>
            <p className={styles.info}>{name}</p>
            <p className={styles.info}>
              {role} *  {institute ? institute_short(institute) : ""} * {department}
            </p>
          </div>
          <div className={styles.button}>
            <button  onClick={() => {
                setPersonal(true);
              }} className={personal ? styles.active : ""}>General Information </button>
            <button  onClick={() => {
                setPersonal(false);
              }} className={!personal ? styles.active : ""}>Working Hours </button>
            <button  onClick={() => {
                Cookies.remove("token")
                router.push('/login') 
                signOut({ redirect: false })
              }} className={styles.signOut}>Sign Out</button>
          </div>
          
        </div>
        {personal && (
          <div className={styles.right_part}>
            <div className={styles.h3}>
              <h3>Personalize Your Profile</h3>
              <button
                style={!edit ? { } : { display: "none" }}
                onClick={() => {
                  setEdit(true);
                }}
              >
                <Image src={"/edit.svg"} width={100} height={100} alt="#" />
                Edit
              </button>
            </div>
            <div className={styles.text}>
              <p>Name</p>
              <input
                value={name}
                readOnly={edit ? false : true}
                style={
                  edit ? { border: "1px solid black", padding: "5px" } : {}
                }
                type="text"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <hr></hr>
            <div className={styles.text}>
              <p>Email</p>
              <input value={email} type="text" />
            </div>
            <hr></hr>

            <div className={styles.text}>
              <p>Number</p>
              <input
                value={number}
                readOnly={edit ? false : true}
                style={
                  edit ? { border: "1px solid black", padding: "5px" } : {}
                }
                type="text"
                onChange={(e) => {
                  setNumber(e.target.value);
                }}
              />
            </div>
            <hr></hr>

            <div className={styles.text}>
              <p>Role</p>
              {edit ? (<select
                  onChange={(e) => {
                    setRole(e.target.value);
                  }}
                >
                  <option value="" selected disabled>
                    Selcet Position
                  </option>
                  {positions.map((e)=>{
                    let a = false
                    if(e==role){
                      a= true
                    }
                    return(<option value={e} selected={a ? true : false}>{e}</option>)
                  })}

                  
                </select>): (<input value={role} type="text" />)}

            </div>
            <hr></hr>

            <div className={styles.text}>
              <p>Institute</p>
              {edit ? (<select
                  onChange={(e) => {
                    setInstitute(e.target.value);
                  }}
                >
                  <option value="" selected disabled>
                    Selcet Position
                  </option>
                  {institutes.map((e)=>{
                    let a = false
                    if(e==institute){
                      a= true
                    }
                    return(<option value={e} selected={a ? true : false}>{e}</option>)
                  })}

                  
                </select>): (<input value={institute} type="text" />)}
              
            </div>
            <hr></hr>

            <div className={styles.text}>
              <p>Department</p>
              <input value={department}  
              readOnly={edit ? false : true}
                style={
                  edit ? { border: "1px solid black", padding: "5px" } : {}
                }
                type="text"
                onChange={(e) => {
                  setDepartment(e.target.value);
                }} />
            </div>
            <hr style={edit ? {} : { display: "none" }}></hr>
            {edit && (
              <div className={styles.update}>
                <button
                  className={styles.save}
                  onClick={() => {
                    handleUpdate();
                  }}
                >
                  Save
                </button>
                <button
                  className={styles.cancel}
                  onClick={() => {
                    setEdit(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {!personal && (
          <div className={styles.right_part}>
            <div className={styles.h3}>
              <h3>Edit Working Hours</h3>
            </div>
            <p
              className={styles.edit_customize}
              onClick={() => {
                setPopup1(true);
              }}
            >
              <svg
                width="24"
                height="24"
                stroke-width="1.5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.0207 5.82839L15.8491 2.99996L20.7988 7.94971L17.9704 10.7781M13.0207 5.82839L3.41405 15.435C3.22652 15.6225 3.12116 15.8769 3.12116 16.1421V20.6776H7.65669C7.92191 20.6776 8.17626 20.5723 8.3638 20.3847L17.9704 10.7781M13.0207 5.82839L17.9704 10.7781"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Customize working hours.
            </p>
            <div className={styles.working_hours}>
              <h3>Working Hours</h3>
              {days.map((day) => (
                <>
                  <div className={styles.text} key={day}>
                    <p>{day}</p>
                    {daydetails[day] ? (
                      <p className={styles.time}>
                        {daydetails[day].stime} - {daydetails[day].etime}
                      </p>
                    ) : (
                      <p className={styles.time} style={{ color: "red" }}>
                        Not available
                      </p>
                    )}
                  </div>
                  <hr></hr>
                </>
              ))}
            </div>
            <div className={styles.additional_hours}>
              <div className={styles.h4}>
                <h3>Personalize Your Profile</h3>
                <button
                  onClick={() => {
                    setPopup2(true);
                  }}
                >
                  Add
                </button>
              </div>

              <p>
                Working on Weekends or compensating for time off? Add them here
                to let customer know when you're availabe
              </p>
              {listOfSpecial.map((e)=>{
                return(<div className={styles.list_box}>
                  <div className={styles.left}>
                  <div><p>Date: {e.sdate} to {e.edate}</p></div>
                  <div><p>Time: {e.stime} to {e.etime}</p></div>
                  {e.reason!=null ? <div><p>Reason : {e.reason}</p></div> : <></> }
                  </div>
                  <button onClick={()=>{handleSpecialDeleteHour(e)}}><Image src={"/delete.svg"} width={100} height={100} alt=""/><p>Delete</p></button>
                </div>)
              })}
              
            </div>
            <div className={styles.additional_hours}>
              <div className={styles.h4}>
                <h3>Unavailability</h3>
                <button
                  onClick={() => {
                    setPopup3(true);
                  }}
                >
                  Add
                </button>
              </div>

              <p>
                Block days off of your schedule. Take a break or make time for
                other schedules you may have.
              </p>
              {listOfBlock.map((e)=>{
                return(<div className={styles.list_box}>
                  <div><p>Date: {e.date}</p><p>Day: {e.day}</p></div>
                  <div><p>Start Time: {e.start}</p><p>End Time: {e.end}</p></div>
                  <button><Image src={"/delete.svg"} width={100} height={100} alt=""/><p>Delete</p></button>
                </div>)
              })}
            </div>
          </div>
        )}

        <div
          className={styles.popup}
          style={
            customize_hours_popup
              ? {}
              : { left: "100vw", transitionDelay: "1s" }
          }
        >
          <div
            className={styles.container}
            style={customize_hours_popup ? {} : { right: "-90vw" }}
          >
            <div className={styles.popup_header}>
              <h2>Edit Working Hours</h2>
              <Image
                src={"/add.svg"}
                width={100}
                height={100}
                alt="close_button"
                onClick={() => {
                  setPopup1(false);
                }}
              ></Image>
            </div>
            <hr></hr>
            <div>
              <div className={styles.date_range}>
                <label>Date Range : </label>
                <DatePicker
                    id="datePicker"
                    selected={range_sdate}
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split("T")[0]; // Get date in "yyyy-MM-dd" format
                      setRangeSDate(formattedDate);
                    }}
                    dateFormat="yyyy-MM-dd"
                    minDate={today}
                    className={styles.daterangeselect}
                  />
                  <p> - </p>
                 <DatePicker
                    id="datePicker"
                    selected={range_edate}
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split("T")[0]; // Get date in "yyyy-MM-dd" format
                      setRangeEDate(formattedDate);
                    }}
                    dateFormat="yyyy-MM-dd"
                    minDate={today}
                    className={styles.daterangeselect}
                  />
              </div>

              <div className={styles.working_details}>
                {days.map((day, index) => (
                  <div className={styles.working_day} key={index}>
                    <input
                      type="checkbox"
                      checked={daydetail_update[day] ? true : false}
                      onChange={(e) =>
                        handleCheckboxChange(day, e.target.checked)
                      }
                    />
                    <p className={styles.label}>{day}</p>
                    {daydetail_update[day] && (
                      <div>
                        <select
                          value={daydetail_update[day].stime}
                          onChange={(e) =>
                            handleStartTimeChange(day, e.target.value)
                          }
                        >
                          {generateTimeOptions(daydetail_update[day].stime)}
                        </select>
                        <p>-</p>
                        <select
                          value={daydetail_update[day].etime}
                          onChange={(e) =>
                            handleEndTimeChange(day, e.target.value)
                          }
                        >
                          {generateTimeOptions(daydetail_update[day].etime)}
                        </select>
                      </div>
                    )}
                    {!daydetail_update[day] && (
                      <div>
                        <select
                          onChange={(e) =>
                            handleStartTimeChange(day, e.target.value)
                          }
                          disabled
                        >
                          <option>09:00</option>
                        </select>
                        <p>-</p>
                        <select
                          onChange={(e) =>
                            handleEndTimeChange(day, e.target.value)
                          }
                          disabled
                        >
                          <option>17:00</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              ;
            </div>
            <div className={styles.popup_footer}>
              <button className={styles.cancel}>Cancel</button>
              <button
                className={styles.save}
                onClick={handleUpdateWorkingHours}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div
          className={styles.popup}
          style={
            special_hours_popup ? {} : { left: "100vw", transitionDelay: "1s" }
          }
        >
          <div
            className={styles.container}
            style={special_hours_popup ? {} : { right: "-90vw" }}
          >
            <div className={styles.popup_header}>
              <h2>Special Working Hours</h2>
              <Image
                src={"/add.svg"}
                width={100}
                height={100}
                alt="close_button"
                onClick={() => {
                  setPopup2(false);
                }}
              ></Image>
            </div>
            <hr></hr>
            <div>
              {/* <div className={styles.special_box}>
                <label>Staff</label>
                <input type="text" value={"Name"} disabled />
              </div> */}
              <div className={styles.special_box}>
                <label>All-Day Availability</label>{" "}
                <label className={styles.switch}>
                  <input type="checkbox" />
                  <span
                    className={styles.slider}
                    onClick={() => {
                      value1 == "Enabled"
                        ? setVal1("Disabled") 
                        : setVal1("Enabled")
                      value1 == "Enabled" ? setAllDay(false)  : setAllDay(true)
                    }}
                  >
                    {value1}
                  </span>
                </label>
              </div>
              <div className={styles.special_box}>
                <label>From</label>
                <div className={styles.details}>
                  <DatePicker
                    id="datePicker"
                    selected={special_sdate}
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split("T")[0]; // Get date in "yyyy-MM-dd" format
                      setSpecialSDate(formattedDate);
                    }}
                    dateFormat="yyyy-MM-dd"
                    minDate={today}
                  className={styles.DatePicker}

                  />
                  <br></br>
                  <DatePicker
                  id="timePicker"
                  selected={special_stime}
                  onChange={(time) => {
                    setSpecialSTime(time);
                    setFormatedSpecialSTime(moment(time).format("HH:mm"));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  timeFormat="HH:mm"
                  dateFormat="HH:mm"
                  className={styles.DatePicker}
                />
                  {/* <select
                    className={value1 == "Enabled" ? styles.hide : ""}
                    onChange={(e) => {
                      setSpecialSTime(e.target.value);
                    }}
                  >
                    {generateTimeOptions(special_stime)}
                  </select> */}
                </div>
              </div>
              <div className={styles.special_box}>
                <label>To</label>
                <div className={styles.details}>
                  <DatePicker
                    id="datePicker"
                    selected={special_edate}
                    dateFormat="yyyy-MM-dd"
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split("T")[0];
                      setSpecialEDate(formattedDate);
                    }}
                    minDate={today}
                  className={styles.DatePicker}

                  />
                  <br></br>
                   <DatePicker
                  id="timePicker"
                  selected={special_etime}
                  onChange={(time) => {
                    setSpecialETime(time);
                    setFormatedSpecialETime(moment(time).format("HH:mm"));

                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  timeFormat="HH:mm"
                  dateFormat="HH:mm"
                  className={styles.DatePicker}
                />
                  {/* <select
                    className={value1 == "Enabled" ? styles.hide : ""}
                    onChange={(e) => {
                      setSpecialETime(e.target.value);
                    }}
                  >
                    {generateTimeOptions(special_etime)}
                  </select> */}
                </div>
              </div>
              <div className={styles.special_box}>
                <label>Reason</label>
                <textarea
                  onChange={(e) => {
                    setSpecialReason(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className={styles.popup_footer}>
              <button className={styles.cancel}>Cancel</button>
              <button className={styles.save} onClick={handleSpecialHour}>
                Save
              </button>
            </div>
          </div>
        </div>

        <div
          className={styles.popup}
          style={
            Add_Additional_Availability_popup
              ? {}
              : { left: "100vw", transitionDelay: "1s" }
          }
        >
          <div
            className={styles.container}
            style={Add_Additional_Availability_popup ? {} : { right: "-90vw" }}
          >
            <div className={styles.popup_header}>
              <h2>Unavailability </h2>
              <Image
                src={"/add.svg"}
                width={100}
                height={100}
                alt="close_button"
                onClick={() => {
                  setPopup3(false);
                }}
              ></Image>
            </div>
            <hr></hr>
            <div>
              {/* <div className={styles.special_box}>
                <label>Staff</label>
                <input type="text" value={"Name"} disabled />
              </div> */}
              <div className={styles.special_box}>
                <label>Type</label>
                <div className={styles.radio}>
                  <div>
                    {" "}
                    <input
                      type="radio"
                      name="radio"
                      defaultChecked
                      onClick={() => {
                        setVal2(true);
                      }}
                    />
                    <p>Time Off</p>
                  </div>
                  <div>
                    {" "}
                    <input
                      type="radio"
                      name="radio"
                      onClick={() => {
                        setVal2(false);
                      }}
                    />
                    <p>Block Time</p>
                  </div>
                </div>
              </div>

              <div className={styles.special_box}>
                <label>All-Day Unavailability</label>{" "}
                <label className={styles.switch}>
                  <input type="checkbox" />
                  <span
                    className={styles.slider}
                    onClick={() => {
                      value1 == "Enabled"
                        ? setVal1("Disabled")
                        : setVal1("Enabled");
                      value1 == "Enabled" ? setBlockAllDay(false) : setBlockAllDay(true)
                    }}
                  >
                    {value1}
                  </span>
                </label>
              </div>
              <div className={styles.special_box}>
                <label>From</label>
                <div className={styles.details}>
                  <DatePicker
                    id="datePicker"
                    selected={block_sdate}
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split("T")[0]; // Get date in "yyyy-MM-dd" format
                      setBlockSDate(formattedDate);
                    }}
                    dateFormat="yyyy-MM-dd"
                    minDate={today}
                  className={styles.DatePicker}

                  />
                  <select
                    className={
                      value1 == "Enabled" || !radio_value ? styles.hide : ""
                    } onChange={(e)=>{setBlockSTime(e.target.value)}}
                  >
                    {generateTimeOptions(block_stime)}
                  </select>
                </div>
              </div>
              <div
                className={
                  !radio_value && value1 == "Disabled"
                    ? styles.special_box
                    : styles.hide2
                }
              >
                <label>From & To Time</label>
                <div>
                  <select className={value1 == "Enabled" ? styles.hide : ""} onChange={(e)=>{setBlockSTime(e.target.value)}}>
                  {generateTimeOptions(block_stime)}
                  </select>
                  <select className={value1 == "Enabled" ? styles.hide : ""} onChange={(e)=>{setBlockETime(e.target.value)}}>
                  {generateTimeOptions(block_etime)}
                  </select>
                </div>
              </div>
              <div className={radio_value ? styles.special_box : styles.hide2}>
                <label>To</label>
                <div className={styles.details}>
                  <DatePicker
                    id="datePicker"
                    selected={block_edate}
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split("T")[0]; // Get date in "yyyy-MM-dd" format
                      setBlockEDate(formattedDate);
                    }}
                    dateFormat="yyyy-MM-dd"
                    minDate={today}
                  className={styles.DatePicker}

                  />
                  <select className={value1 == "Enabled" ? styles.hide : ""} onChange={(e)=>{setBlockETime(e.target.value)}}>
                  {generateTimeOptions(block_etime)}
                  </select>
                </div>
              </div>
              <div className={styles.special_box}>
                <label>Reason</label>
                <textarea
                  onChange={(e) => {
                    setBlockReason(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className={styles.popup_footer}>
              <button className={styles.cancel}>Cancel</button>
              <button className={styles.save} onClick={handleBlockTimeOFf}>Save</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
