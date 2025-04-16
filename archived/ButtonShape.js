import styles from "styles/buttonShape.module.css"

export default function ButtonShape({ spinning, loading }) {
  return (
    <div className={`${styles.buttonShape}`}>
      <svg className={styles.shape} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 193.63 117.91">
        <path d="M15.72,111.31C23.39,133.37,172,120.09,193.5,96.5c7.43-8.16-7.46-66.67-25-78C150.1,6.61,53.22,2.38,14.42,16.73,3.89,20.63-.94,63.37,15.72,111.31Z" transform="translate(-3.33 -6.15)"/>
      </svg>
    </div>
  )
}
