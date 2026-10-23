// Teder's real slides, shared by its door on the home page and its own page.
import { glyphOnly } from './lib.mjs';

// Opening slides Teder made for our three accounts (openfrequency-teder, private/data/dry-media), resized into
// assets/teder. The alt text is each slide's own headline.
export const SLIDES = [
  ['sheela-tova-1', '@sheela.tova', 'מה Gemini שומר ממה שאתם כותבים לו'],
  ['kav-emtza-1', '@kav.emtza', 'מסי או רונאלדו? הנה המספרים, תחליטו אתם'],
  ['shekel-leshekel-3', '@shekel.leshekel', 'כמה עולה חלב בפיקוח, לפי המחירים הרשמיים'],
  ['sheela-tova-2', '@sheela.tova', '4 דברים ש-Gemini יודע לעשות בתוך Gmail ואולי עוד לא ניסיתם'],
  ['kav-emtza-2', '@kav.emtza', 'טופ 5, איזו מדינה זכתה הכי הרבה בליגת האלופות'],
  ['shekel-leshekel-1', '@shekel.leshekel', 'כמה מס בלו משלמים על דלק, במספרים'],
  ['sheela-tova-3', '@sheela.tova', 'Projects ב-Claude, ככה זה עובד'],
  ['kav-emtza-3', '@kav.emtza', 'ליגת העל במספרים'],
  ['shekel-leshekel-2', '@shekel.leshekel', '4 ריביות של החשב הכללי, במספרים'],
];

export const slide = ([file, handle, text], lazy = true) =>
  `<img src="/teder/${file}.jpg" width="540" height="960" alt="שקופית פתיחה של ${handle}, ${text}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;

// A phone playing three of the slides like stories, two more fanned behind it, and the slide waiting for someone to
// approve it before it goes out. It repeats slides shown elsewhere on the page, so it's hidden from readers.
const REEL = [SLIDES[0], SLIDES[1], SLIDES[2]];
export const reel = `<div class="phone-sit reel-sit" aria-hidden="true">
<div class="fan">${[SLIDES[4], SLIDES[5]].map((s) => slide(s, false)).join('')}</div>
<div class="phone"><div class="reel" data-reel><span class="bars">${REEL.map(() => '<i></i>').join('')}</span>${REEL.map((s) => slide(s, false)).join('')}</div></div>
<p class="pop" data-pop><span class="wave">${glyphOnly('teder')}</span><span class="pop-h"><b>תדר</b><small>מצגת חדשה מוכנה</small></span><span class="pop-t">מחכה לאישור לפני שהיא עולה.</span></p>
</div>`;
