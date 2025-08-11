import Image from 'next/image'
import styles from './loading.module.css'

export default function loading() {
    return (
        <section className={styles.main}>
        
                <div className={styles.loader}></div>
        
        </section>
  )
}
