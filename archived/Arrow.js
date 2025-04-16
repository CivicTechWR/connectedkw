import styles from "styles/arrow.module.css"

export default function Arrow({ spinning, loading, arrowDown }) {
  return (
    <div className={`${styles.arrowContainer}`}>
      <svg className={`${styles.arrowSvg} ${spinning ? styles.spinning : ''} ${loading ? styles.loading : ''} ${arrowDown ? styles.arrowDown : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 196.81 193.24">
        <path className={styles.shape} d="M30.88,195.31c32,4.37,137.82-64.27,161.75-96.14C209.32,76.94,56.94-3.65,21.33,7.55-2.92,15.18.75,191.2,30.88,195.31Z" transform="translate(-3.91 -4.99)" />
      </svg>
    </div>
  )
}
