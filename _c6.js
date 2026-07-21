
/* ============================================================
   BOLD AI — coverage verification gates the rest of setup
   ============================================================ */
const PROFILE = {
  name:"Carol", planName:"", visitCost:"a $0 copay",
  glp1Pathway:"bridge", bridgeCopay:"$50 a month",
  provider:"Dr. Desai", apptProposed:"Mon, Nov 3 · 9:00am",
  program:"Bold doctor-supervised GLP-1 weight loss program"
};
let MODE = "new";            // becomes "known" once coverage is confirmed
let coverageConfirmed = false;
let intakeComplete = false;
let chatStarted = false;
let chatFromInbox = false;
const WIREFRAMES_URL = "https://izabela-del.github.io/prototype-test/Bold-Wireframes.html";
const CHECK = `<svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.2 7.5L11 1" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const READY = { label:"Book my first visit", go:"book" };

const NODES = {

  /* ---------- COVERAGE VERIFICATION (the gate) ---------- */
  coverageStart(){
    return {
      text:["Let's confirm your insurance — it's the one thing we need to get your first visit covered.",
            "Which type of insurance do you have?"],
      sugg:[
        {label:"Medicare", key:"Original — Part A & B", go:"covMedicare", collect:true},
        {label:"Medicare Advantage", key:"Private plan — UnitedHealthcare, Humana…", go:"covAdvantage", collect:true},
        {label:"None of the above / not sure", go:"covNone", collect:true}
      ]
    };
  },
  covAdvantage(){
    return {
      text:["Great — Medicare Advantage plans are usually in-network. Which carrier is on your card?"],
      sugg:[
        {label:"UnitedHealthcare", go:"cov:carrier:UnitedHealthcare", collect:true},
        {label:"Humana", go:"cov:carrier:Humana", collect:true},
        {label:"Aetna", go:"cov:carrier:Aetna", collect:true},
        {label:"Blue Cross Blue Shield", go:"cov:carrier:Blue Cross Blue Shield", collect:true},
        {label:"Wellpoint", go:"cov:carrier:Wellpoint", collect:true},
        {label:"Another carrier", go:"cov:carrier:", collect:true}
      ]
    };
  },
  covMedicare(){ return NODES.coverageDone("Medicare"); },
  covNone(){
    return {
      text:["No problem — your Care Coordinator can confirm your coverage with you in just a couple of minutes.",
            "You can reach them at 424-577-5266. I can still get the rest of your setup started now."],
      sugg:[{label:"Start my setup anyway", go:"cov:carrier:", collect:true},{label:"I found my card", go:"coverageStart"}]
    };
  },
  coverageDone(plan){
    coverageConfirmed = true; MODE = "known";
    let line, verified;
    if(plan==="Medicare"){ PROFILE.planName="Medicare"; verified="Medicare"; line="Bold is in-network with Medicare, so your first visit is covered — and most members pay $0."; }
    else if(!plan){ PROFILE.planName="your plan"; verified="Coverage on file"; line="Your Care Coordinator will confirm the details, but most Bold members pay $0 for their first visit."; }
    else { PROFILE.planName=plan; verified=plan; line=`Bold is in-network with your ${plan} plan, so your first visit is a $0 copay.`; }
    return {
      text:[`Good news — ${line}`],
      verified:`<b>${verified}</b> — visit covered`,
      why:"That's the most important step done. Your coverage is now on file, so you'll never be asked to enter it again.",
      callout:"I've unlocked the rest of your setup — a couple of quick consents and your intake questions.",
      sugg:[{label:"Do my intake now", go:"intakeStart"},{label:"Back to my checklist", go:"nav:home"},{label:"Ask another question", go:"menu"}]
    };
  },

  /* ---------- INTAKE ---------- */
  intakeStart(){
    return {
      text:[`Let's finish your weight-management intake, ${PROFILE.name}. It's just a couple of quick questions, and I already have your coverage on file — so nothing to repeat.`,
            `Your visit is confirmed at ${PROFILE.visitCost}. Ready to run through the rest?`],
      sugg:[{label:"Yes, let's do it", go:"intakeQ"},{label:"What will this cost me?", go:"cost"},{label:"I have a question first", go:"menu"}]
    };
  },
  intakeQ(){
    return {
      text:["Great. Most of your health history came over from sign-up, so I just need to confirm one thing.",
            "Since you signed up, any new hospital stays, new medications, or big changes to your health?"],
      sugg:[{label:"No changes", go:"intakeDone", collect:true},{label:"Yes, something changed", go:"intakeChanged", collect:true}]
    };
  },
  intakeDone(){
    intakeComplete = true;
    return {
      text:["Perfect — that's your intake complete. ✓","That was the last form standing between you and your visit, so I can take it off hold. Last step is confirming your time."],
      callout:"Back on your home screen, your intake now shows as done.",
      sugg:[{label:`Confirm ${PROFILE.apptProposed}`, go:"booked", collect:true},{label:"Pick a different time", go:"book"},{label:"Back to my checklist", go:"nav:home"}]
    };
  },
  intakeChanged(){
    intakeComplete = true;
    return {
      text:["Thanks for telling me — I've flagged it so your provider can review it with you on the call. Nothing you need to do now.","That completes your intake. ✓ Ready to confirm your visit?"],
      sugg:[{label:`Confirm ${PROFILE.apptProposed}`, go:"booked", collect:true},{label:"Pick a different time", go:"book"},{label:"Back to my checklist", go:"nav:home"}]
    };
  },

  /* ---------- COST ---------- */
  cost(){
    if(MODE==="known"){
      const planTxt = PROFILE.planName==="your plan" ? "your plan" : `your ${PROFILE.planName}`;
      return {
        text:[`You're all set on cost, ${PROFILE.name} — ${planTxt==="your plan"?"your plan covers":planTxt+" plan covers"} this visit at <b>${PROFILE.visitCost}</b>. That's already confirmed.`],
        why:`Bold is in-network with ${planTxt} plan, so virtual visits with a Bold provider are $0. Your Care Coordinator bills your plan directly.`,
        sugg:[{label:"What about the medication cost?", go:"medCost"},{label:"What if I have secondary insurance?", go:"secondary"}, READY]
      };
    }
    return { text:["Happy to help with cost. First, let's confirm which plan you have."], sugg:[{label:"Confirm my insurance", go:"coverageStart"}] };
  },
  secondary(){
    return { text:["Many members have extra coverage — a Medigap plan, or a spouse's or employer plan.","That coverage often picks up any remaining balance. Your Care Coordinator confirms this before your visit, so you'll know your exact cost with no surprises."],
      sugg:[READY, {label:"Ask something else", go:"menu"}] };
  },
  medCost(){
    return {
      text:[`If you and your provider decide a GLP-1 is right for you, it goes through the Medicare Bridge program — a flat <b>${PROFILE.bridgeCopay}</b>.`],
      pay:{visit:{k:"Initial visit", v:"$0", s:"out of pocket"}, med:{k:"GLP-1 (if prescribed)", v:"$50", s:"monthly copay"}},
      why:"The $50 Bridge copay does not count toward your Part D deductible or out-of-pocket maximum. Your provider handles all the paperwork.",
      sugg:[{label:"Which medications are covered?", go:"meds"},{label:"What if I don't want medication?", go:"noMed"}, READY]
    };
  },

  /* ---------- GLP-1 ---------- */
  glp1(){
    return {
      text:[`From what we have on file, you look like a strong candidate for the ${PROFILE.program}, through the Medicare Bridge at a flat <b>${PROFILE.bridgeCopay}</b>.`],
      pay:{visit:{k:"Initial visit", v:"$0", s:"out of pocket"}, med:{k:"GLP-1 (if prescribed)", v:"$50", s:"monthly copay"}},
      why:"The Bridge is for members with a BMI of 27+ and a qualifying condition, with no diagnosis that would route to Part D instead. Your provider confirms this on your visit.",
      callout:"You and your provider decide together. Nothing is prescribed without your understanding and agreement.",
      sugg:[{label:"Which medications are covered?", go:"meds"},{label:"How does the $50 Bridge work?", go:"bridge"},{label:"What if I don't want medication?", go:"noMed"}]
    };
  },
  meds(){
    return { text:["The covered GLP-1 medications are Foundayo (a pill), Wegovy (injection or tablet), and Zepbound (KwikPen).","You and your provider choose what's right for you — or whether medication is part of your plan at all."],
      sugg:[{label:"How does the $50 Bridge work?", go:"bridge"},{label:"What if I don't want medication?", go:"noMed"}, READY] };
  },
  bridge(){
    return { text:["The Medicare GLP-1 Bridge started July 1, 2026. It gives eligible members covered GLP-1 medication for weight management, for a flat $50 a month."],
      why:"That $50 does not count toward your Part D deductible or out-of-pocket maximum. Your Bold provider handles all the authorizations and paperwork.",
      sugg:[{label:"Which medications are covered?", go:"meds"}, READY] };
  },
  noMed(){
    return { text:["That's completely fine — many members choose that.","We focus on the lifestyle side of weight loss: nutrition and movement that help you lose fat and build strength. You can talk it through with your provider, with no pressure either way."],
      sugg:[{label:"Tell me about the program", go:"program"}, READY] };
  },

  /* ---------- VISIT + BOOK ---------- */
  visit(){
    return { text:["Your first visit is a 45-minute video call with your Bold provider, right from home — no travel and no waiting room.","Here's how it works:"],
      steps:["We email you a Zoom link before your appointment.","At your time, tap the link — it opens the video call.","Keep your phone nearby. If Zoom acts up, your provider can call you as a backup."],
      callout:"Want a quick 2-minute test so you feel ready? I can walk you through it, one step at a time.",
      sugg:[READY, {label:"Do a Zoom test", go:"zoomTest"},{label:"What should I have ready?", go:"prep"}] };
  },
  book(){
    return { text:["Wonderful — let's get you scheduled.",`Based on your goals, <b>${PROFILE.provider}</b> looks like a great fit. I already have your insurance and contact details on file, so there's nothing to spell out.`,"Here are the next openings:"],
      sugg:[{label:`Confirm ${PROFILE.apptProposed}`, go:"booked", collect:true},{label:"Thursday, 10:00 AM", go:"booked", collect:true},{label:"A different day", go:"booked", collect:true}] };
  },
  booked(){
    return { text:["You're all set. You'll get an email with your Zoom link and a reminder before the visit.","You can call or text 424-577-5266 anytime with questions. We're glad you're here."],
      sugg:[{label:"Back to my checklist", go:"nav:home"},{label:"Ask another question", go:"menu"}] };
  },
  zoomTest(){
    return { text:["Wonderful. When you're ready, I'll send a test link to your email and stay with you through each step — nothing to figure out on your own.","There's no rush. We can do it now or closer to your appointment."],
      sugg:[READY, {label:"Ask something else", go:"menu"}] };
  },
  prep(){
    return { text:["Not much at all — just your phone or computer, a quiet spot, and a list of any questions on your mind.","Your provider handles the rest."],
      sugg:[{label:"How does the visit work?", go:"visit"},{label:"Ask something else", go:"menu"}] };
  },

  /* ---------- PROGRAM ---------- */
  program(){
    return { text:["Bold is a weight program built for adults over 65. The goal is to lose fat while keeping your muscle and strength — so you stay strong and independent.","Your provider looks at your whole health, then builds a personal Action Plan: nutrition, movement, and medication if it's the right fit for you."],
      callout:"We go beyond just a number on the scale, and we work alongside your regular doctor — not instead of them.",
      sugg:[{label:"How is this different from my PCP?", go:"pcp"},{label:"Am I eligible for medication?", go:"glp1"}, READY] };
  },
  pcp(){
    return { text:["Your primary care doctor can prescribe medication, but usually doesn't have time to guide the lifestyle side — the nutrition, the side effects, the long-term plan.","Bold fills that gap and coordinates with your doctor, so you have one connected plan for losing weight safely."],
      sugg:[READY, {label:"Tell me more about the program", go:"program"}] };
  },

  menu(){
    const base=[{label:"What will this cost me?", go:"cost"},{label:"Am I eligible for medication?", go:"glp1"},{label:"How does the video visit work?", go:"visit"}];
    if(!coverageConfirmed) base.unshift({label:"Confirm my insurance", go:"coverageStart"});
    else base.push({label:"Book my first visit", go:"book"});
    return { text:["Of course — what would you like to know?"], sugg:base };
  },
  escalate(){
    return { text:["I want to make sure you get the right answer on this one, so I'll pass you to a real person on your care team.","You can reach your Care Coordinator at 424-577-5266 — call or text. They'll follow up quickly."],
      sugg: NODES.menu().sugg };
  }
};

function resolve(go){
  if(go.startsWith("cov:carrier:")) return NODES.coverageDone(go.slice(12));
  if(NODES[go]) return NODES[go]();
  return NODES.escalate();
}
function routeText(t){
  const s=t.toLowerCase(); const has=(...w)=>w.some(x=>s.includes(x));
  if(has("insurance","coverage","covered","in-network","carrier","medicare","medicaid","member id","plan")) return coverageConfirmed ? "cost" : "coverageStart";
  if(has("cost","price","pay","copay","co-pay","afford","expensive","much","$","deductible")) return "cost";
  if(has("glp","ozempic","wegovy","zepbound","mounjaro","medication","medicine","drug","shot","injection","eligible","qualify","bridge")) return "glp1";
  if(has("book","schedule","sign up","get started","opening","ready to book")) return "book";
  if(has("zoom","video","visit","appointment","call","download","telehealth","virtual","in person","in-person","office","ready")) return "visit";
  if(has("what is bold","program","muscle","strength","pcp","doctor","how does bold","difference","intake")) return "program";
  return "escalate";
}

/* ===== chat render ===== */
const thread=document.getElementById("thread");
const ta=document.getElementById("ta");
const sendBtn=document.getElementById("send");
const topicsBtn=document.getElementById("topics");

function esc(s){return s.replace(/&(?!amp;|lt;|gt;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function rich(s){return esc(s).replace(/&lt;b&gt;/g,"<b>").replace(/&lt;\/b&gt;/g,"</b>");}
function bubbleHTML(m){
  let h=m.text.map(p=>`<p>${rich(p)}</p>`).join("");
  if(m.verified) h+=`<div class="verified"><span class="vb">${CHECK}</span><span class="vt">${rich(m.verified)}</span></div>`;
  if(m.why) h+=`<div class="why"><b>Here's why:</b> ${rich(m.why)}</div>`;
  if(m.pay) h+=`<div class="pay"><div class="ph">What you'll pay</div><div class="pb">`+
    `<div class="pcol"><div class="pk">${esc(m.pay.visit.k)}</div><div class="pv">${esc(m.pay.visit.v)}</div><div class="ps">${esc(m.pay.visit.s)}</div></div>`+
    `<div class="pcol"><div class="pk">${esc(m.pay.med.k)}</div><div class="pv">${esc(m.pay.med.v)}</div><div class="ps">${esc(m.pay.med.s)}</div></div></div></div>`;
  if(m.steps) h+=`<ol class="steps">${m.steps.map(s=>`<li>${rich(s)}</li>`).join("")}</ol>`;
  if(m.callout) h+=`<div class="callout">&#9432;&nbsp;<span>${rich(m.callout)}</span></div>`;
  return h;
}
function addBot(m){
  const row=document.createElement("div"); row.className="row bot";
  row.innerHTML=`<div class="who">Bold AI</div><div class="bubble">${bubbleHTML(m)}</div>`;
  if(m.sugg && m.sugg.length){
    const s=document.createElement("div"); s.className="sugg";
    m.sugg.forEach(p=>{ const b=document.createElement("button"); b.className="pill"+(p.collect?" collect":"");
      b.innerHTML=esc(p.label)+(p.key?`<span class="k">${esc(p.key)}</span>`:""); b.onclick=()=>choose(p); s.appendChild(b); });
    row.appendChild(s);
  }
  thread.appendChild(row); scroll();
}
function addMe(text){ const row=document.createElement("div"); row.className="row me"; row.innerHTML=`<div class="bubble">${esc(text)}</div>`; thread.appendChild(row); scroll(); }
function typing(){ const row=document.createElement("div"); row.className="row bot"; row.id="typing"; row.innerHTML=`<div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div>`; thread.appendChild(row); scroll(); }
function untype(){ const t=document.getElementById("typing"); if(t) t.remove(); }
function scroll(){ requestAnimationFrame(()=>{ thread.scrollTop=thread.scrollHeight; }); }
function choose(p){ if(p.go==="nav:home"){ showPage("page-home"); return; } addMe(p.label); go(p.go); }
function go(id){ typing(); setTimeout(()=>{ untype(); addBot(resolve(id)); },460); }
function sendText(){ const t=ta.value.trim(); if(!t) return; addMe(t); ta.value=""; ta.style.height="auto"; sendBtn.disabled=true; const id=routeText(t); typing(); setTimeout(()=>{ untype(); addBot(resolve(id)); },500); }

function knownCardHTML(){
  const planLabel = PROFILE.planName==="your plan" ? "Confirmed" : PROFILE.planName;
  return `<div class="known-card">
    <div class="kh"><span class="badge">${CHECK}</span>What Bold already has for you</div>
    <div class="kgrid">
      <div class="krow"><span class="kk">Coverage</span><span class="kv">${planLabel} · $0 visit</span></div>
      <div class="krow"><span class="kk">Medication</span><span class="kv">Bridge eligible · ${PROFILE.bridgeCopay}</span></div>
      <div class="krow"><span class="kk">Provider match</span><span class="kv">${PROFILE.provider} · ready to book</span></div>
    </div>
    <p class="known-note">I use these so you never have to repeat yourself.</p></div>`;
}
function greet(){
  thread.innerHTML="";
  if(coverageConfirmed){
    const c=document.createElement("div"); c.innerHTML=knownCardHTML(); thread.appendChild(c.firstChild);
    addBot({ text:[`Hi ${PROFILE.name}, I'm Bold AI, your care coordinator. Your coverage is confirmed and on file, so I can give you real answers — not guesses.`,"What's on your mind? Tap a topic below, or type your own question anytime."], sugg: NODES.menu().sugg });
  } else {
    addBot({ text:[`Hi ${PROFILE.name}, I'm Bold AI, your care coordinator.`,"Before anything else, let's confirm your insurance so your visit is covered. You can also ask me anything along the way."], sugg:[{label:"Confirm my insurance", go:"coverageStart"},{label:"Why do you need this?", go:"whyInsurance"},{label:"How does the visit work?", go:"visit"}] });
  }
}
NODES.whyInsurance = function(){
  return { text:["Good question. Confirming your plan lets us show your real cost up front — most Bold members pay $0 — and bill your plan directly, so there are no surprise bills later.","It's the one thing we need before booking your visit."],
    sugg:[{label:"OK, confirm my insurance", go:"coverageStart"},{label:"How does the visit work?", go:"visit"}] };
};

/* ===== inbox ===== */
const inbox=document.getElementById("inbox");
function convData(){
  const aiPreview = coverageConfirmed ? `Coverage confirmed — ask me anything, ${PROFILE.name}.` : "First, let's confirm your insurance to cover your visit.";
  return [
    { id:"ai", av:'<div class="av ai"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" fill="#fff"/><circle cx="18.5" cy="17.5" r="2.2" fill="#fff"/></svg></div>',
      name:"Bold AI", ai:true, role:"Care Coordinator · instant answers", preview:aiPreview, time:"now", unread:!coverageConfirmed },
    { id:"team", av:'<div class="av team"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="#fff" stroke-width="1.6"/><circle cx="16.5" cy="10" r="2.4" stroke="#fff" stroke-width="1.6"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M15 19c0-2 .8-3.6 2.2-4.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg></div>',
      name:"Bold Care Team", role:"Nurses & coordinators · Mon–Fri, 8–6", preview:"We'll confirm your coverage before your visit.", time:"9:12 AM", unread:false },
    { id:"doc", av:'<div class="av doc">MD</div>',
      name:"Dr. Mitul S. Desai, MD", role:"Your Bold provider", preview:"Looking forward to meeting you at your first visit.", time:"Fri", unread:false }
  ];
}
function renderInbox(){
  inbox.innerHTML="";
  convData().forEach(c=>{
    const row=document.createElement("div"); row.className="conv";
    row.innerHTML = c.av + `<div class="mid"><div class="top"><div class="nm">${c.name}${c.ai?' <span class="aitag">AI</span>':''}</div><div class="tm">${c.time}</div></div><div class="rl">${c.role}</div><div class="pv">${c.preview}</div></div>` + (c.unread?'<div class="unread"></div>':'');
    row.onclick=()=>openConv(c.id);
    inbox.appendChild(row);
  });
  const note=document.createElement("div"); note.className="inbox-note";
  note.innerHTML="Bold AI answers instantly, any hour. For anything clinical, it hands you to your care team or doctor.";
  inbox.appendChild(note);
}

/* ===== simple threads ===== */
const SIMPLE = {
  team:{ av:'<div class="av team"><svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="#fff" stroke-width="1.6"/><circle cx="16.5" cy="10" r="2.4" stroke="#fff" stroke-width="1.6"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M15 19c0-2 .8-3.6 2.2-4.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg></div>',
    name:"Bold Care Team", role:"Nurses & coordinators",
    msgs:[`Hi ${PROFILE.name}, this is Maria from the Bold Care Team. We'll confirm your coverage and cost before your visit — message us here anytime.`],
    lock:"Concept screen — a real coordinator replies within 1 business day." },
  doc:{ av:'<div class="av doc">MD</div>', name:"Dr. Mitul S. Desai, MD", role:"Your Bold provider",
    msgs:[`Hi ${PROFILE.name}, I'm Dr. Desai. I'll see you at your first visit. Feel free to leave any questions here beforehand.`],
    lock:"Concept screen — your provider replies between visits." }
};
function openSimple(kind){
  const d=SIMPLE[kind];
  document.getElementById("simple-id").innerHTML = d.av + `<div><div class="name">${d.name}</div><div class="role">${d.role}</div></div>`;
  const st=document.getElementById("simple-thread"); st.innerHTML="";
  d.msgs.forEach(t=>{ const r=document.createElement("div"); r.className="row bot"; r.innerHTML=`<div class="who">${d.name}</div><div class="bubble"><p>${t}</p></div>`; st.appendChild(r); });
  document.getElementById("simple-lock").textContent=d.lock;
  showPage("page-simple");
}

/* ===== home ===== */
function renderHome(){
  const gs=document.getElementById("greet-sub");
  const ohCta=document.getElementById("oh-cta");
  const covTick=document.getElementById("cov-tick");
  const covSub=document.getElementById("cov-sub");
  const covBtn=document.getElementById("cov-btn");
  const stepCov=document.getElementById("step-coverage");
  const lockedList=document.getElementById("locked-list");
  const lockedNote=document.getElementById("locked-note");
  if(coverageConfirmed){
    gs.textContent="Welcome to Bold, Carol. A few quick steps and you're set for your first visit.";
    stepCov.classList.add("done"); covTick.innerHTML=CHECK; covBtn.textContent="Done";
    covSub.textContent=(PROFILE.planName==="your plan"?"Coverage":PROFILE.planName)+" · $0 visit — confirmed";
    lockedList.hidden=false; lockedNote.hidden=true;
    const task=document.getElementById("task-intake"), tick=document.getElementById("intake-tick"), btn=document.getElementById("intake-btn"), count=document.getElementById("todo-count");
    if(intakeComplete){ task.classList.add("done"); tick.innerHTML=CHECK; btn.textContent="Done"; count.textContent="1 of 4 done"; }
    else { task.classList.remove("done"); tick.innerHTML=""; btn.textContent="Start ›"; count.textContent="0 of 4 done"; }
    ohCta.textContent = intakeComplete ? "You're all set — see you Nov 3 ✓" : "Finish your intake to confirm this visit →";
  } else {
    gs.textContent="First, let's confirm your coverage — it's the one thing we need to move your visit forward.";
    stepCov.classList.remove("done"); covTick.innerHTML=""; covBtn.textContent="Start ›";
    covSub.textContent="The one thing we need to cover your visit — a minute by chat";
    lockedList.hidden=true; lockedNote.hidden=false;
    ohCta.textContent="Confirm your coverage to move this forward →";
  }
}

/* ===== toast ===== */
let toastT;
function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2200); }

/* ===== nav ===== */
function showPage(id){ ["page-home","page-inbox","page-chat","page-simple"].forEach(p=>{ document.getElementById(p).hidden=(p!==id); }); if(id==="page-home") renderHome(); }
function launchCoverage(){ chatFromInbox=false; chatStarted=true; thread.innerHTML=""; addBot(NODES.coverageStart()); showPage("page-chat"); }
function launchIntake(){ chatFromInbox=false; chatStarted=true; thread.innerHTML=""; const c=document.createElement("div"); c.innerHTML=knownCardHTML(); thread.appendChild(c.firstChild); addBot(NODES.intakeStart()); showPage("page-chat"); }
function openConv(id){
  if(id==="ai"){ chatFromInbox=true; if(!coverageConfirmed){ chatStarted=true; thread.innerHTML=""; addBot(NODES.coverageStart()); } else if(!chatStarted){ greet(); chatStarted=true; } showPage("page-chat"); return; }
  openSimple(id);
}
function navTo(dest){ if(dest==="home") showPage("page-home"); else if(dest==="messages") showPage("page-inbox"); else toast(dest==="care"?"Care tab — concept screen":"My Health tab — concept screen"); }

/* ===== wiring ===== */
document.getElementById("inbox-back").onclick = ()=>{ window.location.href = WIREFRAMES_URL; };
document.getElementById("chat-back").onclick = ()=>showPage(chatFromInbox ? "page-inbox" : "page-home");
document.getElementById("simple-back").onclick = ()=>showPage("page-inbox");
topicsBtn.onclick = ()=>go("menu");
sendBtn.onclick = sendText; sendBtn.disabled = true;
ta.addEventListener("input", ()=>{ ta.style.height="auto"; ta.style.height=Math.min(ta.scrollHeight,90)+"px"; sendBtn.disabled=!ta.value.trim(); });
ta.addEventListener("keydown", e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendText(); } });

document.getElementById("cov-btn").onclick = launchCoverage;
document.getElementById("onhold").onclick = ()=>{ if(!coverageConfirmed) launchCoverage(); else if(!intakeComplete) launchIntake(); };
document.getElementById("intake-btn").onclick = launchIntake;
document.querySelectorAll(".task[data-consent]").forEach(el=>{ el.querySelector(".btn").onclick=()=>toast(el.dataset.consent+" — opens a review-and-sign page (concept)"); });
document.querySelectorAll(".bottomnav").forEach(nav=>{ nav.addEventListener("click", e=>{ const it=e.target.closest(".navitem"); if(it) navTo(it.dataset.nav); }); });

document.getElementById("restart").onclick = ()=>{
  coverageConfirmed=false; intakeComplete=false; MODE="new"; chatStarted=false; chatFromInbox=false; PROFILE.planName="";
  renderInbox(); showPage("page-home"); toast("Demo reset");
};

renderInbox(); showPage("page-home");
