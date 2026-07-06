const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaChartLine, FaHandHoldingHeart, FaBullseye, FaBell,
  FaMobileAlt, FaUsers, FaLock, FaGlobe, FaCreditCard, FaGem
} = require("react-icons/fa");
const { MdOfflineBolt } = require("react-icons/md");

// ── Palette ──────────────────────────────────────────────────────────────────
const NAVY      = "1C2951";
const NAVY_MID  = "1E3160";
const NAVY_DARK = "0E1A30";
const GOLD      = "C9A135";
const GOLD_LT   = "E8C96B";
const WHITE     = "FFFFFF";
const OFF_BG    = "F8F7F4";
const MUTED     = "8A9BB5";
const CARD_BG   = "F6F5F0";
const CARD_BD   = "ECEAE3";
const BODY      = "3A4A5C";
const SUB       = "B8C5D6";

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeShadow     = () => ({ type:"outer", color:"000000", blur:10, offset:4, angle:45, opacity:0.14 });
const makeCardShadow = () => ({ type:"outer", color:"000000", blur:6,  offset:2, angle:45, opacity:0.09 });

function renderIconSvg(IconComponent, color="#000000", size=256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}
async function iconPng(IconComponent, color, size=256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function build() {
  const pres = new pptxgen();
  pres.layout  = "LAYOUT_16x9";
  pres.title   = "Kingdom Steward – QAF Demo Week";
  pres.author  = "WrightDevs";

  // Pre-bake icons
  const iHeart   = await iconPng(FaHandHoldingHeart, "#"+GOLD);
  const iChart   = await iconPng(FaChartLine,        "#"+GOLD);
  const iBull    = await iconPng(FaBullseye,          "#"+GOLD);
  const iBell    = await iconPng(FaBell,              "#"+GOLD);
  const iOffline = await iconPng(MdOfflineBolt,       "#"+GOLD);
  const iUsers   = await iconPng(FaUsers,             "#"+GOLD);
  const iLock    = await iconPng(FaLock,              "#"+GOLD);
  const iGlobe   = await iconPng(FaGlobe,             "#"+GOLD);
  const iCard    = await iconPng(FaCreditCard,        "#"+GOLD);
  const iGem     = await iconPng(FaGem,               "#"+GOLD);
  const iMobile  = await iconPng(FaMobileAlt,         "#"+GOLD);

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 1 – TITLE
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };

    // decorative circles
    s.addShape(pres.shapes.OVAL, { x:7.8,  y:-1.2, w:4.0, h:4.0, fill:{ color:GOLD, transparency:90 }, line:{ color:GOLD, width:0 } });
    s.addShape(pres.shapes.OVAL, { x:8.6,  y:-0.4, w:2.0, h:2.0, fill:{ color:GOLD, transparency:78 }, line:{ color:GOLD, width:0 } });
    s.addShape(pres.shapes.OVAL, { x:-0.6, y: 4.0, w:2.0, h:2.0, fill:{ color:GOLD, transparency:90 }, line:{ color:GOLD, width:0 } });

    // KS badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:0.65, y:0.95, w:0.9, h:0.9, fill:{ color:GOLD }, rectRadius:0.12, line:{ color:GOLD, width:0 } });
    s.addText("KS", { x:0.65, y:0.95, w:0.9, h:0.9, fontSize:20, bold:true, color:NAVY, align:"center", valign:"middle", margin:0 });

    // Title
    s.addText("Kingdom Steward", {
      x:0.65, y:2.1, w:8.0, h:0.95,
      fontSize:50, bold:true, color:WHITE, fontFace:"Cambria", align:"left", margin:0
    });
    // Tagline
    s.addText("Track Your Giving. Measure Your Faith.", {
      x:0.65, y:3.1, w:8.0, h:0.55,
      fontSize:19, color:GOLD_LT, italic:true, fontFace:"Calibri", align:"left", margin:0
    });
    // Rule
    s.addShape(pres.shapes.RECTANGLE, { x:0.65, y:3.78, w:1.4, h:0.04, fill:{ color:GOLD }, line:{ color:GOLD, width:0 } });
    // Meta
    s.addText("QAF Demo Week  ·  kistew.vercel.app  ·  Built by WrightDevs", {
      x:0.65, y:4.5, w:8.8, h:0.4,
      fontSize:11, color:MUTED, fontFace:"Calibri", align:"left", margin:0
    });

    s.addNotes("Start strong. Let the tagline land. Pause. This is faith meets fintech — and the judges who attend BLW will feel that.");
  }

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 2 – THE PROBLEM
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color:"12203D" };

    s.addText("THE PROBLEM", {
      x:0.6, y:0.32, w:8.8, h:0.42,
      fontSize:12, color:GOLD, bold:true, charSpacing:3, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("Church giving runs on faith.", {
      x:0.6, y:0.88, w:8.8, h:0.75,
      fontSize:36, bold:true, color:WHITE, fontFace:"Cambria", align:"left", margin:0
    });
    s.addText("But not on data.", {
      x:0.6, y:1.6, w:8.8, h:0.75,
      fontSize:36, bold:true, color:GOLD, fontFace:"Cambria", align:"left", margin:0
    });

    const probs = [
      { x:0.50, title:"No Tracking",      body:"Members give consistently but have zero visibility into their history, totals, or Kingdom investment value." },
      { x:3.55, title:"No Accountability", body:"Leaders manage zonal giving via WhatsApp screenshots and manual spreadsheets. No structure, no scale." },
      { x:6.60, title:"No Momentum",      body:"Without streaks, Espees milestones, or feedback loops — giving habits fade quietly." },
    ];
    probs.forEach(p => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x:p.x, y:2.62, w:2.88, h:2.68,
        fill:{ color:NAVY_MID }, rectRadius:0.14,
        line:{ color:GOLD, width:1 }, shadow:makeCardShadow()
      });
      s.addText(p.title, {
        x:p.x+0.18, y:2.8, w:2.55, h:0.42,
        fontSize:14, bold:true, color:GOLD, fontFace:"Calibri", align:"left", margin:0
      });
      s.addText(p.body, {
        x:p.x+0.18, y:3.28, w:2.55, h:1.85,
        fontSize:11.5, color:SUB, fontFace:"Calibri", align:"left", margin:0
      });
    });

    s.addNotes("Every person in this room who attends a Loveworld church has felt this gap. Don't rush. Let it sit.");
  }

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 3 – THE SOLUTION
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color:OFF_BG };

    // Left dark panel
    s.addShape(pres.shapes.RECTANGLE, {
      x:0, y:0, w:4.1, h:5.625,
      fill:{ color:NAVY }, line:{ color:NAVY, width:0 }
    });
    s.addText("THE\nSOLUTION", {
      x:0.42, y:0.75, w:3.3, h:1.6,
      fontSize:38, bold:true, color:WHITE, fontFace:"Cambria", align:"left", valign:"top", margin:0
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x:0.42, y:2.5, w:0.85, h:0.04,
      fill:{ color:GOLD }, line:{ color:GOLD, width:0 }
    });
    s.addText("A premium PWA giving every Kingdom citizen a personal giving dashboard — visible, trackable, and rewarding.", {
      x:0.42, y:2.7, w:3.25, h:1.7,
      fontSize:13.5, color:SUB, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("kistew.vercel.app", {
      x:0.42, y:4.85, w:3.3, h:0.38,
      fontSize:12, color:GOLD, bold:true, fontFace:"Calibri", align:"left", margin:0
    });

    // Right feature rows
    const items = [
      { icon:iHeart,   text:"Log every giving entry in under 10 seconds" },
      { icon:iChart,   text:"Watch your Espees value grow in real-time" },
      { icon:iBull,    text:"Create and track long-term Kingdom pledges" },
      { icon:iOffline, text:"Works fully offline — syncs automatically on reconnect" },
    ];
    items.forEach((item, i) => {
      const y = 0.65 + i * 1.15;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x:4.35, y, w:5.25, h:0.92,
        fill:{ color:WHITE }, rectRadius:0.1,
        line:{ color:CARD_BD, width:1 }, shadow:makeCardShadow()
      });
      s.addShape(pres.shapes.OVAL, {
        x:4.55, y:y+0.2, w:0.48, h:0.48,
        fill:{ color:NAVY }, line:{ color:NAVY, width:0 }
      });
      s.addImage({ data:item.icon, x:4.66, y:y+0.29, w:0.27, h:0.27 });
      s.addText(item.text, {
        x:5.18, y:y+0.16, w:4.25, h:0.58,
        fontSize:13.5, color:BODY, fontFace:"Calibri", valign:"middle", margin:0
      });
    });

    s.addNotes("Pivot point. From pain to product. The left panel anchors the brand; the rows deliver the quick wins.");
  }

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 4 – CORE FEATURES (MVP)
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color:WHITE };

    s.addText("WHAT'S BUILT", {
      x:0.5, y:0.28, w:9, h:0.38,
      fontSize:12, color:GOLD, bold:true, charSpacing:3, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("MVP Features — Live Today", {
      x:0.5, y:0.65, w:9, h:0.56,
      fontSize:28, bold:true, color:NAVY, fontFace:"Cambria", align:"left", margin:0
    });

    const feats = [
      { icon:iHeart,   title:"Giving Ledger",      desc:"Log tithes, offerings, seeds & more. Filter by type, full history, delete erroneous entries." },
      { icon:iChart,   title:"Personal Dashboard", desc:"Monthly & yearly totals, total Espees value, giving streak, and 6-month Chart.js bar chart." },
      { icon:iBull,    title:"Pledge Tracker",     desc:"Create pledges, log installments, glassmorphism progress bars, auto-reminders via cron." },
      { icon:iBell,    title:"Smart Reminders",    desc:"Supabase Edge Function: SMS via Twilio + Email via SendGrid. 7 days / 1 day / 1 day overdue." },
      { icon:iOffline, title:"Offline Sync",       desc:"Service workers + IndexedDB queue. Auto-flush on reconnect with push notification confirmation." },
      { icon:iUsers,   title:"Leader Dashboard",   desc:"Zonal Pastors see aggregated giving for their zone. Enforced by PostgreSQL Row Level Security." },
    ];

    const cols = [0.42, 3.54, 6.66];
    const rows = [1.5, 3.35];
    feats.forEach((f, i) => {
      const x = cols[i % 3];
      const y = rows[Math.floor(i / 3)];
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x, y, w:2.9, h:1.68,
        fill:{ color:CARD_BG }, rectRadius:0.13,
        line:{ color:CARD_BD, width:1 }, shadow:makeCardShadow()
      });
      s.addShape(pres.shapes.OVAL, {
        x:x+0.18, y:y+0.22, w:0.46, h:0.46,
        fill:{ color:NAVY }, line:{ color:NAVY, width:0 }
      });
      s.addImage({ data:f.icon, x:x+0.27, y:y+0.31, w:0.27, h:0.27 });
      s.addText(f.title, {
        x:x+0.78, y:y+0.2, w:1.95, h:0.42,
        fontSize:12.5, bold:true, color:NAVY, fontFace:"Calibri", align:"left", valign:"middle", margin:0
      });
      s.addText(f.desc, {
        x:x+0.18, y:y+0.74, w:2.56, h:0.84,
        fontSize:10.5, color:"5A6475", fontFace:"Calibri", align:"left", margin:0
      });
    });

    s.addNotes("Don't read the cards. Pick one — live demo the dashboard if you can. Let the grid speak.");
  }

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 5 – THE ESPEES ENGINE
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color:NAVY };

    s.addShape(pres.shapes.OVAL, { x:6.8, y:-1.2, w:4.5, h:4.5, fill:{ color:GOLD, transparency:90 }, line:{ color:GOLD, width:0 } });
    s.addShape(pres.shapes.OVAL, { x:7.8, y:-0.3, w:2.5, h:2.5, fill:{ color:GOLD, transparency:80 }, line:{ color:GOLD, width:0 } });

    s.addText("THE ESPEES ENGINE", {
      x:0.6, y:0.32, w:8.8, h:0.42,
      fontSize:12, color:GOLD, bold:true, charSpacing:3, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("Your giving, in Kingdom currency.", {
      x:0.6, y:0.82, w:7.5, h:0.75,
      fontSize:34, bold:true, color:WHITE, fontFace:"Cambria", align:"left", margin:0
    });
    s.addText("Espees is the Loveworld Kingdom currency standard.\nEvery naira logged is instantly converted and tracked.", {
      x:0.6, y:1.68, w:5.5, h:0.88,
      fontSize:14, color:SUB, fontFace:"Calibri", align:"left", margin:0
    });

    // Rate card
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x:0.6, y:2.75, w:3.9, h:1.55,
      fill:{ color:GOLD }, rectRadius:0.16,
      line:{ color:GOLD, width:0 }, shadow:makeShadow()
    });
    s.addText("FIXED EXCHANGE RATE", {
      x:0.82, y:2.9, w:3.5, h:0.35,
      fontSize:10, bold:true, color:NAVY, charSpacing:1, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("1 Esp = ₦2,050", {
      x:0.82, y:3.25, w:3.5, h:0.72,
      fontSize:32, bold:true, color:NAVY, fontFace:"Cambria", align:"left", margin:0
    });

    // Live calc card
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x:4.72, y:2.75, w:4.88, h:2.6,
      fill:{ color:NAVY_MID }, rectRadius:0.16,
      line:{ color:"2D4580", width:1 }, shadow:makeCardShadow()
    });
    s.addText("Live Calculator — updates as you type", {
      x:4.92, y:2.9, w:4.5, h:0.38,
      fontSize:11, color:GOLD, bold:true, fontFace:"Calibri", align:"left", margin:0
    });

    const rows2 = [
      { ngn:"₦10,000",  esp:"4.88 Esp" },
      { ngn:"₦50,000",  esp:"24.39 Esp" },
      { ngn:"₦205,000", esp:"100.00 Esp" },
    ];
    rows2.forEach((r, i) => {
      const y = 3.42 + i * 0.6;
      s.addText(r.ngn, { x:4.92, y, w:2.0, h:0.45, fontSize:16, bold:true, color:WHITE,     fontFace:"Calibri", align:"left",  margin:0 });
      s.addText("→",   { x:6.9,  y, w:0.5, h:0.45, fontSize:14,             color:MUTED,     fontFace:"Calibri", align:"center",margin:0 });
      s.addText(r.esp, { x:7.35, y, w:2.0, h:0.45, fontSize:16, bold:true, color:GOLD,      fontFace:"Calibri", align:"right", margin:0 });
    });

    s.addNotes("This is the unique hook. No other tool in the Loveworld ecosystem tracks giving in Espees. This is what makes KS irreplaceable.");
  }

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 6 – TRACTION
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color:OFF_BG };

    s.addText("TRACTION", {
      x:0.5, y:0.28, w:9, h:0.38,
      fontSize:12, color:GOLD, bold:true, charSpacing:3, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("Built, Deployed & Running", {
      x:0.5, y:0.65, w:9, h:0.56,
      fontSize:28, bold:true, color:NAVY, fontFace:"Cambria", align:"left", margin:0
    });

    // Stat cards
    const stats = [
      { num:"PWA",  label:"Installable\nApp" },
      { num:"7",    label:"Core\nMVP Features" },
      { num:"RLS",  label:"Row-Level\nSecurity" },
      { num:"24/7", label:"Cron Pledge\nReminders" },
    ];
    stats.forEach((st, i) => {
      const x = 0.42 + i * 2.38;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x, y:1.52, w:2.15, h:1.35,
        fill:{ color:NAVY }, rectRadius:0.13,
        line:{ color:NAVY, width:0 }, shadow:makeCardShadow()
      });
      s.addText(st.num, {
        x, y:1.6, w:2.15, h:0.68,
        fontSize:30, bold:true, color:GOLD, fontFace:"Cambria", align:"center", margin:0
      });
      s.addText(st.label, {
        x, y:2.28, w:2.15, h:0.52,
        fontSize:10, color:SUB, fontFace:"Calibri", align:"center", margin:0
      });
    });

    // Stack
    s.addText("Tech Stack", {
      x:0.5, y:3.15, w:9, h:0.38,
      fontSize:13, bold:true, color:NAVY, fontFace:"Calibri", align:"left", margin:0
    });

    const stack = [
      { label:"Vanilla JS / CSS / HTML", sub:"Zero build tools. Lightweight. Fast." },
      { label:"Supabase",                sub:"Auth, RLS, Edge Functions, pg_cron, IndexedDB sync" },
      { label:"SendGrid + Twilio",       sub:"Email & SMS pledge reminders via cron job" },
      { label:"Vercel",                  sub:"Deployed live at kistew.vercel.app" },
    ];
    stack.forEach((t, i) => {
      const x = 0.42 + (i % 2) * 4.82;
      const y = 3.65 + Math.floor(i / 2) * 0.82;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x, y, w:4.55, h:0.65,
        fill:{ color:WHITE }, rectRadius:0.09,
        line:{ color:CARD_BD, width:1 }, shadow:makeCardShadow()
      });
      s.addText(t.label, {
        x:x+0.2, y:y+0.06, w:2.8, h:0.3,
        fontSize:12, bold:true, color:NAVY, fontFace:"Calibri", align:"left", margin:0
      });
      s.addText(t.sub, {
        x:x+0.2, y:y+0.34, w:4.15, h:0.26,
        fontSize:10, color:MUTED, fontFace:"Calibri", align:"left", margin:0
      });
    });

    s.addNotes("This is not a prototype. It is live. Point to the URL. Have a phone showing the installed PWA if you can.");
  }

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 7 – MARKET
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color:"12203D" };

    s.addText("MARKET", {
      x:0.6, y:0.32, w:8.8, h:0.42,
      fontSize:12, color:GOLD, bold:true, charSpacing:3, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("Who Kingdom Steward Serves", {
      x:0.6, y:0.8, w:8.8, h:0.6,
      fontSize:30, bold:true, color:WHITE, fontFace:"Cambria", align:"left", margin:0
    });

    // Big number
    s.addText("7M+", {
      x:0.6, y:1.62, w:3.8, h:1.15,
      fontSize:76, bold:true, color:GOLD, fontFace:"Cambria", align:"left", margin:0
    });
    s.addText("Loveworld / BLW members globally", {
      x:0.6, y:2.75, w:3.8, h:0.4,
      fontSize:13, color:SUB, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("A disciplined, globally-networked giving community\nwith no dedicated digital giving tool.", {
      x:0.6, y:3.28, w:3.9, h:0.78,
      fontSize:12.5, color:"8A9BB5", italic:true, fontFace:"Calibri", align:"left", margin:0
    });

    // Segments
    const segs = [
      { title:"Members",        desc:"Any BLW member who tithes, gives offerings, or makes pledges." },
      { title:"Cell Leaders",   desc:"Track and motivate giving within their cell group." },
      { title:"Zonal Pastors",  desc:"Aggregate giving visibility across their entire zone." },
      { title:"HQ (Roadmap)",   desc:"Global consolidated dashboard for church leadership." },
    ];
    segs.forEach((seg, i) => {
      const y = 1.6 + i * 0.98;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x:5.05, y, w:4.55, h:0.84,
        fill:{ color:NAVY_MID }, rectRadius:0.1,
        line:{ color:"2D4580", width:1 }, shadow:makeCardShadow()
      });
      s.addText(seg.title, {
        x:5.25, y:y+0.06, w:2.0, h:0.3,
        fontSize:12, bold:true, color:GOLD, fontFace:"Calibri", align:"left", margin:0
      });
      s.addText(seg.desc, {
        x:5.25, y:y+0.38, w:4.15, h:0.4,
        fontSize:10.5, color:SUB, fontFace:"Calibri", align:"left", margin:0
      });
    });

    s.addNotes("The market is already warm. They already give — they just need the tool. Community adoption can happen church-by-church.");
  }

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 8 – BUSINESS MODEL
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color:WHITE };

    s.addText("BUSINESS MODEL", {
      x:0.5, y:0.28, w:9, h:0.38,
      fontSize:12, color:GOLD, bold:true, charSpacing:3, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("Simple, Faith-Aligned Pricing", {
      x:0.5, y:0.65, w:9, h:0.56,
      fontSize:28, bold:true, color:NAVY, fontFace:"Cambria", align:"left", margin:0
    });

    const tiers = [
      {
        x:0.38, name:"Free", price:"₦0", period:"forever",
        bg:CARD_BG, border:CARD_BD, nameColor:NAVY, priceColor:NAVY, subColor:"5A6475", featColor:"5A6475",
        feats:["Giving log (basic)","Espees calculator","Personal dashboard","3 active pledges"]
      },
      {
        x:3.52, name:"Premium", price:"₦1,500", period:"/ month",
        bg:NAVY, border:GOLD, nameColor:GOLD, priceColor:WHITE, subColor:SUB, featColor:"D0D8E8",
        featured:true,
        feats:["Everything in Free","Unlimited pledges","SMS & Email reminders","6-month analytics","PDF receipts (roadmap)"]
      },
      {
        x:6.66, name:"Leader", price:"₦10,000", period:"/ month",
        bg:NAVY_MID, border:GOLD, nameColor:GOLD, priceColor:WHITE, subColor:SUB, featColor:"D0D8E8",
        feats:["Everything in Premium","Zonal dashboard","Zone-wide analytics","Member management","Priority support"]
      },
    ];

    tiers.forEach(t => {
      if (t.featured) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
          x:t.x+0.65, y:1.35, w:1.6, h:0.38,
          fill:{ color:GOLD }, rectRadius:0.1, line:{ color:GOLD, width:0 }
        });
        s.addText("MOST POPULAR", {
          x:t.x+0.65, y:1.35, w:1.6, h:0.38,
          fontSize:8, bold:true, color:NAVY, align:"center", valign:"middle", margin:0
        });
      }
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x:t.x, y:1.55, w:2.9, h:3.9,
        fill:{ color:t.bg }, rectRadius:0.16,
        line:{ color:t.border, width: t.featured ? 2 : 1 },
        shadow: t.featured ? makeShadow() : makeCardShadow()
      });
      s.addText(t.name, {
        x:t.x+0.18, y:1.72, w:2.55, h:0.46,
        fontSize:18, bold:true, color:t.nameColor, fontFace:"Cambria", align:"left", margin:0
      });
      s.addText(t.price, {
        x:t.x+0.18, y:2.18, w:2.55, h:0.65,
        fontSize:30, bold:true, color:t.priceColor, fontFace:"Cambria", align:"left", margin:0
      });
      s.addText(t.period, {
        x:t.x+0.18, y:2.82, w:2.55, h:0.3,
        fontSize:10, color:t.subColor, fontFace:"Calibri", align:"left", margin:0
      });
      t.feats.forEach((f, fi) => {
        s.addText("✓  " + f, {
          x:t.x+0.18, y:3.2 + fi * 0.44, w:2.56, h:0.4,
          fontSize:10.5, color:t.featColor, fontFace:"Calibri", align:"left", margin:0
        });
      });
    });

    s.addNotes("Lead with the Free tier. Establishes trust. Then the Premium sell: ₦1,500 is less than a data bundle. Leader tier is a church infrastructure cost.");
  }

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 9 – ROADMAP
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color:OFF_BG };

    s.addText("ROADMAP", {
      x:0.5, y:0.28, w:9, h:0.38,
      fontSize:12, color:GOLD, bold:true, charSpacing:3, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("What We're Building Next", {
      x:0.5, y:0.65, w:9, h:0.56,
      fontSize:28, bold:true, color:NAVY, fontFace:"Cambria", align:"left", margin:0
    });

    // Timeline rule
    s.addShape(pres.shapes.RECTANGLE, {
      x:0.95, y:2.35, w:8.1, h:0.05,
      fill:{ color:"D4D0C5" }, line:{ color:"D4D0C5", width:0 }
    });

    const phases = [
      { x:0.5,  phase:"Phase 1", label:"Q3 2025", items:["In-app Paystack/Flutterwave giving","PDF receipts & giving statements"] },
      { x:2.95, phase:"Phase 2", label:"Q4 2025", items:["Verified Leaders provisioning","Email receipt automation"] },
      { x:5.4,  phase:"Phase 3", label:"Q1 2026", items:["Multi-currency (USD, GBP, ZAR)","Google & Apple SSO"] },
      { x:7.82, phase:"Phase 4", label:"2026+",   items:["Native iOS & Android app","Gamification & badges"] },
    ];
    phases.forEach(p => {
      // dot
      s.addShape(pres.shapes.OVAL, {
        x:p.x+0.77, y:2.2, w:0.3, h:0.3,
        fill:{ color:GOLD }, line:{ color:GOLD, width:0 }
      });
      s.addText(p.phase, {
        x:p.x, y:1.58, w:2.2, h:0.34,
        fontSize:11, bold:true, color:GOLD, fontFace:"Calibri", align:"left", margin:0
      });
      s.addText(p.label, {
        x:p.x, y:1.9, w:2.2, h:0.28,
        fontSize:9.5, color:MUTED, fontFace:"Calibri", align:"left", margin:0
      });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x:p.x, y:2.75, w:2.28, h:2.6,
        fill:{ color:WHITE }, rectRadius:0.13,
        line:{ color:CARD_BD, width:1 }, shadow:makeCardShadow()
      });
      p.items.forEach((item, ii) => {
        s.addText([
          { text:"→  ", options:{ bold:true, color:GOLD } },
          { text:item,  options:{ color:BODY } }
        ], {
          x:p.x+0.15, y:2.95 + ii * 1.05, w:2.0, h:0.88,
          fontSize:11, fontFace:"Calibri", align:"left", margin:0
        });
      });
    });

    s.addNotes("Frame it as vision with a plan. You've shipped the hardest thing already — a working product. This is the natural next steps.");
  }

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 10 – WHY NOW / THE ASK
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color:NAVY };

    s.addShape(pres.shapes.OVAL, { x:-0.8, y:3.3, w:3.8, h:3.8, fill:{ color:GOLD, transparency:90 }, line:{ color:GOLD, width:0 } });
    s.addShape(pres.shapes.OVAL, { x:8.2,  y:0.5, w:2.5, h:2.5, fill:{ color:GOLD, transparency:88 }, line:{ color:GOLD, width:0 } });

    s.addText("WHY NOW", {
      x:0.6, y:0.32, w:8.8, h:0.42,
      fontSize:12, color:GOLD, bold:true, charSpacing:3, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("The Moment Is Right.", {
      x:0.6, y:0.82, w:8.5, h:0.72,
      fontSize:36, bold:true, color:WHITE, fontFace:"Cambria", align:"left", margin:0
    });

    const reasons = [
      { num:"01", text:"Loveworld has a global, disciplined giving community with no dedicated digital giving tool." },
      { num:"02", text:"The MVP is live and functional. This isn't a concept deck — it's a deployed product." },
      { num:"03", text:"The builder has a proven track record shipping production-grade web apps at WrightDevs." },
      { num:"04", text:"QAF support accelerates the payment integration phase and drives adoption at scale." },
    ];
    reasons.forEach((r, i) => {
      const y = 1.75 + i * 0.92;
      s.addText(r.num, {
        x:0.6, y, w:0.7, h:0.72,
        fontSize:24, bold:true, color:GOLD, fontFace:"Cambria", align:"left", valign:"middle", margin:0
      });
      s.addText(r.text, {
        x:1.45, y:y+0.05, w:7.8, h:0.72,
        fontSize:13.5, color:"D0D8E8", fontFace:"Calibri", valign:"middle", margin:0
      });
    });

    s.addNotes("Make it personal here. You built this. You are the builder and the first user. That matters to investors.");
  }

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 11 – CLOSING CTA
  // ══════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color:NAVY_DARK };

    // bg circles
    s.addShape(pres.shapes.OVAL, { x:5.0, y:-0.5, w:6.0, h:6.0, fill:{ color:GOLD, transparency:93 }, line:{ color:GOLD, width:0 } });
    s.addShape(pres.shapes.OVAL, { x:6.2, y:0.8,  w:3.5, h:3.5, fill:{ color:GOLD, transparency:86 }, line:{ color:GOLD, width:0 } });

    // KS badge large
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x:0.65, y:0.75, w:1.05, h:1.05,
      fill:{ color:GOLD }, rectRadius:0.15, line:{ color:GOLD, width:0 }
    });
    s.addText("KS", {
      x:0.65, y:0.75, w:1.05, h:1.05,
      fontSize:26, bold:true, color:NAVY, align:"center", valign:"middle", margin:0
    });

    s.addText("Kingdom Steward", {
      x:0.65, y:2.05, w:7.8, h:0.88,
      fontSize:44, bold:true, color:WHITE, fontFace:"Cambria", align:"left", margin:0
    });
    s.addText("Track Your Giving. Measure Your Faith.", {
      x:0.65, y:2.98, w:7.8, h:0.52,
      fontSize:17, color:GOLD_LT, italic:true, fontFace:"Calibri", align:"left", margin:0
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x:0.65, y:3.65, w:1.1, h:0.04,
      fill:{ color:GOLD }, line:{ color:GOLD, width:0 }
    });

    s.addText([
      { text:"kistew.vercel.app", options:{ bold:true, color:GOLD } },
      { text:"   ·   Built by WrightDevs", options:{ color:MUTED } },
    ], {
      x:0.65, y:3.88, w:8.5, h:0.48,
      fontSize:14, fontFace:"Calibri", align:"left", margin:0
    });

    s.addText("Questions?", {
      x:0.65, y:4.55, w:8.5, h:0.42,
      fontSize:13, color:"6A7A90", italic:true, fontFace:"Calibri", align:"left", margin:0
    });

    s.addNotes("End with silence. Close the deck. Say: 'Kingdom Steward is live. I built it. I'm ready to scale it.'");
  }

  // Write
  await pres.writeFile({ fileName:"C:/Users/DELL/Kingdom steward/kingdom-steward-qaf-pitch.pptx" });
  console.log("✅ Done: C:/Users/DELL/Kingdom steward/kingdom-steward-qaf-pitch.pptx");
}

build().catch(err => { console.error("❌", err); process.exit(1); });
