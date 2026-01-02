import { cn } from "@/lib/cn";
import { EmailLink } from "@/components/email-link";
import { ExperienceList } from "@/components/experience";
import { List } from "@/components/list";
import { Section } from "@/components/section";
import { SocialLink } from "@/components/social-link";
import { HeadingText, MainText } from "./fonts";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
} from "@/components/icons";
import { WavingHand } from "@/components/waving-hand";
import { experience, projects, socialLinks } from "@/data/content";

export default function Home() {
  return (
    <div
      className={cn(
        "min-h-screen w-full flex items-center flex-col bg-gray-100 -z-10",
        "[background-size:30px_30px]",
        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]"
      )}
    >
      <div className="pointer-events-none fixed inset-0 bg-gray-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] z-0" />
      <div className="w-full max-w-2xl px-4 sm:px-5 py-16 sm:py-24 z-10">
        <header className="mb-8 sm:mb-10 space-y-4 sm:space-y-5">
          <div className="space-y-2 sm:space-y-2.5">
            <h1
              className={`${HeadingText.className} text-2xl sm:text-3xl md:text-4xl `}
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
              className={`${MainText.className} text-gray-500 text-sm sm:text-base`}
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

        <footer className="text-xs text-gray-400 text-center font-sans flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
          <p>&copy; 2026 - Lakshya Singh Panwar</p>
          <p>Last Updated on: 02/01/2026 1200 Z</p>
        </footer>
      </div>
    </div>
  );
}
