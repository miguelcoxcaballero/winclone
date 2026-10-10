import type { Message, Person } from './store';

/** Placeholder for the signed-in user; resolved from settings at render time. */
export const ME: Person = { name: '', email: '@me' };

const p = (name: string, email: string): Person => ({ name, email });

const MAYA = p('Maya Chen', 'maya.chen@lumimail.net');
const DANIEL = p('Daniel Okafor', 'd.okafor@riverbend.org');
const PRIYA = p('Priya Raman', 'priya.raman@halcyonworks.io');
const ELENA = p('Elena Morales', 'elena.morales@lumimail.net');
const SAM = p('Sam Whitaker', 'sam.whitaker@postbox.example');
const JONAS = p('Jonas Lindqvist', 'jonas@halcyonworks.io');

let n = 0;
const id = () => `seed${++n}`;

function at(daysAgo: number, h: number, m: number): number {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  const now = Date.now();
  // Keep "today" messages in the past even early in the morning
  if (d.getTime() > now) return now - (n + 1) * 7 * 60_000;
  return d.getTime();
}

function msg(m: Partial<Message> & Pick<Message, 'from' | 'subject' | 'text' | 'date'>): Message {
  return {
    id: id(),
    folder: 'inbox',
    to: [ME],
    cc: [],
    read: true,
    flagged: false,
    pinned: false,
    focused: true,
    ...m,
  };
}

const NEWSLETTER = `
<div class="ol-b-nl">
  <div class="ol-b-nl-head ol-b-ink">
    <div class="ol-b-nl-brand">Quillstone <span>Weekly</span></div>
    <div class="ol-b-nl-issue">Issue 212 · Stories worth slowing down for</div>
  </div>
  <div class="ol-b-nl-hero">
    <svg viewBox="0 0 560 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="qsg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d9b8"/><stop offset="1" stop-color="#e7a98a"/></linearGradient></defs>
      <rect width="560" height="160" fill="url(#qsg)"/>
      <rect x="170" y="38" width="220" height="96" rx="6" fill="#fffaf2" transform="rotate(-4 280 86)"/>
      <path d="M200 70h150M200 88h132M200 106h110" stroke="#b9876b" stroke-width="3" stroke-linecap="round" transform="rotate(-4 280 86)"/>
      <path d="M392 30l46 70-10 6-46-70z" fill="#5a3d33"/><path d="M438 100l6 14-11-8z" fill="#2e1f1a"/>
    </svg>
  </div>
  <h2>The quiet comeback of handwritten letters</h2>
  <p>More people are trading quick messages for slow mail. We talked to three pen-pal clubs about why paper still matters — and why the wait is half the fun.</p>
  <p><a class="ol-b-btn">Read the story</a></p>
  <hr/>
  <h3>Also this week</h3>
  <ul>
    <li><b>Kitchen science:</b> why bread rises faster on rainy days (it doesn't — mostly).</li>
    <li><b>Five-minute habit:</b> a tiny journaling trick that sticks.</li>
    <li><b>Reader mail:</b> your favourite overlooked city parks.</li>
  </ul>
  <p class="ol-b-fine">You're receiving this because you subscribed to Quillstone Weekly. <a>Unsubscribe</a> · <a>Manage preferences</a></p>
</div>`;

const RECEIPT = `
<div class="ol-b-rc">
  <div class="ol-b-rc-head">
    <div class="ol-b-rc-logo"><span></span>Copperline Coffee</div>
    <div class="ol-b-rc-title">Thanks for your order!</div>
    <div class="ol-b-rc-sub">Order #CL-48213 · Paid with card ending 4417</div>
  </div>
  <table class="ol-b-rc-table">
    <tr><td>Hillside Blend, whole bean (340 g)</td><td>1</td><td>$16.50</td></tr>
    <tr><td>Ceramic pour-over dripper, sand</td><td>1</td><td>$24.00</td></tr>
    <tr><td>Paper filters (100)</td><td>2</td><td>$9.00</td></tr>
    <tr class="ol-b-rc-sum"><td>Subtotal</td><td></td><td>$49.50</td></tr>
    <tr class="ol-b-rc-sum"><td>Shipping</td><td></td><td>$0.00</td></tr>
    <tr class="ol-b-rc-sum"><td>Tax</td><td></td><td>$4.21</td></tr>
    <tr class="ol-b-rc-total"><td>Total</td><td></td><td>$53.71</td></tr>
  </table>
  <p>Your beans were roasted this morning and will ship within 2 business days. We'll email you a tracking number as soon as your parcel is on its way.</p>
  <p class="ol-b-fine">Copperline Coffee Roasters · 18 Foundry Lane · Questions? Just reply to this email.</p>
</div>`;

const SALE = `
<div class="ol-b-nl">
  <div class="ol-b-sale">
    <svg viewBox="0 0 560 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="560" height="180" fill="#2f5d50"/>
      <path d="M0 140 L90 70 L160 120 L250 40 L350 130 L430 80 L560 150 V180 H0Z" fill="#244a40"/>
      <path d="M0 165 L120 110 L220 150 L330 100 L440 150 L560 120 V180 H0Z" fill="#1b3a32"/>
      <circle cx="470" cy="45" r="20" fill="#f2c46d"/>
    </svg>
    <div class="ol-b-sale-text"><div>AUTUMN SALE</div><b>25% off</b><span>rain shells, fleeces &amp; trail packs</span></div>
  </div>
  <h2>Weather-proof your weekends</h2>
  <p>The forecast says drizzle, your plans say trailhead. Our lightweight shells pack down to the size of an apple and keep you dry from car park to summit.</p>
  <p><a class="ol-b-btn ol-b-btn-green">Shop the sale</a></p>
  <p class="ol-b-fine">Offer ends Sunday at midnight. Pinecrest Outfitters · You're receiving this because you joined the Pinecrest Trail Club.</p>
</div>`;

const WELCOME = `
<div class="ol-b-nl">
  <div class="ol-b-welcome">
    <svg viewBox="0 0 560 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="wlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe6ff"/><stop offset="1" stop-color="#9cc8f5"/></linearGradient></defs>
      <rect width="560" height="150" fill="url(#wlg)"/>
      <rect x="190" y="35" width="180" height="90" rx="10" fill="#fff"/>
      <path d="M196 44l84 52 84-52" fill="none" stroke="#3b82d6" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="380" cy="40" r="16" fill="#3b82d6"/><path d="M372 40l6 6 10-11" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
  <h2>Welcome to your new inbox</h2>
  <p>Everything you need to stay on top of your day is right here: mail, calendar and contacts, all in one place.</p>
  <ul>
    <li><b>Pin</b> important messages to keep them at the top of your inbox.</li>
    <li><b>Sweep</b> clears out old messages from a sender in one go.</li>
    <li><b>Focused Inbox</b> keeps the messages that matter most front and centre.</li>
  </ul>
  <p>Press <b>Ctrl+N</b> to write your first email.</p>
  <p class="ol-b-fine">This is an automated message from your mail app. Please don't reply.</p>
</div>`;

export function seedMessages(): Message[] {
  n = 0;
  const list: Message[] = [
    msg({
      from: MAYA, subject: 'Hike on Saturday? 🥾', date: at(0, 9, 14), read: false,
      text: `Hey!\n\nThe weather finally looks decent for the weekend. Want to do the Ridgeback Loop on Saturday morning? It's about 11 km with a great view over the reservoir at the halfway point.\n\nI was thinking we leave around 8:00 and grab breakfast at that little bakery by the trailhead afterwards. I can drive if you bring snacks 😄\n\nLet me know!\nMaya`,
    }),
    msg({
      from: p('Kitebird Airlines', 'trips@kitebird-air.example'), subject: 'Your trip to Lisbon: check-in opens soon', date: at(0, 8, 2), read: false,
      text: `Hello,\n\nOnline check-in for your flight KB 2741 to Lisbon opens 24 hours before departure.\n\nFlight: KB 2741\nDeparts: Thursday, 7:45 AM\nSeat: 14A (window)\nBaggage: 1 cabin bag, 1 personal item\n\nTip: add your boarding pass to your phone's wallet so it's ready at the gate.\n\nSafe travels,\nThe Kitebird team`,
    }),
    msg({
      from: p('Quillstone Weekly', 'hello@quillstone-weekly.example'), subject: 'This week: the quiet comeback of handwritten letters', date: at(0, 7, 30), read: false, focused: false,
      text: 'More people are trading quick messages for slow mail. We talked to three pen-pal clubs about why paper still matters — and why the wait is half the fun.', html: NEWSLETTER,
    }),
    msg({
      from: DANIEL, subject: 'Re: Book club pick for November', date: at(1, 18, 45),
      text: `Ha, I knew you'd vote for the lighthouse one. Honestly I'm fine with either, but "The Salt Archive" is shorter and half the group is behind already.\n\nLet's put both to a vote on Tuesday? I'll bring the good biscuits this time.\n\nDaniel\n\n> On Thursday you wrote:\n> I'd love to try "The Keeper of Gull Point" — it's been on my list forever.`,
    }),
    msg({
      from: p('Copperline Coffee', 'orders@copperline-coffee.example'), subject: 'Your Copperline order #CL-48213 receipt', date: at(1, 14, 10),
      text: 'Thanks for your order! Order #CL-48213 · Total $53.71. Your beans were roasted this morning and will ship within 2 business days.', html: RECEIPT,
    }),
    msg({
      from: p('Pinecrest Outfitters', 'news@pinecrest-outfitters.example'), subject: 'Autumn sale: 25% off rain shells 🍂', date: at(1, 11, 0), read: false, focused: false,
      text: 'The forecast says drizzle, your plans say trailhead. Our lightweight shells pack down to the size of an apple.', html: SALE,
    }),
    msg({
      from: PRIYA, cc: [JONAS], subject: "Slides for Thursday's review", date: at(2, 16, 22), flagged: true,
      attachments: [{ name: 'Q4-roadmap-review.pptx', size: '2.4 MB' }, { name: 'metrics-summary.xlsx', size: '86 KB' }],
      text: `Hi,\n\nAttached are the draft slides for Thursday's roadmap review. Could you take a look at slides 6–9 (the onboarding numbers) before Wednesday afternoon? Jonas has already gone through the budget section.\n\nA couple of open questions:\n• Should we show the regional breakdown or keep it at the global level?\n• Do we want the customer quotes at the start or the end?\n\nThanks so much!\nPriya`,
    }),
    msg({
      from: p('Harborview Library', 'notices@harborview-library.example'), subject: 'Your hold is ready for pickup', date: at(3, 10, 5),
      text: `Good news! The item you placed on hold is ready for pickup at the Harborview Main Branch.\n\nTitle: A Field Guide to Coastal Birds\nPickup by: 7 days from today\nLocation: Holds shelf, ground floor\n\nOpening hours: Mon–Sat 9:00 AM – 7:00 PM, Sun 12:00 – 5:00 PM.\n\nHappy reading,\nHarborview Library`,
    }),
    msg({
      from: p('Orbitly Cloud', 'no-reply@orbitly.example'), subject: 'Your storage is 80% full', date: at(4, 13, 40), focused: false,
      text: `You're using 4.0 GB of your 5 GB Orbitly storage.\n\nWhen your storage is full, new photos and files won't sync. You can free up space by emptying your bin or reviewing large files.\n\n— The Orbitly team`,
    }),
    msg({
      from: ELENA, subject: "Grandma's birthday dinner", date: at(5, 20, 12), pinned: true,
      text: `Hi sweetheart,\n\nJust a reminder that we're doing Grandma's 85th at the house on the 24th. Dinner at 6, but come early if you can help with the table.\n\nYour uncle is bringing his famous paella, so maybe a dessert from you? She loves anything with lemon.\n\nLove you,\nMom`,
    }),
    msg({
      from: p('Tidewell Fitness', 'studio@tidewell.example'), subject: 'Your October class schedule', date: at(7, 7, 0), focused: false,
      text: `New month, new classes! Morning flow yoga is back on Tuesdays and Thursdays at 6:30 AM, and we've added a Sunday stretch & breathe session.\n\nBook early — spots fill fast.\n\nSee you on the mat,\nTidewell Fitness`,
    }),
    msg({
      from: SAM, subject: 'Lunch next week?', date: at(9, 12, 31),
      text: `Hey, it's been ages! Are you free for lunch sometime next week? There's a new noodle place near the river that everyone keeps talking about.\n\nI'm flexible Tuesday to Thursday.\n\nSam`,
    }),
    msg({
      from: p('Maple Row Community Garden', 'garden@maplerow.example'), subject: 'Harvest potluck sign-up 🥕', date: at(12, 9, 15), focused: false,
      text: `Our end-of-season harvest potluck is coming up! Please add your dish to the sign-up sheet in the shed so we don't end up with nine pumpkin soups again.\n\nBring a chair, bring a friend.\n\nMaple Row Garden Committee`,
    }),
    msg({
      from: p('Outlook Team', 'no-reply@mail.example'), subject: 'Welcome to your new inbox', date: at(16, 8, 0),
      text: 'Everything you need to stay on top of your day is right here: mail, calendar and contacts, all in one place.', html: WELCOME,
    }),
    msg({
      from: p('Lumen & Leaf', 'care@lumenleaf.example'), subject: 'Care tips for your new monstera 🌿', date: at(22, 15, 45), focused: false,
      text: `Congratulations on your new plant!\n\nA few tips to help it settle in:\n• Bright, indirect light — no harsh afternoon sun.\n• Water when the top 3 cm of soil feel dry.\n• Wipe the leaves once a month so they can breathe.\n\nHappy growing!\nLumen & Leaf`,
    }),
    // Sent Items
    msg({
      folder: 'sent', from: ME, to: [DANIEL], subject: 'Book club pick for November', date: at(2, 21, 3),
      text: `I'd love to try "The Keeper of Gull Point" — it's been on my list forever. What do you think?`,
    }),
    msg({
      folder: 'sent', from: ME, to: [PRIYA], subject: 'Re: Onboarding numbers', date: at(6, 11, 48),
      text: `Thanks Priya — the numbers look good. I'll have comments on the slides by Wednesday.`,
    }),
    // Drafts
    msg({
      folder: 'drafts', draft: true, mode: 'new', from: ME, to: [MAYA], subject: 'Packing list for Lisbon', date: at(1, 22, 10),
      text: `Things to remember:\n- adapter plug\n- sunglasses\n- comfy walking shoes\n- `,
    }),
    // Junk
    msg({
      folder: 'junk', from: p('Prize Desk', 'winner-desk@totally-real-prizes.example'), subject: "Congratulations! You've been selected 🎉", date: at(3, 3, 12), read: false,
      text: `You have been randomly selected to receive an exclusive reward! Click the link below within 24 hours to claim your prize. Act now!!!`,
    }),
    // Archive
    msg({
      folder: 'archive', from: p('Riverbend Utilities', 'billing@riverbend-utilities.example'), subject: 'Your September statement is ready', date: at(26, 9, 0),
      text: `Your September statement is now available. Amount due: $72.18. Due date: the 15th. Thank you for paying on time!`,
    }),
  ];
  return list;
}
