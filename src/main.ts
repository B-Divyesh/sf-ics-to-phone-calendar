import './style.css';
import {
  displayDate,
  eventIcs,
  googleUrl,
  outlookUrl,
  parseCalendar,
  type CalendarEvent,
  type ParsedCalendar,
} from './calendar';

const element = <T extends HTMLElement>(id: string) => {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing element #${id}`);
  return found as T;
};

const input = element<HTMLInputElement>('file-input');
const textarea = element<HTMLTextAreaElement>('ics-text');
const parseButton = element<HTMLButtonElement>('parse-button');
const dropZone = element<HTMLDivElement>('drop-zone');
const dropTitle = element<HTMLHeadingElement>('drop-title');
const importPanel = element<HTMLDivElement>('import-panel');
const results = element<HTMLElement>('results');
const resultsSummary = element<HTMLParagraphElement>('results-summary');
const eventList = element<HTMLDivElement>('event-list');
const repairSummary = element<HTMLDivElement>('repair-summary');
const errorBox = element<HTMLDivElement>('error-box');
const errorText = element<HTMLParagraphElement>('error-text');
const offlineNotice = element<HTMLDivElement>('offline-notice');
const qrDialog = element<HTMLDialogElement>('qr-dialog');
const qrCanvas = element<HTMLDivElement>('qr-canvas');
const qrEventName = element<HTMLParagraphElement>('qr-event-name');
const shareAll = element<HTMLButtonElement>('share-all');

let calendar: ParsedCalendar | null = null;
let currentFilename = 'repaired-calendar.ics';
let dragDepth = 0;

function safeFilename(value: string, fallback = 'event'): string {
  const cleaned = value.normalize('NFKD').replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
  return `${cleaned.slice(0, 70) || fallback}.ics`;
}

function download(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showError(error: unknown): void {
  const message = error instanceof Error ? error.message : 'The file could not be read. Try another ICS file.';
  errorText.textContent = message;
  errorBox.hidden = false;
  errorBox.focus();
}

function clearError(): void {
  errorBox.hidden = true;
}

function svgIcon(kind: 'qr' | 'apple'): SVGElement {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  if (kind === 'qr') {
    svg.innerHTML = '<path d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm9-2h3v3h-3v-3Zm4 0h3v3h-3v-3Zm-4 4h3v3h-3v-3Zm4 0h3v3h-3v-3Z"/>';
  } else {
    svg.innerHTML = '<path d="M16.7 12.8c0-2.3 1.9-3.4 2-3.5a4.3 4.3 0 0 0-3.4-1.8c-1.5-.2-2.8.9-3.6.9s-1.8-.9-3-.9a4.5 4.5 0 0 0-3.8 2.3c-1.6 2.8-.4 6.9 1.2 9.1.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3.1-.7s1.9.7 3.1.7c1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.7-1-2.7-3.4ZM14.3 6c.6-.8 1.1-1.9 1-3-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.9-1.4Z"/>';
  }
  return svg;
}

function actionLink(label: string, href: string, className: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = `button ${className}`;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  return link;
}

function dateStamp(event: CalendarEvent): HTMLDivElement {
  const [year, month, day] = [event.start.raw.slice(0, 4), event.start.raw.slice(4, 6), event.start.raw.slice(6, 8)];
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const stamp = document.createElement('div');
  stamp.className = 'date-stamp';
  const monthLabel = document.createElement('span');
  monthLabel.className = 'month';
  monthLabel.textContent = new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' }).format(date);
  const dayLabel = document.createElement('span');
  dayLabel.className = 'day';
  dayLabel.textContent = String(Number(day));
  stamp.append(monthLabel, dayLabel);
  return stamp;
}

function eventCard(event: CalendarEvent, index: number): HTMLElement {
  const article = document.createElement('article');
  article.className = 'event-card';
  article.setAttribute('aria-labelledby', `event-title-${index}`);

  const top = document.createElement('div');
  top.className = 'event-top';
  top.append(dateStamp(event));
  const details = document.createElement('div');
  const title = document.createElement('h3');
  title.className = 'event-title';
  title.id = `event-title-${index}`;
  title.textContent = event.summary;
  const time = document.createElement('p');
  time.className = 'event-time';
  time.textContent = event.start.allDay
    ? `${displayDate(event.start)} · All day${event.rrule ? ' · Repeats' : ''}`
    : `${displayDate(event.start)} – ${displayDate(event.end)}${event.rrule ? ' · Repeats' : ''}`;
  details.append(title, time);
  if (event.location) {
    const location = document.createElement('p');
    location.className = 'event-location';
    location.textContent = `⌖ ${event.location}`;
    details.append(location);
  }
  top.append(details);
  article.append(top);

  if (event.repairs.length) {
    const repaired = document.createElement('div');
    repaired.className = 'repair-list';
    const heading = document.createElement('p');
    heading.innerHTML = '<strong>Repaired for you</strong>';
    const list = document.createElement('ul');
    event.repairs.forEach((item) => {
      const line = document.createElement('li');
      line.textContent = item;
      list.append(line);
    });
    repaired.append(heading, list);
    article.append(repaired);
  }

  const actions = document.createElement('div');
  actions.className = 'event-actions';
  const apple = document.createElement('button');
  apple.type = 'button';
  apple.className = 'button apple';
  apple.append(svgIcon('apple'), document.createTextNode('Add to Apple'));
  apple.addEventListener('click', () => download(eventIcs(event), safeFilename(event.summary)));
  actions.append(apple);
  actions.append(actionLink('Open in Google', googleUrl(event), 'google'));
  actions.append(actionLink('Open in Outlook', outlookUrl(event), 'outlook'));

  const qr = document.createElement('button');
  qr.type = 'button';
  qr.className = 'button qr-button';
  qr.title = 'Show QR code';
  qr.setAttribute('aria-label', `Show a QR code for ${event.summary}`);
  qr.append(svgIcon('qr'));
  qr.addEventListener('click', () => showQr(event));
  actions.append(qr);
  const providerNote = document.createElement('p');
  providerNote.className = 'provider-note';
  providerNote.textContent = event.rrule ? 'Apple and Google preserve the repeat rule. Outlook opens the first occurrence for review.' : 'Every service lets you review before saving.';
  actions.append(providerNote);
  article.append(actions);
  return article;
}

async function showQr(event: CalendarEvent): Promise<void> {
  qrCanvas.replaceChildren();
  qrEventName.textContent = event.summary;
  qrDialog.showModal();
  try {
    const { toCanvas } = await import('qrcode');
    const canvas = document.createElement('canvas');
    await toCanvas(canvas, googleUrl(event), { width: 224, margin: 1, color: { dark: '#17283b', light: '#ffffff' }, errorCorrectionLevel: 'M' });
    qrCanvas.append(canvas);
  } catch {
    qrCanvas.textContent = 'This event is too detailed for a reliable QR. Use the Google link instead.';
  }
}

function render(parsed: ParsedCalendar): void {
  calendar = parsed;
  clearError();
  importPanel.hidden = true;
  results.hidden = false;
  eventList.replaceChildren(...parsed.events.map(eventCard));
  const count = parsed.events.length;
  resultsSummary.textContent = `${count} ${count === 1 ? 'event' : 'events'} found. Review each one before saving.`;
  const repairCount = parsed.events.reduce((total, event) => total + event.repairs.length, 0);
  const messages = [...parsed.repairs];
  if (repairCount) messages.unshift(`${repairCount} ${repairCount === 1 ? 'issue was' : 'issues were'} repaired.`);
  repairSummary.replaceChildren();
  const icon = document.createElement('span');
  icon.className = 'message-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '✓';
  const copy = document.createElement('div');
  const strong = document.createElement('strong');
  strong.textContent = repairCount ? 'Calendar repaired and ready.' : 'Calendar checked and ready.';
  const detail = document.createElement('p');
  detail.textContent = messages.join(' ');
  copy.append(strong, detail);
  repairSummary.append(icon, copy);
  if ('share' in navigator && typeof File !== 'undefined') shareAll.hidden = false;
  results.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  results.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
}

function processText(value: string, filename?: string): void {
  try {
    const parsed = parseCalendar(value);
    currentFilename = filename ? safeFilename(filename.replace(/\.ics$/i, ''), 'repaired-calendar') : 'repaired-calendar.ics';
    render(parsed);
  } catch (error) {
    showError(error);
  }
}

async function processFile(file?: File): Promise<void> {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) return showError(new Error('That file is over 2 MB. Choose a smaller ICS file.'));
  try {
    processText(await file.text(), file.name);
  } catch {
    showError(new Error('The file could not be opened. Try saving it to Files and choosing it again.'));
  }
}

input.addEventListener('change', () => processFile(input.files?.[0]));
parseButton.addEventListener('click', () => processText(textarea.value));
textarea.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') processText(textarea.value);
});

for (const eventName of ['dragenter', 'dragover']) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    if (eventName === 'dragenter') dragDepth += 1;
    dropZone.classList.add('is-dragging');
    dropTitle.textContent = 'Drop it here';
  });
}
dropZone.addEventListener('dragleave', () => {
  dragDepth -= 1;
  if (dragDepth <= 0) {
    dragDepth = 0;
    dropZone.classList.remove('is-dragging');
    dropTitle.textContent = 'Drop your .ics here';
  }
});
dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dragDepth = 0;
  dropZone.classList.remove('is-dragging');
  dropTitle.textContent = 'Drop your .ics here';
  processFile(event.dataTransfer?.files[0]);
});

document.addEventListener('paste', (event) => {
  if (event.target === textarea) return;
  const value = event.clipboardData?.getData('text');
  if (value?.toUpperCase().includes('BEGIN:VCALENDAR')) {
    event.preventDefault();
    textarea.value = value;
    processText(value);
  }
});

element<HTMLButtonElement>('error-close').addEventListener('click', clearError);
element<HTMLButtonElement>('start-over').addEventListener('click', () => {
  calendar = null;
  input.value = '';
  textarea.value = '';
  results.hidden = true;
  importPanel.hidden = false;
  clearError();
  input.focus();
});
element<HTMLButtonElement>('download-all').addEventListener('click', () => {
  if (calendar) download(calendar.fixedIcs, currentFilename);
});
shareAll.addEventListener('click', async () => {
  if (!calendar) return;
  const file = new File([calendar.fixedIcs], currentFilename, { type: 'text/calendar' });
  try {
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: 'Repaired calendar', files: [file] });
    else download(calendar.fixedIcs, currentFilename);
  } catch (error) {
    if ((error as DOMException).name !== 'AbortError') download(calendar.fixedIcs, currentFilename);
  }
});

element<HTMLButtonElement>('qr-close').addEventListener('click', () => qrDialog.close());
qrDialog.addEventListener('click', (event) => {
  if (event.target === qrDialog) qrDialog.close();
});

function updateNetworkState(): void {
  offlineNotice.hidden = navigator.onLine;
  document.querySelectorAll<HTMLAnchorElement>('.button.google, .button.outlook').forEach((link) => {
    link.setAttribute('aria-disabled', String(!navigator.onLine));
  });
}
window.addEventListener('online', updateNetworkState);
window.addEventListener('offline', updateNetworkState);
updateNetworkState();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
