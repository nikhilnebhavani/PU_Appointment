import styles1 from "./pop.module.css"
import Image from "next/image";

export default function calpop() {
    return (
        <main className={styles1.main}>
            <div className={styles1.popup}>
                <div className={styles1.close}>
                    <button id="close">
                        <Image width={1000} height={1000} src="/close.png" alt="close" />
                    </button>
                </div>
                <div className={styles1.head}>
                    <div className={styles1.cir}></div>
                    <div className={styles1.he}>
                        <h2>30 min meeting</h2>
                        <p>30 min</p>
                    </div>
                </div>
                <div className={styles1.dt}>
                    <div className={styles1.date}>
                        <div className={styles1.dm}>
                            <p>07</p>
                            <p>FEb</p>
                        </div>
                    </div>
                    <div className={styles1.time}>
                        <p>01:00 pm - 01:45 pm</p>
                    </div>
                </div>
                <hr></hr>
                <div className={styles1.middel}>
                    <h3>Status</h3>
                    <p>Completed</p>
                </div>
                <hr></hr>
                <div className={styles1.detail}>
                    <p>Booking Details</p>
                    <div className={styles1.det} ><label>Booking ID :</label><p>#CL - 00001</p></div>
                    <div className={styles1.det} ><label>Workspace :</label><p>Clg</p></div>
                    <div className={styles1.det} ><label>Customer :</label><p>Chiku</p></div>
                    <div className={styles1.det} ><label>Phone :</label><p>+919624019807</p></div>
                    <div className={styles1.det} ><label>Email :</label><p>Chikulove157@gmail.com</p></div>
                    <div className={styles1.det} ><label>Notes :</label><p>Work</p></div>
                </div>
                <div className={styles1.more}>
                    <button>View Details</button>
                </div>
            </div>
        </main>);
}