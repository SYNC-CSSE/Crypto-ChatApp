export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Chat Without <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Compromise</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Experience secure, decentralized messaging powered by blockchain. Your conversations are yours alone, protected by cryptography and distributed across the network.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transform hover:-translate-y-1 transition-all shadow-lg">
            Get Started Now
          </button>
          <button className="px-8 py-3 border-2 border-secondary-500 text-secondary-600 dark:text-secondary-400 font-semibold rounded-lg hover:bg-secondary-50 dark:hover:bg-gray-800 transform hover:-translate-y-1 transition-all">
            Learn More
          </button>
        </div>

        {/* Hero image placeholder */}
        <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 p-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <div className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
              🔐 End-to-end encrypted
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Coming from blockchain infrastructure</p>
          </div>
        </div>
      </div>
    </section>
  )
}
