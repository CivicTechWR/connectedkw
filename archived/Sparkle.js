import styles from "styles/sparkle.module.css"

export default function Sparkle({ rotation="0" }) {
  return (
    <div className={`${styles.container}`} style={{ transform: `rotate(${rotation})`}}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98.84 186.42">
        <path d="M84.22,6.84c-3.37.64-5.43,24.49,4,43.72C91.8,58,98.9,68.36,101.23,66.76,106.19,63.38,89.65,5.81,84.22,6.84Z" transform="translate(-4.81 -5.33)" className={styles.sparkle} />
        <path d="M83.26,88.06c-.1,4.14-17-.89-29.27-7C26.66,67.35,4.84,39.47,7.78,36.33,12.35,31.43,83.46,79.53,83.26,88.06Z" transform="translate(-4.81 -5.33)" className={styles.sparkle} />
        <path d="M83.8,114.24c-.51-3.68-29.88-6.06-56.73,5.55-7.18,3.1-21.63,10.42-20.72,12.94C8.33,138.3,84.63,120.3,83.8,114.24Z" transform="translate(-4.81 -5.33)" className={styles.sparkle} />
        <path d="M86,142.32C85,138.2,61.44,154.7,50.5,172.92c-3.32,5.53-7,15.23-2.87,17.07C56.73,194,88,150.11,86,142.32Z" transform="translate(-4.81 -5.33)" className={styles.sparkle} />
      </svg>
    </div>
  )
}
