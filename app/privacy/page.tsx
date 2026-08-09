import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Dev Champions",
  description:
    "Learn how Dev Champions handles analytics, consent, and privacy for the developer blog and services.",
};

export default function PrivacyPage() {
  return (
    <Container>
      <section className="mx-auto w-full max-w-4xl space-y-8 rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-sm shadow-slate-900/5 dark:border-slate-700/80 dark:bg-slate-950/80 dark:shadow-none">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Privacy Policy
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Protecting your data while improving the Dev Champions experience.
          </h1>
          <p className="max-w-2xl text-slate-600 dark:text-slate-300">
            We collect only anonymous usage data when you consent so we can make
            navigation, blog content, and our services better for developers.
          </p>
        </div>

        <div className="space-y-10 text-slate-700 dark:text-slate-300">
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Data We Collect
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Page visits and engagement metrics</li>
              <li>Button and link clicks for blog and service interactions</li>
              <li>
                Device and browser details like type, screen size, and user
                agent
              </li>
              <li>Referral source and landing page information</li>
            </ul>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              How We Use Data
            </h2>
            <p>
              Analytics help us improve content quality, optimize navigation,
              and make the site more relevant for developers in Lagos and across
              Nigeria. We only use this information in aggregate.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Consent
            </h2>
            <p>
              We ask for your consent before loading analytics and tracking
              tools. If you accept, only anonymous usage data will be collected.
              If you decline, analytics will not be loaded.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Third-Party Tools
            </h2>
            <p>
              We may use third-party services such as Google Analytics and
              Google Tag Manager to process anonymous usage data for the purpose
              of improving this website.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Your Choices
            </h2>
            <p>
              You can decline analytics at any time by clearing your browser
              storage for this site. Data collection will stop on your next
              visit unless you accept again.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Contact
            </h2>
            <p>
              If you have questions about this policy, please email us at{" "}
              <a
                href="mailto:info@dev-champions.tech"
                className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-200"
              >
                info@dev-champions.tech
              </a>
              .
            </p>
          </article>
        </div>
      </section>
    </Container>
  );
}
