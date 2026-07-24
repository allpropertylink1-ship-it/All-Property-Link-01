import Link from "next/link"

export function CTASection() {
  return (
    <section className="bg-gradient-to-r from-primary to-primary-dark py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Are You a Property Professional?</h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-white/70">
          Join our growing network of verified agents, fundis, and service providers. List your services and connect with clients across Kenya.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/auth/register"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition-all hover:bg-teal-50">
            Get Started Free
          </Link>
          <Link href="/contact"
            className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  )
}
