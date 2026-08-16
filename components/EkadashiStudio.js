'use client';

import React, { useState, useEffect, useRef } from "react";
import {
  Copy, Check, Download, Sparkles, ChevronDown, Search, RefreshCw,
  Loader2, Film, ScrollText, Clapperboard, X, Users, Mic, Youtube, PlayCircle
} from "./ekadashi-icons";

/* ================================================================== */
/*  Ekadashi data — 24 of the year + 2 Adhik-maas                      */
/* ================================================================== */
const EKADASHIS = [
  { en: "Shravana Putrada", hi: "श्रावण पुत्रदा एकादशी", month: "Shravana", paksha: "Shukla", date: "2026-08-23", note: "Blessing of virtuous progeny" },
  { en: "Aja", hi: "अजा एकादशी", month: "Bhadrapada", paksha: "Krishna", date: "2026-09-07", note: "Removes sin and sorrow (Harishchandra)" },
  { en: "Parivartini", hi: "परिवर्तिनी एकादशी", month: "Bhadrapada", paksha: "Shukla", date: "2026-09-22", note: "Vishnu turns in his sleep (Vamana)" },
  { en: "Indira", hi: "इन्दिरा एकादशी", month: "Ashwina", paksha: "Krishna", date: "2026-10-06", note: "Liberates ancestors (King Mahijit)" },
  { en: "Papankusha", hi: "पापांकुशा एकादशी", month: "Ashwina", paksha: "Shukla", date: "2026-10-22", note: "The goad that destroys sins" },
  { en: "Rama", hi: "रमा एकादशी", month: "Kartika", paksha: "Krishna", date: "2026-11-05", note: "Great merit, removes even grave sin" },
  { en: "Prabodhini", hi: "देवउठनी (प्रबोधिनी) एकादशी", month: "Kartika", paksha: "Shukla", date: "2026-11-20", note: "Vishnu awakens, Chaturmas ends" },
  { en: "Utpanna", hi: "उत्पन्ना एकादशी", month: "Margashirsha", paksha: "Krishna", date: "2026-12-04", note: "The very origin of Ekadashi" },
  { en: "Mokshada", hi: "मोक्षदा एकादशी", month: "Margashirsha", paksha: "Shukla", date: "2026-12-20", note: "Liberation • Gita Jayanti / Vaikuntha" },
  { en: "Saphala", hi: "सफला एकादशी", month: "Pausha", paksha: "Krishna", date: "2027-01-02", note: "Makes all endeavours fruitful" },
  { en: "Pausha Putrada", hi: "पौष पुत्रदा एकादशी", month: "Pausha", paksha: "Shukla", date: "2027-01-18", note: "Boon of children, fulfils wishes" },
  { en: "Shattila", hi: "षटतिला एकादशी", month: "Magha", paksha: "Krishna", date: "2027-02-01", note: "Charity of sesame — abundance" },
  { en: "Jaya", hi: "जया एकादशी", month: "Magha", paksha: "Shukla", date: "2027-02-16", note: "Victory over sin, frees the cursed" },
  { en: "Vijaya", hi: "विजया एकादशी", month: "Phalguna", paksha: "Krishna", date: "2027-03-03", note: "Grants victory (Rama before Lanka)" },
  { en: "Amalaki", hi: "आमलकी एकादशी", month: "Phalguna", paksha: "Shukla", date: "2027-03-18", note: "Worship of the sacred amla tree" },
  { en: "Papmochani", hi: "पापमोचनी एकादशी", month: "Chaitra", paksha: "Krishna", date: "2027-04-02", note: "Release from every sin" },
  { en: "Kamada", hi: "कामदा एकादशी", month: "Chaitra", paksha: "Shukla", date: "2027-04-16", note: "Fulfils desires, frees from curses" },
  { en: "Varuthini", hi: "वरूथिनी एकादशी", month: "Vaishakha", paksha: "Krishna", date: "2027-05-02", note: "Protection and abundant merit" },
  { en: "Mohini", hi: "मोहिनी एकादशी", month: "Vaishakha", paksha: "Shukla", date: "2027-05-15", note: "Frees from delusion and sin" },
  { en: "Apara", hi: "अपरा एकादशी", month: "Jyeshtha", paksha: "Krishna", date: "2027-05-31", note: "Boundless merit, removes grave sin" },
  { en: "Nirjala", hi: "निर्जला एकादशी", month: "Jyeshtha", paksha: "Shukla", date: "2027-06-14", note: "The waterless fast — merit of all 24" },
  { en: "Yogini", hi: "योगिनी एकादशी", month: "Ashadha", paksha: "Krishna", date: "2027-06-30", note: "Cleanses sin, bestows liberation" },
  { en: "Devshayani", hi: "देवशयनी एकादशी", month: "Ashadha", paksha: "Shukla", date: "2027-07-13", note: "Vishnu's cosmic sleep begins" },
  { en: "Kamika", hi: "कामिका एकादशी", month: "Shravana", paksha: "Krishna", date: "2027-07-29", note: "Washes away sins, pleases Vishnu" },
  { en: "Padmini", hi: "पद्मिनी एकादशी", month: "Adhik Jyeshtha", paksha: "Shukla", date: "2026-05-27", adhik: true, note: "Rare leap-month Ekadashi, supreme merit" },
  { en: "Parama", hi: "परमा एकादशी", month: "Adhik Jyeshtha", paksha: "Krishna", date: "2026-06-11", adhik: true, note: "Leap-month — grants Vishnu's abode" },
];

const DETAIL_META = {
  short: { label: "Short", blurb: "Quick 90–140 word telling" },
  mid:   { label: "Mid",   blurb: "Balanced ~250-word retelling" },
  full:  { label: "Full",  blurb: "Rich, complete katha" },
};

/* ---- editable reference (from the sample script) ------------------- */
const DEFAULT_STYLE =
  "premium Pixar/Disney-grade cinematic 3D, 4K, ray-traced GI, soft SSS skin, warm golden divine light + volumetric god-rays, shallow DOF, smooth cinematic camera, film color grade, expressive appealing characters, identity locked to character sheet, family-friendly, wholesome, all characters are adults, native synced audio";
const DEFAULT_NEG =
  "no distortion, no extra fingers, no face-morph, no flicker, no watermark, no on-screen text, no photoreal humans, no child characters";
const DEFAULT_ENGINE = "Omni Flash";
const DEFAULT_NARRATOR = "warm, friendly male Hindi narrator";

const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MON_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function ymd(iso) { const [y, m, d] = iso.split("-").map(Number); return { y, m, d }; }
function fmtDate(iso) { const { y, m, d } = ymd(iso); return `${d} ${MON[m - 1]} ${y}`; }
function weekdayOf(iso) { const { y, m, d } = ymd(iso); return WDAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; }
function monthLabel(iso) { const { y, m } = ymd(iso); return `${MON_FULL[m - 1]} ${y}`; }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function sortedEkadashis() { return EKADASHIS.filter((e) => !e.adhik).slice().sort((a, b) => (a.date < b.date ? -1 : 1)); }
function nextEkadashi() { const t = todayISO(); const r = sortedEkadashis(); return r.find((e) => e.date >= t) || r[0]; }

/* ================================================================== */
/*  Claude API helper — routes through the server so the key stays      */
/*  server-side and browser CORS/CSP restrictions don't apply.          */
/* ================================================================== */
async function callClaude(system, user) {
  let lastErr;
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const res = await fetch("/api/ekadashi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, user }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "API " + res.status);
      const text = (data.text || "").trim();
      if (!text) throw new Error("empty reply");
      return text;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastErr;
}

/* ---- robust labeled-block parsing (no JSON: survives truncation, needs no escaping) ---- */
const SCENE_KEYS = { TYPE: "type", SENSITIVE: "sensitive", TITLE: "title", SCENE: "scene", CAMERA: "camera", EMOTION: "emotion", SPEAKER: "speaker", LISTENER: "listener", AUDIO: "audio", HINDI: "hindi", ENGLISH: "english" };
const CHAR_KEYS = { NAME: "name", DESC: "desc", VOICE: "voice" };
const YT_KEYS = { TITLE: "title", ALT: "titleAlt", DESC: "description", HASHTAGS: "hashtags", TAGS: "tags" };

function parseOneBlock(block, keyMap) {
  const obj = {}; let cur = null;
  for (const raw of block.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) continue;
    const m = line.match(/^\s*([A-Za-z]+)\s*:\s?(.*)$/);
    const key = m && keyMap[m[1].toUpperCase()];
    if (key) { cur = key; obj[key] = (obj[key] ? obj[key] + " " : "") + m[2]; }
    else if (cur) { obj[cur] += " " + line.trim(); }
  }
  return obj;
}
function parseRecords(text, startKey, keyMap) {
  const clean = text.replace(/```[a-z]*/gi, "").replace(/^\s*---+\s*$/gm, "\n").trim();
  const re = new RegExp("(^|\\n)\\s*(" + startKey + "\\s*:)", "gi");
  const chunks = clean.replace(re, "\n\u0000$2").split("\u0000").map((s) => s.trim()).filter(Boolean);
  return chunks.map((c) => parseOneBlock(c, keyMap)).filter((o) => Object.keys(o).length);
}
function parseScenes(text) {
  return parseRecords(text, "TYPE", SCENE_KEYS).map((o) => ({
    title: (o.title || "").trim(),
    type: /dial/i.test(o.type || "") ? "dialogue" : "narration",
    sensitive: /^(yes|true|1)/i.test((o.sensitive || "").trim()),
    scene: (o.scene || "").trim(),
    camera: (o.camera || "").trim(),
    emotion: (o.emotion || "").trim(),
    speaker: (o.speaker || "").trim(),
    listener: (o.listener || "").trim(),
    audio: (o.audio || "").trim(),
    hindi: (o.hindi || "").trim(),
    english: (o.english || "").trim(),
  })).filter((s) => s.scene && s.hindi && s.english);
}
function parseCharacters(text) {
  return parseRecords(text, "NAME", CHAR_KEYS).map((o) => ({
    name: (o.name || "").trim(), desc: (o.desc || "").trim(), voice: (o.voice || "").trim(),
  })).filter((c) => c.name && c.desc);
}
function parseYT(text) {
  const b = parseOneBlock(text.replace(/```[a-z]*/gi, "").trim(), YT_KEYS);
  const arr = (s, sep) => (s || "").split(sep).map((x) => x.trim()).filter(Boolean);
  return {
    title: (b.title || "").trim(),
    titleAlt: (b.titleAlt || "").trim(),
    description: (b.description || "").trim(),
    hashtags: arr(b.hashtags, /\s+/).map((h) => (h.startsWith("#") ? h : "#" + h)),
    tags: arr(b.tags, ","),
  };
}

const STORY_SYS = "You are a devout storyteller of the Hindu Puranic tradition, expert in Ekadashi vrat kathas as told in the Padma, Skanda, Bhavishya, Brahmavaivarta and Varaha Puranas and the Ekadashi Mahatmya. You write authentic, warm, devotional retellings meant to be read aloud.";
const SHEET_SYS = "You design locked character sheets for premium 3D-animated devotional films. You give each on-screen figure a consistent, wholesome, adult appearance and a distinct voice.";
const SCENE_SYS = "You are a film director storyboarding short devotional videos of Hindu Puranic stories for AI text-to-video generators. You return clean structured data only.";
const YT_SYS = "You are a YouTube growth specialist for a devotional (bhakti) animation channel serving Hindi-speaking audiences.";

function storyPrompt(ek, lang, detail, mode, prev) {
  const langWord = lang === "hi" ? "Hindi (Devanagari script)" : "English";
  const r = {
    hi: { short: "90–130", mid: "220–300", p1: "about 240", p2: "about 260" },
    en: { short: "110–150", mid: "260–340", p1: "about 320", p2: "about 340" },
  }[lang];
  let modeLine;
  if (mode === "single") modeLine = `Length: ${detail === "short" ? r.short : r.mid} words. Include the narrative frame (who tells it to whom), the story, and close with the phala-shruti (fruits of the fast).`;
  else if (mode === "part1") modeLine = `PART 1 of the story: ${r.p1} words covering the opening frame and first half. End mid-narrative — do NOT conclude or state the benefits yet.`;
  else modeLine = `PART 2 (conclusion): continue seamlessly from the passage below and finish, closing with the phala-shruti (fruits of the fast). Do NOT repeat earlier events.\n\n--- Story so far ---\n${prev}\n--- Continue ---`;
  return `Write the vrat katha of ${ek.en} Ekadashi (${ek.hi}), observed in ${ek.month}, ${ek.paksha} Paksha.

Language: ${langWord}.
${modeLine}

Ground it in the traditional Puranic account. Keep it devotional and vivid. Output ONLY the story prose — no title, no headings, no notes.`;
}

function sheetPrompt(ek, ctx) {
  return `From this ${ek.en} Ekadashi story, list every named person/figure that appears on screen, for a 3D-animated film's LOCKED character sheet.

STORY:
"""${ctx}"""

Format — plain text, NO JSON. One block per figure, separated by a line containing only ---. Each block:
NAME: a short ALL-CAPS label (e.g. RAJA MAHIJIT, LOMASH RISHI, PRADHAN MANTRI)
DESC: one sentence locking appearance — approx adult age, build, skin tone, hair/beard, clothing, marks (all adults, wholesome, no idols/statues)
VOICE: a short voice descriptor (e.g. deep, ancient, wise adult male voice)

Output only the blocks, no preamble.`;
}

function charLines(chars) {
  if (!chars || !chars.length) return "None provided — invent consistent ALL-CAPS names and reuse them.";
  return chars.map((c) => `${c.name} — ${c.desc}`).join("\n");
}

function scenePrompt(ek, clip, total, start, end, ctx, chars) {
  const count = end - start + 1;
  return `Storyboard a devotional video (each clip ${clip}s) telling the ${ek.en} Ekadashi katha, in premium 3D-animated-film style.

STORY (reference):
"""${ctx}"""

CHARACTERS (use these exact ALL-CAPS names, keep them consistent):
${chars}

Write scenes ${start} to ${end} (${count} scene${count > 1 ? "s" : ""}) of ${total} total, in order, continuing the arc.

Format — plain text, NO JSON. Output ${count} block${count > 1 ? "s" : ""}, separated by a line containing only ---. Each block has these labels, each on ONE line, in this exact order:
TYPE: narration OR dialogue (dialogue only if a character speaks aloud)
SENSITIVE: yes OR no (yes if it shows wrongdoing, conflict, sorrow or tension)
TITLE: a 2-4 word English title
SCENE: one sentence UNDER 45 WORDS, characters in CAPS (a short appearance note in parentheses on first appearance is fine)
CAMERA: one sentence under 20 words; for dialogue, hold on the speaker for the whole line, drift to others only after
EMOTION: a short EMOTION/BODY note for dialogue, else leave empty
SPEAKER: Narrator (V.O.) for narration, else the speaking character's name
LISTENER: who is addressed (Audience, the visitors, a character name…)
AUDIO: short music/ambience only — do NOT mention the voice
HINDI: the spoken line in natural simple Hindi (Devanagari), 1-2 sentences
ENGLISH: the same line in natural English

Keep it wholesome and family-friendly. No on-screen text. Output only the blocks — no preamble, no commentary.`;
}

function ytPrompt(ek, ctx) {
  return `Write YouTube metadata for a devotional animated short telling the ${ek.en} Ekadashi (${ek.hi}) vrat katha, narrated in Hindi.

STORY:
"""${ctx}"""

Format — plain text, NO JSON. Output exactly these labels, each starting a new line:
TITLE: one catchy title, mostly Hindi, under 90 characters, includes एकादशी
ALT: one alternate title
DESC: 3-4 sentences (Hindi + a little English) — what the katha is, its benefit, a soft subscribe nudge — all on one line
HASHTAGS: 12-15 hashtags separated by spaces (mix Hindi/English; include #Ekadashi #VratKatha)
TAGS: 12-15 plain search tags separated by commas (no #)

Output only these lines.`;
}

/* ---- assembly ----------------------------------------------------- */
function lookupVoice(sheet, speaker) {
  if (!sheet || !speaker) return "";
  const key = speaker.replace(/\s*\(V\.O\.\)\s*/i, "").trim().toUpperCase();
  const hit = sheet.find((c) => c.name && c.name.toUpperCase() === key);
  return hit ? hit.voice : "";
}
function speakerLabel(s) {
  if (s.type !== "dialogue") return "Narrator";
  return (s.speaker || "Narrator").replace(/\s*\(V\.O\.\)\s*/i, "").trim();
}
function fmtTime(sec) {
  const m = Math.floor(sec / 60), r = sec % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
function buildPrompt(s, pos, cfg, sheet) {
  const clip = cfg.clip;
  const isD = s.type === "dialogue";
  let neg = (cfg.neg || "").trim().replace(/\.$/, "");
  if (isD) neg += ", no voice swapping, no wrong-speaker audio";
  else neg += ", no worshipped idols or statues";
  if (s.sensitive) neg += ", no cruelty, no violence";
  const style = (cfg.style || "").trim().replace(/;$/, "");

  const L = [];
  L.push(`SCENE ${pos} VIDEO PROMPT  (${clip}s · ${cfg.engine})`);
  L.push(`STYLE: ${style}; NEG: ${neg}.`);
  L.push(`SCENE (over ${clip}s): ${s.scene}`);
  L.push(`CAMERA: ${s.camera}`);
  if (isD && s.emotion) L.push(`EMOTION/BODY: ${s.emotion}`);
  L.push(`AUDIO: ${(s.audio || "").replace(/[.;]\s*$/, "")}; ${isD ? "exactly one male voice." : "single narrator voice."}`);
  if (isD) {
    const v = lookupVoice(sheet, s.speaker) || s.voice || "distinct adult male voice";
    L.push(`VOICE: exactly ONE voice — ${v} (${s.speaker}). Others NON-SPEAKING and silent.`);
    L.push(`LIP-SYNC: animate only ${s.speaker}'s mouth to the full line; others' mouths stay closed.`);
    L.push(`${s.speaker} → ${s.listener || "the others"} (${s.speaker} speaks; others silent)`);
  } else {
    L.push(`VOICE: ${cfg.narratorVoice} (only voice in clip).`);
    L.push(`${s.speaker || "Narrator (V.O.)"} → ${s.listener || "Audience"}`);
  }
  L.push(`"${s.hindi}"`);
  return L.join("\n");
}
function dubScript(board, clip, key) {
  return board.map((s, i) => `[${fmtTime(i * clip)}] ${speakerLabel(s).toUpperCase()}: ${(key === "hi" ? s.hindi : s.english) || ""}`).join("\n");
}
function charSheetText(chars) {
  if (!chars.length) return "";
  return "CHARACTER SHEET — identity locked (all adults, wholesome)\n\n" +
    chars.map((c) => `${c.name} — ${c.desc}${c.voice ? "  [voice: " + c.voice + "]" : ""}`).join("\n");
}
function fmtSrt(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s},000`;
}
function srt(board, clip, key) {
  return board.map((s, i) => `${i + 1}\n${fmtSrt(i * clip)} --> ${fmtSrt((i + 1) * clip)}\n${(key === "hi" ? s.hindi : s.english) || ""}\n`).join("\n");
}
function downloadText(name, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

/* ================================================================== */
/*  Small UI pieces                                                    */
/* ================================================================== */
function CopyBtn({ text, label, small, gold }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={"copybtn" + (small ? " copybtn--sm" : "") + (gold ? " copybtn--gold" : "")}
      aria-label={label || "Copy"}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); }
        catch {
          const ta = document.createElement("textarea");
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); ta.remove();
        }
        setDone(true); setTimeout(() => setDone(false), 1400);
      }}
    >
      {done ? <Check size={small ? 13 : 15} /> : <Copy size={small ? 13 : 15} />}
      {!small && <span>{done ? "Copied" : "Copy"}</span>}
    </button>
  );
}
function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="seg" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button key={o.v} className={"seg-btn" + (value === o.v ? " is-on" : "")} aria-pressed={value === o.v} onClick={() => onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  );
}
function Stepper({ value, min, max, onChange }) {
  return (
    <div className="stepper">
      <button aria-label="Fewer scenes" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
      <span className="stepper-val">{value}</span>
      <button aria-label="More scenes" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
    </div>
  );
}
function Collapsible({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="collapse">
      <button className="collapse-h" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="collapse-t">{icon}{title}</span>
        <ChevronDown size={16} className={"picker-chev" + (open ? " up" : "")} />
      </button>
      {open && <div className="collapse-b">{children}</div>}
    </div>
  );
}
function EkadashiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef(null), inputRef = useRef(null);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  useEffect(() => {
    function onDoc(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  const today = todayISO();
  const regular = sortedEkadashis();
  const adhik = EKADASHIS.filter((e) => e.adhik);
  const nextEn = (regular.find((e) => e.date >= today) || regular[0]).en;

  const ql = q.trim().toLowerCase();
  const hay = (e) => { const { m } = ymd(e.date); return `${e.en} ${e.hi} ${e.month} ${e.paksha} ${e.note} ${fmtDate(e.date)} ${MON_FULL[m - 1]} ${weekdayOf(e.date)}`.toLowerCase(); };
  const flat = [...regular, ...adhik].filter((e) => !ql || hay(e).includes(ql));

  const groups = [];
  if (!ql) {
    let cur = null;
    for (const e of regular) { const lab = monthLabel(e.date); if (!cur || cur.label !== lab) { cur = { label: lab, items: [] }; groups.push(cur); } cur.items.push(e); }
    if (adhik.length) groups.push({ label: "Adhik Maas · leap month", items: adhik, adhik: true });
  }

  const Item = (e) => {
    const { m, d } = ymd(e.date);
    const past = !e.adhik && e.date < today;
    return (
      <button key={e.en} role="option" aria-selected={e.en === value.en}
        className={"picker-item" + (e.en === value.en ? " is-sel" : "") + (past ? " is-past" : "")}
        onClick={() => { onChange(e); setOpen(false); setQ(""); }}>
        <span className="pi-date"><b>{d}</b><span>{MON[m - 1]}</span></span>
        <span className="pi-main">
          <span className="pi-hi">{e.hi}{e.en === nextEn && <span className="pi-next">NEXT</span>}</span>
          <span className="pi-meta">{e.adhik ? "Adhik Maas · " : ""}{weekdayOf(e.date)} · {e.month} {e.paksha}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="picker" ref={boxRef}>
      <button className="picker-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="picker-cur">
          <span className="picker-hi">{value.hi}</span>
          <span className="picker-sub">{fmtDate(value.date)} · {value.month} {value.paksha}</span>
        </span>
        <ChevronDown size={18} className={"picker-chev" + (open ? " up" : "")} />
      </button>
      {open && (
        <div className="picker-pop" role="listbox">
          <div className="picker-search">
            <Search size={15} />
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, month or date…" />
            {q && <button className="picker-clear" aria-label="Clear" onClick={() => setQ("")}><X size={14} /></button>}
          </div>
          <div className="picker-count">{flat.length} of {EKADASHIS.length} kathas · sorted by date</div>
          <div className="picker-list">
            {ql
              ? (flat.length ? flat.map(Item) : <div className="picker-empty">No katha matches “{q}”.</div>)
              : groups.map((g) => (
                  <div className="picker-group" key={g.label}>
                    <div className={"picker-gh" + (g.adhik ? " adhik" : "")}>{g.label}</div>
                    {g.items.map(Item)}
                  </div>
                ))}
          </div>
          <div className="picker-note">Dates for India (IST) · a day either side is possible by region/tradition — confirm with a local panchang.</div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Main App                                                           */
/* ================================================================== */
export default function EkadashiStudio() {
  const [ek, setEk] = useState(nextEkadashi());
  const [detail, setDetail] = useState("mid");
  const [lang, setLang] = useState("both");
  const [clip, setClip] = useState(10);
  const [scenes, setScenes] = useState(42);

  // editable reference
  const [engine, setEngine] = useState(DEFAULT_ENGINE);
  const [narratorVoice, setNarratorVoice] = useState(DEFAULT_NARRATOR);
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const [neg, setNeg] = useState(DEFAULT_NEG);

  // outputs
  const [story, setStory] = useState({ hi: "", en: "" });
  const [characters, setCharacters] = useState([]);
  const [board, setBoard] = useState([]);
  const [activeLang, setActiveLang] = useState("hi");
  const [dubLang, setDubLang] = useState("hi");
  const [ytMeta, setYtMeta] = useState(null);

  // process
  const [loading, setLoading] = useState(false);
  const [ytLoading, setYtLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  const [resumeFrom, setResumeFrom] = useState(null);

  // generation memory (for resume / continue)
  const [genEk, setGenEk] = useState(ek);
  const [genCtx, setGenCtx] = useState("");

  const liveCfg = () => ({ clip, engine, style, neg, narratorVoice, ek: genEk });

  async function genStory(which) {
    if (detail !== "full") return await callClaude(STORY_SYS, storyPrompt(ek, which, detail, "single"));
    const p1 = await callClaude(STORY_SYS, storyPrompt(ek, which, detail, "part1"));
    const p2 = await callClaude(STORY_SYS, storyPrompt(ek, which, detail, "part2", p1));
    return (p1.trim() + "\n\n" + p2.trim()).trim();
  }

  async function runBoard(fromN, total, ctx, chars, cfg) {
    const BATCH = 3;
    let start = fromN;
    while (start <= total) {
      const want = Math.min(BATCH, total - start + 1);
      const end = start + want - 1;
      setStatus(`Storyboarding scene ${start}${end > start ? "–" + end : ""} of ${total}…`);
      let got;
      try {
        const raw = await callClaude(SCENE_SYS, scenePrompt(cfg.ek, cfg.clip, total, start, end, ctx, charLines(chars)));
        got = parseScenes(raw).slice(0, want);
      } catch (e) {
        setError(`Storyboard paused at scene ${start} (${e.message}). Tap resume to continue.`);
        setResumeFrom(start); return false;
      }
      if (!got.length) {
        setError(`Storyboard paused at scene ${start} (couldn't read the reply). Tap resume to continue.`);
        setResumeFrom(start); return false;
      }
      setBoard((b) => [...b, ...got]);
      start += got.length; // advance only by what actually completed — truncation self-heals
    }
    setResumeFrom(null); setStatus("");
    return true;
  }

  async function generate() {
    setLoading(true); setError(null); setResumeFrom(null);
    setStory({ hi: "", en: "" }); setCharacters([]); setBoard([]); setYtMeta(null);
    setGenEk(ek);
    const wantHi = lang === "hi" || lang === "both";
    const wantEn = lang === "en" || lang === "both";
    try {
      let hi = "", en = "";
      if (wantEn) { setStatus("Writing the English katha…"); en = await genStory("en"); setStory((s) => ({ ...s, en })); }
      if (wantHi) { setStatus("कथा लिखी जा रही है…"); hi = await genStory("hi"); setStory((s) => ({ ...s, hi })); }
      setActiveLang(wantHi ? "hi" : "en");
      const ctx = (en || hi || "").slice(0, 1800);
      setGenCtx(ctx);

      setStatus("Building the character sheet…");
      let chars = [];
      try { chars = parseCharacters(await callClaude(SHEET_SYS, sheetPrompt(ek, ctx))); } catch { chars = []; }
      setCharacters(chars);

      await runBoard(1, scenes, ctx, chars, { ...liveCfg(), ek });
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false); setStatus("");
    }
  }

  async function continueBoard() {
    setLoading(true); setError(null);
    try { await runBoard(board.length + 1, scenes, genCtx, characters, liveCfg()); }
    finally { setLoading(false); setStatus(""); }
  }

  async function genYT() {
    setYtLoading(true);
    try { setYtMeta(parseYT(await callClaude(YT_SYS, ytPrompt(genEk.en ? genEk : ek, genCtx || (story.en || story.hi))))); }
    catch (e) { setError("Couldn't generate YouTube metadata (" + e.message + ")."); }
    finally { setYtLoading(false); }
  }

  const removeScene = (i) => setBoard((b) => b.filter((_, j) => j !== i));

  const hasStory = story.hi || story.en;
  const showTabs = story.hi && story.en;
  const storyText = (activeLang === "hi" ? story.hi : story.en) || story.hi || story.en;
  const paras = (storyText || "").split(/\n\s*\n/).filter(Boolean);
  const cfg = liveCfg();
  const runtime = board.length * clip;
  const canContinue = !loading && (resumeFrom !== null || (board.length > 0 && board.length < scenes));

  function fullExport() {
    const P = [];
    P.push(`${(genEk || ek).en.toUpperCase()} EKADASHI — ${(genEk || ek).hi}`);
    P.push(`${(genEk || ek).month} · ${(genEk || ek).paksha} Paksha`);
    P.push("");
    if (story.hi) P.push("— कथा (Hindi) —", story.hi, "");
    if (story.en) P.push("— Story (English) —", story.en, "");
    if (characters.length) P.push(charSheetText(characters), "");
    if (board.length) {
      P.push(`— STORYBOARD · ${board.length} scenes · ${clip}s each · ${fmtTime(runtime)} —`, "");
      board.forEach((s, i) => { P.push(buildPrompt(s, i + 1, cfg, characters), ""); });
      P.push("— HINDI DUB SCRIPT —", dubScript(board, clip, "hi"), "");
      P.push("— ENGLISH DUB SCRIPT —", dubScript(board, clip, "en"), "");
    }
    if (ytMeta) {
      P.push("— YOUTUBE —", "TITLE: " + ytMeta.title, "ALT: " + (ytMeta.titleAlt || ""), "", ytMeta.description || "",
        "", (ytMeta.hashtags || []).join(" "), "", "TAGS: " + (ytMeta.tags || []).join(", "));
    }
    return P.join("\n");
  }
  function download() {
    downloadText(`${(genEk || ek).en.replace(/\s+/g, "-")}-Ekadashi-video-kit.txt`, fullExport());
  }
  const allPrompts = () => board.map((s, i) => buildPrompt(s, i + 1, cfg, characters)).join("\n\n");

  return (
    <div className="eks-app">
      <style>{CSS}</style>
      <div className="glow" aria-hidden="true" />

      <header className="masthead">
        <div className="mark" aria-hidden="true"><LotusMark /></div>
        <h1 className="title">Ekadashi Studio</h1>
        <div className="title-hi">एकादशी स्टूडियो</div>
        <p className="tagline">Story → character sheet → Omni Flash video prompts → dub script → YouTube — one pipeline</p>
      </header>

      <section className="console" aria-label="Controls">
        <div className="field">
          <label className="lbl">Ekadashi</label>
          <EkadashiPicker value={ek} onChange={setEk} />
        </div>

        <div className="grid2">
          <div className="field">
            <label className="lbl">Story detail</label>
            <Segmented ariaLabel="Detail" value={detail} onChange={setDetail} options={[{ v: "short", l: "Short" }, { v: "mid", l: "Mid" }, { v: "full", l: "Full" }]} />
            <span className="hint">{DETAIL_META[detail].blurb}</span>
          </div>
          <div className="field">
            <label className="lbl">Story language</label>
            <Segmented ariaLabel="Language" value={lang} onChange={setLang} options={[{ v: "hi", l: "हिन्दी" }, { v: "en", l: "English" }, { v: "both", l: "Both" }]} />
            <span className="hint">Prompts speak Hindi; English kept for subtitles/dub</span>
          </div>
        </div>

        <div className="grid2">
          <div className="field">
            <label className="lbl">Clip length</label>
            <Segmented ariaLabel="Clip length" value={clip} onChange={setClip} options={[{ v: 10, l: "10s" }, { v: 15, l: "15s" }, { v: 20, l: "20s" }]} />
          </div>
          <div className="field">
            <label className="lbl">Length / scenes</label>
            <div className="presets">
              {[6, 7, 8].map((m) => {
                const n = Math.round((m * 60) / clip);
                return <button key={m} className={"chip" + (scenes === n ? " on" : "")} onClick={() => setScenes(n)}>{m} min</button>;
              })}
            </div>
            <div className="scene-row">
              <Stepper value={scenes} min={2} max={60} onChange={setScenes} />
              <span className="hint runtime">{scenes} scenes · {fmtTime(scenes * clip)}</span>
            </div>
          </div>
        </div>

        <Collapsible title="Prompt style — reference (editable)" icon={<Clapperboard size={15} />}>
          <p className="cfg-note">Every scene prompt is wrapped with this. Edit once to restyle the whole video.</p>
          <div className="cfg-grid">
            <div className="cfg-field">
              <label>Engine label</label>
              <input value={engine} onChange={(e) => setEngine(e.target.value)} />
            </div>
            <div className="cfg-field">
              <label>Narrator voice</label>
              <input value={narratorVoice} onChange={(e) => setNarratorVoice(e.target.value)} />
            </div>
          </div>
          <div className="cfg-field">
            <label>STYLE preamble</label>
            <textarea rows={4} value={style} onChange={(e) => setStyle(e.target.value)} />
          </div>
          <div className="cfg-field">
            <label>Base negatives (NEG)</label>
            <textarea rows={3} value={neg} onChange={(e) => setNeg(e.target.value)} />
            <span className="cfg-hint">Dialogue scenes auto-add “no voice swapping, no wrong-speaker audio”; tense scenes add “no cruelty, no violence”.</span>
          </div>
          <button className="cfg-reset" onClick={() => { setEngine(DEFAULT_ENGINE); setNarratorVoice(DEFAULT_NARRATOR); setStyle(DEFAULT_STYLE); setNeg(DEFAULT_NEG); }}>
            <RefreshCw size={13} /> Reset to reference
          </button>
        </Collapsible>

        <button className="generate" onClick={generate} disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
          <span>{loading ? "Generating…" : "Generate full video kit"}</span>
        </button>
        {loading && status && <div className="status">{status}</div>}
        {error && <div className="err">{error}{resumeFrom !== null && !loading && <button className="retry" onClick={continueBoard}><RefreshCw size={13} /> Resume</button>}</div>}
      </section>

      <main className="output">
        {!hasStory && !loading && (
          <div className="empty">
            <ScrollText size={30} />
            <p className="empty-title">Your complete video kit appears here</p>
            <p className="empty-body">Pick an Ekadashi and length, then generate. You get the katha, a locked character sheet, numbered scenes in your Omni Flash prompt format, Hindi &amp; English dub scripts, and YouTube metadata — copy-ready.</p>
          </div>
        )}

        {hasStory && (
          <article className="folio">
            <div className="folio-head">
              <Divider />
              <h2 className="folio-hi">{(genEk || ek).hi}</h2>
              <div className="folio-en">{(genEk || ek).en} Ekadashi</div>
              <div className="folio-meta">{fmtDate((genEk || ek).date)} · {(genEk || ek).month} {(genEk || ek).paksha} · {DETAIL_META[detail].label} telling</div>
            </div>
            {showTabs && (
              <div className="tabs" role="tablist">
                <button role="tab" aria-selected={activeLang === "hi"} className={"tab" + (activeLang === "hi" ? " on" : "")} onClick={() => setActiveLang("hi")}>हिन्दी</button>
                <button role="tab" aria-selected={activeLang === "en"} className={"tab" + (activeLang === "en" ? " on" : "")} onClick={() => setActiveLang("en")}>English</button>
              </div>
            )}
            <div className={"folio-body" + (activeLang === "hi" ? " deva" : "")}>
              {paras.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="folio-tools">
              <CopyBtn text={storyText} label="Copy story" />
              <button className="ghost" onClick={download}><Download size={15} /> <span>Download full kit</span></button>
            </div>
          </article>
        )}

        {characters.length > 0 && (
          <section className="card cast">
            <div className="section-h"><Users size={18} /><span>Character sheet</span><span className="section-sub">identity locked · all adults</span></div>
            <div className="cast-tools"><CopyBtn small gold text={charSheetText(characters)} label="Copy character sheet" /></div>
            <div className="cast-list">
              {characters.map((c, i) => (
                <div className="cast-row" key={i}>
                  <div className="cast-name">{c.name}</div>
                  <div className="cast-desc">{c.desc}</div>
                  {c.voice && <div className="cast-voice"><Mic size={11} /> {c.voice}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {board.length > 0 && (
          <section className="storyboard">
            <div className="sb-head">
              <div className="sb-title"><Clapperboard size={18} /><span>Storyboard</span></div>
              <div className="sb-meta">{board.length} scenes · {clip}s · {fmtTime(runtime)}</div>
            </div>
            <div className="sb-tools">
              <CopyBtn gold text={allPrompts()} label="Copy all prompts" />
              <span className="sb-tip">Paste a scene block into your video tool. Dialogue scenes lock a single speaker for clean lip-sync.</span>
            </div>

            <div className="scenes">
              {board.map((s, i) => {
                const isD = s.type === "dialogue";
                return (
                  <div className="scene" key={i}>
                    <div className="scene-top">
                      <span className="scene-num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="scene-name">{s.title}</span>
                      <span className={"scene-tag " + (isD ? "tag-d" : "tag-n")}>{isD ? "Dialogue" : "Narration"}</span>
                      <span className="scene-dur"><Film size={12} /> {clip}s</span>
                      <button className="scene-del" aria-label="Remove scene" onClick={() => removeScene(i)}><X size={14} /></button>
                    </div>
                    <div className="prompt">
                      <div className="prompt-lbl"><span>Video prompt</span><CopyBtn small text={buildPrompt(s, i + 1, cfg, characters)} label="Copy this prompt" /></div>
                      <pre className="prompt-pre">{buildPrompt(s, i + 1, cfg, characters)}</pre>
                    </div>
                    {s.english && <div className="en-ref"><span>EN</span> {s.english}</div>}
                  </div>
                );
              })}
            </div>

            {canContinue && (
              <button className="continue" onClick={continueBoard} disabled={loading}>
                {loading ? <Loader2 size={16} className="spin" /> : <PlayCircle size={16} />}
                {resumeFrom !== null ? `Resume from scene ${board.length + 1}` : `Add scenes ${board.length + 1}–${scenes}`}
              </button>
            )}
          </section>
        )}

        {board.length > 0 && (
          <section className="card">
            <div className="section-h"><Mic size={18} /><span>Dub script</span><span className="section-sub">timecoded · ElevenLabs + .srt</span></div>
            <div className="dub-switch">
              <Segmented ariaLabel="Dub language" value={dubLang} onChange={setDubLang} options={[{ v: "hi", l: "हिन्दी" }, { v: "en", l: "English" }]} />
              <CopyBtn small gold text={dubScript(board, clip, dubLang)} label="Copy dub script" />
              <button className="ghost-gold sm" onClick={() => downloadText(`${(genEk || ek).en.replace(/\s+/g, "-")}-${dubLang}.srt`, srt(board, clip, dubLang))}><Download size={13} /> .srt</button>
            </div>
            <pre className="dub-pre">{dubScript(board, clip, dubLang)}</pre>
          </section>
        )}

        {board.length > 0 && (
          <section className="card">
            <div className="section-h"><Youtube size={18} /><span>Publish to YouTube</span></div>
            {!ytMeta && (
              <button className="ghost-gold" onClick={genYT} disabled={ytLoading}>
                {ytLoading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
                Generate title, description &amp; hashtags
              </button>
            )}
            {ytMeta && (
              <div className="yt">
                <div className="yt-field">
                  <div className="yt-lbl"><span>Title</span><CopyBtn small gold text={ytMeta.title} label="Copy title" /></div>
                  <p className="yt-title">{ytMeta.title}</p>
                  {ytMeta.titleAlt && <p className="yt-alt">Alt: {ytMeta.titleAlt}</p>}
                </div>
                <div className="yt-field">
                  <div className="yt-lbl"><span>Description</span><CopyBtn small gold text={ytMeta.description} label="Copy description" /></div>
                  <p className="yt-desc">{ytMeta.description}</p>
                </div>
                {ytMeta.hashtags && (
                  <div className="yt-field">
                    <div className="yt-lbl"><span>Hashtags</span><CopyBtn small gold text={(ytMeta.hashtags || []).join(" ")} label="Copy hashtags" /></div>
                    <div className="taglist">{ytMeta.hashtags.map((h, i) => <span className="tagpill" key={i}>{h}</span>)}</div>
                  </div>
                )}
                {ytMeta.tags && (
                  <div className="yt-field">
                    <div className="yt-lbl"><span>Search tags</span><CopyBtn small gold text={(ytMeta.tags || []).join(", ")} label="Copy tags" /></div>
                    <div className="taglist">{ytMeta.tags.map((h, i) => <span className="tagpill dim" key={i}>{h}</span>)}</div>
                  </div>
                )}
                <button className="ghost-gold sm" onClick={genYT} disabled={ytLoading}><RefreshCw size={13} /> Regenerate</button>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="foot">
        <p>Stories are AI retellings of traditional Puranic kathas for creative use — verify against scripture for ritual purposes.</p>
        <p className="foot-om">॥ ॐ नमो भगवते वासुदेवाय ॥</p>
      </footer>
    </div>
  );
}

/* ================================================================== */
/*  SVG motifs                                                         */
/* ================================================================== */
function LotusMark() {
  return (
    <svg viewBox="0 0 64 64" width="46" height="46" fill="none">
      <g stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 14c3 6 3 12 0 20-3-8-3-14 0-20z" fill="rgba(230,174,55,0.14)" />
        <path d="M32 20c7 3 11 8 12 16-8-2-13-6-12-16z" fill="rgba(230,174,55,0.10)" />
        <path d="M32 20c-7 3-11 8-12 16 8-2 13-6 12-16z" fill="rgba(230,174,55,0.10)" />
        <path d="M20 36c9-1 17 1 24 0-4 6-9 9-12 9s-8-3-12-9z" fill="rgba(230,174,55,0.16)" />
        <path d="M14 40c3 8 10 13 18 13s15-5 18-13" opacity=".55" />
      </g>
      <circle cx="32" cy="30" r="2" fill="var(--saffron)" />
    </svg>
  );
}
function Divider() {
  return (
    <svg className="orn" viewBox="0 0 220 18" width="180" height="16" fill="none" aria-hidden="true">
      <g stroke="var(--gold-2)" strokeWidth="1.2" strokeLinecap="round">
        <line x1="10" y1="9" x2="92" y2="9" /><line x1="128" y1="9" x2="210" y2="9" />
        <circle cx="18" cy="9" r="1.4" fill="var(--gold-2)" /><circle cx="202" cy="9" r="1.4" fill="var(--gold-2)" />
      </g>
      <path d="M110 2c4 3 4 11 0 14-4-3-4-11 0-14z" fill="rgba(230,174,55,0.22)" stroke="var(--gold)" strokeWidth="1.1" />
      <path d="M100 9c4-2 6-2 10 0-4 2-6 2-10 0z" fill="var(--gold)" opacity=".7" />
      <path d="M120 9c-4-2-6-2-10 0 4 2 6 2 10 0z" fill="var(--gold)" opacity=".7" />
    </svg>
  );
}

/* ================================================================== */
/*  Styles                                                             */
/* ================================================================== */
const CSS = `
.eks-app{
  --night-0:#150D28; --night-1:#1E1436; --night-2:#2A1D48;
  --panel:rgba(40,27,68,.72); --panel-brd:rgba(230,174,55,.22);
  --parch:#FBF4E4; --parch-2:#F4E9CF; --parch-edge:#E3D2A6;
  --ink:#39291A; --ink-2:#71603F;
  --gold:#E6AE37; --gold-2:#C98A1B; --gold-soft:#F1D08A;
  --saffron:#DB5B22; --verm:#C6402C; --plum:#8A5CC0; --plum-soft:#C7AEE8;
  --f-display:'Marcellus', Georgia, 'Times New Roman', serif;
  --f-body:'Mukta', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --f-hi:'Tiro Devanagari Hindi','Noto Sans Devanagari','Mukta', system-ui, serif;
  position:relative; min-height:100dvh; box-sizing:border-box;
  font-family:var(--f-body); color:#EFE6D2; line-height:1.6;
  background:
    radial-gradient(1100px 520px at 50% -8%, rgba(230,174,55,.16), transparent 60%),
    radial-gradient(800px 600px at 88% 8%, rgba(138,92,192,.20), transparent 55%),
    linear-gradient(180deg, var(--night-1), var(--night-0) 60%, #110A20);
  padding:26px 18px 40px; overflow-x:hidden;
}
.eks-app *{box-sizing:border-box;}
.eks-app button{font-family:inherit; cursor:pointer;}
.eks-app input, .eks-app textarea{font-family:inherit;}
.glow{position:absolute; top:-140px; left:50%; transform:translateX(-50%); width:520px; height:280px; pointer-events:none;
  background:radial-gradient(closest-side, rgba(230,174,55,.30), transparent 70%); filter:blur(18px); animation:flick 5s ease-in-out infinite;}
@keyframes flick{0%,100%{opacity:.75;} 50%{opacity:1;}}

.masthead{max-width:820px; margin:0 auto 22px; text-align:center; position:relative;}
.mark{display:flex; justify-content:center; margin-bottom:6px;}
.title{font-family:var(--f-display); font-size:clamp(30px,7vw,46px); letter-spacing:.5px; margin:0;
  background:linear-gradient(180deg,#FBE8B8,#E6AE37 55%,#C98A1B); -webkit-background-clip:text; background-clip:text; color:transparent;}
.title-hi{font-family:var(--f-hi); font-size:clamp(17px,4.4vw,23px); color:var(--gold-soft); margin-top:2px;}
.tagline{color:#C9BDA2; font-size:13px; margin:10px auto 0; max-width:560px;}

.console{max-width:820px; margin:0 auto; background:var(--panel); backdrop-filter:blur(8px); border:1px solid var(--panel-brd);
  border-radius:18px; padding:18px 16px 16px; box-shadow:0 20px 50px -28px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.05);}
.field{display:flex; flex-direction:column; gap:7px; margin-bottom:14px;}
.grid2{display:grid; grid-template-columns:1fr 1fr; gap:14px;}
.lbl{font-family:var(--f-display); font-size:12.5px; letter-spacing:1.4px; text-transform:uppercase; color:var(--gold);}
.hint{font-size:11.5px; color:#A99B7E;}
.runtime{color:var(--plum-soft);}

/* picker */
.picker{position:relative;}
.picker-btn{width:100%; display:flex; align-items:center; justify-content:space-between; gap:10px; background:rgba(21,13,40,.6);
  border:1px solid var(--panel-brd); color:#F1E7CE; border-radius:12px; padding:11px 13px; min-height:52px; text-align:left; transition:border-color .2s;}
.picker-btn:hover{border-color:rgba(230,174,55,.5);}
.picker-cur{display:flex; flex-direction:column; gap:1px; min-width:0;}
.picker-hi{font-family:var(--f-hi); font-size:18px; color:var(--gold-soft); line-height:1.2;}
.picker-sub{font-size:11.5px; color:#A99B7E; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
.picker-chev{color:var(--gold); transition:transform .25s; flex:none;}
.picker-chev.up{transform:rotate(180deg);}
.picker-pop{position:absolute; z-index:40; top:calc(100% + 6px); left:0; right:0; background:#231738; border:1px solid var(--panel-brd);
  border-radius:14px; overflow:hidden; box-shadow:0 24px 50px -20px rgba(0,0,0,.85);}
.picker-search{display:flex; align-items:center; gap:8px; padding:10px 12px; border-bottom:1px solid rgba(230,174,55,.14); color:var(--gold);}
.picker-search input{flex:1; background:transparent; border:none; outline:none; color:#F1E7CE; font-size:14px;}
.picker-search input::placeholder{color:#8F815F;}
.picker-clear{background:none; border:none; color:#9C8E70; display:flex;}
.picker-list{max-height:290px; overflow-y:auto;}
.picker-item{width:100%; display:flex; flex-direction:column; gap:2px; text-align:left; background:none; border:none; padding:10px 13px; border-bottom:1px solid rgba(255,255,255,.04); transition:background .15s;}
.picker-item:hover{background:rgba(230,174,55,.10);}
.picker-item.is-sel{background:rgba(230,174,55,.16);}
.pi-hi{font-family:var(--f-hi); font-size:16.5px; color:#F3E9D0;}
.pi-meta{font-size:11.5px; color:#A99B7E;}
.picker-empty{padding:16px; text-align:center; color:#A99B7E; font-size:13px;}
.picker-count{padding:8px 12px 5px; font-size:10.5px; letter-spacing:.6px; text-transform:uppercase; color:var(--gold-2); border-bottom:1px solid rgba(230,174,55,.1);}
.picker-note{padding:8px 12px 10px; font-size:10.5px; color:#8F815F; line-height:1.45; border-top:1px solid rgba(230,174,55,.1);}
.picker-gh{position:sticky; top:0; background:#1D1233; padding:7px 12px 5px; font-size:10px; letter-spacing:1.4px; text-transform:uppercase; color:var(--gold-soft); font-weight:700; border-bottom:1px solid rgba(230,174,55,.1); z-index:1;}
.picker-gh.adhik{color:var(--plum-soft);}
.picker-item{flex-direction:row; align-items:center; gap:11px;}
.pi-date{flex:none; width:46px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(230,174,55,.1); border:1px solid rgba(230,174,55,.22); border-radius:9px; padding:5px 0; line-height:1.02;}
.pi-date b{font-size:16px; color:var(--gold-soft); font-family:var(--f-display); font-weight:400;}
.pi-date span{font-size:9px; text-transform:uppercase; letter-spacing:.6px; color:#A99B7E;}
.pi-main{display:flex; flex-direction:column; gap:2px; min-width:0; text-align:left;}
.pi-hi{display:flex; align-items:center; gap:8px; flex-wrap:wrap;}
.pi-next{font-family:var(--f-body); font-size:8.5px; font-weight:700; letter-spacing:.8px; color:#10331E; background:linear-gradient(180deg,#7FE3A4,#3FA35B); padding:2px 6px; border-radius:20px;}
.picker-item.is-past{opacity:.5;}
.picker-item.is-past .pi-date{background:rgba(255,255,255,.04); border-color:rgba(255,255,255,.08);}

/* segmented + stepper + presets */
.seg{display:flex; gap:6px; background:rgba(21,13,40,.55); padding:4px; border-radius:12px; border:1px solid rgba(230,174,55,.14);}
.seg-btn{flex:1; min-height:40px; border:none; background:transparent; color:#CFC2A6; font-size:14px; font-weight:500; border-radius:9px; transition:all .2s; padding:6px 4px;}
.seg-btn:hover{color:#F1E7CE;}
.seg-btn.is-on{background:linear-gradient(180deg,#E6AE37,#C98A1B); color:#2A1B08; font-weight:600; box-shadow:0 4px 14px -6px rgba(230,174,55,.7);}
.presets{display:flex; gap:7px;}
.chip{flex:1; min-height:38px; border:1px solid rgba(230,174,55,.22); background:rgba(21,13,40,.5); color:#CFC2A6; border-radius:10px; font-size:13px; transition:all .18s;}
.chip:hover{border-color:rgba(230,174,55,.5); color:#F1E7CE;}
.chip.on{background:rgba(230,174,55,.16); border-color:var(--gold); color:var(--gold-soft); font-weight:600;}
.scene-row{display:flex; align-items:center; gap:12px; flex-wrap:wrap;}
.stepper{display:flex; align-items:center; gap:2px; background:rgba(21,13,40,.55); border:1px solid rgba(230,174,55,.14); border-radius:12px; padding:3px;}
.stepper button{width:40px; height:40px; border:none; background:transparent; color:var(--gold); font-size:22px; line-height:1; border-radius:9px; transition:background .15s;}
.stepper button:hover:not(:disabled){background:rgba(230,174,55,.15);}
.stepper button:disabled{opacity:.35; cursor:not-allowed;}
.stepper-val{min-width:30px; text-align:center; font-size:16px; font-weight:600; color:#F3E9D0;}

/* collapsible reference */
.collapse{border:1px solid rgba(230,174,55,.18); border-radius:12px; margin-bottom:14px; overflow:hidden; background:rgba(21,13,40,.35);}
.collapse-h{width:100%; display:flex; align-items:center; justify-content:space-between; gap:10px; background:transparent; border:none; color:var(--gold-soft); padding:12px 14px; font-size:13.5px; font-weight:500;}
.collapse-t{display:flex; align-items:center; gap:8px;}
.collapse-b{padding:4px 14px 16px; border-top:1px solid rgba(230,174,55,.12);}
.cfg-note{font-size:12px; color:#A99B7E; margin:8px 0 12px;}
.cfg-grid{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
.cfg-field{display:flex; flex-direction:column; gap:5px; margin-bottom:12px;}
.cfg-field label{font-size:11px; letter-spacing:1px; text-transform:uppercase; color:var(--gold-2); font-weight:600;}
.cfg-field input, .cfg-field textarea{background:rgba(15,9,28,.6); border:1px solid rgba(230,174,55,.2); border-radius:9px; color:#EDE2C8; font-size:13px; padding:9px 11px; outline:none; resize:vertical; line-height:1.5;}
.cfg-field input:focus, .cfg-field textarea:focus{border-color:var(--gold);}
.cfg-hint{font-size:11px; color:#9C8E70;}
.cfg-reset{display:inline-flex; align-items:center; gap:6px; background:rgba(230,174,55,.12); border:1px solid rgba(230,174,55,.25); color:var(--gold-soft); font-size:12px; padding:7px 12px; border-radius:9px;}

/* generate */
.generate{width:100%; margin-top:4px; min-height:54px; border:none; border-radius:14px; display:flex; align-items:center; justify-content:center; gap:10px;
  font-size:16px; font-weight:600; color:#2A1B08; position:relative; overflow:hidden;
  background:linear-gradient(180deg,#F3D07E,#E6AE37 45%,#C98A1B); box-shadow:0 14px 34px -14px rgba(230,174,55,.75);}
.generate::after{content:""; position:absolute; inset:0; background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%); transform:translateX(-120%); animation:sweep 3.4s ease-in-out infinite;}
@keyframes sweep{0%,55%{transform:translateX(-120%);} 80%,100%{transform:translateX(120%);}}
.generate:disabled{filter:saturate(.7) brightness(.92); cursor:wait;}
.generate:disabled::after{animation:none;}
.spin{animation:rot 1s linear infinite;}
@keyframes rot{to{transform:rotate(360deg);}}
.status{margin-top:11px; text-align:center; font-size:13px; color:var(--gold-soft); font-family:var(--f-hi);}
.err{margin-top:11px; background:rgba(198,64,44,.14); border:1px solid rgba(198,64,44,.4); color:#F0C4B8; padding:10px 12px; border-radius:11px; font-size:13px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;}
.retry{display:inline-flex; align-items:center; gap:5px; background:rgba(198,64,44,.25); border:none; color:#F6DAD1; padding:5px 10px; border-radius:8px; font-size:12.5px;}

/* output */
.output{max-width:820px; margin:22px auto 0; display:flex; flex-direction:column; gap:20px;}
.empty{text-align:center; padding:40px 22px; border:1px dashed rgba(230,174,55,.28); border-radius:18px; color:#B7A986;}
.empty svg{color:var(--gold); opacity:.85;}
.empty-title{font-family:var(--f-display); font-size:19px; color:#EBDCBB; margin:12px 0 6px;}
.empty-body{font-size:13.5px; max-width:500px; margin:0 auto; line-height:1.65;}

/* folio */
.folio{background:linear-gradient(180deg,var(--parch),var(--parch-2)); color:var(--ink); border:1px solid var(--parch-edge); border-radius:16px; padding:26px 24px 20px; position:relative; box-shadow:0 24px 60px -30px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.4); animation:rise .5s ease both;}
@keyframes rise{from{opacity:0; transform:translateY(12px);} to{opacity:1; transform:none;}}
.folio::before, .folio::after{content:""; position:absolute; width:20px; height:20px; border:2px solid rgba(201,138,27,.5); border-radius:3px;}
.folio::before{top:9px; left:9px; border-right:none; border-bottom:none;}
.folio::after{bottom:9px; right:9px; border-left:none; border-top:none;}
.folio-head{text-align:center; margin-bottom:14px;}
.orn{display:block; margin:0 auto 8px;}
.folio-hi{font-family:var(--f-hi); font-size:clamp(23px,6vw,32px); color:#7A3C10; margin:0; line-height:1.2;}
.folio-en{font-family:var(--f-display); font-size:15px; letter-spacing:2px; text-transform:uppercase; color:var(--gold-2); margin-top:3px;}
.folio-meta{font-size:12px; color:var(--ink-2); margin-top:5px;}
.tabs{display:flex; gap:8px; justify-content:center; margin:6px 0 16px;}
.tab{border:1px solid var(--parch-edge); background:rgba(255,255,255,.4); color:var(--ink-2); padding:7px 20px; border-radius:20px; font-size:14px; min-height:38px; transition:all .18s;}
.tab.on{background:#7A3C10; color:#FBF4E4; border-color:#7A3C10; font-weight:500;}
.tab:not(.on):hover{background:rgba(122,60,16,.1);}
.folio-body{font-size:16px; line-height:1.85;}
.folio-body.deva{font-family:var(--f-hi); font-size:17.5px; line-height:2;}
.folio-body p{margin:0 0 14px;}
.folio-body p:first-of-type::first-letter{font-family:var(--f-display); font-size:3.1em; line-height:.78; float:left; padding:6px 10px 0 0; color:#B5471A;}
.folio-body.deva p:first-of-type::first-letter{font-family:var(--f-hi); font-size:2.2em; padding-top:2px;}
.folio-tools{display:flex; gap:10px; flex-wrap:wrap; margin-top:16px; padding-top:14px; border-top:1px solid rgba(201,138,27,.28);}

/* generic dark card + section header */
.card{background:var(--panel); border:1px solid var(--panel-brd); border-radius:16px; padding:16px 16px 18px; box-shadow:0 18px 44px -30px rgba(0,0,0,.8); animation:rise .5s ease both;}
.section-h{display:flex; align-items:center; gap:9px; font-family:var(--f-display); font-size:19px; color:var(--gold-soft); margin-bottom:4px; flex-wrap:wrap;}
.section-h svg{color:var(--gold);}
.section-sub{font-family:var(--f-body); font-size:11px; letter-spacing:.4px; text-transform:uppercase; color:#9C8E70; margin-left:2px;}

/* cast */
.cast-tools{display:flex; justify-content:flex-end; margin:2px 0 10px;}
.cast-list{display:flex; flex-direction:column; gap:9px;}
.cast-row{background:rgba(15,9,28,.4); border:1px solid rgba(230,174,55,.14); border-left:3px solid var(--plum); border-radius:10px; padding:10px 12px;}
.cast-name{font-weight:700; font-size:13.5px; letter-spacing:.6px; color:var(--gold-soft);}
.cast-desc{font-size:13px; color:#D9CDAF; margin-top:3px; line-height:1.55;}
.cast-voice{display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:var(--plum-soft); margin-top:6px; background:rgba(138,92,192,.15); border:1px solid rgba(138,92,192,.3); padding:2px 8px; border-radius:20px;}

/* storyboard */
.storyboard{animation:rise .5s ease both;}
.sb-head{display:flex; align-items:baseline; justify-content:space-between; gap:10px; flex-wrap:wrap;}
.sb-title{display:flex; align-items:center; gap:9px; font-family:var(--f-display); font-size:22px; color:var(--gold-soft);}
.sb-title svg{color:var(--gold);}
.sb-meta{font-size:12.5px; color:var(--plum-soft);}
.sb-tools{display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin:10px 0 16px;}
.sb-tip{font-size:11.5px; color:#A99B7E; flex:1; min-width:180px;}
.scenes{display:flex; flex-direction:column; gap:14px;}
.scene{background:var(--panel); border:1px solid var(--panel-brd); border-left:3px solid var(--gold); border-radius:14px; padding:14px 15px; box-shadow:0 14px 34px -26px rgba(0,0,0,.8);}
.scene-top{display:flex; align-items:center; gap:10px; margin-bottom:12px;}
.scene-num{font-family:var(--f-display); font-size:22px; color:var(--gold); letter-spacing:1px; line-height:1;}
.scene-name{flex:1; font-size:15px; font-weight:600; color:#F3E9D0;}
.scene-tag{font-size:10.5px; letter-spacing:.5px; text-transform:uppercase; padding:3px 8px; border-radius:20px; flex:none; font-weight:600;}
.tag-d{color:var(--plum-soft); background:rgba(138,92,192,.18); border:1px solid rgba(138,92,192,.35);}
.tag-n{color:var(--gold-2); background:rgba(230,174,55,.12); border:1px solid rgba(230,174,55,.28);}
.scene-dur{display:inline-flex; align-items:center; gap:4px; font-size:11px; color:#B7A986; flex:none;}
.scene-del{background:rgba(198,64,44,.12); border:1px solid rgba(198,64,44,.3); color:#E7A99B; width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex:none; transition:background .15s;}
.scene-del:hover{background:rgba(198,64,44,.28);}
.prompt{background:rgba(12,7,22,.55); border:1px solid rgba(230,174,55,.16); border-radius:10px; padding:10px 12px;}
.prompt-lbl{display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;}
.prompt-lbl span{font-size:10.5px; letter-spacing:1.6px; text-transform:uppercase; color:var(--gold-2); font-weight:600;}
.prompt-pre{margin:0; font-size:12px; line-height:1.62; color:#D9CDAF; font-family:ui-monospace,'SF Mono',Menlo,monospace; white-space:pre-wrap; word-break:break-word;}
.en-ref{margin-top:9px; font-size:12.5px; color:#A99B7E; line-height:1.5;}
.en-ref span{display:inline-block; font-size:9.5px; font-weight:700; letter-spacing:1px; color:var(--gold-2); background:rgba(230,174,55,.12); padding:1px 6px; border-radius:5px; margin-right:6px; vertical-align:middle;}
.continue{width:100%; margin-top:14px; min-height:46px; border:1px dashed rgba(230,174,55,.4); background:rgba(230,174,55,.08); color:var(--gold-soft); border-radius:12px; display:flex; align-items:center; justify-content:center; gap:8px; font-size:14px; font-weight:500; transition:background .18s;}
.continue:hover:not(:disabled){background:rgba(230,174,55,.16);}
.continue:disabled{opacity:.7; cursor:wait;}

/* dub */
.dub-switch{display:flex; align-items:center; gap:10px; margin:8px 0 12px;}
.dub-switch .seg{flex:1;}
.dub-pre{margin:0; background:rgba(12,7,22,.55); border:1px solid rgba(230,174,55,.16); border-radius:10px; padding:12px 13px; font-size:12.5px; line-height:1.7; color:#E3D8BC; font-family:ui-monospace,'SF Mono',Menlo,monospace; white-space:pre-wrap; word-break:break-word; max-height:340px; overflow-y:auto;}

/* youtube */
.ghost-gold{display:inline-flex; align-items:center; gap:8px; background:rgba(230,174,55,.12); border:1px solid rgba(230,174,55,.35); color:var(--gold-soft); font-size:14px; font-weight:500; padding:11px 16px; border-radius:11px; min-height:46px; transition:background .18s;}
.ghost-gold:hover:not(:disabled){background:rgba(230,174,55,.2);}
.ghost-gold:disabled{opacity:.7; cursor:wait;}
.ghost-gold.sm{font-size:12.5px; padding:7px 12px; min-height:auto; margin-top:4px;}
.yt{display:flex; flex-direction:column; gap:14px; margin-top:4px;}
.yt-field{background:rgba(15,9,28,.4); border:1px solid rgba(230,174,55,.14); border-radius:11px; padding:11px 13px;}
.yt-lbl{display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:7px;}
.yt-lbl span{font-size:10.5px; letter-spacing:1.4px; text-transform:uppercase; color:var(--gold-2); font-weight:600;}
.yt-title{font-family:var(--f-hi); font-size:17px; color:#F3E9D0; margin:0; line-height:1.4;}
.yt-alt{font-size:12.5px; color:#A99B7E; margin:6px 0 0;}
.yt-desc{font-family:var(--f-hi); font-size:14.5px; color:#E3D8BC; margin:0; line-height:1.7; white-space:pre-wrap;}
.taglist{display:flex; flex-wrap:wrap; gap:6px;}
.tagpill{font-size:12px; color:var(--gold-soft); background:rgba(230,174,55,.12); border:1px solid rgba(230,174,55,.25); padding:3px 9px; border-radius:16px;}
.tagpill.dim{color:#C0B392; background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.1);}

/* buttons */
.copybtn{display:inline-flex; align-items:center; gap:6px; background:#7A3C10; color:#FBF4E4; border:none; padding:8px 14px; border-radius:9px; font-size:13px; font-weight:500; min-height:38px; transition:filter .15s;}
.copybtn:hover{filter:brightness(1.12);}
.copybtn--gold{background:linear-gradient(180deg,#E6AE37,#C98A1B); color:#2A1B08;}
.copybtn--sm{padding:5px 7px; min-height:30px; min-width:30px; justify-content:center;}
.copybtn--sm:not(.copybtn--gold){background:rgba(255,255,255,.06); color:#CFC2A6;}
.copybtn--sm:not(.copybtn--gold):hover{background:rgba(255,255,255,.14);}
.ghost{display:inline-flex; align-items:center; gap:6px; background:transparent; color:#7A3C10; border:1px solid rgba(122,60,16,.4); padding:8px 14px; border-radius:9px; font-size:13px; font-weight:500; min-height:38px; transition:background .15s;}
.ghost:hover{background:rgba(122,60,16,.1);}

/* footer */
.foot{max-width:640px; margin:36px auto 0; text-align:center; color:#8C7F63; font-size:11.5px; line-height:1.6;}
.foot-om{font-family:var(--f-hi); color:var(--gold-2); font-size:15px; margin-top:10px; opacity:.85;}

.eks-app button:focus-visible, .eks-app input:focus-visible, .eks-app textarea:focus-visible{outline:2px solid var(--gold); outline-offset:2px; border-radius:8px;}
@media (max-width:600px){
  .grid2{grid-template-columns:1fr;}
  .cfg-grid{grid-template-columns:1fr;}
  .eks-app{padding:20px 12px 34px;}
  .folio{padding:22px 16px 18px;}
}
@media (prefers-reduced-motion: reduce){
  .glow, .generate::after, .spin, .folio, .storyboard, .card{animation:none !important;}
}
`;
