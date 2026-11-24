import Image from "next/image";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getSanityAttribute } from "@/sanity/lib/dataAttribute";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TreatmentFaqAccordion from "@/components/TreatmentFaqAccordion";
import type { TreatmentFaq } from "@/data/treatments";
import priceListRaw from "@/data/priceList_raw.json";
import { Icon, type IconName } from "../phlebotomy/icons";
import { ACCENTS, accentGradient } from "../phlebotomy/accents";
import TreatmentSteps, { type TreatmentStep } from "./TreatmentSteps";

/**
 * English anti-wrinkle page.
 *
 * Rule for this page: every word of the current live page is kept exactly as it is (the text
 * comes in through props from the same source the live page uses, so edits made in the content
 * editor still show), and new content is only ever added around it.
 *
 * SHOW_DRAFT_MARKERS: while true, the page shows a draft banner and highlights the wording Sofia
 * still has to confirm. Set it to false before this page goes to the live site.
 */
const SHOW_DRAFT_MARKERS = true;

const PHONE_TEL = "tel:02072253582";
const WHATSAPP_URL = "https://wa.me/447818474041";
const EMAIL_HREF = "mailto:info@yourhealthfirst.uk?subject=Anti-wrinkle%20consultation";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=YourHealthFirst+Clinic+2+Wimpole+Street+London+W1G+0EB";

type Props = {
  locale: string;
  docId: string;
  slug: string;
  title: string;
  tagline?: string;
  intro: string;
  body: string[];
  benefits: string[];
  suitableFor: string[];
  faqs: TreatmentFaq[];
  codeFaqs: TreatmentFaq[];
  priceFrom?: string;
  results: string;
  category: string;
  bodyImages: { src: string; alt: string; position?: string }[];
  gallery?: { folder: string; prefix: string; count: number; ext: string };
  related: { slug: string; title: string; intro: string }[];
  sanitySettings: Record<string, unknown> | null;
};

/* ---------------------------------------------------------------- helpers */

function Confirm({ children, note }: { children?: ReactNode; note?: string }) {
  if (!SHOW_DRAFT_MARKERS) return <>{children}</>;
  return (
    <mark className="rounded-[4px] border border-dashed border-[#d9a400] bg-[#fff3c4] px-1.5 py-0.5 text-[0.95em] text-[#6b4a00]">
      {children}
      {note ? <span className="font-semibold"> [{note}]</span> : null}
    </mark>
  );
}

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
const creamBg = "relative w-full overflow-hidden bg-[linear-gradient(135deg,#faf4ea_0%,#f0e0c8_100%)] px-5";

const draftNote = (text: string) => (SHOW_DRAFT_MARKERS ? ` [Sofia to confirm: ${text}]` : "");

/* ------------------------------------------------------------ price table */

type PriceRow = { service: string; price: string };
type PriceSection = { id: string; items: PriceRow[] };
const awSection = (priceListRaw as unknown as PriceSection[]).find((s) => s.id === "anti-wrinkle");
const priceOf = (name: string) => awSection?.items.find((i) => i.service === name)?.price ?? "";
const consultationPrice = priceOf("Consultation");

const priceGroups: { title: string; icon: IconName; accent: number; rows: { label: string; key: string }[] }[] = [
  {
    title: "Upper face",
    icon: "target",
    accent: 5,
    rows: [
      { label: "Forehead", key: "Forehead" },
      { label: "Frown", key: "Frown" },
      { label: "Crow's feet", key: "Crow's feet" },
      { label: "Brow lift", key: "Brow lift" },
      { label: "Bunny lines", key: "Bunny lines" },
    ],
  },
  {
    title: "Jaw and lower face",
    icon: "user",
    accent: 2,
    rows: [
      { label: "Jawline / Masseter (jaw slimming)", key: "Jawline / Masseter (jaw slimming)" },
      { label: "Gummy smile", key: "Gummy smile" },
      { label: "Teeth grinding / Clenching", key: "Teeth grinding / Clenching" },
      { label: "Nefertiti lift", key: "Nefertiti lift" },
    ],
  },
  {
    title: "Neck",
    icon: "shield",
    accent: 4,
    rows: [{ label: "Neck lift (platysmal bands)", key: "Neck lift (platysmal bands)" }],
  },
  {
    title: "Packages",
    icon: "check",
    accent: 1,
    rows: [
      { label: "3 areas (to choose, Face)", key: "3 areas (to choose, Face)" },
      { label: "4 areas (to choose, Face)", key: "4 areas (to choose, Face)" },
      { label: "5 areas (to choose, Face)", key: "5 areas (to choose, Face)" },
    ],
  },
  {
    title: "Excessive sweating (hyperhidrosis)",
    icon: "drop",
    accent: 3,
    rows: [
      { label: "Under both arms", key: "Hyperhidrosis — under both arms" },
      { label: "Palms of both hands", key: "Hyperhidrosis — palms of both hands" },
      { label: "Soles of both feet", key: "Hyperhidrosis — soles of both feet" },
    ],
  },
];

/* ---------------------------------------------------------------- content */

const whoForExtra: { icon: IconName; text: string }[] = [
  { icon: "target", text: "You have frown lines, forehead lines or crow's feet that stay visible when your face is relaxed." },
  { icon: "user", text: "You look tired or cross when you are not, because of a heavy brow or deep frown lines." },
  { icon: "shield", text: "You are new to anti-wrinkle injections and want to talk it through before you decide." },
  { icon: "check", text: "You want a natural result, where people say you look well rested and not that you have had treatment." },
];

const steps: TreatmentStep[] = [
  { icon: "consult", title: "Book", text: "Email us (preferred), or call or WhatsApp. Tell us which areas you would like to look at." },
  { icon: "assess", title: "Consultation", text: "Sofia reviews your medical history, assesses your face and agrees the right dose and placement with you." },
  { icon: "inject", title: "Treatment", text: "Fine needles, a few small injections into specific muscles. The appointment takes about 15 to 30 minutes." },
  { icon: "aftercare", title: "Aftercare", text: "Stay upright for 4 hours. No intense exercise, heat or alcohol for 24 hours." },
  { icon: "results", title: "Results", text: "Softening starts within a few days and the full effect shows by about day 14. A top-up can be arranged after 2 weeks." },
  { icon: "repeat", title: "Maintenance", text: "Results last about 3 to 6 months. You should never have treatment more often than every 12 weeks." },
];

const extraFaqs: TreatmentFaq[] = [
  {
    question: "How much do anti-wrinkle injections cost?",
    answer: `A consultation is ${consultationPrice}. Treatment is priced per area: from ${priceOf("Bunny lines")} for bunny lines, ${priceOf("Frown")} for frown lines, crow's feet or a brow lift, and ${priceOf("Forehead")} for the forehead. Packages are ${priceOf("3 areas (to choose, Face)")} for three areas, ${priceOf("4 areas (to choose, Face)")} for four and ${priceOf("5 areas (to choose, Face)")} for five. See the price table on this page or our full price list.`,
  },
  {
    question: "How long does the appointment take?",
    answer:
      "Most appointments take about 15 to 30 minutes, so most people go straight back to their day.",
  },
  {
    question: "Do I need a consultation first?",
    answer: `Yes. Sofia reviews your medical history, assesses your face and agrees the dose and placement with you before any treatment. The consultation is ${consultationPrice}.`,
  },
  {
    question: "Who carries out the treatment?",
    answer: `Sofia Bouzian, Aesthetic Practitioner & Clinical Director, carries out your consultation and your treatment. Prescribing is done by a registered prescriber.${draftNote("the prescriber's name, regulator and registration number")}`,
  },
  {
    question: "What is the difference between Botox and anti-wrinkle injections?",
    answer: `"Anti-wrinkle injections" is the general name for treatments that relax the muscles that cause expression lines. Botox is one well-known brand name of botulinum toxin type A, which is a prescription-only medicine. At your consultation Sofia explains what is suitable for you.${draftNote("Botox wording")}`,
  },
  {
    question: "What is the Nefertiti lift?",
    answer: `The Nefertiti lift is a non-surgical treatment that uses carefully placed anti-wrinkle injections to target the platysma, a thin muscle that runs from the lower face down the neck. By relaxing selected areas of it, the treatment may help soften the appearance of vertical neck bands and improve the appearance of jawline definition in suitable patients.${draftNote("please check this description and the wording about the product")}`,
  },
  {
    question: "Is the Nefertiti lift a surgical procedure?",
    answer: "No. It is a non-surgical injectable treatment and does not involve incisions or surgery. It is not a substitute for a surgical facelift.",
  },
  {
    question: "Does the Nefertiti lift remove a double chin?",
    answer:
      "No. The treatment does not remove fat beneath the chin. It mainly targets selected muscle activity, and it may improve the appearance of the jawline in suitable patients.",
  },
  {
    question: "Can it treat loose skin on the neck?",
    answer:
      "It may help with the appearance of muscle-related neck bands, but it does not remove excess skin or significantly tighten advanced skin laxity.",
  },
  {
    question: "Is the Nefertiti lift suitable for everyone?",
    answer:
      "No. Suitability depends on your anatomy, medical history, muscle activity and expectations, so a consultation is required before treatment.",
  },
  {
    question: "Where are you based?",
    answer:
      "2 Wimpole Street, London W1G 0EB, in the Harley Street medical district. We are a few minutes' walk from Oxford Circus and Bond Street stations.",
  },
  {
    question: "Where can I have anti-wrinkle injections in London?",
    answer:
      "At YourHealthFirst Clinic, 2 Wimpole Street, London W1G 0EB, in the Harley Street medical district. We are a few minutes' walk from Oxford Circus and Bond Street stations, and you can book by email, phone or WhatsApp.",
  },
  {
    question: "Can I see before and after photos of anti-wrinkle injections?",
    answer:
      "Yes. Our gallery shows real before and after results from patients treated at YourHealthFirst Clinic in London. Every face is different, so your own results will vary, and Sofia will explain what is realistic for you at your consultation.",
  },
];

const neckHelps = [
  "Soften the appearance of prominent vertical neck bands.",
  "Reduce the visible downward pull of the platysma muscle.",
  "Improve the appearance of the lower face and jawline.",
  "Create a smoother-looking transition between the jawline and neck.",
  "Support a more refreshed and refined lower-face appearance.",
];
const neckSuitable = [
  "You notice visible vertical bands in the neck when speaking or contracting the muscles.",
  "You have early changes in jawline definition that are linked to platysma activity.",
  "You prefer a non-surgical approach to lower-face and neck rejuvenation.",
  "You have realistic expectations about the results of muscle-relaxing treatment.",
];
const neckRisks = [
  "Temporary redness, swelling or bruising, and tenderness at the injection sites.",
  "Headache.",
  "Temporary muscle weakness.",
  "Asymmetry or an altered smile.",
  "In uncommon cases, neck weakness or difficulty swallowing.",
];

const benefitIcons: IconName[] = ["check", "shield", "target", "user", "bolt", "calendar"];

/* ------------------------------------------------------------------- page */

export default async function AntiWrinkleEnglish(props: Props) {
  const {
    locale,
    docId,
    slug,
    title,
    tagline,
    intro,
    body,
    benefits,
    suitableFor,
    faqs,
    codeFaqs,
    priceFrom,
    results,
    category,
    bodyImages,
    gallery,
    related,
    sanitySettings,
  } = props;

  const t = await getTranslations({ locale, namespace: "TreatmentDetail" });
  const tHeader = await getTranslations({ locale, namespace: "Header" });

  const allFaqs: TreatmentFaq[] = [...faqs, ...extraFaqs];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/ \[Sofia to confirm:[^\]]*\]/g, "") },
    })),
  };

  // The aftercare and "what to expect over time" lists exist in the page data but are not shown on
  // the live page; they are added here as new content.
  const extraSections = codeFaqs.flatMap((f) => f.sections ?? []);

  // body paragraphs are shown in order, three groups, each beside one of the existing photos
  // Old page layout, kept: each existing photo gets its own row with a share of the existing paragraphs
  const imgCount = Math.max(bodyImages.length, 1);
  const perRow = Math.ceil(body.length / imgCount);
  const rows = bodyImages.map((img, i) => ({
    img,
    paras: body.slice(i * perRow, (i + 1) * perRow),
  }));

  const facts: { label: string; value: string; sub?: string; icon: IconName }[] = [
    { label: t("results"), value: results, icon: "calendar" },
    // Sofia confirmed the starting price is £100 (bunny lines), so it follows the price list, not the old £120
    { label: t("startingFrom"), value: priceOf("Bunny lines") || priceFrom || "", icon: "target" },
    { label: t("location"), value: "2 Wimpole Street, London W1G 0EB", icon: "pin" },
    { label: "Appointment", value: "About 15 to 30 minutes", sub: "For the appointment", icon: "check" },
  ];

  const popular = [
    { label: "Frown", key: "Frown" },
    { label: "Crow's feet", key: "Crow's feet" },
    { label: "Forehead", key: "Forehead" },
    { label: "3 areas (to choose, Face)", key: "3 areas (to choose, Face)" },
  ];

  const galleryImages = gallery
    ? Array.from({ length: Math.min(6, gallery.count) }, (_, i) => ({
        src: `${gallery.folder}/${gallery.prefix}-${i + 1}.${gallery.ext}`,
        alt: `${title} before and after in London — result ${i + 1}`,
      }))
    : [];

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
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
                {tHeader("treatments")}
              </Link>
              <span className="text-white/30">/</span>
              <span className="font-nav text-[13px] tracking-[1px] text-tan/70 uppercase">{category}</span>
            </div>
            <h1 className="font-display text-[38px] leading-[42px] font-bold tracking-[-1px] text-cream uppercase lg:text-[58px] lg:leading-[64px]">
              {title} in London
            </h1>
            {tagline ? (
              <p className="max-w-[640px] font-serif text-[20px] leading-[30px] text-white/75 italic lg:text-[22px] lg:leading-[32px]">
                {tagline}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={EMAIL_HREF} className={primaryBtn}>
                <Icon name="mail" className="h-4 w-4" />
                Email to book
              </a>
              <a href={PHONE_TEL} className={ghostBtn}>
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

      {/* Key facts */}
      <section className="relative z-10 w-full px-5">
        <div className="mx-auto -mt-[60px] max-w-[1400px]">
          <div className="grid grid-cols-1 overflow-hidden rounded-[20px] border border-tan/30 bg-white shadow-xl sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-b border-tan/20 px-6 pt-4 pb-2 sm:col-span-2 lg:col-span-4">
              <h2 className="font-nav text-[12px] font-semibold tracking-[3px] text-tan uppercase">{t("keyFacts")}</h2>
            </div>
            {facts.map((f, i) => (
              <div key={f.label} className="flex items-start gap-4 border-b border-tan/20 p-6 lg:border-b-0 lg:border-r lg:last:border-r-0">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm"
                  style={{ background: accentGradient(ACCENTS[i % ACCENTS.length]), color: ACCENTS[i % ACCENTS.length].ink }}
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

      {/* Main content: the layout of the current page (photo rows on the left, Key Facts and Book cards on the right) */}
      <section className="w-full px-5">
        <div className="mx-auto max-w-[1400px] pt-[48px] pb-[48px] lg:pt-[56px] lg:pb-[56px]">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            {/* Main text */}
            <div className="flex flex-col gap-8 lg:flex-1">
              <p
                className="text-[18px] leading-[30px] font-medium tracking-[-0.3px] text-forest"
                data-sanity={getSanityAttribute(docId, "treatment", "intro")}
              >
                {intro}
              </p>
              <div className="flex flex-col gap-10">
                {rows.map((row, i) => {
                  const isLast = i === rows.length - 1;
                  return (
                    <div
                      key={row.img.src}
                      className={`flex flex-col items-start gap-6 sm:flex-row sm:items-stretch sm:gap-8 ${
                        i % 2 === 1 ? "sm:flex-row-reverse" : ""
                      }`}
                    >
                      <div className="relative aspect-[4/5] w-full max-w-[280px] shrink-0 overflow-hidden rounded-[14px] border border-black/8 shadow-md sm:aspect-auto sm:min-h-[200px] sm:w-[260px]">
                        <Image
                          src={row.img.src}
                          alt={row.img.alt}
                          fill
                          sizes="(min-width: 640px) 260px, 280px"
                          className="object-cover"
                          style={row.img.position ? { objectPosition: row.img.position } : undefined}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-5">
                        {row.paras.map((para, j) => (
                          <p key={j} className="text-[16px] leading-[27px] tracking-[-0.2px] text-body-text">
                            {para}
                          </p>
                        ))}
                        {isLast && (
                          <div className={`flex flex-col gap-4 ${row.paras.length ? "mt-2" : ""}`}>
                            <h2 className="font-subheading text-[20px] leading-[26px] font-semibold tracking-[-0.8px] text-forest uppercase">
                              {t("suitableFor")}
                            </h2>
                            <ul className="flex flex-col gap-3">
                              {suitableFor.map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                  <span className="mt-[8px] h-[6px] w-[6px] shrink-0 rounded-full bg-tan" />
                                  <span className="text-[16px] leading-[26px] tracking-[-0.2px] text-body-text">{item}</span>
                                </li>
                              ))}
                              {whoForExtra.map((w) => (
                                <li key={w.text} className="flex items-start gap-3">
                                  <span className="mt-[8px] h-[6px] w-[6px] shrink-0 rounded-full bg-tan" />
                                  <span className="text-[16px] leading-[26px] tracking-[-0.2px] text-body-text">{w.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6 lg:w-[340px] lg:shrink-0">
              <div className="overflow-hidden rounded-[12px] bg-cream">
                <div className="relative h-[150px] w-full">
                  <Image
                    src="/images/treatments/anti-wrinkles/consultation-corner.jpg"
                    alt="A calm consultation corner at YourHealthFirst Clinic with an armchair by a Harley Street window"
                    fill
                    sizes="340px"
                    className="object-cover object-[25%_50%]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(122,98,72,0.15)_0%,rgba(58,44,26,0.85)_100%)]" />
                  <h3 className="absolute bottom-3 left-5 font-subheading text-[14px] font-semibold tracking-[2px] text-cream uppercase">
                    Popular areas
                  </h3>
                </div>
                <div className="p-6 pt-4">
                  <ul className="flex flex-col">
                    {popular.map((r) => (
                      <li key={r.label} className="flex items-baseline justify-between gap-3 border-b border-black/10 py-2.5 last:border-b-0">
                        <span className="text-[14px] leading-[20px] text-body-text">{r.label}</span>
                        <span className="shrink-0 font-subheading text-[16px] font-semibold text-forest">{priceOf(r.key)}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#prices" className="mt-3 inline-block text-[14px] text-tan underline-offset-4 hover:underline">
                    See all areas and prices
                  </a>
                </div>
              </div>

              <div className="rounded-[12px] bg-[linear-gradient(135deg,#7a6248_0%,#b49b7d_50%,#7a6248_100%)] p-6">
                <h3 className="font-subheading text-[15px] font-semibold tracking-[1px] text-cream uppercase">{t("bookTitle")}</h3>
                <p className="mt-2 text-[14px] leading-[22px] text-white/60">{t("bookDesc")}</p>
                <div className="mt-5 flex flex-col gap-3">
                  <a
                    href={EMAIL_HREF}
                    className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-tan font-nav text-[14px] font-semibold tracking-[-0.3px] text-forest transition-opacity hover:opacity-90"
                  >
                    <Icon name="mail" className="h-4 w-4" />
                    Email to book
                  </a>
                  <a
                    href={PHONE_TEL}
                    className="flex h-12 items-center justify-center rounded-[8px] bg-tan font-nav text-[14px] font-semibold tracking-[-0.3px] text-forest transition-opacity hover:opacity-90"
                  >
                    {t("call")}
                  </a>
                  <a
                    href={`/${locale}/contact-us`}
                    className="flex h-12 items-center justify-center rounded-[8px] border border-white/40 font-nav text-[14px] font-semibold tracking-[-0.3px] text-cream transition-colors hover:border-tan hover:text-tan"
                  >
                    {t("sendEnquiry")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key benefits: all the existing points */}
      <section className={creamBg}>
        <div className="pointer-events-none absolute -left-[10%] -top-[20%] h-[420px] w-[420px] rounded-full bg-tan/15 blur-[110px]" />
        <div className="relative mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
          <SectionBars>{t("keyBenefits")}</SectionBars>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => {
              const a = ACCENTS[i % ACCENTS.length];
              return (
                <li
                  key={b}
                  className="flex items-start gap-4 rounded-[16px] border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: a.tint, borderColor: a.line, borderLeft: `4px solid ${a.grad[0]}` }}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm"
                    style={{ background: accentGradient(a), color: a.ink }}
                  >
                    <Icon name={benefitIcons[i % benefitIcons.length]} className="h-5 w-5" />
                  </span>
                  <span className="text-[15px] leading-[24px] text-body-text">{b}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Areas and prices (new) */}
      <section id="prices" className="relative w-full overflow-hidden bg-[linear-gradient(135deg,#f1e2c8_0%,#e3cba2_100%)] px-5">
        <div className="pointer-events-none absolute -right-[8%] -top-[20%] h-[460px] w-[460px] rounded-full bg-white/40 blur-[110px]" />
        <div className="pointer-events-none absolute -left-[8%] bottom-[-25%] h-[420px] w-[420px] rounded-full bg-tan/25 blur-[110px]" />
        <div className="relative mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionBars>Anti-wrinkle prices in London</SectionBars>
            <p className="inline-flex w-fit items-center gap-3 rounded-full border border-tan/50 bg-white/70 px-5 py-3 text-[14px] leading-[20px] text-body-text">
              <Icon name="chat" className="h-4 w-4 shrink-0 text-tan" />
              <span>
                Consultation <strong className="font-semibold text-forest">{consultationPrice}</strong>. Treatment is priced per area.
              </span>
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {priceGroups.map((g) => {
              const a = ACCENTS[g.accent];
              return (
                <div
                  key={g.title}
                  className="flex flex-col gap-4 rounded-[18px] border bg-white p-6 shadow-md"
                  style={{ borderColor: a.line, borderTop: `4px solid ${a.grad[0]}` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{ background: accentGradient(a), color: a.ink }}
                    >
                      <Icon name={g.icon} className="h-5 w-5" />
                    </span>
                    <h3 className="font-subheading text-[14px] font-bold tracking-[1.2px] uppercase" style={{ color: a.text }}>
                      {g.title}
                    </h3>
                  </div>
                  <ul className="flex flex-col">
                    {g.rows.map((r) => (
                      <li key={r.label} className="flex items-baseline justify-between gap-4 border-b border-black/8 py-2.5 last:border-b-0">
                        <span className="text-[15px] leading-[22px] text-body-text">{r.label}</span>
                        <span className="shrink-0 font-subheading text-[16px] font-semibold text-forest">{priceOf(r.key)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <div className="flex flex-col justify-between gap-5 rounded-[18px] bg-[linear-gradient(135deg,#7a6248_0%,#b49b7d_50%,#7a6248_100%)] p-6 shadow-md">
              <div className="flex flex-col gap-2">
                <h3 className="font-subheading text-[14px] font-bold tracking-[1.2px] text-cream uppercase">Start with a consultation</h3>
                <p className="font-subheading text-[28px] font-semibold text-white">{consultationPrice}</p>
                <p className="text-[14px] leading-[22px] text-white/80">
                  Sofia reviews your medical history, assesses your face and agrees the right dose and placement with you.
                </p>
              </div>
              <a
                href={EMAIL_HREF}
                className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-tan font-nav text-[14px] font-semibold tracking-[-0.3px] text-forest transition-opacity hover:opacity-90"
              >
                <Icon name="mail" className="h-4 w-4" />
                Email to book
              </a>
            </div>
          </div>
          <p className="mt-6 text-[14px] leading-[22px] text-body-text">
            See our full{" "}
            <Link href="/price-list" className="text-tan underline-offset-4 hover:underline">
              price list
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Nefertiti lift and neck bands (new, from Sofia's own notes) */}
      <section className={creamBg}>
        <div className="pointer-events-none absolute -right-[10%] -top-[20%] h-[460px] w-[460px] rounded-full bg-white/40 blur-[110px]" />
        <div className="relative mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
          <SectionBars>Nefertiti lift for neck bands and jawline in London</SectionBars>
          <p className="mt-4 max-w-[860px] text-[16px] leading-[26px] text-body-text">
            The Nefertiti lift is a non-surgical treatment that uses carefully placed anti-wrinkle injections to target the platysma, a thin muscle that runs from the lower face down the neck. It is named after Queen Nefertiti, known for her elegant neck and defined jawline. By relaxing selected areas of the platysma, it aims to reduce the downward pull around the lower face and neck, and it may help soften the appearance of vertical neck bands and improve the appearance of jawline definition in suitable patients.
            {SHOW_DRAFT_MARKERS ? (
              <>
                {" "}
                <Confirm note="Sofia to confirm this wording, and which product is used" />
              </>
            ) : null}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {[
              { title: "What it may help with", intro: "Depending on your anatomy and individual suitability, treatment may help to:", items: neckHelps, accent: 5 },
              { title: "Who may be suitable", intro: "It may suit adults where:", items: neckSuitable, accent: 1 },
              { title: "Risks and side effects", intro: "As with all treatments of this kind, side effects are possible:", items: neckRisks, accent: 3 },
            ].map((c) => {
              const a = ACCENTS[c.accent];
              return (
                <div
                  key={c.title}
                  className="flex flex-col gap-4 rounded-[18px] border bg-white p-6 shadow-md"
                  style={{ borderColor: a.line, borderTop: `4px solid ${a.grad[0]}` }}
                >
                  <h3 className="font-subheading text-[14px] font-bold tracking-[1.2px] uppercase" style={{ color: a.text }}>
                    {c.title}
                  </h3>
                  <p className="text-[14px] leading-[22px] text-body-text">{c.intro}</p>
                  <ul className="flex flex-col gap-2.5">
                    {c.items.map((it) => (
                      <li key={it} className="flex items-start gap-2.5 text-[14px] leading-[22px] text-body-text">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: a.grad[0] }} />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <p className="rounded-[16px] border border-tan/40 bg-white/70 p-5 text-[14px] leading-[22px] text-body-text">
              <strong className="font-semibold text-forest">Please note:</strong> the Nefertiti lift is not a substitute for a surgical facelift. It cannot remove excess skin, reduce fat under the chin or correct significant skin laxity. Results are not immediate. The effect develops over the following days and is usually assessed at around two weeks. Results are temporary.
            </p>
            <p className="rounded-[16px] border border-tan/40 bg-white/70 p-5 text-[14px] leading-[22px] text-body-text">
              The neck contains important muscles that are involved in swallowing, so careful patient selection and detailed knowledge of the anatomy matter in this area. A consultation is essential to assess your face and neck, muscle activity, medical history and expectations. The Nefertiti lift is priced in the table above.
            </p>
          </div>
        </div>
      </section>

      {/* How treatment works (new) */}
      <TreatmentSteps
        title="How anti-wrinkle treatment works in London"
        steps={steps}
        note={<>The appointment takes about 15 to 30 minutes</>}
        bookHref={EMAIL_HREF}
        bookLabel="Email to book"
      />

      {/* Natural result and your practitioner (new) */}
      <section className="relative w-full overflow-hidden bg-[linear-gradient(120deg,#3a2c1a_0%,#241a0f_100%)] px-5">
        <Image src="/images/treatments/anti-wrinkles/linen-texture.jpg" alt="" fill sizes="100vw" className="object-cover opacity-[0.16]" />
        <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 py-[56px] lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:py-[72px]">
          <div className="flex flex-col gap-5">
            <span className="font-nav text-[12px] font-semibold tracking-[3px] text-tan uppercase">A natural result</span>
            <blockquote className="font-serif text-[26px] leading-[36px] text-cream italic lg:text-[32px] lg:leading-[44px]">
              The highest artistry in anti-wrinkle treatment is imperceptibility. People should notice that you look well-rested, radiant, and refreshed — never frozen.
            </blockquote>
            <p className="text-[14px] text-white/60">
              Sofia Bouzian
              {SHOW_DRAFT_MARKERS ? (
                <>
                  {" "}
                  <Confirm note="Sofia to confirm this quote from her blog" />
                </>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-5 rounded-[20px] border border-white/15 bg-white/[0.06] p-5">
            <div className="relative h-[110px] w-[110px] shrink-0 overflow-hidden rounded-full border-2 border-tan/60">
              <Image src="/images/hero-portrait.jpg" alt="Sofia Bouzian" fill sizes="110px" className="object-cover object-top" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-subheading text-[13px] font-semibold tracking-[2px] text-tan uppercase">Your practitioner</h3>
              <p className="font-subheading text-[16px] font-semibold text-cream">Sofia Bouzian</p>
              <p className="text-[14px] leading-[22px] text-tan">Aesthetic Practitioner &amp; Clinical Director</p>
              <p className="text-[14px] leading-[22px] text-white/75">
                Master of Science (MSc), Postgraduate Diploma (PGDip), and a Level 7 Qualification in Aesthetic Medicine. Founder of YourHealthFirst Clinic in Harley Street, London.
              </p>
              <p className="text-[14px] leading-[22px] text-white/85">
                Sofia carries out your consultation and treatment. Prescribing is done by a registered prescriber.
                {SHOW_DRAFT_MARKERS ? (
                  <>
                    {" "}
                    <Confirm note="Sofia to confirm the prescriber's name, regulator and registration number" />
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Aftercare and what to expect over time (from the page data, not shown on the live page) */}
      {extraSections.length > 0 && (
        <section className="w-full px-5">
          <div className="mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
            <SectionBars>Aftercare and what to expect</SectionBars>
            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {extraSections.map((sec, i) => {
                const a = ACCENTS[(i + 2) % ACCENTS.length];
                return (
                  <div key={sec.heading} className="flex flex-col gap-4 rounded-[18px] border p-6" style={{ background: a.tint, borderColor: a.line }}>
                    <h3 className="font-subheading text-[14px] font-bold tracking-[1.2px] uppercase" style={{ color: a.text }}>
                      {sec.heading}
                    </h3>
                    <ul className="flex flex-col gap-3">
                      {sec.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2.5 text-[14px] leading-[22px] text-body-text">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: a.grad[0] }} />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQs: the existing questions first, then new ones */}
      <section id="faqs" className="w-full bg-cream px-5">
        <div className="mx-auto max-w-[900px] py-[80px] lg:py-[100px]">
          <h2 className="text-center font-subheading text-[26px] font-medium leading-[32px] tracking-[-1px] text-forest uppercase lg:text-[32px] lg:leading-[38px]">
            {t("faqsTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-center text-[15px] leading-[24px] text-body-text">
            Everything you need to know about {title.toLowerCase()} at YourHealthFirst Clinic.
          </p>
          <div className="mt-10">
            <TreatmentFaqAccordion items={allFaqs} docId={docId} />
          </div>
        </div>
      </section>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="w-full px-5">
          <div className="mx-auto max-w-[1400px] py-[70px] lg:py-[90px]">
            <h2 className="text-center font-subheading text-[26px] font-medium leading-[32px] tracking-[-1px] text-forest uppercase lg:text-[32px] lg:leading-[38px]">
              {t("galleryTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-[520px] text-center text-[15px] leading-[24px] text-body-text">
              Real before &amp; after results from patients treated at YourHealthFirst Clinic.
            </p>
            <p className="mx-auto mt-2 max-w-[640px] text-center text-[14px] leading-[22px] text-body-text/80">
              Anti-wrinkle injections before and after: results from our clinic at 2 Wimpole Street, London.
            </p>
            <div className="mx-auto mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((g) => (
                <div
                  key={g.src}
                  className="group relative overflow-hidden rounded-[12px] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href={`/gallery?treatment=${slug}`}
                className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#a8896a] px-7 font-nav text-[14px] font-semibold tracking-[-0.3px] text-cream transition-opacity hover:opacity-90"
              >
                {t("viewGalleryCta")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Prices, appointment and opening hours: the existing block, with contact tiles added */}
      <section className="relative w-full overflow-hidden bg-forest px-5">
        <div className="pointer-events-none absolute -right-[8%] -top-[30%] h-[460px] w-[460px] rounded-full bg-tan/10 blur-[110px]" />
        <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-10 py-[56px] lg:grid-cols-[1.35fr_0.65fr] lg:gap-14 lg:py-[72px]">
          <div className="flex flex-col gap-5">
            <SectionBars light>YourHealthFirst Clinic, 2 Wimpole Street</SectionBars>
            <p className="max-w-[620px] text-[16px] leading-[26px] text-white/75">
              London W1G 0EB, in the Harley Street medical district. A few minutes&apos; walk from Oxford Circus and Bond Street stations.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { href: EMAIL_HREF, icon: "mail" as IconName, label: "Email (preferred)", value: "info@yourhealthfirst.uk", a: ACCENTS[0], ext: false },
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
            <div className="flex flex-col gap-2">
              <h3 className="font-subheading text-[14px] font-semibold tracking-[2px] text-tan uppercase">{t("ourPrices")}</h3>
              <Link href={`/price-list`} className="text-[14px] text-tan underline-offset-4 hover:underline">
                {t("checkPriceList")}
              </Link>
            </div>
            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
              <h3 className="font-subheading text-[14px] font-semibold tracking-[2px] text-tan uppercase">{t("getAppointment")}</h3>
              <p className="text-[14px] leading-[22px] text-white/80">
                By phone: 0207 225 3582 / 078 1847 4041
                <br />
                By email: info@yourhealthfirst.uk
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
              <h3 className="font-subheading text-[14px] font-semibold tracking-[2px] text-tan uppercase">{t("openingHours")}</h3>
              <p className="text-[14px] leading-[22px] text-white/80">
                {t("openingWeekdays")}
                <br />
                {t("openingSaturday")}
                <br />
                {t("openingSunday")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related treatments */}
      {related.length > 0 && (
        <section className="w-full bg-cream px-5">
          <div className="mx-auto max-w-[1400px] py-[70px] lg:py-[80px]">
            <h2 className="font-subheading text-[28px] font-medium leading-[34px] tracking-[-1.2px] text-forest uppercase">
              {t("relatedTreatments")}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => {
                const a = ACCENTS[(i + 1) % ACCENTS.length];
                return (
                  <Link
                    key={r.slug}
                    href={`/treatments/${r.slug}`}
                    className="group flex flex-col gap-3 rounded-[16px] border bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: a.line, borderTop: `4px solid ${a.grad[0]}` }}
                  >
                    <p className="font-subheading text-[14px] font-semibold tracking-[-0.5px] text-forest uppercase">{r.title}</p>
                    <p className="line-clamp-3 text-[14px] leading-[22px] text-body-text">{r.intro}</p>
                    <span className="font-nav text-[13px] font-semibold tracking-[0.5px] text-tan uppercase transition-opacity group-hover:opacity-70">
                      {t("learnMore")}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* For Sofia only */}
      {SHOW_DRAFT_MARKERS && (
        <section className="w-full px-5">
          <div className="mx-auto flex max-w-[1000px] flex-col gap-8 py-[60px]">
            <div className="rounded-[20px] border-2 border-dashed border-[#d9a400] bg-[#fff8dc] p-8">
              <p className="font-nav text-[12px] font-semibold tracking-[3px] text-[#8a6200] uppercase">
                For Sofia only. Removed before this page goes live
              </p>
              <h2 className="mt-2 font-display text-[26px] font-bold leading-[32px] tracking-[-0.5px] text-forest">
                Why this page should work better in Google
              </h2>
              <p className="mt-4 text-[15px] leading-[24px] text-body-text">
                In Google Search Console the current page was shown 1,206 times, clicked 0 times, and averaged position 69, which is about page seven. The new page keeps every word of the current page and adds what people look for before they book.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-subheading text-[13px] font-semibold tracking-[2px] text-[#8a6200] uppercase">What it is written to be found for</h3>
                  <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-[22px] text-body-text">
                    <li>Anti-wrinkle injections London (and Harley Street, Wimpole Street, near Oxford Circus and Bond Street)</li>
                    <li>Anti-wrinkle injections cost, price and how much</li>
                    <li>Forehead lines, frown lines, crow&apos;s feet, brow lift and bunny lines</li>
                    <li>Jaw slimming, teeth grinding, gummy smile, neck bands and excessive sweating</li>
                    <li>How long they last, side effects, aftercare and how often you can have them</li>
                    <li>Before and after photos, and Botox compared with anti-wrinkle injections</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-subheading text-[13px] font-semibold tracking-[2px] text-[#8a6200] uppercase">What is better than the current page</h3>
                  <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-[22px] text-body-text">
                    <li>The heading says &ldquo;in London&rdquo;, which is how people search</li>
                    <li>All your prices are on the page, with the consultation fee, instead of one &ldquo;from&rdquo; figure</li>
                    <li>Twenty-seven questions answered, set up so Google can show them directly (the current page has none set up)</li>
                    <li>How treatment works, aftercare and the 12-week gap, so people know what to expect</li>
                    <li>Six before and after photos instead of three, and easy ways to book by email, phone or WhatsApp</li>
                    <li>Twice the content, with all of your own words still there</li>
                  </ul>
                </div>
              </div>
              <p className="mt-6 text-[14px] leading-[22px] text-body-text">
                <strong className="font-semibold text-forest">What we cannot promise:</strong> a ranking. Google decides that, and London is a competitive market. We are not changing the page title or description yet, only reviewing them with you on 27 November. After the page is live we will check Google Search Console after 4 to 6 weeks and show you what changed. Please read the page again and tell us anything that is wrong, especially the wording in yellow.
              </p>
            </div>

            <div className="rounded-[20px] border-2 border-dashed border-[#d9a400] bg-[#fff8dc] p-8">
              <p className="font-nav text-[12px] font-semibold tracking-[3px] text-[#8a6200] uppercase">
                For Sofia only. Removed before this page goes live
              </p>
              <h2 className="mt-2 font-display text-[26px] font-bold leading-[32px] tracking-[-0.5px] text-forest">
                Please confirm these before we publish
              </h2>
              <ol className="mt-6 flex flex-col gap-3">
                {[
                  "Who is the registered prescriber for the anti-wrinkle injections? Please send their name, regulator (for example GMC, NMC or GDC) and registration number, so we can show it on this page.",
                  "The word Botox: it stays in the existing text and in the question about the difference between Botox and anti-wrinkle injections. Are you happy with this, and with using \"anti-wrinkle injections\" everywhere else?",
                  "The new section \"Nefertiti lift for neck bands and jawline\" and five new questions are taken from your email. We left out the claims about lifting the jawline. Which product do you use for this treatment, and are you happy for the page to say \"anti-wrinkle injections\" rather than naming the product, because botulinum toxin is a prescription-only medicine?",
                  "The quote in \"A natural result\" is taken from the blog post \"Anti-Wrinkle Injections — Everything You Need to Know\" (16 March 2023). Is it yours, and are you happy for it to be used here?",
                ].map((q, i) => (
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
