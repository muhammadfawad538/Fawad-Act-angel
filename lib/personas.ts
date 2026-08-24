// Single source of truth for Act Angel's 4 personas — used by the nav "Hire an Angel"
// dropdown (components/mobile-nav.tsx) and the persona demo modal
// (components/hire-an-angel-modal.tsx), so labels/scripts can't drift between the two.
//
// Contacts, avatars and every message below are captured verbatim from the reference theme
// (https://aiactangel.netlify.app/) — its nav dropdown personas, their chat threads, and the
// separate script its *hero* phone plays. Each persona has its own contact and photo there,
// rather than the single shared stock avatar this used to carry.

export type PersonaId = "sales" | "service" | "hr" | "assistance"

export type ScriptLine = ["in" | "out", string]

export interface Persona {
  id: PersonaId
  label: string // nav dropdown / picker label
  contact: string // contact name shown on the call screen and chat header
  avatar: string // per-persona photo (public/images)
  role: string
  messages: ScriptLine[]
}

export const PERSONAS: Persona[] = [
  {
    id: "sales",
    label: "Sales Angel",
    contact: "Alex Morgan",
    avatar: "/images/alex_morgan.webp",
    role: "Sales",
    messages: [
      ["in", "Is the downtown listing still available?"],
      ["out", "Yes! Want to schedule a viewing this weekend?"],
      ["in", "Saturday works"],
      ["out", "Booked — Sat, 11:00 AM"],
    ],
  },
  {
    id: "service",
    label: "Service Angel",
    contact: "Nora Bennett",
    avatar: "/images/nora_bennett.png",
    role: "Service",
    messages: [
      ["in", "My order hasn't arrived yet, can you check?"],
      ["out", "Of course — I can see it's out for delivery today."],
      ["in", "Great, thank you!"],
      ["out", "You're welcome. I'll text you once it's delivered."],
    ],
  },
  {
    id: "hr",
    label: "Recruitment Angel",
    contact: "Mia Torres",
    avatar: "/images/mia_torres.png",
    role: "Human Resource",
    messages: [
      ["in", "I'd like to apply for the ops role."],
      ["out", "Great! Could you share your resume and availability for a call?"],
      ["in", "Available Thursday afternoon."],
      ["out", "Booked — Thursday, 2:00 PM with our hiring lead."],
    ],
  },
  {
    id: "assistance",
    label: "Executive Assistant Angel",
    contact: "Sarah Thomson",
    avatar: "/images/sarah_thomson.png",
    role: "Assistance",
    messages: [
      ["in", "Can you move my 3pm to tomorrow morning?"],
      ["out", "Done — moved to tomorrow at 9:00 AM and notified the attendees."],
      ["in", "Perfect, thanks."],
      ["out", "Anytime. Your day is now clear until 11 AM."],
    ],
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
