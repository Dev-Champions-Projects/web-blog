export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="prose prose-slate dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p>
          Dev Champions respects your privacy. We collect anonymous usage data
          to improve our website, blog content, and service experience. This
          policy explains what data we collect, how we use it, and how you can
          control it.
        </p>

        <h2>Data We Collect</h2>
        <ul>
          <li>Page visits and engagement metrics</li>
          <li>Button and link clicks for service and blog interactions</li>
          <li>
            Device and browser information such as browser type and screen size
          </li>
          <li>Referral source and landing page information</li>
        </ul>

        <h2>How We Use Data</h2>
        <p>
          We use analytics data to improve content quality, optimize navigation,
          and make our services more relevant for developers in Lagos and across
          Nigeria. Data is used to understand which blog posts and features are
          most useful so we can serve you better.
        </p>

        <h2>Consent</h2>
        <p>
          We ask for your consent before loading analytics and tracking tools.
          If you accept, we will only collect anonymous usage data. If you
          decline, analytics will not be loaded.
        </p>

        <h2>Third-Party Tools</h2>
        <p>
          We may use third-party services such as Google Analytics and Google
          Tag Manager to process anonymous usage data for the purpose of
          improving this website.
        </p>

        <h2>Your Choices</h2>
        <p>
          You can decline analytics at any time by clearing your browser storage
          for this site. Data collection will stop on your next visit unless you
          accept again.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about this policy, please email us at{" "}
          <a
            href="mailto:info@dev-champions.tech"
            className="text-slate-900 dark:text-slate-100 underline"
          >
            info@dev-champions.tech
          </a>
          .
        </p>
      </div>
    </main>
  );
}
