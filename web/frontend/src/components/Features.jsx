const features = [
  {
    icon: '🔐',
    title: 'Blockchain Secured',
    description: 'All conversations are stored on blockchain, ensuring immutability and transparency.'
  },
  {
    icon: '🔒',
    title: 'End-to-End Encryption',
    description: 'Messages are encrypted before transmission, only sender and receiver can read them.'
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Decentralized network ensures zero latency and instant message delivery worldwide.'
  },
  {
    icon: '👥',
    title: 'Group Chats',
    description: 'Create group conversations with multiple members, all secured by blockchain.'
  },
  {
    icon: '📁',
    title: 'File Sharing',
    description: 'Share files securely through IPFS integration, permanently backed up.'
  },
  {
    icon: '🌍',
    title: 'Fully Decentralized',
    description: 'No central servers, no data centers. True peer-to-peer communication.'
  }
]

export default function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            BlockChat combines the best of modern messaging with blockchain security
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg dark:hover:shadow-primary-500/10 group transition-all cursor-pointer"
            >
              {/* Icon */}
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
