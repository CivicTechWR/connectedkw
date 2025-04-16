export default function Section({ className, children, id }) {
  return (
    <section className={`p-4 ${className}`} id={id}>
      <div className={`container md:p-8 sm:max-w-screen-lg mx-auto`}>
        {children}
      </div>
    </section>
  )
}
