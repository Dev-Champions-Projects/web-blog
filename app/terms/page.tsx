import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Dev Champions",
  description:
    "Read the terms and conditions for using Dev Champions, including content use, conduct, and analytics consent.",
};

export default function TermsPage() {
  return (
    <Container>
      <section className="mx-auto w-full max-w-4xl space-y-8 rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-sm shadow-slate-900/5 dark:border-slate-700/80 dark:bg-slate-950/80 dark:shadow-none">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Terms & Conditions
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Use of Dev Champions and our developer content.
          </h1>
          <p className="max-w-2xl text-slate-600 dark:text-slate-300">
            By using Dev Champions, you agree to these terms and the way we
            handle analytics and external links.
          </p>
        </div>

        <div className="space-y-10 text-slate-700 dark:text-slate-300">
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Use of Content
            </h2>
            <p>
              All content on this site is for informational purposes only.
              Content may not be reproduced or redistributed without permission.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              User Conduct
            </h2>
            <p>
              You agree not to use Dev Champions for unlawful activities or to
              post harmful content. Respectful and honest use helps the entire
              community.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Analytics and Consent
            </h2>
            <p>
              We may collect anonymous usage data only after you provide consent
              through the consent banner. This data helps us improve the site
              and blog experience.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              External Links
            </h2>
            <p>
              Our site may link to external websites. We are not responsible for
              the content or privacy practices of third-party sites.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Contact
            </h2>
            <p>
              If you have questions about these terms, please contact us at{" "}
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
