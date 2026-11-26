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
import ZoomImage from "./ZoomImage";

/**
 * English dermal fillers page.
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
const EMAIL_HREF = "mailto:info@yourhealthfirst.uk?subject=Dermal%20filler%20consultation";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=YourHealthFirst+Clinic+2+Wimpole+Street+London+W1G+0EB";

type PriceItem = { area: string; price: string };

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
  bodyImages: { src: string; alt: string; position?: string }[];
  sidebarImage?: { src: string; alt: string };
  diagramImage?: { src: string; alt: string };
  advantages?: { title: string; intro?: string; items: { title: string; description: string }[] };
  priceList: PriceItem[];
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
const consultation = (priceListRaw as unknown as PriceSection[]).find((s) => s.id === "general-fees")?.items[0];
const consultationPrice = consultation?.price ?? "";
const consultationNote = consultation?.note ?? "";

const priceGroupDefs: { title: string; icon: IconName; accent: number; test: RegExp }[] = [
  { title: "Lips", icon: "lips", accent: 3, test: /^Lip/ },
  { title: "Cheeks and chin", icon: "cheek", accent: 4, test: /^(Cheeks|Chin)/ },
  { title: "Lines and folds", icon: "target", accent: 2, test: /^(Nasolabial|Glabellar)/ },
  { title: "Eyes, nose, jaw and hands", icon: "eye", accent: 5, test: /^(Tear|Non-Surgical|Jaw|Hands)/ },
  { title: "Dissolving filler", icon: "undo", accent: 1, test: /^Dissolving/ },
];

/* ---------------------------------------------------------------- content */

const whoForExtra: { icon: IconName; text: string }[] = [
  { icon: "lips", text: "You would like fuller, better defined lips that still look like yours." },
  { icon: "cheek", text: "Your cheeks or mid face have lost volume and you look more tired than you feel." },
  { icon: "eye", text: "You have under-eye hollows or dark circles that make you look tired." },
  { icon: "shield", text: "You are new to dermal fillers and want to talk it through before you decide." },
];

type AreaCard = { icon: IconName; title: string; text: string; priceKey: RegExp; note?: string };
const areaCards: AreaCard[] = [
  {
    icon: "lips",
    title: "Lip fillers in London (Russian lips)",
    text: "Natural-looking lip fillers, also called lip injections, lip augmentation or lip enhancement, using the Russian lips technique, with symmetry and proportion in mind. Lips can look noticeably swollen for the first 24 to 48 hours, and lip filler tends to last 6 to 12 months.",
    priceKey: /^Lip Enhancement \(Russian Lips\) — 1ml/,
  },
  {
    icon: "cheek",
    title: "Cheek fillers and mid face",
    text: "Cheek filler (cheek augmentation) replaces volume lost with age and supports the mid face. Structural areas like the cheeks can last longer than the lips.",
    priceKey: /^Cheeks/,
  },
  {
    icon: "jaw",
    title: "Chin filler in London",
    text: "Chin enhancement to balance the profile and add definition, built up gradually to keep the result natural.",
    priceKey: /^Chin Enhancement — 1ml/,
  },
  {
    icon: "jaw",
    title: "Jaw filler (jawline fillers)",
    text: "Jawline contouring to define and contour the lower face. Like the cheeks, the jawline can hold the result for longer than the lips.",
    priceKey: /^Jaw-Line/,
  },
  {
    icon: "eye",
    title: "Tear trough filler (under eyes)",
    text: "Treatment for dark circles and hollow eyes, to soften under-eye hollowing and a tired look.",
    priceKey: /^Tear Trough/,
  },
  {
    icon: "target",
    title: "Nasolabial folds and marionette lines",
    text: "Correction of the folds that run from the nose to the mouth and down from the corners of the mouth, softening them while keeping your expression.",
    priceKey: /^Nasolabial Folds \/ Marionette Lines — 1ml/,
  },
  {
    icon: "nose",
    title: "Non-surgical nose job",
    text: "Non-surgical rhinoplasty with hyaluronic acid filler, for those who would like to reshape the nose without surgery.",
    priceKey: /^Non-Surgical Nose/,
  },
  {
    icon: "hand",
    title: "Hand fillers",
    text: "Hand rejuvenation, to restore volume to hands that have thinned with age.",
    priceKey: /^Hands/,
  },
  {
    icon: "undo",
    title: "Dissolving filler",
    text: "Dissolving (hyaluronidase) is available if a correction is needed, including filler placed by another consultant.",
    priceKey: /^Dissolving Filler — from another/,
    note: "from another consultant",
  },
];

const steps: TreatmentStep[] = [
  { icon: "consult", title: "Book", text: "Email us (preferred), or call or WhatsApp. Tell us which areas you would like to look at." },
  { icon: "assess", title: "Consultation", text: "Sofia takes your medical history, looks at your face and agrees with you which areas and how much product are right for you." },
  { icon: "inject", title: "Treatment", text: "A numbing cream is applied in sensitive areas such as the lips. Most appointments take around 25 to 50 minutes." },
  { icon: "aftercare", title: "Aftercare", text: "No strenuous exercise, alcohol or heat (saunas, sunbeds) for 24 to 48 hours. Do not press or massage the area unless told to." },
  { icon: "results", title: "Results", text: "You see the result straight away. It settles and looks more natural over the next 1 to 2 weeks. A follow-up at 2 to 4 weeks is available." },
  { icon: "repeat", title: "Maintenance", text: "Results typically last 9 to 18 months, lips 6 to 12. Many patients repeat after 4 to 6 months to maintain the result." },
];

const benefitIcons: IconName[] = ["check", "shield", "lips", "eye", "nose", "jaw", "undo"];

/* ------------------------------------------------------------------- page */

export default async function DermalFillersEnglish(props: Props) {
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
    bodyImages,
    sidebarImage,
    diagramImage,
    advantages,
    priceList,
    gallery,
    related,
    sanitySettings,
  } = props;

  const t = await getTranslations({ locale, namespace: "TreatmentDetail" });
  const tHeader = await getTranslations({ locale, namespace: "Header" });

  const priceOf = (re: RegExp) => priceList.find((p) => re.test(p.area))?.price ?? "";

  const extraFaqs: TreatmentFaq[] = [
    {
      question: "How much do dermal fillers cost in London?",
      answer: `Prices depend on the area and the amount of product. Lip enhancement (Russian lips) is from ${priceOf(/^Lip Enhancement \(Russian Lips\) — 1ml/)} for 1ml. Cheeks or mid face are from ${priceOf(/^Cheeks.*1ml/)} for 1ml and ${priceOf(/^Cheeks.*2ml/)} for 2ml, and chin enhancement is from ${priceOf(/^Chin Enhancement — 1ml/)} for 1ml and ${priceOf(/^Chin Enhancement — 2ml/)} for 2ml. Nasolabial folds and marionette lines are ${priceOf(/^Nasolabial.*1ml/)} for 1ml and ${priceOf(/^Nasolabial.*2ml/)} for 2ml. A non-surgical nose job is from ${priceOf(/^Non-Surgical/)}, tear trough is from ${priceOf(/^Tear/)}, the jawline is from ${priceOf(/^Jaw/)} and hand fillers are ${priceOf(/^Hands/)}. The exact price is confirmed at your consultation. See the price table on this page or our full price list.`,
    },
    {
      question: "How much do lip fillers cost in London?",
      answer: `Lip fillers (also called lip injections, lip augmentation or lip enhancement) using the Russian lips technique are from ${priceOf(/^Lip Enhancement \(Russian Lips\) — 1ml/)} for 1ml. How much product is right for you is agreed at your consultation.`,
    },
    {
      question: "What is the difference between lip fillers, lip injections and lip augmentation?",
      answer: `They are different names for the same treatment. Lip filler, lip injections, lip augmentation and lip enhancement all describe having hyaluronic acid filler placed in the lips to add definition, shape or volume. It is a non-surgical treatment, not lip surgery. Sofia explains the options and agrees the amount with you at your consultation.${draftNote("please check this explanation of lip filler, lip injections and lip augmentation")}`,
    },
    {
      question: "Can lip filler look natural?",
      answer: `That is the aim. Sofia looks at symmetry and proportion first and builds the filler up gradually, so your lips look like yours rather than overdone. The result is visible straight away and settles over the next 1 to 2 weeks.${draftNote("please confirm this is how you describe a natural lip result")}`,
    },
    {
      question: "Can lip filler be dissolved or corrected?",
      answer: `Yes. Hyaluronic acid lip filler can be dissolved with hyaluronidase if you would like a correction, including lip filler placed by another consultant. Dissolving filler from another consultant is ${priceOf(/^Dissolving Filler — from another/)}, and dissolving filler administered at YHF is ${priceOf(/^Dissolving Filler — administered/)}.`,
    },
    {
      question: "How much does chin filler cost in London?",
      answer: `Chin enhancement is from ${priceOf(/^Chin Enhancement — 1ml/)} for 1ml and ${priceOf(/^Chin Enhancement — 2ml/)} for 2ml. How much product is right for you is agreed at your consultation.`,
    },
    {
      question: "What does jaw filler do?",
      answer: `Jaw filler (also called jawline fillers) is used to define and contour the lower face. It is from ${priceOf(/^Jaw/)} and, like the cheeks, the jawline can hold the result for longer than the lips. Sofia agrees the plan with you at your consultation.`,
    },
    {
      question: "How long does the appointment take?",
      answer:
        "Following a consultation, most dermal filler appointments take around 25 to 50 minutes from start to finish, depending on how many areas are being treated.",
    },
    {
      question: "Do I need a consultation first?",
      answer: `Yes. Sofia takes a full medical history and looks at your face before any treatment, so that the right areas and the right amount of product are agreed with you. The consultation is ${consultationPrice}${consultationNote ? `, and ${consultationNote.charAt(0).toLowerCase()}${consultationNote.slice(1)}` : ""}.`,
    },
    {
      question: "What is the Russian lips technique?",
      answer: `It is a way of placing filler in the lips to give them more definition and lift, with attention to symmetry and proportion, rather than only adding volume.${draftNote("please check this description of your Russian lips technique")}`,
    },
    {
      question: "Can dermal fillers be dissolved?",
      answer: `Yes. Most fillers used at YourHealthFirst are hyaluronic acid-based, which can be dissolved with hyaluronidase if you ever want a correction. Dissolving filler from another consultant is ${priceOf(/^Dissolving Filler — from another/)}, and dissolving filler administered at YHF is ${priceOf(/^Dissolving Filler — administered/)}.`,
    },
    {
      question: "What is the difference between dermal fillers and anti-wrinkle injections?",
      answer:
        "Dermal fillers add volume or shape to an area, for example the lips, cheeks, chin or under the eyes. Anti-wrinkle injections work differently: they relax the muscles that cause expression lines such as frown lines and crow's feet. Some people have both. At your consultation Sofia explains which is suitable for you.",
    },
    {
      question: "Where can I have dermal fillers in London?",
      answer:
        "At YourHealthFirst Clinic, 2 Wimpole Street, Marylebone, London W1G 0EB, in the Harley Street medical district of central London. We are a few minutes' walk from Oxford Circus and Bond Street stations, and you can book by email, phone or WhatsApp.",
    },
    {
      question: "Can I see before and after photos of dermal fillers?",
      answer:
        "Yes. Our gallery shows real before and after results from patients treated at YourHealthFirst Clinic in London. Every face is different, so your own results will vary, and Sofia will explain what is realistic for you at your consultation.",
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
    { label: t("startingFrom"), value: priceFrom ?? "", icon: "target" },
    { label: t("location"), value: "2 Wimpole Street, London W1G 0EB", icon: "pin" },
    { label: "Appointment", value: "Around 25 to 50 minutes", sub: "Depending on how many areas are treated", icon: "check" },
  ];

  const popular = [
    { label: "Lips, 1ml (Russian lips)", re: /^Lip Enhancement \(Russian Lips\) — 1ml/ },
    { label: "Cheeks / mid face, 1ml", re: /^Cheeks.*1ml/ },
    { label: "Chin, 1ml", re: /^Chin.*1ml/ },
    { label: "Tear trough", re: /^Tear/ },
  ];

  const galleryImages = gallery
    ? Array.from({ length: Math.min(6, gallery.count) }, (_, i) => ({
        src: `${gallery.folder}/${gallery.prefix}-${i + 1}.${gallery.ext}`,
        alt: `${title} before and after in London — result ${i + 1}`,
      }))
    : [];

  const cheekImg = bodyImages[0];
  const lipImg = bodyImages[1];
  const priceGroups = priceGroupDefs
    .map((g) => ({ ...g, rows: priceList.filter((p) => g.test.test(p.area)) }))
    .filter((g) => g.rows.length > 0);

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

      {/* Main content: the layout of the current page (text beside the cheek photo, lip photo beside Suitable For, cards on the right) */}
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

              <div className="flex flex-col items-start gap-6 sm:flex-row sm:gap-8">
                <div className="flex flex-1 flex-col gap-5">
                  {body.map((para, j) => (
                    <p key={j} className="text-[16px] leading-[27px] tracking-[-0.2px] text-body-text">
                      {para}
                    </p>
                  ))}
                </div>
                {cheekImg ? (
                  <div className="relative aspect-[4/5] w-full max-w-[280px] shrink-0 overflow-hidden rounded-[14px] border border-black/8 shadow-md sm:w-[260px]">
                    <Image
                      src={cheekImg.src}
                      alt={cheekImg.alt}
                      fill
                      sizes="(min-width: 640px) 260px, 280px"
                      className="object-cover"
                      style={cheekImg.position ? { objectPosition: cheekImg.position } : undefined}
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-stretch sm:gap-8">
                {lipImg ? (
                  <div className="relative aspect-[4/5] w-full max-w-[280px] shrink-0 overflow-hidden rounded-[14px] border border-black/8 shadow-md sm:aspect-auto sm:min-h-[260px] sm:w-[220px]">
                    <Image
                      src={lipImg.src}
                      alt={lipImg.alt}
                      fill
                      sizes="(min-width: 640px) 220px, 280px"
                      className="object-cover"
                      style={lipImg.position ? { objectPosition: lipImg.position } : undefined}
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col gap-4">
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
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6 lg:w-[340px] lg:shrink-0">
              <div className="rounded-[12px] bg-cream p-6">
                <h3 className="font-subheading text-[14px] font-semibold tracking-[2px] text-forest uppercase">Popular treatments</h3>
                <ul className="mt-3 flex flex-col">
                  {popular.map((r) => (
                    <li key={r.label} className="flex items-baseline justify-between gap-3 border-b border-black/10 py-2.5 last:border-b-0">
                      <span className="text-[14px] leading-[20px] text-body-text">{r.label}</span>
                      <span className="shrink-0 font-subheading text-[16px] font-semibold text-forest">{priceOf(r.re)}</span>
                    </li>
                  ))}
                </ul>
                <a href="#prices" className="mt-3 inline-block text-[14px] font-medium text-forest underline underline-offset-4 hover:text-tan">
                  See all areas and prices
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

              {sidebarImage ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] border border-black/8 shadow-md">
                  <Image
                    src={sidebarImage.src}
                    alt={sidebarImage.alt}
                    fill
                    sizes="340px"
                    className="object-cover object-[50%_35%]"
                  />
                </div>
              ) : null}
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

      {/* Treatment areas (new) */}
      <section className="w-full px-5">
        <div className="mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-12">
            <div className="flex max-w-[720px] flex-col">
              <SectionBars>Dermal filler treatments in London</SectionBars>
              <p className="mt-4 text-[16px] leading-[26px] text-body-text">
                Sofia treats the lips, cheeks, chin, jawline, under eyes, nose, nasolabial folds and hands. Choose the area you would like to look at, and book a consultation to talk it through. We are at 2 Wimpole Street in Marylebone, in the Harley Street medical district of central London.
                {SHOW_DRAFT_MARKERS ? (
                  <>
                    {" "}
                    <Confirm note="Sofia to check the wording in these cards" />
                  </>
                ) : null}
              </p>
              <div className="mt-8 flex flex-col gap-4 rounded-[18px] border border-tan/40 bg-cream p-6">
                <h3 className="font-subheading text-[16px] font-semibold text-forest">Not sure which area is right for you?</h3>
                <p className="text-[15px] leading-[24px] text-body-text">
                  Sofia looks at your face and agrees the areas and the amount of product with you at a consultation. The consultation is{" "}
                  <strong className="font-semibold text-forest">{consultationPrice}</strong>
                  {consultationNote ? `, and ${consultationNote.charAt(0).toLowerCase()}${consultationNote.slice(1)}` : ""}.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href={EMAIL_HREF}
                    className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-tan px-6 font-nav text-[14px] font-semibold tracking-[-0.3px] text-forest transition-opacity hover:opacity-90"
                  >
                    <Icon name="mail" className="h-4 w-4" />
                    Email to book
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-forest/30 px-6 font-nav text-[14px] font-semibold tracking-[-0.3px] text-forest transition-colors hover:border-tan hover:text-tan"
                  >
                    <Icon name="chat" className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
            {diagramImage ? (
              <div className="w-full max-w-[560px] shrink-0 lg:w-[540px]">
                <ZoomImage src={diagramImage.src} alt={diagramImage.alt} />
                {SHOW_DRAFT_MARKERS ? (
                  <p className="mt-2 text-[13px] leading-[19px]">
                    <Confirm note="Sofia: this picture names forehead lines, glabellar lines, bunny lines, crow's feet and eyebrow lift, which sound like anti-wrinkle areas. Is it right for dermal fillers?" />
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {areaCards.map((c, i) => {
              const a = ACCENTS[i % ACCENTS.length];
              const price = priceOf(c.priceKey);
              return (
                <div
                  key={c.title}
                  className="flex flex-col gap-4 rounded-[18px] border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: a.tint, borderColor: a.line, borderTop: `4px solid ${a.grad[0]}` }}
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
                  <p className="text-[15px] leading-[24px] text-body-text">{c.text}</p>
                  {price ? (
                    <p className="mt-auto text-[14px] text-body-text">
                      {c.note ? `Price ${c.note}: ` : "From "}
                      <strong className="font-subheading text-[16px] font-semibold text-forest">{price}</strong>
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prices: all the existing rows, grouped */}
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
          <p className="mt-5 max-w-[640px] text-[15px] leading-[24px] text-body-text">
            Prices vary by treatment area and the amount of product used — confirmed exactly at your consultation.
          </p>
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
                      <li key={r.area} className="flex items-baseline justify-between gap-4 border-b border-black/8 py-2.5 last:border-b-0">
                        <span className="text-[15px] leading-[22px] text-body-text">{r.area}</span>
                        <span className="shrink-0 text-right font-subheading text-[16px] font-semibold text-forest">{r.price}</span>
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
                  Sofia takes your medical history, looks at your face and agrees with you which areas and how much product are right for you.
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
            <Link href="/price-list" className="font-medium text-forest underline underline-offset-4 hover:text-tan">
              price list
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Advantages: the existing six, kept word for word, in a calmer editorial layout */}
      {advantages ? (
        <section className="relative w-full overflow-hidden bg-[linear-gradient(120deg,#3a2c1a_0%,#241a0f_100%)] px-5">
          <Image src="/images/treatments/anti-wrinkles/linen-texture.jpg" alt="" fill sizes="100vw" className="object-cover opacity-[0.14]" />
          <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 py-[56px] lg:grid-cols-[340px_1fr] lg:gap-16 lg:py-[72px]">
            <div className="relative mx-auto w-full max-w-[300px] lg:max-w-none">
              <div className="nef-glow pointer-events-none absolute -inset-6 rounded-full bg-tan/25 blur-[60px]" />
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[170px] rounded-b-[16px] border border-tan/50 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                <Image
                  src="/images/treatments/dermal-fillers/hyaluronic-gel.jpg"
                  alt="A droplet of clear hyaluronic acid gel on ivory silk"
                  fill
                  sizes="340px"
                  className="object-cover"
                />
                <video
                  className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
                  src="/images/treatments/dermal-fillers/hyaluronic-gel-loop.mp4"
                  poster="/images/treatments/dermal-fillers/hyaluronic-gel.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="font-subheading text-[28px] font-semibold leading-[36px] tracking-[-0.5px] text-cream lg:text-[36px] lg:leading-[44px]">
                {advantages.title}
              </h2>
              {advantages.intro ? (
                <p className="mt-4 max-w-[620px] text-[16px] leading-[26px] text-white/85">{advantages.intro}</p>
              ) : null}
              <div className="mt-8 grid grid-cols-1 gap-x-12 sm:grid-cols-2">
                {advantages.items.map((item) => (
                  <div key={item.title} className="relative border-t border-white/15 pb-7 pt-5">
                    <span className="absolute -top-px left-0 h-px w-10 bg-tan" />
                    <h3 className="font-subheading text-[18px] font-semibold leading-[26px] text-tan">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-[24px] text-white/85">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* How treatment works (new) */}
      <TreatmentSteps
        title="How dermal filler treatment works in London"
        steps={steps}
        note={<>Most appointments take around 25 to 50 minutes</>}
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
              A result that looks refreshed, not overdone. Symmetry and proportion come first, and filler is built up gradually.
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
                Sofia carries out your consultation and treatment.
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
              Dermal fillers before and after: results from our clinic at 2 Wimpole Street, London.
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
                In Google Search Console the current page was shown 4,382 times, clicked 0 times, and averaged position 58, which is about page six. Many people search for dermal fillers, but almost nobody reaches the page. The new page keeps every word of the current page and adds what people look for before they book.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-subheading text-[13px] font-semibold tracking-[2px] text-[#8a6200] uppercase">What it is written to be found for</h3>
                  <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-[22px] text-body-text">
                    <li>Dermal fillers London, and Harley Street, Wimpole Street, near Oxford Circus and Bond Street</li>
                    <li>Lip fillers London, lip injections, lip augmentation and lip enhancement, and the Russian lips technique</li>
                    <li>Marylebone and central London</li>
                    <li>Cheek, chin, jaw and tear trough fillers, including chin filler cost</li>
                    <li>Non-surgical nose job and hand fillers</li>
                    <li>Dermal filler cost and price, lip filler cost</li>
                    <li>Dissolving filler, side effects, aftercare, how long fillers last</li>
                    <li>Before and after photos, and fillers compared with anti-wrinkle injections</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-subheading text-[13px] font-semibold tracking-[2px] text-[#8a6200] uppercase">What is better than the current page</h3>
                  <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-[22px] text-body-text">
                    <li>The heading says &ldquo;in London&rdquo;, which is how people search</li>
                    <li>A card for each area you treat (lips, cheeks, chin, jawline, under eyes, nose, hands), each with its own price</li>
                    <li>The whole price list grouped by area, with the consultation fee</li>
                    <li>Twenty-five questions answered and set up so Google can show them directly (the current page has none set up)</li>
                    <li>How treatment works, so people know what to expect</li>
                    <li>Six before and after photos, and easy ways to book by email, phone or WhatsApp</li>
                    <li>All of your own words are still there</li>
                  </ul>
                </div>
              </div>
              <p className="mt-6 text-[14px] leading-[22px] text-body-text">
                <strong className="font-semibold text-forest">What we cannot promise:</strong> a ranking. Google decides that, and London is a competitive market for dermal fillers. We are not changing the page title or description yet, only reviewing them with you on 27 November. After the page is live we will check Google Search Console after 4 to 6 weeks and show you what changed. Please read the page again and tell us anything that is wrong, especially the wording in yellow.
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
                  "Which filler brands do you use (for example the names of the hyaluronic acid products)? People search for brand names, and the page only says \"CE/FDA-approved premium hyaluronic acid products\" at the moment.",
                  "The picture of treatment areas on the page names forehead lines, glabellar lines, bunny lines, crow's feet and eyebrow lift. These sound like anti-wrinkle areas. Is this the right picture for dermal fillers, or should we replace it?",
                  "The consultation is shown as £50, free of charge if you go ahead with treatment, as on your price list. Is this right for dermal fillers?",
                  "Please read the card for each area, the question \"What is the Russian lips technique?\" and the steps under \"How dermal filler treatment works\". They are written from the text already on your page. Please correct anything that is not how you work.",
                  "Do you treat any other areas with filler (for example the temples) that we should add?",
                  "People search for 0.5ml lip filler and for Juvederm lip filler. Do you offer 0.5ml, and at what price? Which brand do you use, and do you place lip filler with a cannula or a needle? We have not written any of this on the page yet.",
                  "Please read the new questions about lip filler (names, natural look, dissolving), chin filler cost and jaw filler. They are written from the text and prices already on your page.",
                  "Prices: the page and the full price list now show these \"from\" prices: Russian lips from £250 for 1ml (the 2ml lip price of £550 is removed), nasolabial folds from £375, chin from £250 (was £500), cheeks and mid face from £350 (was £500), non-surgical nose job from £400 (was £500), tear trough from £500 (was £550), jawline from £350 (was £450). The 2ml prices for nasolabial folds, chin and cheeks are unchanged at £700. Are all of these right?",
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
