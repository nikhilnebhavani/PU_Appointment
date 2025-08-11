"use client"
import styles from "./historypage.module.css";
import Image from "next/image";
import Navbar from "../navbar/page";
import { useRouter } from "next/navigation";
import Appointment_summary from "../../app/appointment_summary/page";
import { useState } from "react";


export default function historypage() {
    const router = useRouter();
    const [summary, setsummary] = useState(false);
    
    const openmeethistory = () =>{
        setsummary(true);
        document.body.style.position= 'fixed'; 
      };
    
      const closemeethistory = () =>{
        setsummary(false);
        document.body.style.position= ''; 
      };
    
    return (
        
        <main className={styles.main}>
            <Navbar className={styles.nav} />
            <div className={styles.header}>
                <Image width={1000} height={1000} src="/leftshift.png" alt="previous" />
                <p>March , 2024</p>
                <Image width={1000} height={1000} src="/rightshift.png" alt="previous" />
            </div>
            <div className={styles.container}>
                <div className={styles.col_name}>
                    <p className={styles.time}>Time</p>
                    <p className={styles.booking_Id}>Booking Id</p>
                    <p className={styles.workspace}>Workspace</p>
                    <p className={styles.service}>Service</p>
                    <p className={styles.staff}>Staff/Group</p>
                    <p className={styles.customer}>Customer</p>
                    <p className={styles.status}>Status</p>
                </div>
                <div className={styles.data_list}>
                    <div className={styles.history_data}>
                        <div className={styles.main_date}>
                            <Image width={100} height={100} src="/calender.png" alt="calender" />
                            <p>01 March 2024</p>
                        </div>
                        <div className={styles.data} onClick={openmeethistory}>
                            <div className={styles.time}>
                                <Image width={100} height={100} src="/clock.png" alt="calender" />
                                <p>01:00 pm -01:30 pm</p>
                            </div>
                            <div className={styles.booking_Id}>
                                <p>#CL-00002</p>
                            </div>
                            <div className={styles.workspace}>
                                <p>College</p>
                            </div>
                            <div className={styles.service}>
                                <p>30min meeting</p>
                            </div>
                            <div className={styles.staff}>
                                <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                <p>Mark Patel</p>
                            </div>
                            <div className={styles.customer}>
                                <p>Devanshu</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                        <div className={styles.data} onClick={openmeethistory}>
                            <div className={styles.time}>
                                <Image width={100} height={100} src="/clock.png" alt="calender" />
                                <p>01:00 pm - 01:30 pm</p>
                            </div>
                            <div className={styles.booking_Id}>
                                <p>#CL-00002</p>
                            </div>
                            <div className={styles.workspace}>
                                <p>College</p>
                            </div>
                            <div className={styles.service}>
                                <p>30min meeting</p>
                            </div>
                            <div className={styles.staff}>
                                <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                <p>Mark Patel</p>
                            </div>
                            <div className={styles.customer}>
                                <p>Chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                        <div className={styles.data_phone} onClick={openmeethistory}>
                            <div className={styles.name}>
                                <p>Time</p>
                                <p>Booking ID</p>
                                <p>Workspace</p>
                                <p>Service</p>
                                <p>Staff/Group</p>
                                <p>Customer</p>
                            </div>
                            <div className={styles.name_data}>
                                <div className={styles.time}>
                                    <Image width={100} height={100} src="/clock.png" alt="calender" />
                                    <p>01:00 pm - 01:30 pm</p>
                                </div>
                                <p>#CL-000006</p>
                                <p>College</p>
                                <p>30 min meeting</p>
                                <div className={styles.staff}>
                                    <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                    <p>Mark Patel</p>
                                </div>
                                <p>chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                        <div className={styles.data_phone} onClick={openmeethistory}>
                            <div className={styles.name}>
                                <p>Time</p>
                                <p>Booking ID</p>
                                <p>Workspace</p>
                                <p>Service</p>
                                <p>Staff/Group</p>
                                <p>Customer</p>
                            </div>
                            <div className={styles.name_data}>
                                <div className={styles.time}>
                                    <Image width={100} height={100} src="/clock.png" alt="calender" />
                                    <p>01:00 pm - 01:30 pm</p>
                                </div>
                                <p>#CL-000006</p>
                                <p>College</p>
                                <p>30 min meeting</p>
                                <div className={styles.staff}>
                                    <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                    <p>Mark Patel</p>
                                </div>
                                <p>chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.history_data}>
                        <div className={styles.main_date}>
                            <Image width={100} height={100} src="/calender.png" alt="calender" />
                            <p>02 March 2024</p>
                        </div>
                        <div className={styles.data} onClick={openmeethistory}>
                            <div className={styles.time}>
                                <Image width={100} height={100} src="/clock.png" alt="calender" />
                                <p>01:00 pm - 01:30 pm</p>
                            </div>
                            <div className={styles.booking_Id}>
                                <p>#CL-00002</p>
                            </div>
                            <div className={styles.workspace}>
                                <p>College</p>
                            </div>
                            <div className={styles.service}>
                                <p>30min meeting</p>
                            </div>
                            <div className={styles.staff}>
                                <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                <p>Mark Patel</p>
                            </div>
                            <div className={styles.customer}>
                                <p>Chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                        <div className={styles.data} onClick={openmeethistory}>
                            <div className={styles.time}>
                                <Image width={100} height={100} src="/clock.png" alt="calender" />
                                <p>01:00 pm - 01:30 pm</p>
                            </div>
                            <div className={styles.booking_Id}>
                                <p>#CL-00002</p>
                            </div>
                            <div className={styles.workspace}>
                                <p>College</p>
                            </div>
                            <div className={styles.service}>
                                <p>30min meeting</p>
                            </div>
                            <div className={styles.staff}>
                                <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                <p>Mark Patel</p>
                            </div>
                            <div className={styles.customer}>
                                <p>Chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                        <div className={styles.data_phone} onClick={openmeethistory}>
                            <div className={styles.name}>
                                <p>Time</p>
                                <p>Booking ID</p>
                                <p>Workspace</p>
                                <p>Service</p>
                                <p>Staff/Group</p>
                                <p>Customer</p>
                            </div>
                            <div className={styles.name_data}>
                                <div className={styles.time}>
                                    <Image width={100} height={100} src="/clock.png" alt="calender" />
                                    <p>01:00 pm - 01:30 pm</p>
                                </div>
                                <p>#CL-000006</p>
                                <p>College</p>
                                <p>30 min meeting</p>
                                <div className={styles.staff}>
                                    <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                    <p>Mark Patel</p>
                                </div>
                                <p>chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.history_data}>
                        <div className={styles.main_date}>
                            <Image width={100} height={100} src="/calender.png" alt="calender" />
                            <p>03 March 2024</p>
                        </div>
                        <div className={styles.data} onClick={openmeethistory}>
                            <div className={styles.time}>
                                <Image width={100} height={100} src="/clock.png" alt="calender" />
                                <p>01:00 pm - 01:30 pm</p>
                            </div>
                            <div className={styles.booking_Id}>
                                <p>#CL-00002</p>
                            </div>
                            <div className={styles.workspace}>
                                <p>College</p>
                            </div>
                            <div className={styles.service}>
                                <p>30min meeting</p>
                            </div>
                            <div className={styles.staff}>
                                <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                <p>Mark Patel</p>
                            </div>
                            <div className={styles.customer}>
                                <p>Chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                        <div className={styles.data} onClick={openmeethistory}>
                            <div className={styles.time}>
                                <Image width={100} height={100} src="/clock.png" alt="calender" />
                                <p>01:00 pm - 01:30 pm</p>
                            </div>
                            <div className={styles.booking_Id}>
                                <p>#CL-00002</p>
                            </div>
                            <div className={styles.workspace}>
                                <p>College</p>
                            </div>
                            <div className={styles.service}>
                                <p>30min meeting</p>
                            </div>
                            <div className={styles.staff}>
                                <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                <p>Mark Patel</p>
                            </div>
                            <div className={styles.customer}>
                                <p>Chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                        <div className={styles.data_phone} onClick={openmeethistory}>
                            <div className={styles.name}>
                                <p>Time</p>
                                <p>Booking ID</p>
                                <p>Workspace</p>
                                <p>Service</p>
                                <p>Staff/Group</p>
                                <p>Customer</p>
                            </div>
                            <div className={styles.name_data}>
                                <div className={styles.time}>
                                    <Image width={100} height={100} src="/clock.png" alt="calender" />
                                    <p>01:00 pm - 01:30 pm</p>
                                </div>
                                <p>#CL-000006</p>
                                <p>College</p>
                                <p>30 min meeting</p>
                                <div className={styles.staff}>
                                    <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                    <p>Mark Patel</p>
                                </div>
                                <p>chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.history_data}>
                        <div className={styles.main_date}>
                            <Image width={100} height={100} src="/calender.png" alt="calender" />
                            <p>04 March 2024</p>
                        </div>
                        <div className={styles.data} onClick={openmeethistory}>
                            <div className={styles.time}>
                                <Image width={100} height={100} src="/clock.png" alt="calender" />
                                <p>01:00 pm - 01:30 pm</p>
                            </div>
                            <div className={styles.booking_Id}>
                                <p>#CL-00002</p>
                            </div>
                            <div className={styles.workspace}>
                                <p>College</p>
                            </div>
                            <div className={styles.service}>
                                <p>30min meeting</p>
                            </div>
                            <div className={styles.staff}>
                                <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                <p>Mark Patel</p>
                            </div>
                            <div className={styles.customer}>
                                <p>Chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                        <div className={styles.data} onClick={openmeethistory}>
                            <div className={styles.time}>
                                <Image width={100} height={100} src="/clock.png" alt="calender" />
                                <p>01:00 pm - 01:30 pm</p>
                            </div>
                            <div className={styles.booking_Id}>
                                <p>#CL-00002</p>
                            </div>
                            <div className={styles.workspace}>
                                <p>College</p>
                            </div>
                            <div className={styles.service}>
                                <p>30min meeting</p>
                            </div>
                            <div className={styles.staff}>
                                <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                <p>Mark Patel</p>
                            </div>
                            <div className={styles.customer}>
                                <p>Chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                        <div className={styles.data_phone} onClick={openmeethistory}>
                            <div className={styles.name}>
                                <p>Time</p>
                                <p>Booking ID</p>
                                <p>Workspace</p>
                                <p>Service</p>
                                <p>Staff/Group</p>
                                <p>Customer</p>
                            </div>
                            <div className={styles.name_data}>
                                <div className={styles.time}>
                                    <Image width={100} height={100} src="/clock.png" alt="calender" />
                                    <p>01:00 pm - 01:30 pm</p>
                                </div>
                                <p>#CL-000006</p>
                                <p>College</p>
                                <p>30 min meeting</p>
                                <div className={styles.staff}>
                                    <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                    <p>Mark Patel</p>
                                </div>
                                <p>chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.history_data}>
                        <div className={styles.main_date}>
                            <Image width={100} height={100} src="/calender.png" alt="calender" />
                            <p>05 March 2024</p>
                        </div>
                        <div className={styles.data} onClick={openmeethistory}>
                            <div className={styles.time}>
                                <Image width={100} height={100} src="/clock.png" alt="calender" />
                                <p>01:00 pm - 01:30 pm</p>
                            </div>
                            <div className={styles.booking_Id}>
                                <p>#CL-00002</p>
                            </div>
                            <div className={styles.workspace}>
                                <p>College</p>
                            </div>
                            <div className={styles.service}>
                                <p>30min meeting</p>
                            </div>
                            <div className={styles.staff}>
                                <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                <p>Mark Patel</p>
                            </div>
                            <div className={styles.customer}>
                                <p>Chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                        <div className={styles.data} onClick={openmeethistory}>
                            <div className={styles.time}>
                                <Image width={100} height={100} src="/clock.png" alt="calender" />
                                <p>01:00 pm - 01:30 pm</p>
                            </div>
                            <div className={styles.booking_Id}>
                                <p>#CL-00002</p>
                            </div>
                            <div className={styles.workspace}>
                                <p>College</p>
                            </div>
                            <div className={styles.service}>
                                <p>30min meeting</p>
                            </div>
                            <div className={styles.staff}>
                                <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                <p>Mark Patel</p>
                            </div>
                            <div className={styles.customer}>
                                <p>Chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div> 
                        <div className={styles.data_phone} onClick={openmeethistory}>
                            <div className={styles.name}>
                                <p>Time</p>
                                <p>Booking ID</p>
                                <p>Workspace</p>
                                <p>Service</p>
                                <p>Staff/Group</p>
                                <p>Customer</p>
                            </div>
                            <div className={styles.name_data}>
                                <div className={styles.time}>
                                    <Image width={100} height={100} src="/clock.png" alt="calender" />
                                    <p>01:00 pm - 01:30 pm</p>
                                </div>
                                <p>#CL-000006</p>
                                <p>College</p>
                                <p>30 min meeting</p>
                                <div className={styles.staff}>
                                    <Image width={100} height={100} src="/Ellipse 5.png" alt="calender" />
                                    <p>Mark Patel</p>
                                </div>
                                <p>chiku</p>
                            </div>
                            <div className={styles.status}>
                                <button>Completed</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {summary && <Appointment_summary close={closemeethistory}/>}
            <div className={styles.footer}>
                <Image width={1000} height={1000} src="/appointment.png" alt="previous" />
                <p>Total Appointments: 4</p>
            </div>
        </main>
    );
}