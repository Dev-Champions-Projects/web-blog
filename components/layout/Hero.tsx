import Link from "next/link";

const Hero = () => {
  return (
    <section className="py-20 sm:py-24 bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12">
          <div className="relative w-full h-72 sm:h-96 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/10">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
              alt="Team working together"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 flex flex-col gap-6 rounded-3xl bg-slate-950/70 p-6 shadow-xl shadow-slate-950/20 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#409FB6]/10 px-3 py-1 text-sm font-semibold text-[#409FB6]">
                  Weekly Digest
                </span>
                <p className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                  Every Tuesday at 9am
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white">98%</p>
                <p className="text-sm text-slate-200/80">Open Rate</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-6">
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#5A1C4B] dark:text-[#7fd2eb]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#5A1C4B] dark:bg-[#409FB6]" />
                Champions Path
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Stay ahead with the latest tech, web dev trends, and product
                insights.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Explore expert-written articles, tutorials, and
                behind-the-scenes stories from Dev Champions IT. Whether you’re
                building SaaS, scaling applications, or mastering frontend,
                everything you need is here.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/blog/feed/1"
                  className="inline-flex items-center justify-center rounded-xl bg-[#5A1C4B] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#409FB6] focus:outline-none focus:ring-2 focus:ring-[#409FB6]/40"
                >
                  Browse Latest Posts
                </Link>
                <Link
                  href="/blog/create"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:border-[#409FB6] hover:text-[#409FB6] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-[#409FB6]"
                >
                  Share Your Story
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                  Why read Champions Path?
                </p>
                <ul className="mt-6 space-y-4 text-slate-700 dark:text-slate-300">
                  <li className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#5A1C4B] dark:bg-[#409FB6]" />
                    In-depth guides for modern web and AI projects.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#5A1C4B] dark:bg-[#409FB6]" />
                    Curated workflows, code examples, and real build stories.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#5A1C4B] dark:bg-[#409FB6]" />
                    Fresh updates for teams, founders, and solo developers.
                  </li>
                </ul>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Trusted by developers
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      50,000+ readers every month
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-[#409FB6]/10 px-3 py-1 text-sm font-semibold text-[#409FB6]">
                    Top-rated
                  </span>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex -space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                      alt="Subscriber"
                      className="h-10 w-10 rounded-full border-2 border-white object-cover dark:border-slate-900"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Subscriber"
                      className="h-10 w-10 rounded-full border-2 border-white object-cover dark:border-slate-900"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80"
                      alt="Subscriber"
                      className="h-10 w-10 rounded-full border-2 border-white object-cover dark:border-slate-900"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                      alt="Subscriber"
                      className="h-10 w-10 rounded-full border-2 border-white object-cover dark:border-slate-900"
                    />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Loved by product, design, and engineering teams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
