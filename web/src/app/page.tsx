import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="hBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6"/>
                  <stop offset="100%" stopColor="#2563EB"/>
                </linearGradient>
                <linearGradient id="hOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FB923C"/>
                  <stop offset="100%" stopColor="#F97316"/>
                </linearGradient>
              </defs>
              <rect x="20" y="30" width="36" height="140" rx="18" fill="url(#hBlue)"/>
              <circle cx="90" cy="42" r="20" fill="url(#hBlue)"/>
              <path d="M56 50 L90 50 L130 90 L110 110 L75 72 L56 90 Z" fill="url(#hOrange)"/>
              <path d="M56 120 L80 120 Q120 120 120 160 Q120 180 100 180 L56 180 Q38 180 38 162 Q38 144 56 144" fill="url(#hBlue)"/>
            </svg>
            <div>
              <span className="text-2xl font-black">
                <span className="text-slate-800">Kaam</span>
                <span className="text-orange-500">Do</span>
              </span>
              <span className="block text-xs text-slate-500 font-medium -mt-1">Har Kaam, Sahi Insaan</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-black text-slate-800 mb-4">
            <span className="text-blue-600">Kaam</span>
            <span className="text-orange-500">Do</span>
          </h1>
          <p className="text-2xl text-slate-600 font-medium mb-8">Har Kaam, Sahi Insaan</p>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12">
            Digital marketplace connecting customers with verified technicians, workers, and contractors.
            Find the right professional for every job.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/admin"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              Open Admin Panel
            </Link>
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "For Customers", desc: "Book verified professionals, track jobs in real-time, secure payments", icon: "🏠" },
                { title: "For Workers", desc: "Accept jobs, manage schedule, track earnings, build reputation", icon: "🔧" },
                { title: "For Contractors", desc: "Manage projects, send quotations, oversee teams, grow business", icon: "📋" },
              ].map((feature) => (
                <div key={feature.title} className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          © 2026 KaamDo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
