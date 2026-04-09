export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-secondary-500">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to Chat Securely?
        </h2>

        {/* Description */}
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of users who choose private, secure, and decentralized messaging. Start your journey with BlockChat today.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transform hover:-translate-y-1 transition-all shadow-lg">
            Launch App
          </button>
          <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transform hover:-translate-y-1 transition-all">
            View Docs
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-16 pt-16 border-t border-white/20">
          <p className="text-white/80 text-sm mb-6">Trusted by developers worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="text-white/70 text-sm font-semibold">
              ✓ Open Source
            </div>
            <div className="text-white/70 text-sm font-semibold">
              ✓ Community Driven
            </div>
            <div className="text-white/70 text-sm font-semibold">
              ✓ Security First
            </div>
            <div className="text-white/70 text-sm font-semibold">
              ✓ Privacy Focused
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
