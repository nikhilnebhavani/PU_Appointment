import styles from "./secpop.module.css"
import Image from "next/image";

export default function calpop() {


    return (
        <main className={styles.main}>
            <div className={styles.popup}>
                <div className={styles.close}>
                    <button id="close">
                        <Image width={1000} height={1000} src="/close.png" alt="close" />
                    </button>
                </div>
                <div className={styles.head}>
                    <div className={styles.cir}></div>
                    <div className={styles.he}>
                        <h2>30 min meeting</h2>
                        <p>30 min</p>
                    </div>
                </div>
                <div className={styles.dt}>
                    <div className={styles.date}>
                        <div className={styles.dm}>
                            <p>07</p>
                            <p>FEb</p>
                        </div>
                    </div>
                    <div className={styles.time}>
                        <p>01:00 pm - 01:45 pm</p>
                    </div>
                </div>
                <hr></hr>
                <div className={styles.middel}>
                    <h3>Status</h3>
                    <div className={styles.droplist}>
                        <select id="Upcoming">
                            <option value="Upcoming" selected >Upcoming</option>
                            <option value="Reschedule">Reschedule</option>
                            <option value="Cancel">Cancel</option>
                        </select>
                        <Image width={100} height={100} src="/dropdownicon.png" alt="dropdownicon"></Image>
                    </div>
                </div>
                <hr></hr>
                <div className={styles.detail}>
                    <p>Booking Details</p>
                    <div className={styles.det} ><label>Booking ID :</label><p>#CL - 00001</p></div>
                    <div className={styles.det} ><label>Workspace :</label><p>Clg</p></div>
                    <div className={styles.det} ><label>Customer :</label><p>Chiku</p></div>
                    <div className={styles.det} ><label>Phone :</label><p>+919624019807</p></div>
                    <div className={styles.det} ><label>Email :</label><p>Chikulove157@gmail.com</p></div>
                    <div className={styles.det} ><label>Notes :</label><p>Work</p></div>
                </div>
                <div className={styles.more}>
                    <button>View Details</button>
                </div>
            </div>
        </main>);
}