import styles from "styles/marquee.module.css"

export default function Marquee() {
  return(
    <div className={`${styles.enableAnimation} relative sm:absolute max-sm:my-8 bottom-px left-0 right-0`}>
      <div className={`${styles.marquee} ${styles.marqueeHoverPause} sm:bg-white sm:border-y-3 sm:border-black py-2`}>
        <ul className={styles.marqueeContent}>
          <li>new website 🐣 </li>
          <li>coming in hot 🔥</li>
          <li>events 💃</li>
          <li>maps 👀</li>
          <li>recommendations ⭐</li>
          <li>community engagement ✌</li>
        </ul>

        <ul aria-hidden={true} className={styles.marqueeContent}>
          <li>new website 🐣 </li>
          <li>coming in hot 🔥</li>
          <li>events 💃</li>
          <li>maps 👀</li>
          <li>recommendations ⭐</li>
          <li>community engagement ✌</li>
        </ul>
      </div>
    </div>
  )
}