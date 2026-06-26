import Link from "next/link";
import { MapPinIcon, PhoneIcon, MailIcon, ArrowRightIcon } from "lucide-react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import Container from "./Container";

const Footer = () => {
  return (
    <footer className="md:mt-20 lg:mt-24 border-t border-[#5A1C4B]/10 bg-gradient-to-br from-[#f8ecf4] via-[#f3f8fb] to-[#f7f8fb] text-slate-800 shadow-[0_-10px_40px_rgba(90,28,75,0.08)] dark:border-[#409FB6]/20 dark:from-[#140b16] dark:via-[#07181d] dark:to-[#020617] dark:text-slate-200">
      <Container>
        <div className="py-20">
          <div className="mb-8 overflow-hidden whitespace-nowrap rounded-2xl border border-[#5A1C4B]/10 bg-gradient-to-r from-[#f8ecf4] via-[#f3f8fb] to-[#f7f8fb] px-2 py-4 shadow-sm backdrop-blur dark:border-[#409FB6]/20 dark:bg-gradient-to-r dark:from-[#140b16] dark:via-[#07181d] dark:to-[#020617]">
            <div className="animate-marquee inline-flex items-center gap-16">
              <span className="marquee-item px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 sm:text-base">
                Explore Our Blog posts on: AI Innovations, Data Science &
                Analytics, Digital Agency Success Stories, E-commerce & Online
                Business, Events & Community Initiatives, Future of Technology,
                Software Development, Team Talks & Behind-the-Scenes, Tech
                Tutorials & How-Tos, UI/UX, Web Design, Web3... Stay ahead with{" "}
                <Link
                  href="https://dev-champions.tech"
                  target="_blank"
                  className="font-semibold text-[#5A1C4B] underline decoration-[#409FB6] decoration-2 underline-offset-4 dark:text-[#7fd2eb]"
                >
                  Dev Champions IT
                </Link>
              </span>
              <span
                aria-hidden="true"
                className="marquee-item px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 sm:text-base"
              >
                Explore Our Blog posts on: AI Innovations, Data Science &
                Analytics, Digital Agency Success Stories, E-commerce & Online
                Business, Events & Community Initiatives, Future of Technology,
                Software Development, Team Talks & Behind-the-Scenes, Tech
                Tutorials & How-Tos, UI/UX, Web Design, Web3... Stay ahead with{" "}
                <Link
                  href="https://dev-champions.tech"
                  target="_blank"
                  className="font-semibold text-[#5A1C4B] underline decoration-[#409FB6] decoration-2 underline-offset-4 dark:text-[#7fd2eb]"
                >
                  Dev Champions IT
                </Link>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#5A1C4B]/15 bg-white/80 shadow-sm dark:border-[#409FB6]/20 dark:bg-slate-900/70">
                  <Image
                    src="/logo_white.png"
                    alt="Tek Core Logo"
                    width={40}
                    height={40}
                    className="block h-10 w-10 object-contain dark:hidden"
                    priority
                  />
                  <Image
                    src="/logo_web_white.png"
                    alt="Tek Core Logo"
                    width={40}
                    height={40}
                    className="hidden h-10 w-10 object-contain dark:block"
                    priority
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#5A1C4B] dark:text-[#7fd2eb]">
                    CHAMPS PATH
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Digital Innovation Partner
                  </p>
                </div>
              </Link>

              <p className="leading-7 text-slate-600 dark:text-slate-300">
                We design, build, and scale modern web applications, AI-powered
                solutions, and digital products that help businesses grow
                faster.
              </p>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5A1C4B] px-5 py-3 font-medium text-white transition hover:bg-[#409FB6] hover:text-slate-950"
              >
                Get Free Consultation
                <ArrowRightIcon className="h-4 w-4" />
              </Link>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="https://facebook.com/DevChampions"
                  target="_blank"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5A1C4B]/10 text-[#5A1C4B] transition hover:bg-[#409FB6]/20 hover:text-[#409FB6] dark:bg-white/10 dark:text-slate-200 dark:hover:bg-[#409FB6]/20 dark:hover:text-[#7fd2eb]"
                >
                  <SiFacebook size={18} />
                </Link>

                <Link
                  href="https://x.com/DevChampions"
                  target="_blank"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5A1C4B]/10 text-[#5A1C4B] transition hover:bg-[#409FB6]/20 hover:text-[#409FB6] dark:bg-white/10 dark:text-slate-200 dark:hover:bg-[#409FB6]/20 dark:hover:text-[#7fd2eb]"
                >
                  <SiX size={18} />
                </Link>

                <Link
                  href="https://instagram.com/DevChampions"
                  target="_blank"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5A1C4B]/10 text-[#5A1C4B] transition hover:bg-[#409FB6]/20 hover:text-[#409FB6] dark:bg-white/10 dark:text-slate-200 dark:hover:bg-[#409FB6]/20 dark:hover:text-[#7fd2eb]"
                >
                  <SiInstagram size={18} />
                </Link>

                <Link
                  href="https://www.linkedin.com/company/dev-champions"
                  target="_blank"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5A1C4B]/10 text-[#5A1C4B] transition hover:bg-[#409FB6]/20 hover:text-[#409FB6] dark:bg-white/10 dark:text-slate-200 dark:hover:bg-[#409FB6]/20 dark:hover:text-[#7fd2eb]"
                >
                  <FaLinkedin size={18} />
                </Link>
              </div>
            </div>

            <div>
              <h3 className="mb-6 text-lg font-semibold text-[#5A1C4B] dark:text-[#7fd2eb]">
                Services
              </h3>

              <ul className="space-y-4">
                <li>
                  <Link
                    href="https://www.dev-champions.tech/"
                    target="_blank"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    Web Development
                  </Link>
                </li>

                <li>
                  <Link
                    href="https://www.dev-champions.tech/"
                    target="_blank"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    Mobile App Development
                  </Link>
                </li>

                <li>
                  <Link
                    href="https://www.dev-champions.tech/"
                    target="_blank"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    AI Solutions
                  </Link>
                </li>

                <li>
                  <Link
                    href="https://www.dev-champions.tech/"
                    target="_blank"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    UI/UX Design
                  </Link>
                </li>

                <li>
                  <Link
                    href="https://www.dev-champions.tech/"
                    target="_blank"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    Cloud & DevOps
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-lg font-semibold text-[#5A1C4B] dark:text-[#7fd2eb]">
                Company
              </h3>

              <ul className="space-y-4">
                <li>
                  <Link
                    href="https://www.dev-champions.tech/"
                    target="_blank"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    About Us
                  </Link>
                </li>

                <li>
                  <Link
                    href="https://www.dev-champions.tech/"
                    target="_blank"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    Portfolio
                  </Link>
                </li>

                <li>
                  <Link
                    href="https://jobs.dev-champions.tech/"
                    target="_blank"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    Jobs
                  </Link>
                </li>

                <li>
                  <Link
                    href="https://blogs.dev-champions.tech/"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    Blog
                  </Link>
                </li>

                <li>
                  <Link
                    href="https://calendly.com/dev-champions-info/30min"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-lg font-semibold text-[#5A1C4B] dark:text-[#7fd2eb]">
                Contact
              </h3>

              <div className="space-y-5">
                <div className="flex gap-3">
                  <MapPinIcon className="mt-1 h-5 w-5 shrink-0 text-[#409FB6]" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Lagos, Nigeria
                  </span>
                </div>

                <div className="flex gap-3">
                  <PhoneIcon className="mt-1 h-5 w-5 shrink-0 text-[#409FB6]" />
                  <a
                    href="tel:+2349115034504"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    +234 9115 034 504
                  </a>
                </div>

                <div className="flex gap-3">
                  <MailIcon className="mt-1 h-5 w-5 shrink-0 text-[#409FB6]" />
                  <a
                    href="mailto:info@dev-champions.tech"
                    className="text-slate-600 transition hover:text-[#5A1C4B] dark:text-slate-300 dark:hover:text-[#7fd2eb]"
                  >
                    info@dev-champions.tech
                  </a>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#f8ecf4] via-[#f3f8fb] to-[#f7f8fb] md:p-8 lg:p-8 shadow-sm dark:border-[#409FB6]/20 dark:bg-gradient-to-r dark:from-[#140b16] dark:via-[#07181d] dark:to-[#020617] sm:p-2">
                <h4 className="mb-2 font-medium text-slate-800 dark:text-slate-100">
                  Ready to start a project?
                </h4>

                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  Tell us about your idea and get a free consultation.
                </p>

                <Link
                  href="https://calendly.com/dev-champions-info/30min"
                  className="inline-flex items-center gap-2 font-medium text-[#5A1C4B] transition hover:text-[#409FB6] dark:text-[#7fd2eb]"
                >
                  Request a Quote
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#5A1C4B]/10 pt-8 md:flex-row dark:border-slate-700/60">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 md:text-left">
              © {new Date().getFullYear()} DEV CHAMPIONS IT. All rights
              reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-slate-500 transition hover:text-[#5A1C4B] dark:text-slate-400 dark:hover:text-[#7fd2eb]"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="text-sm text-slate-500 transition hover:text-[#5A1C4B] dark:text-slate-400 dark:hover:text-[#7fd2eb]"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
