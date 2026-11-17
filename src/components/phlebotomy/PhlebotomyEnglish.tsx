import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TreatmentFaqAccordion from "@/components/TreatmentFaqAccordion";
import type { TreatmentFaq } from "@/data/treatments";
import { sanityFetch } from "@/sanity/lib/fetch";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { Icon, type IconName } from "./icons";
import AppointmentSteps, { type JourneyStep } from "./AppointmentSteps";
import { ACCENTS, accentGradient } from "./accents";
import KitSending from "./KitSending";

/**
 * DRAFT SWITCH. While true the page shows the "draft for approval" banner, highlights every
 * fact Sofia still has to confirm, and shows the "For Sofia only" checklist at the bottom.
 * Set to false before this page goes to the live site: the banner, highlights and checklist
 * disappear and the fallback wording is shown as normal text.
 */
const SHOW_DRAFT_MARKERS = true;

const PHONE_TEL = "tel:+442072253582";
const WHATSAPP_URL = "https://wa.me/447818474041";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=2+Wimpole+Street+London+W1G+0EB";

/** Wraps wording Sofia still has to confirm. Visible highlight while SHOW_DRAFT_MARKERS is true. */
function Confirm({ children, note }: { children: ReactNode; note?: string }) {
  if (!SHOW_DRAFT_MARKERS) return <>{children}</>;
  return (
    <mark className="rounded-[4px] border border-dashed border-[#d9a400] bg-[#fff3c4] px-1.5 py-0.5 text-[0.95em] text-[#6b4a00]">
      {children}
      {note ? <span className="font-semibold"> [{note}]</span> : null}
    </mark>
  );
}

const draftNote = (text: string) => (SHOW_DRAFT_MARKERS ? ` [Sofia to confirm: ${text}]` : "");

/* ---------------------------------------------------------------- content */

const whoFor: { icon: IconName; text: string }[] = [
  { icon: "clipboard", text: "You have a blood test kit from a private, NHS or international laboratory and need a practitioner to take the sample." },
  { icon: "user", text: "A doctor, consultant or therapist has asked you to arrange an independent blood draw." },
  { icon: "tubes", text: "Your kit says the sample must be centrifuged before it is sent, and you need a clinic that can do it." },
  { icon: "child", text: "Your child needs a blood test and you want a calm, unhurried appointment." },
  { icon: "shield", text: "You are nervous about needles or have difficult veins. Tell us when you book and we will plan extra time." },
];

const steps: JourneyStep[] = [
  { icon: "book", title: "Book", text: "Call, WhatsApp or email us. Tell us which laboratory your kit is from and whether it needs centrifuging or a courier. If the appointment is for a child, tell us their age." },
  { icon: "prepare", title: "Prepare", text: "Read your kit instructions, drink plenty of plain water, and only fast if the kit says so. See the preparation guide below." },
  { icon: "arrive", title: "Arrive", text: "Bring the whole kit, including the requisition form. The test cannot go ahead without it." },
  { icon: "draw", title: "Blood draw", text: "A registered phlebotomist takes the sample with sterile single-use equipment. You can lie down if you prefer." },
  { icon: "centrifuge", title: "Preparation", text: "We label the tubes, centrifuge them if your kit requires it, and pack them to the laboratory's instructions." },
  { icon: "dispatch", title: "Dispatch", text: "You send the kit by the courier or post option in your kit. We can hold the sample at the clinic for courier collection, and freeze it if your form requires it." },
];

const labs = [
  "Functional DX",
  "Regenerus Labs",
  "Cyrex",
  "Genova",
  "ArminLabs",
  "Nordic Lab",
  "Alletess Medical Laboratory",
  "FRAT",
  "Viva Health",
  "Key Clinic",
  "RGCC International",
  "Religen USA",
];

/** `answer` is clean text (also used for the FAQ search markup). `draft` is shown only while drafting. */
const faqSource: { question: string; answer: string; draft?: string }[] = [
  {
    question: "Do I need a referral or a doctor's request?",
    answer:
      "Not if you already have a private laboratory test kit with its requisition form. You can book directly with us. If you do not have a kit yet, call us first: we collect and prepare the sample, and the test itself is ordered from a laboratory or your clinician.",
  },
  {
    question: "Can I bring my own test kit?",
    answer:
      "Yes. We regularly prepare samples for UK, European and international laboratories, including Functional DX, Regenerus, Cyrex, Genova, ArminLabs and Nordic Lab. Bring the complete kit and the requisition form.",
  },
  {
    question: "How much does a private blood draw cost?",
    answer:
      "Adults from £80, children under 16 from £120, and £10 per tube if the sample needs centrifuging. Mobile visits are priced separately on request.",
  },
  {
    question: "Do I need an appointment?",
    answer:
      "We offer a walk-in service, but appointments are given priority. Without one, waits can reach 45 minutes or more. Please book if your kit needs centrifuging, a courier collection or a child's appointment.",
    draft: "walk-in wording",
  },
  {
    question: "How long does it take?",
    answer:
      "Most appointments take 15–30 minutes, depending on the number of tubes, paperwork checks and whether the sample needs centrifuging.",
    draft: "appointment length",
  },
  {
    question: "Do you take blood from children?",
    answer:
      "Yes. We look after children with a gentle, unhurried approach. Tell us your child's age when you book so we can plan the time and the right equipment. A favourite toy, book or tablet helps. Please follow our guidance on numbing cream before you arrive.",
  },
  {
    question: "Do you offer mobile or home blood draws?",
    answer:
      "Yes, on request. We cover the Teddington and Twickenham areas, and mobile visits are priced separately. Call or WhatsApp us with your postcode and kit details. Some tests need immediate processing on site and are better done at the clinic.",
    draft: "other areas covered",
  },
  {
    question: "Do I need to fast?",
    answer:
      "Only if your test instructions say so. Plain water is fine, and it helps. Never stop prescribed medication unless your doctor tells you to.",
  },
  {
    question: "Who gives me my results?",
    answer:
      "The laboratory that analyses your sample, or the clinician who ordered the test. We do not analyse or interpret results; we make sure the sample is collected, handled and prepared correctly.",
  },
];

const faqItems: TreatmentFaq[] = faqSource.map((f) => ({
  question: f.question,
  answer: f.answer + (f.draft ? draftNote(f.draft) : ""),
}));

const guides: { slug: string; title: string; blurb: string }[] = [
  { slug: "private-phlebotomy-london-blood-collection", title: "Private Phlebotomy at YourHealthFirst Clinic", blurb: "Your guide to blood collection" },
  { slug: "how-to-prepare-for-a-blood-test", title: "How to prepare for a blood test", blurb: "A patient's guide" },
  { slug: "blood-tests-adults-children-london", title: "Blood tests for adults and children", blurb: "What to expect" },
  { slug: "what-to-expect-home-phlebotomy-visit", title: "What to expect during a home phlebotomy visit", blurb: "A patient's guide" },
  { slug: "manage-anxiety-during-blood-collection", title: "Tips for managing anxiety during blood collection", blurb: "Practical techniques for nervous patients" },
  { slug: "why-book-private-phlebotomy-london", title: "Why book a private phlebotomy service in London?", blurb: "The advantages of a private appointment" },
];

const guideIcons: IconName[] = ["shield", "clipboard", "child", "truck", "chat", "check"];

const sofiaChecklist: string[] = [
  "Which opening hours are correct? This page says Mon–Fri 10am–6:30pm and Sat 12–4pm; other pages say 10am–6pm and 9am–6pm.",
  "Mobile visits: price, minimum notice, which areas besides Teddington and Twickenham, and the furthest distance.",
  "Appointment length: 15–30 minutes (guides) or 10–15 minutes (older site data)?",
  "Walk-ins: the current page says walk-ins are accepted with waits of 45 minutes or more; the guides say booking is strongly recommended with zero waiting. Which should we say?",
  "Registration wording: may we say Sofia is a registered phlebotomist, with her National Phlebotomist Register number?",
  "Preparation: adults 2 litres of water across the day, or 500ml shortly before? Children's numbing cream: 30 minutes (page) or 60 minutes (guide)?",
  "Do we post samples for patients, or only hold them (frozen if required) for courier collection?",
  "The guides say \"same-day and same-week appointments\" and \"zero waiting time\". Can we promise this?",
  "Laboratory list: add Doctor's Data, which a guide names but this page does not?",
  "Should centrifuging for other clinics and practitioners have its own page?",
];

/* ---------------------------------------------------------------- helpers */

function SectionBars({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="h-[3px] w-12 rounded-full bg-tan" />
      <h2
        className={`font-display text-[30px] font-bold leading-[36px] tracking-[-1px] uppercase lg:text-[36px] lg:leading-[42px] ${
          light ? "text-cream" : "text-forest"
        }`}
      >
        {children}
      </h2>
    </div>
  );
}

const primaryBtn =
  "inline-flex h-14 items-center gap-3 rounded-[10px] bg-tan px-7 font-nav text-[14px] font-semibold tracking-[0.5px] text-forest uppercase transition-opacity hover:opacity-90";
const ghostBtn =
  "inline-flex h-14 items-center gap-3 rounded-[10px] border border-white/35 px-7 font-nav text-[14px] font-semibold tracking-[0.5px] text-white uppercase transition-colors hover:border-tan hover:text-tan";
const creamBg =
  "relative w-full overflow-hidden bg-[linear-gradient(135deg,#faf4ea_0%,#f0e0c8_100%)] px-5";

const quickFacts: { icon: IconName; label: string; value: string; sub: string }[] = [
  { icon: "user", label: "Who", value: "Adults and children", sub: "" },
  { icon: "target", label: "Price", value: "Adults from £80", sub: "Children under 16 from £120 · Centrifuging £10 per tube" },
  { icon: "pin", label: "Where", value: "2 Wimpole Street, W1G 0EB", sub: "Near Oxford Circus and Bond Street" },
  { icon: "truck", label: "Mobile visits", value: "On request", sub: "Priced separately" },
  { icon: "phone", label: "Book", value: "0207 225 3582", sub: "WhatsApp 07818 474041" },
];

/* ------------------------------------------------------------------- page */

export default async function PhlebotomyEnglish() {
  const sanitySettings = await sanityFetch<Record<string, unknown> | null>({
    query: SITE_SETTINGS_QUERY,
    tags: ["siteSettings"],
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSource.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const priorItems: ReactNode[] = [
    <>Please make sure you have received your test kit and read all the enclosed instructions before your appointment. Check whether the laboratory asks you to fast or to come at a certain time of day.</>,
    <>When you book, tell us which laboratory your kit is from, whether it needs centrifuging or a courier, and, for a child, their age.</>,
  ];

  const onDaySteps: ReactNode[] = [
    <>Please drink plenty of water, and bring all the information in your test kit, as these provide vital information needed for the test to proceed and produce viable results.</>,
    <>Bring your test kit and all of its contents. Private blood test kits contain a requisition form (the test cannot proceed if you do not have your requisition form). Check the contents of your test kit.</>,
    <>
      Stay well-hydrated with plain water to make your veins plump and easier to find{" "}
      <Confirm note="Sofia to confirm">(for adults at minimum 2L, and kids minimum 1L)</Confirm>.
    </>,
    <>Avoid other liquids: don&apos;t drink coffee, tea, juice, soda, or other sugary drinks, as they can interfere with test results. Confirm fasting requirements: for some tests, you may need to fast and can only drink water.</>,
    <>Do not stop or change any prescribed medication unless your doctor tells you to.</>,
    <>
      For children:{" "}
      <Confirm note="Sofia to confirm timing">please apply numbing cream to both arms 30 minutes before arrival</Confirm>.
    </>,
    <>Bring the return packaging supplied by the laboratory, and photo ID if your laboratory asks for it.</>,
  ];

  const priceRows: { label: string; price: string; confirm?: boolean }[] = [
    { label: "Blood draw, adults", price: "From £80" },
    { label: "Blood draw, children under 16", price: "From £120" },
    { label: "Centrifuging, per tube", price: "£10" },
    { label: "Mobile visit", price: "Priced separately, on request", confirm: true },
  ];

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header sanitySettings={sanitySettings} />

      {/* Hero */}
      <section className="relative w-full bg-[linear-gradient(90deg,#7a6248_0%,#b49b7d_50%,#7a6248_100%)] pt-[111px]">
        <div className="mx-auto max-w-[1400px] px-5 pb-[110px] pt-[70px] lg:pb-[130px] lg:pt-[90px]">
          <div className="flex flex-col gap-4">
            {SHOW_DRAFT_MARKERS && (
              <div className="w-fit rounded-full border border-[#ffbe02]/60 bg-[#ffbe02]/15 px-4 py-2 text-[13px] font-semibold text-[#ffe08a]">
                Draft for approval. This version is not on the live website.
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/treatments"
                className="font-nav text-[13px] tracking-[1px] text-white/40 uppercase transition-colors hover:text-tan"
              >
                Treatments
              </Link>
              <span className="text-white/30">/</span>
              <span className="font-nav text-[13px] tracking-[1px] text-tan/70 uppercase">
                Phlebotomy &amp; Health Tests
              </span>
            </div>
            <h1 className="font-display text-[38px] leading-[42px] font-bold tracking-[-1px] text-cream uppercase lg:text-[58px] lg:leading-[64px]">
              Private Phlebotomy in London
            </h1>
            <p className="max-w-[640px] font-serif text-[20px] leading-[30px] text-white/75 italic lg:text-[22px] lg:leading-[32px]">
              Blood draws and sample centrifugation for adults and children, at 2 Wimpole Street in the Harley Street medical district.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={PHONE_TEL} className={primaryBtn}>
                <Icon name="phone" className="h-4 w-4" />
                Call 0207 225 3582
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={ghostBtn}>
                <Icon name="chat" className="h-4 w-4" />
                WhatsApp
              </a>
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className={ghostBtn}>
                <Icon name="pin" className="h-4 w-4" />
                Get directions
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-tan/40 to-transparent" />
      </section>

      {/* Quick facts */}
      <section className="relative z-10 w-full px-5">
        <div className="mx-auto -mt-[60px] max-w-[1400px]">
          <div className="grid grid-cols-1 overflow-hidden rounded-[20px] border border-tan/30 bg-white shadow-xl sm:grid-cols-2 lg:grid-cols-5">
            {quickFacts.map((f, i) => (
              <div key={f.label} className="flex items-start gap-4 border-b border-tan/20 p-6 lg:border-b-0 lg:border-r lg:last:border-r-0">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm"
                  style={{
                    background: accentGradient(ACCENTS[i % ACCENTS.length]),
                    color: ACCENTS[i % ACCENTS.length].ink,
                  }}
                >
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="font-nav text-[12px] font-semibold tracking-[2px] text-tan uppercase">{f.label}</span>
                  <span className="font-subheading text-[15px] font-semibold leading-[21px] text-forest">{f.value}</span>
                  {f.sub ? <span className="text-[13px] leading-[19px] text-body-text">{f.sub}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="w-full px-5">
        <div className="mx-auto max-w-[1400px] py-[70px] lg:py-[90px]">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.5fr_1.5fr] lg:gap-16">
            <div className="relative w-full max-w-[380px]">
              <div className="pointer-events-none absolute -left-2 sm:-left-4 -top-2 sm:-top-4 h-full w-full rounded-[18px] border border-tan/40" />
              <div className="relative w-full overflow-hidden rounded-[14px] shadow-md" style={{ aspectRatio: "3/4" }}>
                <Image
                  src="/images/treatments/phlebotomy/blood-draw.jpg"
                  alt="A phlebotomist taking a blood sample from a patient's arm"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 xl:flex-row xl:gap-10">
              <div className="flex flex-1 flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <h2 className="font-display text-[28px] font-bold leading-[34px] tracking-[-1px] text-forest lg:text-[34px] lg:leading-[40px]">
                    {"A calm, careful blood draw, prepared to your laboratory's instructions"}
                  </h2>
                  <span className="h-[3px] w-16 rounded-full bg-tan" />
                </div>
                <p className="text-[16px] leading-[27px] text-body-text">
                  Since 2014, YourHealthFirst Clinic has provided private blood draws for adults and children, and prepared samples for specialist laboratories. If you have a test kit from a private or international laboratory, bring it to us. We take the sample, centrifuge it on site when your kit requires it, and prepare it for the courier or post.
                </p>
                <p className="text-[16px] leading-[27px] text-body-text">
                  We collect and prepare the sample. Your laboratory or the clinician who ordered the test analyses it and gives you the results.
                </p>
              </div>
              <div className="flex h-fit w-full shrink-0 flex-col items-center gap-4 rounded-[14px] border border-tan/30 bg-cream px-6 py-8 text-center shadow-sm xl:w-[280px]">
                <div className="relative h-24 w-full">
                  <Image src="/images/treatments/phlebotomy/npr-logo.png" alt="National Phlebotomist Register" fill className="object-contain" />
                </div>
                <span className="text-[16px] font-semibold leading-[22px] text-forest">
                  <Confirm note="Sofia to confirm registration wording and number">National Phlebotomist Register</Confirm>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section className={creamBg}>
        <div className="pointer-events-none absolute -left-[10%] -top-[20%] h-[500px] w-[500px] rounded-full bg-tan/15 blur-[110px]" />
        <div className="pointer-events-none absolute -right-[10%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-white/40 blur-[110px]" />
        <div className="relative mx-auto max-w-[1400px] py-[70px] lg:py-[90px]">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
            <div className="relative flex flex-col justify-between gap-10 overflow-hidden rounded-[24px] bg-forest p-9 shadow-lg lg:p-12">
              <div className="pointer-events-none absolute -right-[20%] -top-[20%] h-[340px] w-[340px] rounded-full bg-tan/15 blur-[90px]" />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span className="font-nav text-[12px] font-semibold tracking-[3px] text-tan uppercase">Who it is for</span>
                  <span className="h-px w-12 bg-tan/40" />
                </div>
                <h2 className="font-display text-[30px] font-bold leading-[36px] tracking-[-1px] text-cream uppercase lg:text-[38px] lg:leading-[44px]">
                  Is private phlebotomy right for you?
                </h2>
                <p className="text-[15px] leading-[25px] text-white/70">
                  If any of these sound like you, we can help. When you book, tell us your laboratory, and whether your kit needs centrifuging or a courier.
                </p>
              </div>
              <div className="relative flex flex-wrap gap-3">
                <a href={PHONE_TEL} className={primaryBtn}>
                  <Icon name="phone" className="h-4 w-4" />
                  Call us
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={ghostBtn}>
                  <Icon name="chat" className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>

            <ul className="flex flex-col overflow-hidden rounded-[24px] border border-tan/25 bg-white/70 shadow-sm backdrop-blur-sm">
              {whoFor.map((w, i) => (
                <li key={w.text} className="flex flex-1 items-center gap-5 border-b border-tan/25 px-7 py-6 last:border-b-0 lg:px-9">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-md"
                    style={{
                      background: accentGradient(ACCENTS[i % ACCENTS.length]),
                      color: ACCENTS[i % ACCENTS.length].ink,
                    }}
                  >
                    <Icon name={w.icon} className="h-7 w-7" />
                  </span>
                  <p className="text-[16px] leading-[26px] text-body-text">{w.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How an appointment works: rail that fills while scrolling, animated step icons */}
      <AppointmentSteps
        steps={steps}
        phoneHref={PHONE_TEL}
        note={
          <>
            <Icon name="calendar" className="h-4 w-4 shrink-0 text-tan" />
            <span>
              Most appointments take <Confirm note="Sofia to confirm">15–30 minutes</Confirm>
            </span>
          </>
        }
      />

      {/* Prior to your appointment + On the day: same box design as the original page */}
      <section className="relative w-full overflow-hidden bg-[linear-gradient(135deg,#faf4ea_0%,#f0e0c8_100%)] px-5">
        <div className="pointer-events-none absolute -left-[10%] -top-[20%] h-[500px] w-[500px] rounded-full bg-tan/15 blur-[110px]" />
        <div className="pointer-events-none absolute -right-[10%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-white/40 blur-[110px]" />
        <div className="relative mx-auto max-w-[1400px] py-[70px] lg:py-[90px]">
          <div className="relative overflow-hidden rounded-[24px] border border-tan/25 bg-white/70 shadow-lg backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[36%] lg:block">
              <Image
                src="/images/treatments/phlebotomy/hero-banner.jpg"
                alt=""
                fill
                className="object-cover object-[70%_50%] opacity-90"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#faf4ea_0%,rgba(250,244,234,0.55)_45%,rgba(250,244,234,0)_100%)]" />
            </div>

            <div className="relative flex flex-col gap-10 p-8 lg:max-w-[66%] lg:p-12">
              {/* Prior */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tan text-white shadow-sm">
                    <Icon name="clipboard" className="h-6 w-6" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="h-[3px] w-12 rounded-full bg-tan" />
                    <h3 className="font-display text-[26px] font-bold leading-[30px] tracking-[-0.5px] text-forest uppercase lg:text-[30px] lg:leading-[34px]">
                      Prior to your appointment
                    </h3>
                  </div>
                </div>
                {priorItems.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tan font-nav text-[13px] font-semibold text-white">
                      {i + 1}
                    </span>
                    <p className="text-[15px] leading-[24px] text-body-text">{item}</p>
                  </div>
                ))}
                <div className="flex items-start gap-3 rounded-[12px] bg-white/80 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tan/20 text-tan">
                    <Icon name="phone" className="h-4 w-4" />
                  </span>
                  <p className="text-[13px] leading-[21px] text-body-text">
                    To arrange your clinic appointment, please contact us on{" "}
                    <strong className="text-tan">0207 225 3582</strong> or via WhatsApp on{" "}
                    <strong className="text-tan">07818 474041</strong>.
                  </p>
                </div>
              </div>

              <span className="h-px w-full bg-tan/30" />

              {/* On the day */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tan text-white shadow-sm">
                    <Icon name="calendar" className="h-6 w-6" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="h-[3px] w-12 rounded-full bg-tan" />
                    <h3 className="font-display text-[26px] font-bold leading-[30px] tracking-[-0.5px] text-forest uppercase lg:text-[30px] lg:leading-[34px]">
                      On the day of appointment
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col">
                  {onDaySteps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tan font-nav text-[13px] font-semibold text-white">
                          {i + 1}
                        </span>
                        {i < onDaySteps.length - 1 && <span className="my-1 w-px flex-1 bg-tan/30" />}
                      </div>
                      <p className="pb-5 text-[15px] leading-[24px] text-body-text">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Centrifugation, dark band */}
      <section className="relative w-full overflow-hidden bg-[linear-gradient(120deg,#3a2c1a_0%,#241a0f_100%)] px-5">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-tan/8 blur-[100px]" />
        <div className="relative mx-auto max-w-[1400px] py-[80px] lg:py-[100px]">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="font-nav text-[12px] font-semibold tracking-[3px] text-tan uppercase">Centrifugation</span>
                <span className="h-px w-16 bg-tan/40" />
              </div>
              <h2 className="font-display text-[32px] font-bold leading-[38px] tracking-[-1px] text-cream uppercase lg:text-[42px] lg:leading-[48px]">
                Why centrifugation matters
              </h2>
              <p className="text-[15px] leading-[25px] text-white/70">
                Centrifugation spins the blood at controlled speed so that the red cells and the plasma or serum separate. Many delicate biomarkers, such as hormones and specialist antibodies, break down if whole blood sits too long, which can give incorrect results or a rejected sample.
              </p>
              <p className="text-[15px] leading-[25px] text-white/70">
                We centrifuge on site, with calibrated equipment, when your laboratory&apos;s instructions require it. Not every test needs it; some need whole blood. Check your kit, or ask us and we will tell you.
              </p>
              <div className="flex flex-col gap-3">
                <h3 className="font-subheading text-[13px] font-semibold tracking-[2px] text-tan uppercase">Laboratories we work with</h3>
                <ul className="flex flex-wrap gap-2">
                  {labs.map((l) => (
                    <li key={l} className="rounded-full border border-tan/40 px-3.5 py-1.5 text-[13px] text-white/85">
                      {l}
                    </li>
                  ))}
                </ul>
                <p className="text-[14px] leading-[22px] text-white/60">
                  Among others. If your laboratory is not on this list, send us the kit instructions before you book and we will confirm we can process it.
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[440px]">
              <div className="pointer-events-none absolute -right-2 sm:-right-8 -top-2 sm:-top-8 h-full w-full rounded-full border border-tan/30" />
              <div className="relative w-full overflow-hidden rounded-[24px] shadow-xl" style={{ aspectRatio: "4/5" }}>
                <Image
                  src="/images/treatments/phlebotomy/centrifuge-machine.jpg"
                  alt="Blood sample being placed in the centrifuge at YourHealthFirst Clinic"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="absolute -left-2 sm:-left-6 -top-2 sm:-top-6 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-tan text-forest shadow-lg">
                <Icon name="drop" className="h-5 w-5 sm:h-7 sm:w-7" />
              </span>
              <span className="absolute -right-2 sm:-right-6 -bottom-2 sm:-bottom-6 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-tan text-forest shadow-lg">
                <Icon name="tubes" className="h-5 w-5 sm:h-7 sm:w-7" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile visits and prices */}
      <section className="w-full px-5">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 py-[70px] lg:grid-cols-2 lg:gap-20 lg:py-[90px]">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tan text-white shadow-sm">
                <Icon name="truck" className="h-6 w-6" />
              </span>
              <SectionBars>Mobile visits</SectionBars>
            </div>
            <p className="text-[16px] leading-[27px] text-body-text">
              {"Can't come to Wimpole Street? We can travel to you. Mobile visits are available on request, including the Teddington and Twickenham areas"}
              {SHOW_DRAFT_MARKERS ? (
                <>
                  {" "}
                  <Confirm note="Sofia to confirm other areas and the furthest distance">and other areas</Confirm>
                </>
              ) : null}
              . They are priced separately from clinic appointments, so please call or WhatsApp us with your postcode and kit details and we will confirm availability and cost.
            </p>
            <p className="text-[16px] leading-[27px] text-body-text">
              Tests that must be processed immediately on site, for example by centrifuge or freezer, are better done at the clinic.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex h-14 w-fit items-center gap-3 rounded-[10px] bg-forest px-7 font-nav text-[14px] font-semibold tracking-[0.5px] text-white uppercase transition-opacity hover:opacity-90"
            >
              <Icon name="chat" className="h-4 w-4" />
              Ask about a mobile visit
            </a>
          </div>

          <div className="flex flex-col gap-5">
            <SectionBars>Our prices</SectionBars>
            <div className="overflow-hidden rounded-[20px] border border-tan/30 bg-cream shadow-sm">
              {priceRows.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-6 border-b border-tan/25 px-6 py-5 last:border-b-0">
                  <span className="text-[15px] leading-[22px] text-body-text">{r.label}</span>
                  <span className="text-right font-subheading text-[16px] font-semibold text-forest">
                    {r.confirm ? <Confirm>{r.price}</Confirm> : r.price}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[14px] leading-[22px] text-body-text">
              The laboratory charges for the test itself separately. See our full{" "}
              <Link href="/price-list" className="text-tan underline-offset-4 hover:underline">
                price list
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Preparing and sending your kit */}
      <section className={creamBg}>
        <div className="pointer-events-none absolute -right-[10%] -top-[10%] h-[450px] w-[450px] rounded-full bg-tan/15 blur-[110px]" />
        <div className="pointer-events-none absolute -left-[10%] bottom-[-15%] h-[450px] w-[450px] rounded-full bg-white/40 blur-[110px]" />
        <div className="relative mx-auto max-w-[1400px] py-[70px] lg:py-[90px]">
          <SectionBars>Sending your kit</SectionBars>

          <KitSending />
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="w-full px-5">
        <div className="mx-auto max-w-[900px] py-[80px] lg:py-[100px]">
          <h2 className="text-center font-subheading text-[26px] font-medium leading-[32px] tracking-[-1px] text-forest uppercase lg:text-[32px] lg:leading-[38px]">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-center text-[15px] leading-[24px] text-body-text">
            Everything you need to know about private blood draws at YourHealthFirst Clinic.
          </p>
          <div className="mt-10">
            <TreatmentFaqAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="w-full border-t border-black/8 bg-cream px-5">
        <div className="mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
          <SectionBars>Read before your appointment</SectionBars>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="group relative min-h-[260px] overflow-hidden rounded-[24px] shadow-lg lg:min-h-full">
              <Image
                src="/images/treatments/phlebotomy/preparation-flatlay.jpg"
                alt="A glass of water, a notebook and pen, a folded towel and two blood collection tubes laid out on a table"
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="object-cover object-[78%_50%] transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/60 via-transparent to-transparent" />
              <div className="phl-float absolute bottom-5 left-5 flex items-center gap-3 rounded-full border border-white/40 bg-white/85 py-2 pr-5 pl-2 shadow-lg backdrop-blur-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: accentGradient(ACCENTS[0]), color: ACCENTS[0].ink }}>
                  <Icon name="clipboard" className="h-5 w-5" />
                </span>
                <span className="font-subheading text-[13px] font-semibold tracking-[0.5px] text-forest">Six short guides</span>
              </div>
            </div>
            <div className="grid grid-cols-1 content-start gap-4 sm:grid-cols-2">
              {guides.map((g, i) => {
                const a = ACCENTS[i % ACCENTS.length];
                return (
                  <Link
                    key={g.slug}
                    href={`/blog/${g.slug}`}
                    className="group flex items-center gap-4 rounded-[16px] border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ background: a.tint, borderColor: a.line, borderLeft: `4px solid ${a.grad[0]}` }}
                  >
                    <span
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110"
                      style={{ background: accentGradient(a), color: a.ink }}
                    >
                      <Icon name={guideIcons[i % guideIcons.length]} className="h-6 w-6" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-subheading text-[15px] font-semibold leading-[21px]" style={{ color: a.text }}>
                        {g.title}
                      </span>
                      <span className="text-[13px] leading-[19px] text-body-text">{g.blurb}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Find us and book */}
      <section className="relative w-full overflow-hidden bg-forest px-5">
        <div className="pointer-events-none absolute -right-[8%] -top-[30%] h-[460px] w-[460px] rounded-full bg-tan/10 blur-[110px]" />
        <div className="pointer-events-none absolute -left-[6%] bottom-[-40%] h-[380px] w-[380px] rounded-full bg-[#3f7a63]/25 blur-[110px]" />
        <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-10 py-[56px] lg:grid-cols-[1.35fr_0.65fr] lg:gap-14 lg:py-[72px]">
          <div className="flex flex-col gap-5">
            <SectionBars light>YourHealthFirst Clinic, 2 Wimpole Street</SectionBars>
            <p className="max-w-[620px] text-[16px] leading-[26px] text-white/75">
              London W1G 0EB, in the Harley Street medical district. A few minutes&apos; walk from Oxford Circus and Bond Street stations. Tell us your laboratory, whether your kit needs centrifuging or a courier, and whether the appointment is for a child or a mobile visit.
            </p>
            <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { href: PHONE_TEL, icon: "phone" as IconName, label: "Call", value: "0207 225 3582", a: ACCENTS[1], ext: false },
                { href: WHATSAPP_URL, icon: "chat" as IconName, label: "WhatsApp", value: "07818 474041", a: ACCENTS[5], ext: true },
                { href: DIRECTIONS_URL, icon: "pin" as IconName, label: "Directions", value: "Open in Maps", a: ACCENTS[2], ext: true },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  {...(c.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-3 rounded-[16px] border border-white/15 bg-white/[0.06] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12]"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-md transition-transform duration-300 group-hover:scale-110"
                    style={{ background: accentGradient(c.a), color: c.a.ink }}
                  >
                    <Icon name={c.icon} className="h-5 w-5" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-subheading text-[12px] font-semibold tracking-[1.5px] text-tan uppercase">{c.label}</span>
                    <span className="text-[14px] font-medium text-white">{c.value}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-[20px] border border-white/15 bg-white/[0.06] p-6">
            <h3 className="font-subheading text-[14px] font-semibold tracking-[2px] text-tan uppercase">Opening hours</h3>
            <ul className="flex flex-col gap-3 text-[15px] leading-[22px] text-white/85">
              {[
                { day: "Monday to Friday", time: "10am to 6:30pm", c: ACCENTS[1].grad[0] },
                { day: "Saturday", time: "12pm to 4pm", c: ACCENTS[5].grad[0] },
                { day: "Sunday and out of hours", time: "By appointment only", c: ACCENTS[2].grad[0] },
              ].map((h) => (
                <li key={h.day} className="flex items-center gap-3 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: h.c }} />
                  <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3">
                    <span>{h.day}</span>
                    <span className="font-medium text-white">
                      <Confirm>{h.time}</Confirm>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {SHOW_DRAFT_MARKERS && <p className="text-[12px] font-semibold text-[#ffd45c]">[Sofia to confirm hours]</p>}
            <p className="text-[14px] leading-[22px] text-white/60">info@yourhealthfirst.uk</p>
          </div>
        </div>
      </section>

      {/* For Sofia only */}
      {SHOW_DRAFT_MARKERS && (
        <section className="w-full px-5">
          <div className="mx-auto max-w-[1000px] py-[60px]">
            <div className="rounded-[20px] border-2 border-dashed border-[#d9a400] bg-[#fff8dc] p-8">
              <p className="font-nav text-[12px] font-semibold tracking-[3px] text-[#8a6200] uppercase">
                For Sofia only. Removed before this page goes live
              </p>
              <h2 className="mt-2 font-display text-[26px] font-bold leading-[32px] tracking-[-0.5px] text-forest">
                Please confirm these before we publish
              </h2>
              <ol className="mt-6 flex flex-col gap-3">
                {sofiaChecklist.map((q, i) => (
                  <li key={q} className="flex gap-4 border-t border-[#d9a400]/40 pt-3 text-[15px] leading-[23px] text-body-text">
                    <span className="w-6 shrink-0 font-semibold text-forest">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      <Footer sanitySettings={sanitySettings} />
    </div>
  );
}
