/** Every email the exchange sends, as shown on the admin Emails page. */
export type EmailGroup = "Account" | "Verification" | "Submissions" | "Admin alerts";

export type EmailTemplate = {
  id: string;
  group: EmailGroup;
  name: string;
  short: string;
  when: string;
  to: string;
  subject: string;
  pre: string;
  hello: string;
  title: string;
  paras?: string[];
  quote?: { text: string; by: string };
  rows?: [string, string][];
  list?: string[];
  cta?: { label: string; href: string };
  alt?: { label: string; href: string };
  after?: string[];
  link?: string;
  why: string;
  settings?: { label: string; href: string };
};

export const EMAIL_GROUPS: EmailGroup[] = ["Account", "Verification", "Submissions", "Admin alerts"];

export const EMAIL_FROM = "Teaching Materials Exchange <tme@illinois.edu>";

export const EMAILS: EmailTemplate[] = [
  {
    id: "reset",
    group: "Account",
    name: "Password reset",
    short: "From “Forgot password?”",
    when: "Sent when someone asks to reset a password on the Sign in page.",
    to: "Priya Raman <praman@riverbend.edu>",
    subject: "Reset your password",
    pre: "This link works for one hour.",
    hello: "Hi Priya,",
    title: "Reset your password",
    paras: ["We got a request to reset the password for your Teaching Materials Exchange account."],
    cta: {
      label: "Choose a new password",
      href: "/reset-password",
    },
    after: ["This link works for one hour, and only once. If you didn't ask for this, you can ignore this email. Your password won't change."],
    link: "https://tme.illinois.edu/reset/7f3k29qd",
    why: "You got this email because someone asked to reset the password for praman@riverbend.edu.",
  },
  {
    id: "ver-review",
    group: "Verification",
    name: "Verification in review",
    short: "Document, or a page we can’t confirm",
    when: "Sent when an instructor uploads a document, or sends a page the system can't confirm.",
    to: "Priya Raman <praman@riverbend.edu>",
    subject: "We're checking your instructor status",
    pre: "A person will review it by Monday, October 26.",
    hello: "Hi Priya,",
    title: "We're checking your instructor status",
    paras: ["Thanks for verifying. A person on our team will review your document and email you by Monday, October 26."],
    rows: [
      ["You sent", "appointment-letter-2026.pdf"],
      ["Received", "Thursday, October 22, 10:41 AM"],
    ],
    cta: {
      label: "See your account",
      href: "/account",
    },
    after: ["Until then, you can download public files. Only our verification team sees your document, and we delete it after review."],
    why: "You got this email because you asked to verify your instructor status.",
  },
  {
    id: "ver-ok",
    group: "Verification",
    name: "Verified",
    short: "Approved",
    when: "Sent when verification is approved, automatically or by an admin.",
    to: "Priya Raman <praman@riverbend.edu>",
    subject: "You're verified on the Teaching Materials Exchange",
    pre: "Teaching notes and solutions are unlocked.",
    hello: "Hi Priya,",
    title: "You're verified",
    paras: [
      "Teaching notes and solutions are now unlocked for you everywhere on the exchange.",
      "You asked for the teaching note for Revenue Recognition at Lakeside Fitness. It’s ready to download.",
    ],
    rows: [
      ["Verified on", "October 17, 2026"],
      ["Lasts until", "October 17, 2027"],
    ],
    cta: {
      label: "Download the teaching note",
      href: "/r/0142/files/lakeside-teaching-note.pdf",
    },
    alt: {
      label: "Browse materials",
      href: "/browse",
    },
    after: ["We'll email you before your verification ends."],
    why: "You got this email because you asked to verify your instructor status.",
  },
  {
    id: "ver-link",
    group: "Verification",
    name: "Asked for a different link",
    short: "Page couldn’t be read",
    when: "Sent when an admin chooses “Ask for a different link.”",
    to: "Morgan Blake <mblake@prairielakes.edu>",
    subject: "Could you send a different page?",
    pre: "We couldn't open the page you sent.",
    hello: "Hi Morgan,",
    title: "Could you send a different page?",
    quote: {
      text: "Thanks for applying. We couldn't open the page you sent. Could you reply with another page on your school's website that lists your name and title?",
      by: "Jamie Morales, verification team",
    },
    rows: [["You sent", "prairielakes.edu/directory/morgan-blake"]],
    cta: {
      label: "Send a different page",
      href: "/verify",
    },
    after: ["No page that works? You can upload a document, like an appointment letter, instead."],
    why: "You got this email because you asked to verify your instructor status.",
  },
  {
    id: "ver-no",
    group: "Verification",
    name: "Couldn’t verify",
    short: "Declined",
    when: "Sent when an admin declines a verification request.",
    to: "Alex Kim <akim@riverbend.edu>",
    subject: "We couldn't verify your instructor status",
    pre: "Teaching notes and solutions are still locked.",
    hello: "Hi Alex,",
    title: "We couldn't verify you yet",
    quote: {
      text: "Thanks for applying. We couldn't confirm from your page that you teach a course, so we can't unlock teaching notes yet. If you're the instructor of record for a course, reply with a page that shows it, like a course schedule or syllabus.",
      by: "Jamie Morales, verification team",
    },
    rows: [["Reason", "Not an instructor (student or staff)"]],
    cta: {
      label: "Try again",
      href: "/verify",
    },
    after: ["You can still download public files."],
    why: "You got this email because you asked to verify your instructor status.",
  },
  {
    id: "ver-renew",
    group: "Verification",
    name: "Renewal reminder",
    short: "A month before it ends",
    when: "Sent a month before verification ends, and again on the last day.",
    to: "Priya Raman <praman@riverbend.edu>",
    subject: "Your verification ends October 17, 2027",
    pre: "Re-check your page to keep teaching notes unlocked.",
    hello: "Hi Priya,",
    title: "Your verification ends soon",
    paras: ["Re-check your faculty page to keep downloading teaching notes and solutions. It takes a few seconds."],
    rows: [
      ["Your page", "riverbend.edu/accountancy/faculty/priya-raman"],
      ["Ends", "October 17, 2027"],
    ],
    cta: {
      label: "Re-check my page",
      href: "/verify?state=expired",
    },
    why: "You got this email because your instructor verification ends in a month.",
  },
  {
    id: "sub-received",
    group: "Submissions",
    name: "Submission received",
    short: "First-time contributor",
    when: "Sent when a first-time contributor submits. Trusted contributors publish right away and get “Published” instead.",
    to: "Elena Fischer <efischer@prairielakes.edu>, Sam Ortega <sortega@prairielakes.edu>",
    subject: "We got your case: Generative AI in the Monthly Close",
    pre: "A person will check it within 2 business days.",
    hello: "Hi Elena,",
    title: "Thanks for sharing your case",
    paras: ["This is your first contribution, so a person on our team will check Generative AI in the Monthly Close within 2 business days."],
    list: [
      "We check the files and details.",
      "We email you when it's published, or if something needs a change.",
      "Once published, it appears in Browse and on your author page.",
    ],
    cta: {
      label: "View your resource page",
      href: "/r/0171?own=1",
    },
    why: "You got this email because you submitted materials to the Teaching Materials Exchange.",
  },
  {
    id: "sub-changes",
    group: "Submissions",
    name: "Changes requested",
    short: "Sent back with notes",
    when: "Sent when an admin chooses “Request changes.”",
    to: "Elena Fischer <efischer@prairielakes.edu>, Sam Ortega <sortega@prairielakes.edu>",
    subject: "One change before we publish your case",
    pre: "Remove the email addresses on page 3 of the exhibit.",
    hello: "Hi Elena,",
    title: "One change before we publish",
    paras: ["We reviewed Generative AI in the Monthly Close. It stays in review until you send the update."],
    quote: {
      text: "Thanks for sharing this case, Elena and Sam. Before we publish it, please remove or mask the two email addresses on page 3 of prompt-log-exhibit.pdf. Upload the new file from My resources and it comes straight back to us.",
      by: "Jamie Morales, verification team",
    },
    cta: {
      label: "Update your submission",
      href: "/contribute",
    },
    why: "You got this email because you submitted materials to the Teaching Materials Exchange.",
  },
  {
    id: "sub-published",
    group: "Submissions",
    name: "Published",
    short: "Approved, or trusted contributor",
    when: "Sent when an admin approves a submission, or right away for trusted contributors.",
    to: "Elena Fischer <efischer@prairielakes.edu>, Sam Ortega <sortega@prairielakes.edu>",
    subject: "Your case is published",
    pre: "Anyone can now find Generative AI in the Monthly Close.",
    hello: "Hi Elena,",
    title: "Your case is published",
    paras: ["Generative AI in the Monthly Close is live. Anyone can find it, and verified instructors can download the teaching note."],
    rows: [
      ["Link", "tme.illinois.edu/r/0171"],
      ["License", "CC BY 4.0"],
      ["Cite as", "Fischer, E., & Ortega, S. (2026). Generative AI in the monthly close (Version 1) [Teaching case]. Teaching Materials Exchange."],
    ],
    cta: {
      label: "View your resource page",
      href: "/r/0171?published=1",
    },
    after: ["Download and course counts appear on the page as instructors use it."],
    why: "You got this email because you submitted materials to the Teaching Materials Exchange.",
  },
  {
    id: "sub-declined",
    group: "Submissions",
    name: "Declined",
    short: "Won’t be published",
    when: "Sent when an admin declines a submission.",
    to: "Elena Fischer <efischer@prairielakes.edu>, Sam Ortega <sortega@prairielakes.edu>",
    subject: "We can't publish your submission",
    pre: "Your files stay in My resources.",
    hello: "Hi Elena,",
    title: "We can't publish this one",
    quote: {
      text: "Thanks for sharing this with us. We can't publish it on the exchange because the rights to share the exhibit are unclear. If you get written permission from the company, reply to this email and we'll take another look.",
      by: "Jamie Morales, verification team",
    },
    rows: [["Reason", "Rights to share are unclear"]],
    cta: {
      label: "Go to My resources",
      href: "/account",
    },
    after: ["Your files stay in My resources as a draft. Only you and your co-authors can see them."],
    why: "You got this email because you submitted materials to the Teaching Materials Exchange.",
  },
  {
    id: "adm-digest",
    group: "Admin alerts",
    name: "Daily digest",
    short: "8:00 AM on weekdays",
    when: "Sent at 8:00 AM on weekdays to admins who turn it on in Your email alerts.",
    to: "Jamie Morales <jmorales@illinois.edu>",
    subject: "3 verifications and 1 submission waiting",
    pre: "The oldest verification has waited 1 day.",
    hello: "Good morning, Jamie.",
    title: "What's waiting today",
    rows: [
      ["Verifications", "3 waiting. The oldest has waited 1 day."],
      ["Submissions", "1 in review, resubmitted after changes"],
      ["Within the promise", "100% over the last 30 days"],
    ],
    cta: {
      label: "Open the dashboard",
      href: "/admin",
    },
    why: "You got this email because the daily digest is on in your email alerts.",
    settings: {
      label: "Change your email alerts",
      href: "/admin",
    },
  },
  {
    id: "adm-late",
    group: "Admin alerts",
    name: "Waiting over 1 business day",
    short: "One email per item",
    when: "Sent once per item when a verification or submission has waited over 1 business day, to admins who turn it on.",
    to: "Jamie Morales <jmorales@illinois.edu>",
    subject: "Morgan Blake has waited over 1 business day",
    pre: "Decide by the end of the day to keep the 2-day promise.",
    hello: "Hi Jamie,",
    title: "This verification needs a decision",
    paras: ["Decide by the end of the day to keep the 2-business-day promise."],
    rows: [
      ["Applicant", "Morgan Blake, Prairie Lakes College"],
      ["Waiting since", "Monday, 2:15 PM"],
      ["Status", "2nd request. The first page needed JavaScript to load."],
    ],
    cta: {
      label: "Review now",
      href: "/admin/verification",
    },
    why: "You got this email because alerts for items waiting over 1 business day are on.",
    settings: {
      label: "Change your email alerts",
      href: "/admin",
    },
  },
  {
    id: "adm-weekly",
    group: "Admin alerts",
    name: "Weekly summary",
    short: "Mondays at 9:00 AM",
    when: "Sent Mondays at 9:00 AM to admins who turn it on.",
    to: "Jamie Morales <jmorales@illinois.edu>",
    subject: "Last week on the Teaching Materials Exchange",
    pre: "14 verifications decided, 3 materials published.",
    hello: "Hi Jamie,",
    title: "Last week, October 12 to 18",
    rows: [
      ["Verifications", "14 decided, all within 2 business days"],
      ["Submissions", "3 published, 1 sent back for changes"],
      ["Downloads", "1,284"],
      ["New verified instructors", "15"],
      ["Course reports", "9"],
    ],
    cta: {
      label: "Open the dashboard",
      href: "/admin",
    },
    why: "You got this email because the weekly summary is on in your email alerts.",
    settings: {
      label: "Change your email alerts",
      href: "/admin",
    },
  },
  {
    id: "acct-suspended",
    group: "Account",
    name: "Account suspended",
    short: "From the Users page",
    when: "Sent when an admin suspends an account on the Users page.",
    to: "Kai Tanaka <ktanaka@eastmoor.edu>",
    subject: "Your account is suspended",
    pre: "You can't sign in for now.",
    hello: "Hi Kai,",
    title: "Your account is suspended",
    paras: ["An admin suspended your Teaching Materials Exchange account, so you can't sign in or download locked files."],
    rows: [["Reason", "Shared locked files publicly"]],
    after: ["To ask about this, reply to this email. Materials you published stay up unless an admin unpublishes them."],
    why: "You got this email because your account status changed.",
  },
  {
    id: "ver-revoked",
    group: "Verification",
    name: "Verification removed",
    short: "From the Users page",
    when: "Sent when an admin removes an instructor's verification on the Users page.",
    to: "Priya Raman <praman@riverbend.edu>",
    subject: "Your instructor verification was removed",
    pre: "Teaching notes and solutions are locked for now.",
    hello: "Hi Priya,",
    title: "Your verification was removed",
    paras: ["An admin removed your instructor verification, so teaching notes and solutions are locked for your account. Your published materials stay up."],
    rows: [["Reason", "No longer teaching at this school"]],
    cta: {
      label: "Verify again",
      href: "/verify",
    },
    after: ["If you think this is a mistake, reply to this email."],
    why: "You got this email because your instructor verification changed.",
  },
  {
    id: "mat-unpublished",
    group: "Submissions",
    name: "Unpublished by an admin",
    short: "From the Materials page",
    when: "Sent to every author when an admin unpublishes a resource on the Materials page.",
    to: "Priya Raman <praman@riverbend.edu>",
    subject: "We unpublished Testing Journal Entries with Python",
    pre: "It no longer shows in Browse or search.",
    hello: "Hi Priya,",
    title: "We unpublished your data exercise",
    paras: ["Testing Journal Entries with Python no longer shows in Browse or search. Old links show a notice instead."],
    rows: [["Reason", "Contains personal data"]],
    cta: {
      label: "Go to My resources",
      href: "/account",
    },
    after: ["Upload a fixed file from My resources and we'll review it again, or reply to this email with questions."],
    why: "You got this email because you are an author of this resource.",
  },
];

/** Pages and states the emails lead to. */
export const EMAIL_RELATED = [
  { label: "Reset password page", sub: "Where the password reset email leads.", href: "/reset-password" },
  { label: "Expired reset link", sub: "Reset links work for one hour, and only once.", href: "/reset-password?expired=1" },
  { label: "Locked file from a direct link", sub: "Changes with \u201cView as\u201d in the sidebar.", href: "/r/0142/files/lakeside-solution.xlsx" },
  { label: "Unpublished resource", sub: "An old link to a resource its authors unpublished.", href: "/r/0066" },
  { label: "Page not found", sub: "A mistyped or retired address.", href: "/r/0999" },
];
