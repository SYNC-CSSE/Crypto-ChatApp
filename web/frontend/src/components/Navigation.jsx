import { Link } from 'react-router-dom'
export default function Navigation() {
  return (
    <nav className="fixed w-full top-0 z-50 bg-[#eeebfc]/90 border-b border-[#d8cfee] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-xl text-[#23114b]">BlockChat</span>
          </div>

          {/* Right side - Nav Actions */}
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-[#5f4f88] hover:text-[#23114b] transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="hidden sm:flex text-sm font-semibold text-[#23114b] bg-[#d8ef45] hover:bg-[#cae43f] px-4 py-2 rounded-lg shadow-md shadow-[#b5cc3a]/30 transition-all hover:scale-105">
              Sign up
            </Link>
            <div className="w-px h-6 bg-[#d8cfee] mx-2 hidden sm:block"></div>
          </div>
        </div>
      </div>
    </nav>
  )
}
