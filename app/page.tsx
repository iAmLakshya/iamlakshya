import { EmailLink } from "@/components/email-link";
import { ExperienceList } from "@/components/experience";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
} from "@/components/icons";
import { List } from "@/components/list";
import { OnlineCount } from "@/components/online-count";
import { Section } from "@/components/section";
import { SocialLink } from "@/components/social-link";
import { WavingHand } from "@/components/waving-hand";
import { experience, projects, socialLinks } from "@/data/content";
import { cn } from "@/lib/cn";
import { HeadingText, MainText } from "./fonts";

export default function Home() {
  return (
    <div
      className={cn(
        "-z-10 flex min-h-screen w-full flex-col items-center bg-gray-100",
        "[background-size:30px_30px]",
        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]"
      )}
    >
      <div className="pointer-events-none fixed inset-0 z-0 bg-gray-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="z-10 w-full max-w-2xl px-4 py-16 sm:px-5 sm:py-24">
        <header className="mb-8 space-y-4 sm:mb-10 sm:space-y-5">
          <div className="space-y-2 sm:space-y-2.5">
            <h1
              className={`${HeadingText.className} text-2xl sm:text-3xl md:text-4xl`}
            >
              <span>Hi,</span>
              <br />
              I'm{" "}
              <span className="underline underline-offset-4 sm:underline-offset-5">
                Lakshya Singh Panwar
              </span>
              &nbsp;
              <WavingHand />
            </h1>
            <p
              className={`${MainText.className} text-sm text-gray-500 sm:text-base`}
            >
              Full Stack Developer, Management Graduate, FinTech Enthusiast,
              Problem Solver, Hustler, Dreamer ... and so much more!
            </p>
          </div>
          <div className="flex gap-1.5 sm:gap-2.5">
            <SocialLink
              href={socialLinks.github}
              icon={<GithubIcon className="size-5" />}
            />
            <SocialLink
              href={socialLinks.linkedin}
              icon={<LinkedinIcon className="size-5" />}
            />
            <EmailLink icon={<MailIcon className="size-5" />} />
            <SocialLink
              href={socialLinks.instagram}
              icon={<InstagramIcon className="size-5" />}
            />
          </div>
        </header>

        <Section>
          <p className="text-sm sm:text-base">
            I like taking things apart to see how they work. Sometimes I even
            put them back together. Give me a problem and I'll disappear for a
            few days, resurfacing with either a working solution or 17 new
            questions. I'm happiest when I'm building something that probably
            won't work on the first try, surrounded by too many browser tabs and
            cold coffee. Currently based in London, still figuring out what I
            want to be when I grow up.
          </p>
        </Section>

        <Section title="💼 Experience" highlightColor="orange">
          <ExperienceList
            items={experience}
            viewAllHref={`${socialLinks.linkedin}/details/experience`}
            viewAllText="View full resume"
          />
        </Section>

        <Section title="🛠️ Projects" highlightColor="blue">
          <List items={projects} />
        </Section>

        {/* <Section title="Latest Writeups" highlightColor="green">
          <List
            items={writeups}
            viewAllHref={socialLinks.blog}
            viewAllText="View all writeups"
          />
        </Section> */}

        <footer className="flex flex-col items-center justify-between gap-2 text-center font-sans text-xs text-gray-400 sm:flex-row sm:gap-0">
          <p>&copy; 2026 - Lakshya Singh Panwar</p>
          <OnlineCount />
          <p>Last Updated on: 02/01/2026 1200 Z</p>
        </footer>
      </div>
    </div>
  );
}
