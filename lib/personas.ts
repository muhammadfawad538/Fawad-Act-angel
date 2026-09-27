// Single source of truth for Act Angel's 4 personas — used by the nav "Hire an Angel"
// dropdown (components/mobile-nav.tsx) and the persona demo modal
// (components/hire-an-angel-modal.tsx), so labels/scripts can't drift between the two.
//
// Contacts, avatars and every message below are captured verbatim from the reference theme
// (https://aiactangel.netlify.app/) — its nav dropdown personas, their chat threads, and the
// separate script its *hero* phone plays. Each persona has its own contact and photo there,
// rather than the single shared stock avatar this used to carry.

export type PersonaId = "sales" | "service" | "hr" | "assistance" | "hope"

export type ScriptLine = ["in" | "out", string]

export interface Capability {
  title: string
  description: string
}

export interface Faq {
  question: string
  answer: string
}

// Hope Angel's phone-demo "messages" stage shows fundraising progress instead of a chat thread
// (see components/persona-phone-demo.tsx's CampaignDemoScreen) — raised/goal are the display
// strings, raisedValue/goalValue the numbers the progress bar's fill % is computed from.
export interface CampaignDemo {
  tagline: string
  raised: string
  goal: string
  raisedValue: number
  goalValue: number
  ctaLabel: string
}

// One entry per Live Preview "Scenario" pill (components/hire-an-angel-page-content.tsx's
// LiveDemoSection), aligned by index with Persona.scenarios — the question/answer bubble pair
// and progress card overlaid on the photo change to match whichever scenario is selected.
// progressPct is 0 for the two non-monetary scenarios (Funding Application, Volunteer Sign-Up),
// matching the reference's near-empty bar there.
export interface CampaignScenario {
  question: string
  answer: string
  progressValueText: string
  progressPct: number
}

// One entry per rotation of the HERO phone's "messages" stage (components/persona-phone-demo.tsx) —
// a separate, independently-worded set from CampaignScenario above (the hero autoplays through
// these regardless of the Live Preview's own Scenario picker). PersonaPhoneDemo cycles through
// them one per full call loop, indexed by its existing `cycle` counter.
export interface CampaignSlide {
  scenarioTag: string
  question: string
  answer: string
}

export interface Persona {
  id: PersonaId
  label: string // nav dropdown / picker label
  slug: string // URL segment under /hire-an-angel/, e.g. "sales-angel"
  contact: string // contact name shown on the call screen and chat header
  avatar: string // per-persona photo (public/images)
  role: string
  messages: ScriptLine[]

  // Landing-page copy below — verbatim from the client's content doc
  // (requirements/Act_Angel_AI_Hire_an_Angel_Website_Content.pdf). Optional because it's being
  // rolled out persona-by-persona: HireAnAngelPageContent only renders these sections once a
  // persona actually has this data, so the pages we haven't gotten to yet keep today's
  // minimal layout instead of showing broken/empty sections.
  eyebrow?: string // small badge above the hero headline, e.g. "Virtual AI Sales Employee"
  heroHeadline?: string
  heroSubtext?: string
  heroSubtext2?: string // second hero paragraph — only Hope Angel's copy has one so far
  trustSubtext?: string // overrides the shared "Free from personal worries…" line under the hero
  capabilities?: Capability[]
  capabilitiesNumbered?: boolean // renders "01".."NN" instead of the shared icon swatch
  outcomeLabel?: string // mini-card eyebrow under the hero, default "Business Outcome"
  outcomeCardTitle?: string // mini-card's own headline; falls back to outcomeTitle
  outcomeTitle?: string // full-bleed banner headline (and mini-card fallback)
  outcomeDescription?: string
  whatIsTitle?: string
  whatIsDescription?: string
  faqEyebrow?: string // FAQ section's small badge, default "Structured for Answer Engines…"
  faqs?: Faq[] // when set, renders a Q&A list instead of whatIsTitle/whatIsDescription
  ctaLine?: string
  ctaHireLabel?: string // e.g. "Hire a Sales Angel"
  ctaHref?: string // hero CTA target, default "/get-started"

  // Live Preview section (components/hire-an-angel-page-content.tsx's LiveDemoSection).
  scenarios?: string[] // "Scenario" pills; falls back to useCases
  channels?: string[] // "Channel" pills; falls back to the shared Call/Chat/Email/SMS/Web list
  liveDemoHeadline?: string
  liveDemoSubtext?: string
  liveDemoCtaLabel?: string // falls back to ctaHireLabel
  liveDemoCtaHref?: string // falls back to ctaHref — set separately when ctaHref points offsite
  liveDemoCtaVariant?: "dark" | "purple" // default "dark" (matches the other 4 personas)
  liveDemoCaption?: string // falls back to "Don't Take Our Word for It. Meet Your Angel."
  livePreviewPillLabel?: string // photo's top-left "{contact} · {label}" pill; falls back to label
  liveDemoBadgeLabel?: string // photo's top-right pulsing badge, default "Live"

  // Closing section — set closingHeadline to opt into the richer Hope Angel-style closer
  // (eyebrow + headline + paragraph + single CTA) instead of the shared ctaLine + "Experience
  // an Angel" scroll-link closer.
  closingEyebrow?: string
  closingHeadline?: string
  closingDescription?: string
  closingCtaLabel?: string
  closingCtaHref?: string
  closingQuote?: string // pull-quote banner between the closing CTA and the mission form
  closingQuoteTag?: string // small-caps label on the quote banner's right edge
  showMissionForm?: boolean // embeds the nonprofit application form (Hope Angel) at #share-your-mission

  // Hope Angel's phone-demo override — see CampaignDemo above.
  campaignDemo?: CampaignDemo
  // Live Preview's reactive overlay — see CampaignScenario above. Falls back to campaignDemo's
  // fixed values for every scenario when not set.
  campaignScenarios?: CampaignScenario[]
  // Hero phone's autoplay rotation — see CampaignSlide above.
  campaignSlides?: CampaignSlide[]

  // "Hire an Angel" nav mega-menu card (requirements/Hire_an_angel_dropdown.png) — a short role
  // subtitle under the name, and 4 use-case bullets. Reuses the `avatar` photo above rather than
  // the mockup's separate halo/wings portrait set, which hasn't been provided yet.
  dropdownRole?: string
  useCases?: [string, string, string, string]
}

export const PERSONAS: Persona[] = [
  {
    id: "sales",
    label: "Sales Angel",
    slug: "sales-angel",
    contact: "Alex Morgan",
    avatar: "/images/sales_angel.png",
    role: "Sales",
    messages: [
      ["in", "Is the downtown listing still available?"],
      ["out", "Yes! Want to schedule a viewing this weekend?"],
      ["in", "Saturday works"],
      ["out", "Booked — Sat, 11:00 AM"],
    ],
    eyebrow: "Virtual AI Sales Employee",
    heroHeadline: "Turn Every Deal Into Action.",
    heroSubtext:
      "Your virtual AI sales employee engages deals, qualifies interest, books meetings, and moves opportunities forward across your connected sales systems.",
    capabilities: [
      { title: "Engage new deals.", description: "Respond to inbound enquiries with relevant, timely conversations." },
      { title: "Qualify interest.", description: "Capture needs, timing, and fit against your sales criteria." },
      { title: "Follow up consistently.", description: "Run personalised follow-ups based on responses and sales stage." },
      { title: "Book the next meeting.", description: "Coordinate availability and schedule qualified conversations." },
      { title: "Keep your CRM current.", description: "Log interactions, update records, and create next-step tasks." },
      { title: "Hand over with context.", description: "Route opportunities to the right rep with a clear conversation summary." },
    ],
    outcomeTitle: "More momentum. Less chasing.",
    outcomeDescription:
      "Reduce manual follow-up, shorten the path from enquiry to meeting, and give sellers more time for relationships and closing.",
    whatIsTitle: "What is a Sales Angel?",
    whatIsDescription:
      "A Sales Angel is a virtual AI sales employee from Act Angel AI that autonomously qualifies deals, follows up, schedules meetings, and updates connected sales systems within your defined rules and permissions.",
    ctaLine: "Put your next opportunity in motion.",
    ctaHireLabel: "Hire a Sales Angel",
    dropdownRole: "Drives Sales",
    useCases: ["Lead Qualification", "Discovery Calls", "Meeting Scheduling", "Pipeline Follow-Up"],
  },
  {
    id: "service",
    label: "Service Angel",
    slug: "service-angel",
    contact: "Nora Bennett",
    avatar: "/images/service_angel.png",
    role: "Service",
    messages: [
      ["in", "My order hasn't arrived yet, can you check?"],
      ["out", "Of course — I can see it's out for delivery today."],
      ["in", "Great, thank you!"],
      ["out", "You're welcome. I'll text you once it's delivered."],
    ],
    eyebrow: "Virtual AI Customer Service Employee",
    heroHeadline: "From Customer Request to Resolution.",
    heroSubtext:
      "Your virtual AI service employee answers questions, acts on routine requests, and keeps customers informed across your connected support systems.",
    capabilities: [
      { title: "Answer with context.", description: "Use approved knowledge and customer records to deliver relevant answers." },
      { title: "Resolve routine requests.", description: "Complete permitted account and service updates in connected systems." },
      { title: "Manage support tickets.", description: "Create, categorise, prioritise, and update cases as work progresses." },
      { title: "Coordinate service.", description: "Schedule appointments and trigger the right fulfilment workflows." },
      { title: "Keep customers informed.", description: "Send status updates and follow up on outstanding information." },
      { title: "Escalate intelligently.", description: "Route exceptions to the right team with history and actions taken." },
    ],
    outcomeTitle: "Less waiting. More resolution.",
    outcomeDescription:
      "Reduce repetitive support work, improve response consistency, and give specialists more capacity for complex customer needs.",
    whatIsTitle: "What is a Service Angel?",
    whatIsDescription:
      "A Service Angel is a virtual AI customer service employee from Act Angel AI that answers questions and autonomously completes routine service workflows across connected systems, with escalation when human judgement is needed.",
    ctaLine: "Make every service interaction count.",
    ctaHireLabel: "Hire a Service Angel",
    dropdownRole: "Supports Customers",
    useCases: ["Ticket Triage & Resolution", "Order & Account Support", "Renewals & Upsell", "After-Hours Coverage"],
  },
  {
    id: "hr",
    label: "HR Angel",
    slug: "recruitment-angel",
    contact: "Mia Torres",
    avatar: "/images/hr_angel.png",
    role: "Human Resource",
    messages: [
      ["in", "I'd like to apply for the ops role."],
      ["out", "Great! Could you share your resume and availability for a call?"],
      ["in", "Available Thursday afternoon."],
      ["out", "Booked — Thursday, 2:00 PM with our hiring lead."],
    ],
    // Content doc's "HR Angel" section, used verbatim — displayed under the "HR Angel" label
    // above while the URL stays /hire-an-angel/recruitment-angel (route intentionally unchanged).
    eyebrow: "Virtual AI HR Employee",
    heroHeadline: "Less HR Admin. More Human Impact.",
    heroSubtext:
      "Your virtual AI HR employee coordinates people processes, handles routine employee requests, and keeps work moving across your connected HR systems.",
    capabilities: [
      { title: "Coordinate recruitment.", description: "Schedule interviews and keep candidates informed of next steps." },
      { title: "Orchestrate onboarding.", description: "Launch checklists, request documents, and track assigned tasks." },
      { title: "Answer policy questions.", description: "Use approved HR guidance to provide consistent employee support." },
      { title: "Process routine requests.", description: "Collect details and route leave or document requests for approval." },
      { title: "Keep HR records current.", description: "Update authorised employee information and flag missing details." },
      { title: "Coordinate offboarding.", description: "Trigger assigned tasks and track completion across relevant teams." },
    ],
    outcomeTitle: "Smoother processes. More time for people.",
    outcomeDescription:
      "Reduce repetitive administration, improve follow-through across the employee lifecycle, and free HR teams to focus on people and organisational priorities.",
    whatIsTitle: "What is an HR Angel?",
    whatIsDescription:
      "An HR Angel is a virtual AI employee from Act Angel AI that autonomously coordinates routine HR workflows across connected systems and approved data. Sensitive cases and employment decisions remain with authorised people.",
    ctaLine: "Give your people team more capacity.",
    ctaHireLabel: "Hire an HR Angel",
    dropdownRole: "Talent Management",
    useCases: ["Candidate Sourcing", "Resume Screening", "Interview Scheduling", "Candidate Follow-Up"],
  },
  {
    id: "assistance",
    label: "Assistant Angel",
    slug: "executive-assistant-angel",
    contact: "Sarah Thomson",
    avatar: "/images/assistant_angel.png",
    role: "Assistance",
    messages: [
      ["in", "Can you move my 3pm client call to tomorrow morning?"],
      ["out", "Done — moved your client call to tomorrow at 9:00 AM and notified the attendees."],
      ["in", "Perfect, thanks."],
      ["out", "Anytime. Your day is now clear until 11 AM."],
    ],
    // Content doc's "Assistant Angel" section, used verbatim — displayed under the "Assistant
    // Angel" label above while the URL stays /hire-an-angel/executive-assistant-angel (route
    // intentionally unchanged).
    eyebrow: "Virtual AI Assistant Employee",
    heroHeadline: "Give Your Priorities Room to Move.",
    heroSubtext:
      "Your virtual AI assistant coordinates schedules, prepares information, and follows through on everyday work across your connected tools and workflows.",
    capabilities: [
      { title: "Coordinate calendars.", description: "Arrange meetings, resolve scheduling clashes, and send reminders." },
      { title: "Organise the inbox.", description: "Prioritise messages, draft replies, and route requests for action." },
      { title: "Prepare meeting briefs.", description: "Bring together relevant records, documents, and outstanding decisions." },
      { title: "Turn meetings into action.", description: "Capture next steps from meeting notes and assign follow-up tasks." },
      { title: "Keep work moving.", description: "Track deadlines, chase updates, and surface blockers." },
      { title: "Maintain working records.", description: "Update tasks, documents, and business records within granted access." },
    ],
    outcomeTitle: "Fewer loose ends. More focus.",
    outcomeDescription:
      "Reduce coordination overhead, keep commitments visible, and give leaders and teams more time for decisions that move the business forward.",
    whatIsTitle: "What is an Assistant Angel?",
    whatIsDescription:
      "An Assistant Angel is a virtual AI assistant employee from Act Angel AI that autonomously coordinates administrative work across connected calendars, communication tools, data, and processes, following your permissions and approval rules.",
    ctaLine: "Make space for your highest-value work.",
    ctaHireLabel: "Hire an Assistant Angel",
    dropdownRole: "Organizes Work",
    useCases: ["Calendar Management", "Inbox Triage", "Travel & Expense", "Meeting Prep & Notes"],
  },
  {
    // Content captured verbatim from https://hope-angel.vercel.app/hire-an-angel/hope-angel
    // (the reference nonprofit-focused Hope Angel build). avatar reuses sales_angel's photo —
    // that's the same image the client supplied as Hope Angel's reference avatar.
    id: "hope",
    label: "Hope Angel",
    slug: "hope-angel",
    contact: "Hope Angel",
    avatar: "/images/hope_angel.png",
    role: "Devoted Volunteer",
    messages: [
      ["in", "How close are you to the campaign goal?"],
      ["out", "Our example campaign has raised $1.7M toward a $2.1M goal. May I show you how your contribution can help?"],
    ],
    campaignDemo: {
      tagline: "Here to help your mission",
      raised: "$1.7M",
      goal: "$2.1M",
      raisedValue: 1.7,
      goalValue: 2.1,
      ctaLabel: "Message Hope Angel",
    },
    // Hero phone's autoplay rotation — one full call loop per slide, captured verbatim from
    // watching https://hope-angel.vercel.app/hire-an-angel/hope-angel's hero widget cycle.
    campaignSlides: [
      {
        scenarioTag: "Purposeful fundraising",
        question: "How close are we to the campaign goal?",
        answer: "We have raised $1.7M toward $2.1M. I can show you how a gift moves the mission forward.",
      },
      {
        scenarioTag: "Volunteer welcome",
        question: "I can help this weekend. Where am I needed?",
        answer: "Thank you! Tell me your interests and availability, and I will connect you with the right team.",
      },
      {
        scenarioTag: "Funding applications",
        question: "Could I apply for vocational training support?",
        answer: "I can explain the criteria and gather your application. The NPO team will review and decide.",
      },
    ],
    // Aligned by index with the `scenarios` array below (Purposeful Fundraising, Goal Progress,
    // Funding Application, Volunteer Sign-Up) — captured verbatim from clicking each pill on
    // https://hope-angel.vercel.app/hire-an-angel/hope-angel.
    campaignScenarios: [
      {
        question: "How close are you to the campaign goal?",
        answer: "Our example campaign has raised $1.7M toward a $2.1M goal. May I show you how your contribution can help?",
        progressValueText: "$1.7M / $2.1M",
        progressPct: 81,
      },
      {
        question: "How much more is needed for the training program?",
        answer: "This sample campaign has reached $18,400 of its $25,000 goal. Another $6,600 would complete the target.",
        progressValueText: "$18,400 / $25,000",
        progressPct: 74,
      },
      {
        question: "Can I apply for support from this fund?",
        answer: "I can guide you through the eligibility questions and documents. Your completed request will go to the NPO team for review and a decision.",
        progressValueText: "NPO review required",
        progressPct: 0,
      },
      {
        question: "I want to help. Are there volunteer opportunities?",
        answer: "Thank you. I can ask about your interests, language, and availability, then share suitable ways to serve with the team.",
        progressValueText: "Volunteer match",
        progressPct: 0,
      },
    ],
    eyebrow: "Devoted AI Volunteer Employee for Nonprofits",
    heroHeadline: "Hope Angel: More Good, Done Every Day.",
    heroSubtext:
      "Hope Angel serves your nonprofit's purpose without taking a salary. It helps raise funds for clear goals, welcome donors and volunteers, and guide people applying for support.",
    heroSubtext2:
      "As your mission grows, Hope Angel helps you reach more people and act quickly, with consistent follow-up so opportunities to help are less likely to be missed.",
    trustSubtext:
      "Steady, multilingual service, 24 hours a day, 365 days a year. Your team sets the purpose, eligibility rules, permissions, and points where a person should step in.",
    capabilitiesNumbered: true,
    capabilities: [
      { title: "Raise funds for a purpose.", description: "Build campaigns around specific needs and help supporters see the good their contribution can do." },
      { title: "Show progress in real time.", description: "Display the fundraising target beside the amount raised, updated from connected donation data." },
      { title: "Communicate across channels.", description: "Connect through voice, chat, WhatsApp, email, SMS, iMessage, and other supported channels in multiple languages." },
      { title: "Build donor relationships.", description: "Answer questions, thank supporters, and follow up consistently with meaningful campaign updates." },
      { title: "Manage applications for support.", description: "Explain available funds or grants, gather applications and documents, and help applicants complete the process." },
      { title: "Help qualify and disburse.", description: "Check against your criteria, prepare requests for human approval, and coordinate approved disbursements." },
      { title: "Welcome more volunteers.", description: "Gather interests and availability, answer questions, and connect people with ways to serve." },
      { title: "Share your mission widely.", description: "Help create clear, multilingual outreach for campaigns, events, and community programs." },
    ],
    outcomeLabel: "Mission Outcome",
    outcomeCardTitle: "Grow your reach. Keep the good moving.",
    outcomeTitle: "Grow your mission without losing its personal touch.",
    outcomeDescription:
      "Hope Angel helps your NPO welcome more donors and volunteers, respond promptly across channels, and follow through on more opportunities to help. Your team can spend more time serving people and causes.",
    faqEyebrow: "Clear answers for nonprofit organizations",
    faqs: [
      {
        question: "What is Hope Angel?",
        answer:
          "Hope Angel is a devoted virtual AI volunteer employee from Act Angel AI (AAA) for eligible nonprofit organizations. It helps with purposeful fundraising, donor and volunteer engagement, and applications for funds or grants raised by the NPO. It works within each organization's rules and human oversight.",
      },
      {
        question: "Can Hope Angel show fundraising progress in real time?",
        answer:
          "When connected to your donation data, Hope Angel can display a campaign's target beside the amount raised and update the view as donations are recorded.",
      },
      {
        question: "How does Hope Angel help manage applications for support?",
        answer:
          "Hope Angel can explain a program, collect applications, check submitted information against your criteria, and prepare requests for your team's review. After approval, it can help coordinate disbursement through authorized systems.",
      },
      {
        question: "Which communication channels can Hope Angel use?",
        answer:
          "Hope Angel can communicate through connected voice, website chat, WhatsApp, email, SMS, iMessage, and other supported channels. Availability depends on your integrations and permissions.",
      },
    ],
    ctaHireLabel: "Meet Hope Angel",
    ctaHref: "https://www.actangel.ai/get-started/",
    scenarios: ["Purposeful Fundraising", "Goal Progress", "Funding Application", "Volunteer Sign-Up"],
    channels: ["Voice", "Chat", "WhatsApp", "Email", "SMS", "iMessage"],
    liveDemoHeadline: "See Hope Angel handle it.",
    liveDemoSubtext:
      "Choose a scenario and a channel to see an example of how Hope Angel moves a conversation toward a helpful next step.",
    liveDemoCtaLabel: "Share Your Mission",
    liveDemoCtaHref: "#share-your-mission",
    liveDemoCtaVariant: "purple",
    liveDemoCaption: "See what service could look like for your NPO.",
    livePreviewPillLabel: "Devoted Volunteer",
    liveDemoBadgeLabel: "Preview",
    closingEyebrow: "Progress with Purpose",
    closingHeadline: "Let's help your mission reach further.",
    closingDescription:
      "We would be honored to learn about the good your organization does. As part of our Progress with Purpose commitment, Act Angel AI (AAA) invests in Hope Angel and extends its service on a complimentary basis to eligible NPOs. Before offering an Angel, we take time to understand each organization and verify its authenticity and ethical practices. Please tell us about your mission and how Hope Angel might serve it.",
    closingCtaLabel: "Share Your Mission",
    closingCtaHref: "#share-your-mission",
    closingQuote: "We choose to measure success by the good we do with it.",
    closingQuoteTag: "Revenue. Angels. Time.",
    showMissionForm: true,
    dropdownRole: "Serves Nonprofits",
    useCases: ["Purposeful Fundraising", "Donor & Volunteer Engagement", "Funding Applications", "Campaign Progress"],
  },
]

// The theme's hero phone runs its own thread — a longer 5-message pricing conversation —
// rather than reusing the Sales persona's modal script, so it's kept separate here.
//
// Doesn't ask for name/email/phone: that contact info is already captured automatically by the
// product (caller ID, ad-click tracking, connected CRM, etc.), so the AI goes straight to
// qualifying the actual need instead of the usual lead-form questions — the script itself is
// the pitch for that.
export const HERO_CONTACT = "Alex Morgan"
export const HERO_AVATAR = "/images/sales_angel.png"
export const HERO_MESSAGES: ScriptLine[] = [
  ["in", "Hi, I saw your ad — do you have time to chat about pricing?"],
  ["out", "Of course! What are you looking for — team size and use case?"],
  ["in", "Looking for the Pro plan for a 10-person team."],
  ["out", "Perfect — I can set up a walkthrough tomorrow at 10:00 AM. Does that work?"],
  ["in", "Yes, that works!"],
  ["out", "You're booked for 10:00 AM tomorrow. Talk soon!"],
]
