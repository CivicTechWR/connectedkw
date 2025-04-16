const Blob = ({ className="", fill="var(--theme-blue)", opacity="1", blobStyles={} }) => {
  const style = {
    fill: fill,
    opacity: opacity,
    ...blobStyles
  }

  return(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 886.35 774.85"
      preserveAspectRatio="none"
      className={className}
    >
      <path
        d="M568.25,741.2C691.41,691.92,901.4,553.86,893.94,366.09,885.61,156.2,609-30,380.15,18.78c-275.69,58.77-444.76,450.6-342,636.34C124,810.25,393.55,811.1,568.25,741.2Z"
        transform="translate(-7.78 -10.93)"
        style={style}
      />
    </svg>
  )
}

export default Blob
