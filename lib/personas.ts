// Single source of truth for Act Angel's 4 personas — used by the nav "Hire an Angel"
// dropdown (components/mobile-nav.tsx) and the persona demo modal
// (components/hire-an-angel-modal.tsx), so labels/scripts can't drift between the two.
//
// Contacts, avatars and every message below are captured verbatim from the reference theme
// (https://aiactangel.netlify.app/) — its nav dropdown personas, their chat threads, and the
// separate script its *hero* phone plays. Each persona has its own contact and photo there,
// rather than the single shared stock avatar this used to carry.

export type PersonaId = "sales" | "service" | "hr" | "assistance1"

export type ScriptLine = ["in" | "out", string]

export interface Capability {
  title: string
  description: string
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
  heroHeadline?: string
  heroSubtext?: string
  capabilities?: Capability[]
  outcomeTitle?: string
  outcomeDescription?: string
  whatIsTitle?: string
  whatIsDescription?: string
  ctaLine?: string
  ctaHireLabel?: string // e.g. "Hire a Sales Angel"
}

export const PERSONAS: Persona[] = [
  {
    id: "sales",
    label: "Sales Angel",
    slug: "sales-angel",
    contact: "Alex Morgan",
    avatar: "/images/alex_morgan.webp",
    role: "Sales",
    messages: [
      ["in", "Is the downtown listing still available?"],
      ["out", "Yes! Want to schedule a viewing this weekend?"],
      ["in", "Saturday works"],
      ["out", "Booked — Sat, 11:00 AM"],
    ],
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
  },
  {
    id: "service",
    label: "Service Angel",
    slug: "service-angel",
    contact: "Nora Bennett",
    avatar: "/images/nora_bennett.png",
    role: "Service",
    messages: [
      ["in", "My order hasn't arrived yet, can you check?"],
      ["out", "Of course — I can see it's out for delivery today."],
      ["in", "Great, thank you!"],
      ["out", "You're welcome. I'll text you once it's delivered."],
    ],
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
  },
  {
    id: "hr",
    label: "HR Angel",
    slug: "recruitment-angel",
    contact: "Mia Torres",
    avatar: "/images/mia_torres.png",
    role: "Human Resource",
    messages: [
      ["in", "I'd like to apply for the ops role."],
      ["out", "Great! Could you share your resume and availability for a call?"],
      ["in", "Available Thursday afternoon."],
      ["out", "Booked — Thursday, 2:00 PM with our hiring lead."],
    ],
    // Content doc's "HR Angel" section, used verbatim — displayed under the "HR Angel" label
    // above while the URL stays /hire-an-angel/recruitment-angel (route intentionally unchanged).
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
  },
  {
    id: "assistance",
    label: "Assistant Angel",
    slug: "executive-assistant-angel",
    contact: "Sarah Thomson",
    avatar: "/images/sarah_thomson.png",
    role: "Assistance",
    messages: [
      ["in", "Can you move my 3pm to tomorrow morning?"],
      ["out", "Done — moved to tomorrow at 9:00 AM and notified the attendees."],
      ["in", "Perfect, thanks."],
      ["out", "Anytime. Your day is now clear until 11 AM."],
    ],
    // Content doc's "Assistant Angel" section, used verbatim — displayed under the "Assistant
    // Angel" label above while the URL stays /hire-an-angel/executive-assistant-angel (route
    // intentionally unchanged).
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
  },
]

// The theme's hero phone runs its own thread — a longer 5-message pricing conversation —
// rather than reusing the Sales persona's modal script, so it's kept separate here.
export const HERO_CONTACT = "Alex Morgan"
export const HERO_AVATAR = "/images/alex_morgan.webp"
export const HERO_MESSAGES: ScriptLine[] = [
  ["in", "Hi, I saw your ad — do you have time to chat about pricing?"],
  ["out", "Of course! Could I get your name and what you're looking for?"],
  ["in", "Sarah Chen, looking for the Pro plan for a 10-person team."],
  ["out", "Perfect — I can set up a walkthrough tomorrow at 10:00 AM. Work for you?"],
  ["out", "You're booked for 10:00 AM tomorrow. Talk soon, Sarah!"],
]
