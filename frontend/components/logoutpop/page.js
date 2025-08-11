import styles from "./logoutp.module.css"
import Image from "next/image";

export default function logoutpop(){
    return (
        <main className={styles.main}>
            <div className={styles.popup}>
            <div className={styles.fb}>
                    <button id="fing">
                        <Image width={1000} height={1000} src="/historyclock.png" alt="fpng" />
                        <p>History</p>
                    </button>
                </div>
                <div className={styles.sb}>
                    <button id="sing">
                        <Image width={1000} height={1000} src="/logout.png" alt="spng" />
                        <p>logout Account</p>
                    </button>
                </div>
            </div>
        </main>);
}