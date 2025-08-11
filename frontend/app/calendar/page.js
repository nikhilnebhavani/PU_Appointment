"use client"
import Image from "next/image";
import styles from "./calendar.module.css";
import styles1 from "./pop.module.css";
import { format, addMonths, subMonths, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, set } from 'date-fns';
import { useRef, useState , useEffect } from 'react';
import Navbar from '../../components/navbar/page';
import Calpop2 from '../../components/calpop2/page';
import Cancelpop from "../../components/cancelpop/page";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function calendar() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropid, setdropid] = useState(-1);
  const [selectdate, setselectdate] = useState(-1);
  const [m, setM] = useState([]);
  const [email, setEmail] = useState();
  const view = (id)=>{
    router.push(`/mymeeting/?${id}`)
  }

  // month and year pop
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // pop usestate
  const [meetingpop1 ,setmeetingpop1] = useState(false);
  const [meetingdetails ,setmeetingDetails] = useState({});
  const [cancelpop ,setcancelpop] = useState(false);

  // use ref
  const [current_month ,setCurrentMonth] = useState(10);
  const [current_year ,setCurrentYear] = useState(2024);
  
  // use ref for month and year pop
  const popref =useRef(null);

  // use ref for dropbutton in date
  const dropref = useRef(null);

  // use effect for month and year pop
  useEffect(() => {
    function handleClickOutside(event) {
      if (popref.current && !popref.current.contains(event.target)) {
        setShowMonthPicker(false);
        setShowYearPicker(false);
      }
      if(dropref.current && !dropref.current.contains(event.target)){
        setdropid(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // const token = "U2FsdGVkX18syn4QG3yPL/RFHZg77mvehfwyGd/i/YJuuuA+5kqjmotNOocwsg8y"
    const token = Cookies.get("token");
    const fetchData = async () => {
      if (token != null) {
        const user = { token };
        try {
          const response = await fetch(`${apiUrl}/meetings`, {
          // const response = await fetch("http://172.20.10.14:3001/meetings", {

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
          setM(result.meetings);
          setEmail(result.email);
        } catch (error) {
          alert(error);
        }
      }
    };
    fetchData();
  }, []);


  const monthspop = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const years = Array.from({ length: 12 }, (_, i) => currentDate.getFullYear() - 5 + i); // Change range as needed

  const handleMonthClick = () => {
    setShowMonthPicker(true);
    setShowYearPicker(false); // Close year picker when month picker is opened
  };

  const handleMonthChange = (month) => {
    const newDate = new Date(selectdate);
    setCurrentMonth(monthspop.indexOf(month))
    newDate.setMonth(monthspop.indexOf(month));
    newDate.setFullYear(current_year)
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };
  const handleYearClick = () => {
    setShowYearPicker(true);
    setShowMonthPicker(false); // Close month picker when year picker is opened
  };
  const handleYearChange = (year) => {
    const newDate = new Date(selectdate);
    setCurrentYear(year)
    newDate.setFullYear(year);
    newDate.setMonth(current_month)
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };


  // for header month and year 
  const renderHeader = () => {
    return (
      <div className={styles.yearmonth}>
        <button onClick={prevMonth}>{'<'}</button>
        <div className={styles.month}><button onClick={handleMonthClick}> <h2>{format(currentDate, 'MMMM , yyyy')}</h2> </button></div>
        {/* <div className={styles.month}><h2>{format(currentDate, 'MMMM , yyyy')}</h2></div> */}
        {/* <span>{format(currentDate, 'MMMM yyyy')}</span> */}
        <button onClick={nextMonth}>{'>'}</button>
      </div>

     
    );
   };

  //  for month date in grid
const renderCells = () => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      // all for classess
      let addclass = styles.dateofcal;
      let drop = styles.dropnone;
      let dropbutton = styles.dropbutton;
      

    
      if (!isSameMonth(day, monthStart)) {
        addclass = styles.disabled;
      }
      // for today date
      else if (isSameDay(day, new Date())) {
        if(isSameDay(day,selectdate)){
          addclass=styles.today;
        }
        else
         addclass = styles.today;
      }
      // for selected date
      else if (isSameDay(day, selectdate)) {
        addclass = styles.selectdate;
      }
     
      
      // for drop pop
      if (dropid == day) {
        drop = styles.dropitem;
        dropbutton = styles.dropnone;
      }

   

      // on date box 
      days.push(
        <div className={styles.cal} key={day}>
          <div  className={styles.normal}>
            {/* <div className={styles.addnew}> */}
              {/* pop */}
              {/* <div ref={dropref} className={drop}>
                <a href="">Add Appointment</a>
                <hr></hr>
                <a href="">Add Time off</a>
              </div> */}

             {/* date */}
             
              <div className={addclass} id={day} onClick={() => {
                setselectdate(format(event.target.id,'yyyy-MM-dd'));
              }}>
                {format(day, 'd')}
              </div>
             
             

            {/* </div> */}
            {/* {format(day, 'd')} */}
          </div>

         {/* it's submeeting part day vise   */}
         {m.map((e,index)=>{
          if(e.date == format(day,'yyyy-MM-dd')){
            return(
              <div className={styles.submeeting} onClick={()=>{
                setmeetingpop1(true)
                setmeetingDetails(e)
                }} style={e.status=="Cancelled" ? {background : 'red'} : e.status=="Pending" ? {background : 'yellow'} : {}} key={index}>
              <div className={styles.smtime} style={e.status=="Cancelled" ? {color : 'white'} : {}}>{e.time}</div>
              <div className={styles.smline} style={e.status=="Cancelled" ? {color : 'white'} : {}}> : </div>
              <div className={styles.smname} style={e.status=="Cancelled" ? {color : 'white'} : {}}>{email==e.booked_by ? e.booked_to_name : e.booked_by_name}</div>
              </div>
            )
          }
         })}
          
        </div>
      );
      day = addDays(day, 1);
    }

  }

  return days;
};


return (
  <main className={styles.main}>
    <Navbar/> 

    <div className={styles.main_box}>

      {/*  calendar header  month and year*/}
      {renderHeader()}

    {/* month and years pop */}
      {showMonthPicker && (
        <div ref={popref}  className={styles.popUp}>
          <div className={styles.popHeader} onClick={handleYearClick}>{currentDate.getFullYear()}</div>
          <hr></hr>
          <div className={styles.popContent}>
            {monthspop.map((month, index) => (
              <div key={index}  onClick={() => handleMonthChange(month)}>{month}</div>
            ))}
          </div>
        </div>
      )}

     {/* month and years */}
      {showYearPicker && (
        <div ref={popref}  className={styles.popUp}>
          <div className={styles.popHeader} onClick={handleMonthClick} >{format(currentDate, 'MMMM')}</div>
          <hr></hr>
          <div className={styles.popContent}>
            {years.map((year, index) => (
              <div key={index} onClick={() => handleYearChange(year)}>{year}</div>
            ))}
          </div>
        </div>
      )}

       {/* cal day and date */}
      <div className={styles.container}>
        <div className={styles.date}>
          <div className={styles.day}><div>Sun</div></div>
          <div className={styles.day}>
            <div>Mon</div>
          </div>
          <div className={styles.day}><div>Tue</div></div>
          <div className={styles.day}><div>Wed</div></div>
          <div className={styles.day}><div>Thu</div></div>
          <div className={styles.day}><div>Fri</div></div>
          <div className={styles.day}><div>Sat</div></div>


          {renderCells()}
        </div>
      </div>
    </div>
   
   {/* mobile selected date data */}
    <div className={styles.formobile}>
      {m.map((e, index)=>{
        if(selectdate==e.date){
        return(<div className={styles.schedule} key={index}>
        <div className={styles.sch_left}>
          <h2>{e.service_name}</h2>
          <div className={styles.dt_time}><p>{e.date}</p><li>{e.time}</li></div>
          <li>{e.duration}</li>
        </div>
        <div className={styles.sch_right}>
          <ul>
            <li className={styles.imp} style={e.status=="Upcoming" ? {color:"blue"} : e.status=="Pending" ? {color:"black"} : {}}>{e.status}</li>
          </ul>
        </div>
      </div>)
        }
      })}
    </div>
   
   {
    meetingpop1 &&  (
      <main className={styles1.main}>
          <div className={styles1.popup}>
              <div className={styles1.close}>
                  <button id="close" onClick={()=>{setmeetingpop1(false)}}>
                      <Image width={1000} height={1000} src="/close.png" alt="close" />
                  </button>
              </div>
              <div className={styles1.head}>
                      <h2>{email==meetingdetails.booked_by ? meetingdetails.booked_to_name : meetingdetails.booked_by_name}</h2>
                      <h2>{email==meetingdetails.booked_by ? meetingdetails.booked_to : meetingdetails.booked_by}</h2>
                      <h2>{email==meetingdetails.booked_by ? meetingdetails.booked_to_phone : meetingdetails.booked_by_phone}</h2>
                      <p>{meetingdetails.duration}</p>
                      <p>{meetingdetails.time}</p>
              </div>

              <div className={styles1.middel}>
                  <h3>Status</h3>
                  <p>{meetingdetails.status}</p>
              </div>
              
              <div className={styles1.more}>
                  <button onClick={()=>{
                    setmeetingpop1(false);
                    view(meetingdetails._id)
                  }}>View Details</button>
              </div>
          </div>
      </main>)
   }

   

  </main>
);
}