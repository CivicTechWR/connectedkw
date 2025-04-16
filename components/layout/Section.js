export default function Section({ children, className }) {
  return (
    <section className={`${className} py-12`}>
        <div className="container max-w-screen-xl mx-auto px-6 md:px-8">
            {children}
        </div>
    </section>
  )
}