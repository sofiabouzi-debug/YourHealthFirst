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
import TreatmentSteps, { type TreatmentStep } from "../antiwrinkle/TreatmentSteps";
import ZoomImage from "../dermalfillers/ZoomImage";

/**
 * English Profhilo page.
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
const EMAIL_HREF = "mailto:info@yourhealthfirst.uk?subject=Profhilo%20consultation";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=YourHealthFirst+Clinic+2+Wimpole+Street+London+W1G+0EB";

type ExtendedGuide = {
  heading: string;
  subheading: string;
  intro: string;
  bestForHeading: string;
  bestForIntro: string;
  bestForItems: { title: string; description: string }[];
  bestForImage?: { src: string; alt: string };
  notRightHeading: string;
  notRightIntro: string;
  notRightItems: { title: string; description: string }[];
  resultsHeading: string;
  resultsBody: string;
  ctaHeading: string;
  ctaBody: string;
};

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
  priceFrom?: string;
  results: string;
  category: string;
  bodyImage?: { src: string; alt: string; position?: string };
  areas: string[];
  areasImage?: { src: string; alt: string };
  guide?: ExtendedGuide;
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

/* ------------------------------------------------------------ price data */

type PriceSection = { id: string; items: { service: string; price: string; note?: string }[] };
const priceSections = priceListRaw as unknown as PriceSection[];
const consultation = priceSections.find((s) => s.id === "general-fees")?.items[0];
const consultationPrice = consultation?.price ?? "";
const consultationNote = consultation?.note ?? "";
const profhiloRows = priceSections.find((s) => s.id === "profhilo")?.items ?? [];
const rawPrice = (re: RegExp) => profhiloRows.find((r) => re.test(r.service))?.price ?? "";
const amount = (p: string) => {
  const m = p.replace(/,/g, "").match(/£\s*(\d+)/);
  return m ? Number(m[1]) : NaN;
};

const facePrice = rawPrice(/^1 treatment \(face\)/i);
const faceCourse = rawPrice(/^Course of 2 \(face\)/i);
const neckPrice = rawPrice(/^1 treatment \(neck\)/i);
const neckCourse = rawPrice(/^Course of 2 \(neck\)/i);
const courseSaving = amount(facePrice) * 2 - amount(faceCourse);

/* ---------------------------------------------------------------- content */

const whoForExtra: { icon: IconName; text: string }[] = [
  { icon: "sparkle", text: "Your skin looks dull, tired or dehydrated and you would like it to look fresher." },
  { icon: "neck", text: "You would like to improve the skin of your neck as well as your face." },
  { icon: "shield", text: "You are new to Profhilo and want to talk it through before you decide." },
];

type AreaCard = { icon: IconName; title: string; text: string; price?: string; confirm?: string };
const areaCardsBase: Omit<AreaCard, "price">[] = [
  {
    icon: "face",
    title: "Profhilo for the face",
    text: "Profhilo is injected at 5 Bio Aesthetic Points on each side of the face, so it spreads through the tissue and improves skin quality across a wider zone. It does not add volume to one spot.",
  },
  {
    icon: "neck",
    title: "Profhilo for the neck",
    text: "Profhilo is popular for the neck, where skin laxity can be difficult to treat otherwise. The neck is treated with the same course of 2 sessions.",
  },
  {
    icon: "chest",
    title: "Profhilo for the décolleté",
    text: "Profhilo is also popular for the décolleté, the skin of the upper chest, where loss of skin quality and laxity can be hard to treat.",
    confirm: "please confirm you treat the décolleté, and its price",
  },
  {
    icon: "hand",
    title: "Profhilo for the hands",
    text: "Profhilo can be used on the hands, where skin loses hydration and firmness with age.",
    confirm: "please confirm you treat the hands, and its price",
  },
  {
    icon: "arm",
    title: "Profhilo for the upper arms",
    text: "Profhilo is popular for the upper arms, where skin laxity can be difficult to treat otherwise.",
    confirm: "please confirm you treat the upper arms, and its price",
  },
  {
    icon: "knee",
    title: "Profhilo for the knees",
    text: "Profhilo is popular for the knees, where skin laxity can be difficult to treat otherwise.",
    confirm: "please confirm you treat the knees, and its price",
  },
];

const steps: TreatmentStep[] = [
  { icon: "consult", title: "Book", text: "Email us (preferred), or call or WhatsApp. Tell us which areas you would like to look at." },
  { icon: "assess", title: "Consultation", text: "At YourHealthFirst we take your medical history, look at your skin and agree with you whether Profhilo is right for you and which areas to treat." },
  { icon: "inject", title: "First session", text: "Profhilo is injected at 5 Bio Aesthetic Points on each side of the face. The injections are quick and superficial, with only brief discomfort at each point." },
  { icon: "repeat", title: "Second session", text: "A course is 2 sessions, spaced 4 weeks apart." },
  { icon: "results", title: "Results", text: "Hydration and glow are often visible almost immediately. The fuller skin-remodelling effect on firmness develops over 4 to 6 weeks." },
  { icon: "aftercare", title: "Aftercare and maintenance", text: "Small bumps at the injection points settle within 24 to 48 hours. A full course lasts 6 to 9 months, and many patients repeat it twice a year." },
];

type Moment = { when: string; text: string; icon: IconName; confirm?: string };
const moments: Moment[] = [
  { when: "Straight after", icon: "drop", text: "Small bumps at each injection point are expected. They typically settle within 24 to 48 hours. Mild bruising can occasionally occur." },
  { when: "First days", icon: "sparkle", text: "Increased hydration and glow are often visible almost immediately." },
  { when: "After 1 week", icon: "clock", text: "The bumps have settled, and the skin often looks and feels more hydrated.", confirm: "please confirm what patients usually see after one week" },
  { when: "Week 4", icon: "bolt", text: "Your second session, 4 weeks after the first." },
  { when: "4 to 6 weeks", icon: "layers", text: "The fuller skin-remodelling effect on laxity and firmness develops progressively." },
  { when: "6 to 9 months", icon: "calendar", text: "A full course typically lasts 6 to 9 months. Many patients repeat the course twice a year to maintain skin quality." },
];

const benefitIcons: IconName[] = ["drop", "layers", "face", "sparkle", "check", "shield"];

/* ------------------------------------------------------------------- page */

export default async function ProfhiloEnglish(props: Props) {
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
    priceFrom,
    results,
    category,
    bodyImage,
    areas,
    areasImage,
    guide,
    gallery,
    related,
    sanitySettings,
  } = props;

  const t = await getTranslations({ locale, namespace: "TreatmentDetail" });
  const tHeader = await getTranslations({ locale, namespace: "Header" });

  const consultationLine = `${consultationPrice}${consultationNote ? `, and ${consultationNote.charAt(0).toLowerCase()}${consultationNote.slice(1)}` : ""}`;

  const areaCards: AreaCard[] = areaCardsBase.map((c, i) => ({
    ...c,
    price: i === 0 ? facePrice : i === 1 ? neckPrice : undefined,
  }));

  const extraFaqs: TreatmentFaq[] = [
    {
      question: "What is Profhilo?",
      answer: `Profhilo is an injectable treatment containing one of the highest concentrations of hyaluronic acid on the market. It spreads beneath the skin to hydrate it and to stimulate collagen and elastin, improving skin quality rather than adding volume. It is sometimes searched for as Profilo or Profihlo, but the name is Profhilo.`,
    },
    {
      question: "How much does Profhilo cost in London?",
      answer: `At YourHealthFirst Profhilo for the face is ${facePrice} for one treatment and ${faceCourse} for a course of 2. Profhilo for the neck is ${neckPrice} for one treatment and ${neckCourse} for a course of 2.${Number.isFinite(courseSaving) && courseSaving > 0 ? ` A course of 2 costs £${courseSaving} less than two single treatments.` : ""} The standard protocol is 2 sessions, 4 weeks apart. The consultation is ${consultationLine}. See the price table on this page or our full price list.`,
    },
    {
      question: "Is Profhilo a filler? What is the difference between Profhilo and dermal fillers?",
      answer: `Profhilo is not a traditional filler. Dermal fillers add volume or shape to a specific area, for example the lips, cheeks, chin or under the eyes. Profhilo spreads through the tissue rather than sitting in one place, so it improves skin quality, hydration and firmness without changing facial contours or adding bulk. Some people have both. At your consultation at YourHealthFirst we explain which is suitable for you.`,
    },
    {
      question: "What is the difference between Profhilo and Sunekos?",
      answer: `Both are injectable skin treatments that improve skin quality rather than adding volume. Profhilo is a high concentration of hyaluronic acid, with a standard course of 2 sessions 4 weeks apart. Sunekos combines amino acids with hyaluronic acid to stimulate the skin's own collagen and elastin, with a standard course of 4 sessions spaced 7 to 10 days apart. At your consultation at YourHealthFirst we explain which is suitable for you.${draftNote("please check this comparison of Profhilo and Sunekos")}`,
    },
    {
      question: "Where is Profhilo injected?",
      answer: `For the face, Profhilo is injected at 5 specific Bio Aesthetic Points (BAP) on each side, which is 10 injection points in total. They are placed for the best anatomical position, so the product spreads and improves skin quality across the treated zone. The picture on this page shows the injection points on the face and neck.`,
    },
    {
      question: "Can Profhilo be used on the neck?",
      answer: `Yes. Profhilo is popular for the neck, where skin laxity can be difficult to treat otherwise. Profhilo for the neck is ${neckPrice} for one treatment and ${neckCourse} for a course of 2.`,
    },
    {
      question: "Can Profhilo be used on the hands, décolleté, upper arms or knees?",
      answer: `Yes. Profhilo is also popular for the décolleté, arms and knees, and the hands are on our list of treatment areas. At your consultation at YourHealthFirst we agree which areas to treat and confirm the price.${draftNote("please confirm which of these areas you treat, and the price of each")}`,
    },
    {
      question: "Can Profhilo be used under the eyes?",
      answer: `Profhilo is not specifically designed to correct under-eye hollows or dark circles. A consultation can help determine which treatment is most suitable for you and for the delicate eye area. If hollows under the eyes are your main concern, tear trough filler may be an option, and you can read about it on our dermal fillers page.${draftNote("people search for Profhilo under the eyes. Do you treat this area, and how do you describe it?")}`,
    },
    {
      question: "Can I see Profhilo before and after photos?",
      answer: `Yes. Our gallery shows real before and after results from patients treated with Profhilo at YourHealthFirst Clinic in London. Profhilo improves skin quality gradually over 4 to 6 weeks, and every skin is different, so your own results will vary. At YourHealthFirst we will explain what is realistic for you at your consultation.`,
    },
    {
      question: "What does Profhilo look like after 1 week?",
      answer: `Small bumps at the injection points typically settle within 24 to 48 hours, so by one week they have normally gone. Skin often looks and feels more hydrated, and the fuller effect on firmness and laxity develops over 4 to 6 weeks. Your second session is 4 weeks after the first.${draftNote("please confirm what patients usually see after one week")}`,
    },
    {
      question: "What aftercare is needed after Profhilo?",
      answer: `Small bumps at the injection points are expected and settle within 24 to 48 hours, and mild bruising can occasionally occur. At your appointment at YourHealthFirst we explain what to do and what to avoid in the days afterwards.${draftNote("please tell us your aftercare advice (for example exercise, heat, alcohol, make-up, touching the skin) so we can add it")}`,
    },
    {
      question: "Do I need a consultation first?",
      answer: `Yes. At YourHealthFirst we take a full medical history and look at your skin before any treatment, so that we can agree whether Profhilo is right for you and which areas to treat. The consultation is ${consultationLine}.`,
    },
    {
      question: "Where can I have Profhilo in London?",
      answer:
        "At YourHealthFirst Clinic, 2 Wimpole Street, Marylebone, London W1G 0EB, in the Harley Street medical district of central London. We are a few minutes' walk from Oxford Circus and Bond Street stations, and you can book by email, phone or WhatsApp.",
    },
    {
      question: "Who carries out the treatment?",
      answer: `Sofia Bouzian, Aesthetic Practitioner & Clinical Director, carries out your consultation and your treatment.${draftNote("please confirm how you want your title written")}`,
    },
  ];

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

  const facts: { label: string; value: string; sub?: string; icon: IconName }[] = [
    { label: t("results"), value: results, icon: "calendar" },
    { label: t("startingFrom"), value: priceFrom ?? "", sub: facePrice ? `One treatment from ${facePrice}` : undefined, icon: "target" },
    { label: "Course", value: "2 sessions, 4 weeks apart", icon: "layers" },
    { label: t("location"), value: "2 Wimpole Street, London W1G 0EB", icon: "pin" },
  ];

  const popular = [
    { label: "Face, 1 treatment", value: facePrice },
    { label: "Face, course of 2", value: faceCourse },
    { label: "Neck, 1 treatment", value: neckPrice },
    { label: "Neck, course of 2", value: neckCourse },
  ].filter((r) => r.value);

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

      {/* Main content: the layout of the current page (text beside the photo, areas and who it is for, picture of the injection points) */}
      <section className="w-full px-5">
        <div className="mx-auto max-w-[1400px] pt-[48px] pb-[48px] lg:pt-[56px] lg:pb-[56px]">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            {/* Main text */}
            <div className="flex flex-col gap-8 lg:flex-1">
              <div className="flow-root">
                {bodyImage ? (
                  <div className="relative float-right mb-4 ml-6 aspect-square w-[200px] overflow-hidden rounded-[14px] border border-black/8 shadow-md sm:w-[300px]">
                    <Image
                      src={bodyImage.src}
                      alt={bodyImage.alt}
                      fill
                      sizes="(min-width: 640px) 300px, 200px"
                      className="object-cover"
                      style={bodyImage.position ? { objectPosition: bodyImage.position } : undefined}
                    />
                  </div>
                ) : null}
                <p
                  className="mb-5 text-[18px] leading-[30px] font-medium tracking-[-0.3px] text-forest"
                  data-sanity={getSanityAttribute(docId, "treatment", "intro")}
                >
                  {intro}
                </p>
                {body.map((para, j) => (
                  <p
                    key={j}
                    className="mb-5 text-[16px] leading-[27px] tracking-[-0.2px] text-body-text"
                    data-sanity={getSanityAttribute(docId, "treatment", `bodyParagraphs[${j}]`)}
                  >
                    {para}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start lg:gap-8">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 rounded-[14px] border border-tan/25 bg-cream/40 p-6">
                    <h2 className="font-subheading text-[20px] leading-[26px] font-semibold tracking-[-0.8px] text-forest uppercase">
                      {t("whatAreas")}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {areas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center gap-2 rounded-full border border-tan/40 bg-white px-4 py-2 text-[14px] leading-[18px] whitespace-nowrap text-body-text"
                        >
                          <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-tan" />
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 rounded-[14px] border border-tan/50 bg-tan/20 p-6">
                    <h2 className="font-subheading text-[20px] leading-[26px] font-semibold tracking-[-0.8px] text-forest uppercase">
                      {t("whoIsItFor")}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {suitableFor.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <span className="mt-[8px] h-[6px] w-[6px] shrink-0 rounded-full bg-forest" />
                          <span className="text-[16px] leading-[26px] tracking-[-0.2px] text-body-text">{item}</span>
                        </div>
                      ))}
                      {whoForExtra.map((w) => (
                        <div key={w.text} className="flex items-start gap-3">
                          <span className="mt-[8px] h-[6px] w-[6px] shrink-0 rounded-full bg-forest" />
                          <span className="text-[16px] leading-[26px] tracking-[-0.2px] text-body-text">{w.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {areasImage ? <ZoomImage src={areasImage.src} alt={areasImage.alt} /> : null}
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6 lg:w-[340px] lg:shrink-0">
              <div className="rounded-[12px] bg-cream p-6">
                <h3 className="font-subheading text-[14px] font-semibold tracking-[2px] text-forest uppercase">Profhilo prices</h3>
                <ul className="mt-3 flex flex-col">
                  {popular.map((r) => (
                    <li key={r.label} className="flex items-baseline justify-between gap-3 border-b border-black/10 py-2.5 last:border-b-0">
                      <span className="text-[14px] leading-[20px] text-body-text">{r.label}</span>
                      <span className="shrink-0 font-subheading text-[16px] font-semibold text-forest">{r.value}</span>
                    </li>
                  ))}
                </ul>
                <a href="#prices" className="mt-3 inline-block text-[14px] font-medium text-forest underline underline-offset-4 hover:text-tan">
                  See the full price table
                </a>
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

      {/* Is Profhilo the right treatment for you? The existing guide, kept word for word */}
      {guide ? (
        <section className={creamBg}>
          <div className="pointer-events-none absolute -right-[8%] -top-[20%] h-[420px] w-[420px] rounded-full bg-tan/15 blur-[110px]" />
          <div className="relative mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
            <div className="max-w-[820px]">
              <SectionBars>{guide.heading}</SectionBars>
              <p className="mt-3 text-[15px] leading-[24px] text-body-text/80 italic">{guide.subheading}</p>
              <p className="mt-4 text-[16px] leading-[27px] tracking-[-0.2px] text-body-text">{guide.intro}</p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-stretch lg:gap-10">
              <div className="flex flex-col gap-5">
                <h3 className="font-subheading text-[19px] leading-[25px] font-semibold tracking-[-0.6px] text-forest uppercase">
                  {guide.bestForHeading}
                </h3>
                <p className="text-[15px] leading-[24px] text-body-text">{guide.bestForIntro}</p>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {guide.bestForItems.map((item, i) => {
                    const a = ACCENTS[i % ACCENTS.length];
                    return (
                      <li
                        key={item.title}
                        className="flex flex-col gap-2 rounded-[16px] border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        style={{ background: a.tint, borderColor: a.line, borderLeft: `4px solid ${a.grad[0]}` }}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm"
                            style={{ background: accentGradient(a), color: a.ink }}
                          >
                            <Icon name={benefitIcons[i % benefitIcons.length]} className="h-[18px] w-[18px]" />
                          </span>
                          <strong className="font-subheading text-[15px] leading-[21px] font-semibold text-forest">{item.title}:</strong>
                        </span>
                        <span className="text-[15px] leading-[23px] text-body-text">{item.description}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {guide.bestForImage ? (
                <div className="relative min-h-[320px] w-full overflow-hidden rounded-[18px] border border-black/8 shadow-md lg:min-h-0">
                  <Image
                    src={guide.bestForImage.src}
                    alt={guide.bestForImage.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className="mt-12 flex flex-col gap-5">
              <h3 className="font-subheading text-[19px] leading-[25px] font-semibold tracking-[-0.6px] text-forest uppercase">
                {guide.notRightHeading}
              </h3>
              <p className="max-w-[820px] text-[15px] leading-[24px] text-body-text">{guide.notRightIntro}</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {guide.notRightItems.map((item, i) => (
                  <div key={item.title} className="flex gap-4 rounded-[16px] border border-forest/15 bg-white p-5 shadow-sm">
                    <span className="font-display text-[34px] leading-[34px] font-bold text-tan/70">{i + 1}</span>
                    <div className="flex flex-col gap-1.5">
                      <h4 className="text-[16px] leading-[22px] font-semibold text-forest">{item.title}</h4>
                      <p className="text-[15px] leading-[24px] text-body-text">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h3 className="font-subheading text-[19px] leading-[25px] font-semibold tracking-[-0.6px] text-forest uppercase">
                  {guide.resultsHeading}
                </h3>
                <p className="text-[16px] leading-[27px] tracking-[-0.2px] text-body-text">{guide.resultsBody}</p>
              </div>
              <div className="flex flex-col justify-between gap-5 rounded-[18px] bg-[linear-gradient(135deg,#7a6248_0%,#b49b7d_50%,#7a6248_100%)] p-6 shadow-md">
                <div className="flex flex-col gap-2">
                  <h3 className="font-subheading text-[19px] leading-[25px] font-semibold tracking-[-0.6px] text-cream uppercase">
                    {guide.ctaHeading}
                  </h3>
                  <p className="text-[15px] leading-[24px] text-white/85">{guide.ctaBody}</p>
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
          </div>
        </section>
      ) : null}

      {/* Key benefits: all the existing points */}
      <section className="w-full px-5">
        <div className="mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
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

      {/* Treatment areas (new) */}
      <section className={creamBg}>
        <div className="relative mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
          <div className="max-w-[760px]">
            <SectionBars>Profhilo treatment areas in London</SectionBars>
            <p className="mt-4 text-[16px] leading-[26px] text-body-text">
              At YourHealthFirst we offer Profhilo for the face, neck, décolleté, hands, upper arms and knees. Book a consultation to talk through which areas are right for you. We are at 2 Wimpole Street in Marylebone, in the Harley Street medical district of central London, a few minutes&apos; walk from Oxford Circus and Bond Street.
              {SHOW_DRAFT_MARKERS ? (
                <>
                  {" "}
                  <Confirm note="Sofia to check the wording in these cards" />
                </>
              ) : null}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {areaCards.map((c, i) => {
              const a = ACCENTS[i % ACCENTS.length];
              return (
                <div
                  key={c.title}
                  className="flex flex-col gap-4 rounded-[18px] border bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderColor: a.line, borderTop: `4px solid ${a.grad[0]}` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm"
                      style={{ background: accentGradient(a), color: a.ink }}
                    >
                      <Icon name={c.icon} className="h-6 w-6" />
                    </span>
                    <h3 className="font-subheading text-[14px] font-bold tracking-[1.2px] uppercase" style={{ color: a.text }}>
                      {c.title}
                    </h3>
                  </div>
                  <p className="text-[15px] leading-[24px] text-body-text">
                    {c.text}
                    {c.confirm ? (
                      <>
                        {" "}
                        <Confirm note={`Sofia: ${c.confirm}`} />
                      </>
                    ) : null}
                  </p>
                  <p className="mt-auto text-[14px] text-body-text">
                    {c.price ? (
                      <>
                        One treatment from <strong className="font-subheading text-[16px] font-semibold text-forest">{c.price}</strong>
                      </>
                    ) : (
                      "Price confirmed at your consultation"
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery: before and after, placed high because it is what most people look for */}
      {galleryImages.length > 0 && (
        <section className="w-full px-5">
          <div className="mx-auto max-w-[1400px] py-[70px] lg:py-[90px]">
            <p className="text-center font-nav text-[12px] font-semibold tracking-[3px] text-tan uppercase">{t("galleryTitle")}</p>
            <h2 className="mt-2 text-center font-subheading text-[26px] leading-[32px] font-medium tracking-[-1px] text-forest uppercase lg:text-[32px] lg:leading-[38px]">
              {title} before and after in London
            </h2>
            <p className="mx-auto mt-3 max-w-[560px] text-center text-[15px] leading-[24px] text-body-text">
              Real before &amp; after results from patients treated at YourHealthFirst Clinic.
            </p>
            <p className="mx-auto mt-2 max-w-[640px] text-center text-[14px] leading-[22px] text-body-text/80">
              Profhilo improves skin quality gradually, with the fuller effect developing over 4 to 6 weeks. Every skin is different, so results vary.
            </p>
            <div className="mx-auto mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((g, gi) => (
                <div
                  key={g.src}
                  className="group relative overflow-hidden rounded-[12px] bg-[#16100a] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className={gi === 0 ? "object-contain" : "object-cover"}
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

      {/* What to expect: the timeline of a course */}
      <section className="relative w-full overflow-hidden bg-[linear-gradient(120deg,#3a2c1a_0%,#241a0f_100%)] px-5">
        <Image src="/images/treatments/anti-wrinkles/linen-texture.jpg" alt="" fill sizes="100vw" className="object-cover opacity-[0.14]" />
        <div className="relative mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
          <SectionBars light>What to expect after Profhilo</SectionBars>
          <p className="mt-4 max-w-[640px] text-[16px] leading-[26px] text-white/80">
            Profhilo works gradually. This is how a standard course unfolds, from the first session to the months that follow.
          </p>
          <ol className="relative mt-10 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-6">
            <span className="pointer-events-none absolute left-[22px] top-3 bottom-3 w-px bg-white/20 lg:left-6 lg:right-6 lg:top-[22px] lg:bottom-auto lg:h-px lg:w-auto" />
            {moments.map((m, i) => {
              const a = ACCENTS[i % ACCENTS.length];
              return (
                <li key={m.when} className="relative flex gap-4 lg:flex-col lg:gap-4">
                  <span
                    className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md"
                    style={{ background: accentGradient(a), color: a.ink }}
                  >
                    <Icon name={m.icon} className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-subheading text-[16px] leading-[22px] font-semibold text-tan">{m.when}</h3>
                    <p className="text-[14px] leading-[22px] text-white/85">
                      {m.text}
                      {m.confirm ? (
                        <>
                          {" "}
                          <Confirm note={`Sofia: ${m.confirm}`} />
                        </>
                      ) : null}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Prices */}
      <section id="prices" className="relative w-full overflow-hidden bg-[linear-gradient(135deg,#f1e2c8_0%,#e3cba2_100%)] px-5">
        <div className="pointer-events-none absolute -right-[8%] -top-[20%] h-[460px] w-[460px] rounded-full bg-white/40 blur-[110px]" />
        <div className="pointer-events-none absolute -left-[8%] bottom-[-25%] h-[420px] w-[420px] rounded-full bg-tan/25 blur-[110px]" />
        <div className="relative mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionBars>
              {title} — {t("priceListTitle")} in London
            </SectionBars>
            <p className="inline-flex w-fit items-center gap-3 rounded-full border border-tan/50 bg-white/70 px-5 py-3 text-[14px] leading-[20px] text-body-text">
              <Icon name="chat" className="h-4 w-4 shrink-0 text-tan" />
              <span>
                Consultation <strong className="font-semibold text-forest">{consultationPrice}</strong>
                {consultationNote ? `. ${consultationNote}.` : "."}
              </span>
            </p>
          </div>
          <p className="mt-5 max-w-[680px] text-[15px] leading-[24px] text-body-text">
            The standard Profhilo protocol is 2 sessions, spaced 4 weeks apart.
            {Number.isFinite(courseSaving) && courseSaving > 0 ? ` A course of 2 costs £${courseSaving} less than two single treatments.` : ""}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[
              { title: "Profhilo for the face", icon: "face" as IconName, accent: 1, rows: [{ l: "1 treatment", p: facePrice }, { l: "Course of 2", p: faceCourse }] },
              { title: "Profhilo for the neck", icon: "neck" as IconName, accent: 2, rows: [{ l: "1 treatment", p: neckPrice }, { l: "Course of 2", p: neckCourse }] },
            ].map((g) => {
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
                      <li key={r.l} className="flex items-baseline justify-between gap-4 border-b border-black/8 py-2.5 last:border-b-0">
                        <span className="text-[15px] leading-[22px] text-body-text">{r.l}</span>
                        <span className="shrink-0 text-right font-subheading text-[16px] font-semibold text-forest">{r.p}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto flex items-center gap-2 border-t border-black/8 pt-4 text-[14px] leading-[20px] text-body-text">
                    <Icon name="calendar" className="h-4 w-4 shrink-0 text-tan" />
                    A course is 2 sessions, spaced 4 weeks apart.
                  </p>
                </div>
              );
            })}
            <div className="flex flex-col justify-between gap-5 rounded-[18px] bg-[linear-gradient(135deg,#7a6248_0%,#b49b7d_50%,#7a6248_100%)] p-6 shadow-md">
              <div className="flex flex-col gap-2">
                <h3 className="font-subheading text-[14px] font-bold tracking-[1.2px] text-cream uppercase">Start with a consultation</h3>
                <p className="font-subheading text-[28px] font-semibold text-white">{consultationPrice}</p>
                <p className="text-[14px] leading-[22px] text-white/80">
                  At YourHealthFirst we take your medical history, look at your skin and agree with you whether Profhilo is right for you and which areas to treat.
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
            Hands, décolleté, upper arms and knees: the price is confirmed at your consultation.
            {SHOW_DRAFT_MARKERS ? (
              <>
                {" "}
                <Confirm note="Sofia: please give us the price of each of these areas" />
              </>
            ) : null}{" "}
            See our full{" "}
            <Link href="/price-list" className="font-medium text-forest underline underline-offset-4 hover:text-tan">
              price list
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Compare with other skin treatments (new) */}
      <section className="w-full px-5">
        <div className="mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
          <div className="max-w-[760px]">
            <SectionBars>Profhilo, dermal fillers or Sunekos?</SectionBars>
            <p className="mt-4 text-[16px] leading-[26px] text-body-text">
              People often ask how Profhilo differs from other injectable treatments. In short, Profhilo improves skin quality, fillers add volume or shape, and Sunekos stimulates the skin&apos;s own collagen and elastin. At your consultation we explain which is suitable for you.
              {SHOW_DRAFT_MARKERS ? (
                <>
                  {" "}
                  <Confirm note="Sofia to check this comparison" />
                </>
              ) : null}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {[
              {
                name: "Profhilo",
                lead: true,
                href: "",
                does: "A high concentration of hyaluronic acid that spreads through the tissue to improve skin hydration, firmness and quality, without adding volume.",
                good: "Dull, dehydrated skin, fine lines and early loss of firmness, in the face and neck.",
                course: "2 sessions, 4 weeks apart. A course lasts 6 to 9 months.",
              },
              {
                name: "Dermal fillers",
                lead: false,
                href: "/treatments/dermal-fillers",
                does: "Hyaluronic acid filler placed in a specific area to add volume or shape, for example the lips, cheeks, chin or under the eyes.",
                good: "Lost volume, definition and contour in one area.",
                course: "Results typically last 9 to 18 months, lips 6 to 12.",
              },
              {
                name: "Sunekos",
                lead: false,
                href: "/treatments/sunekos",
                does: "Amino acids with hyaluronic acid, to stimulate the skin's own collagen and elastin.",
                good: "Fine lines, loss of elasticity and dullness in the face, neck, eye area and hands.",
                course: "A standard course is 4 sessions, 7 to 10 days apart.",
              },
            ].map((c, i) => {
              const a = ACCENTS[(i + 1) % ACCENTS.length];
              return (
                <div
                  key={c.name}
                  className={`flex flex-col gap-4 rounded-[18px] border p-6 shadow-sm ${c.lead ? "bg-forest text-white" : "bg-white"}`}
                  style={c.lead ? { borderColor: "rgba(255,190,2,0.4)" } : { borderColor: a.line, borderTop: `4px solid ${a.grad[0]}` }}
                >
                  <h3 className={`font-subheading text-[18px] font-semibold ${c.lead ? "text-tan" : "text-forest"}`}>{c.name}</h3>
                  <dl className="flex flex-col gap-3">
                    {[
                      { k: "What it does", v: c.does },
                      { k: "Good for", v: c.good },
                      { k: "Course", v: c.course },
                    ].map((r) => (
                      <div key={r.k} className={`border-t pt-3 ${c.lead ? "border-white/15" : "border-black/10"}`}>
                        <dt className={`text-[12px] font-semibold tracking-[1.5px] uppercase ${c.lead ? "text-tan" : "text-body-text/60"}`}>{r.k}</dt>
                        <dd className={`mt-1 text-[15px] leading-[23px] ${c.lead ? "text-white/85" : "text-body-text"}`}>{r.v}</dd>
                      </div>
                    ))}
                  </dl>
                  {c.href ? (
                    <Link href={c.href} className="mt-auto text-[14px] font-medium text-forest underline underline-offset-4 hover:text-tan">
                      Read about {c.name.toLowerCase()}
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How treatment works (new) */}
      <TreatmentSteps
        title="How Profhilo treatment works in London"
        steps={steps}
        note={<>A course is 2 sessions, spaced 4 weeks apart</>}
        bookHref={EMAIL_HREF}
        bookLabel="Email to book"
      />

      {/* Our approach and your practitioner (new) */}
      <section className="relative w-full overflow-hidden bg-[linear-gradient(120deg,#3a2c1a_0%,#241a0f_100%)] px-5">
        <Image src="/images/treatments/anti-wrinkles/linen-texture.jpg" alt="" fill sizes="100vw" className="object-cover opacity-[0.16]" />
        <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 py-[56px] lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:py-[72px]">
          <div className="flex flex-col gap-5">
            <span className="font-nav text-[12px] font-semibold tracking-[3px] text-tan uppercase">Our approach</span>
            <blockquote className="font-serif text-[26px] leading-[36px] text-cream italic lg:text-[32px] lg:leading-[44px]">
              Healthier, more radiant skin that still looks like yours. Profhilo improves skin quality without changing your features.
            </blockquote>
            <p className="text-[14px] text-white/60">YourHealthFirst Clinic, Harley Street</p>
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
                At YourHealthFirst we carry out your consultation and treatment personally.
                {SHOW_DRAFT_MARKERS ? (
                  <>
                    {" "}
                    <Confirm note="Sofia to confirm" />
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs: the existing questions first, then new ones */}
      <section id="faqs" className="w-full bg-cream px-5">
        <div className="mx-auto max-w-[900px] py-[80px] lg:py-[100px]">
          <h2 className="text-center font-subheading text-[26px] leading-[32px] font-medium tracking-[-1px] text-forest uppercase lg:text-[32px] lg:leading-[38px]">
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
            <h2 className="font-subheading text-[28px] leading-[34px] font-medium tracking-[-1.2px] text-forest uppercase">
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
              <h2 className="mt-2 font-display text-[26px] leading-[32px] font-bold tracking-[-0.5px] text-forest">
                Why this page should work better in Google
              </h2>
              <p className="mt-4 text-[15px] leading-[24px] text-body-text">
                In Google Search Console the current page was shown 9,364 times in the last 3 months, clicked once, and averaged position 59, which is about page six. About 18,000 people a month search for Profhilo in the UK, and about 8,000 search for Profhilo before and after photos. Almost nobody reaches the page. The new page keeps every word of the current page and adds what people look for before they book.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-subheading text-[13px] font-semibold tracking-[2px] text-[#8a6200] uppercase">What it is written to be found for</h3>
                  <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-[22px] text-body-text">
                    <li>Profhilo London, Profhilo Marylebone, Harley Street, Wimpole Street, near Oxford Circus and Bond Street</li>
                    <li>Profhilo cost and price, and the price of a course</li>
                    <li>Profhilo before and after, and what it looks like after 1 week</li>
                    <li>Profhilo for the neck, hands, décolleté, arms and knees</li>
                    <li>Profhilo injection points, side effects and aftercare</li>
                    <li>Profhilo compared with dermal fillers and with Sunekos</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-subheading text-[13px] font-semibold tracking-[2px] text-[#8a6200] uppercase">What is better than the current page</h3>
                  <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-[22px] text-body-text">
                    <li>The heading says &ldquo;in London&rdquo;, which is how people search</li>
                    <li>A price table for the face and neck, and the saving on a course (the current page shows only one &ldquo;starting from&rdquo; price)</li>
                    <li>A card for each area you treat</li>
                    <li>Before and after photos higher up, and a timeline of what to expect</li>
                    <li>A comparison with dermal fillers and Sunekos</li>
                    <li>{allFaqs.length} questions answered and set up so Google can show them directly</li>
                    <li>All of your own words are still there</li>
                  </ul>
                </div>
              </div>
              <p className="mt-6 text-[14px] leading-[22px] text-body-text">
                <strong className="font-semibold text-forest">What we cannot promise:</strong> a ranking. Google decides that, and London is a competitive market for Profhilo. We are not changing the page title or description yet. After the page is live we will check Google Search Console after 4 to 6 weeks and show you what changed. Please read the page again and tell us anything that is wrong, especially the wording in yellow.
              </p>
            </div>

            <div className="rounded-[20px] border-2 border-dashed border-[#d9a400] bg-[#fff8dc] p-8">
              <p className="font-nav text-[12px] font-semibold tracking-[3px] text-[#8a6200] uppercase">
                For Sofia only. Removed before this page goes live
              </p>
              <h2 className="mt-2 font-display text-[26px] leading-[32px] font-bold tracking-[-0.5px] text-forest">
                Please confirm these before we publish
              </h2>
              <ol className="mt-6 flex flex-col gap-3">
                {[
                  "Which other areas do you treat with Profhilo: the décolleté, hands, upper arms and knees? Your current page mentions all of them, but your price list only has the face and the neck. What is the price of each area, and is a course of 2 sessions right for each?",
                  "The page now shows the price list prices: face £400 for one treatment and £700 for a course of 2, and the same for the neck. The current page shows only \"£700 course of 2 (face)\" as the starting price. Which do you want people to see first?",
                  "People search for Profhilo under the eyes (about 170 a month) and Profhilo before and after for the eyes (about 260 a month). Your current page says Profhilo is not designed for under-eye hollows. Do you treat this area, and how would you describe it?",
                  "What aftercare do you advise after Profhilo (for example exercise, heat, alcohol, make-up, touching the skin)? We have not written any, because it is not on your current page.",
                  "In the timeline, the \"After 1 week\" point says the bumps have settled and the skin often looks and feels more hydrated. Is this what patients usually see?",
                  "Please check the comparison of Profhilo, dermal fillers and Sunekos, and the question \"What is the difference between Profhilo and Sunekos?\". We wrote it from the text on your own pages.",
                  "Please read the card for each area and the steps under \"How Profhilo treatment works\". They are written from the text already on your page. Please correct anything that is not how you work.",
                  "Some people search for Profhilo Structura. Do you offer it, or only the standard Profhilo?",
                  "How long does a Profhilo appointment take? We have not put a time on the page.",
                  "The consultation is shown as £50, free of charge if you go ahead with treatment, as on your price list. Is this right for Profhilo?",
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
