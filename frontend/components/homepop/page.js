import styles from "./popup.module.css"
import Image from "next/image";

export default function homepop() {
    return (
        <main className={styles.main}>
            <div className={styles.popup}>
                <div className={styles.fb}>
                    <button id="fing">
                        <Image width={1000} height={1000} src="/firstpng.png" alt="fpng" />
                        <p>Appointment</p>
                    </button>
                </div>
                <div className={styles.sb}>
                    <button id="sing">
                        <Image width={1000} height={1000} src="/secpng.png" alt="tpng" />
                        <p>Add Break & Block Time</p>
                    </button>
                </div>
                <div className={styles.tb}>
                    <button id="ting">
                        <Image width={1000} height={1000} src="/thirpng.png" alt="tpng" />
                        <p>Add Special Working Hours</p>
                    </button>
                </div>
                <div className={styles.line}>
                    <hr></hr>
                </div>
                <div className={styles.fob}>
                    <button id="foing">
                        <div className={styles.foupng}>
                        <Image width={1000} height={1000} src="/fourth.png" alt="fopng" />
                        </div>
                        
                        <p>Booking Page</p>
                    </button>
                </div>
            </div>
        </main>);
}