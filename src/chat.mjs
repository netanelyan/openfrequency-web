// A WhatsApp conversation drawn as one phone sees it: that phone's own messages on the left in the green of a sent
// message, the other side's on the right, each with its time. Every chat on the site is made up, and says so in its
// caption.
//   who: the name in the chat's header; face: the avatar (a mark, or one letter); tag: a label on the header
//   msgs: [['me' | 'them', 'HH:MM', html], ...]; names: what a screen reader says for 'me' and 'them'
//   caption: optional; without one the chat is named by its header, and the page says it's made up nearby
export function chat({ id, who, sub = 'וואטסאפ', face, tag = 'דוגמה', caption, msgs, names }) {
  const avatar = face.startsWith('<') ? face : `<span class="ava" aria-hidden="true">${face}</span>`;
  const name = caption ? `aria-labelledby="${id}"` : `aria-label="${who}, ${sub}"`;
  return `<figure class="chat glass" ${name}>
<div class="chat-top">${avatar}<span><b>${who}</b><small>${sub}</small></span>${tag ? `<span class="tag">${tag}</span>` : ''}</div>
<ol class="msgs">
${msgs.map(([side, time, text]) => `<li class="msg ${side}"><span class="sr">${names[side]}, ${time}. </span>${text}<time aria-hidden="true">${time}</time></li>`).join('\n')}
</ol>
${caption ? `<figcaption id="${id}">${caption}</figcaption>` : ''}
</figure>`;
}
