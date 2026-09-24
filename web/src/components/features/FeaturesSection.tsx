
interface Feature {
  title: string;
  desc: string;
  icon: string;
  href?: string;
}

export default function FeaturesSection() {

  const features: Feature[] = [
    {
      title: "For Customers",
      desc: "Book verified professionals, track jobs in real-time, secure payments",
      icon: "🏠",
      href: "/",
    },
    {
      title: "For Workers",
      desc: "Accept jobs, manage schedule, track earnings, build reputation",
      icon: "🔧",
      href: "/worker",
    },
    {
      title: "For Contractors",
      desc: "Manage projects, send quotations, oversee teams, grow business",
      icon: "📋",
      href: "/contractor",
    },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
          Platform Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-primary transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-500">{feature.desc}</p>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}