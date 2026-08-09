export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="prose prose-slate dark:prose-invert">
        <h1>Terms & Conditions</h1>
        <p>
          Welcome to Dev Champions. By using our website, you agree to these
          terms and conditions. Please read them carefully.
        </p>

        <h2>Use of Content</h2>
        <p>
          All content on this site is for informational purposes only. You may
          not reproduce or redistribute content without permission.
        </p>

        <h2>User Conduct</h2>
        <p>
          Users agree not to use our website for unlawful activities or to post
          harmful content.
        </p>

        <h2>Analytics and Consent</h2>
        <p>
          We may collect anonymous usage data if you consent via the consent
          banner. This helps us improve our services and user experience.
        </p>

        <h2>External Links</h2>
        <p>
          Our site may contain links to external websites. We are not
          responsible for the content or practices of those sites.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about these terms, please contact us at{" "}
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
