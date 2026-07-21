
/* ============================================================
   BOLD AI — Messages inbox + smart care-coordinator chat
   Data pre-loaded from the Weight Management onboarding flow.
   ============================================================ */

const PROFILE = {
  name:"Carol", planName:"UnitedHealthcare", memberId:"•••• 789",
  visitCost:"a $0 copay", glp1Pathway:"bridge", bridgeCopay:"$50 a month",
  provider:"Dr. Desai", apptProposed:"Mon, Nov 3 · 9:00am",
  program:"Bold doctor-supervised GLP-1 weight loss program"
};
let MODE = "known";
let intakeComplete = false;
const WIREFRAMES_URL = "https://izabela-del.github.io/prototype-test/Bold-Wireframes.html";

const PLAN_COST = {
  united:"Bold is in-network with your UnitedHealthcare plan. Your virtual visits are a $0 copay.",
  bcbs:"Bold is in-network with your Blue Cross Blue Shield plan. Your estimated cost is $0–$25, and 78% of Bold members pay $0.",
  medicare:"Bold is in-network with Medicare. Your estimated cost is $0–$35, and 78% of Bold members pay $0.",
  aetna:"Bold is in-network with your Aetna plan. Your estimated cost is $0–$55, and 78% of Bold members pay $0.",
  wellpoint:"Bold is in-network with your Wellpoint plan. Your estimated cost is $0–$25, and 78% of Bold members pay $0.",
  other:"Bold is in-network with your plan. Your estimated cost is $0–$55, and 78% of Bold members pay $0."
};
const READY = { label:"Book my first visit", go:"book" };

const NODES = {
  cost(){
    if(MODE==="known"){
      return {
        text:[`You're all set on cost, ${PROFILE.name} — your ${PROFILE.planName} plan covers this visit at <b>${PROFILE.visitCost}</b>. That was confirmed when we checked your coverage at sign-up.`],
        why:`Bold is in-network with your ${PROFILE.planName} plan (member ${PROFILE.memberId}), so virtual visits with a Bold provider are $0. Your Care Coordinator bills your plan directly.`,
        sugg:[{label:"What about the medication cost?", go:"medCost"},{label:"What if I have secondary insurance?", go:"secondary"}, READY]
      };
    }
    return {
      text:["Happy to help with cost — it's the thing members ask about most.","Your out-of-pocket cost depends on your plan. Which insurance do you use?"],
      sugg:[{label:"UnitedHealthcare", go:"cost:united", collect:true},{label:"Blue Cross Blue Shield", go:"cost:bcbs", collect:true},{label:"Medicare", go:"cost:medicare", collect:true},{label:"Aetna", go:"cost:aetna", collect:true},{label:"Wellpoint", go:"cost:wellpoint", collect:true},{label:"Another plan", go:"cost:other", collect:true}]
    };
  },
  "cost:*"(plan){
    return { text:[PLAN_COST[plan]], callout:"Your Care Coordinator bills your plan directly, so there are no surprises.",
      sugg:[{label:"What about the medication cost?", go:"medCost"},{label:"What if I have secondary insurance?", go:"secondary"}, READY] };
  },
  secondary(){
    return { text:["Many members have extra coverage — a Medigap plan, or a spouse's or employer plan.","That coverage often picks up any remaining balance. Your Care Coordinator confirms this before your visit, so you'll know your exact cost with no surprises."],
      sugg:[READY, {label:"Ask something else", go:"menu"}] };
  },
  medCost(){
    if(MODE==="known" && PROFILE.glp1Pathway==="bridge"){
      return {
        text:[`If you and your provider decide a GLP-1 is right for you, it goes through the Medicare Bridge program — a flat <b>${PROFILE.bridgeCopay}</b>.`,"That was the pathway you matched into at sign-up."],
        pay:{visit:{k:"Initial visit", v:"$0", s:"out of pocket"}, med:{k:"GLP-1 (if prescribed)", v:"$50", s:"monthly copay"}},
        why:"The $50 Bridge copay does not count toward your Part D deductible or out-of-pocket maximum. Your provider handles all the paperwork.",
        sugg:[{label:"Which medications are covered?", go:"meds"},{label:"What if I don't want medication?", go:"noMed"}, READY]
      };
    }
    return { text:["Medication cost depends on whether you qualify for the Medicare Bridge program or go through your Part D plan.","Want me to check which path fits you?"],
      sugg:[{label:"Check my medication path", go:"glp1"}, READY] };
  },
  glp1(){
    if(MODE==="known" && PROFILE.glp1Pathway==="bridge"){
      return {
        text:[`Good news — from what you shared at sign-up, you're a strong candidate for the ${PROFILE.program}, through the Medicare Bridge at a flat <b>${PROFILE.bridgeCopay}</b>.`],
        pay:{visit:{k:"Initial visit", v:"$0", s:"out of pocket"}, med:{k:"GLP-1 (if prescribed)", v:"$50", s:"monthly copay"}},
        why:"You matched the Bridge pathway during onboarding: a BMI in range plus a qualifying condition, and no diagnosis that would route you to Part D instead. Your provider confirms this on your visit.",
        callout:"You and your provider decide together. Nothing is prescribed without your understanding and agreement.",
        sugg:[{label:"Which medications are covered?", go:"meds"},{label:"How does the $50 Bridge work?", go:"bridge"},{label:"What if I don't want medication?", go:"noMed"}]
      };
    }
    return { text:["Let's find which path fits you. It only takes two or three quick questions.","First: which card do you use for your insurance?"],
      sugg:[{label:"A private card", key:"United, Humana, Anthem…", go:"glp1:card:adv", collect:true},{label:"Red-white-and-blue Medicare card", go:"glp1:card:orig", collect:true},{label:"I'm not sure", go:"glp1:card:orig", collect:true}] };
  },
  "glp1:card:*"(kind){
    return { text:["Thanks. Next: has a doctor diagnosed you with diabetes, sleep apnea, or fatty liver disease (MASH)?"],
      sugg:[{label:"Yes", go:"glp1:dx:yes", collect:true},{label:"No", go:"glp1:dx:no", collect:true},{label:"I'm not sure", go:"glp1:dx:no", collect:true}] };
  },
  "glp1:dx:yes"(){
    return { text:["Got it. Because you already have a Part D–covered diagnosis, you'd keep getting a GLP-1 through your Part D plan — not the Bridge."],
      why:"Your cost then depends on your Part D plan. Your Bold provider handles the prior authorizations and paperwork.",
      callout:"You and your provider decide together. Nothing is prescribed without your agreement.",
      sugg:[{label:"Which medications are covered?", go:"meds"}, READY] };
  },
  "glp1:dx:no"(){
    return { text:["Almost there. Do you have a BMI of 27 or higher, plus a condition like high blood pressure, prediabetes, heart disease, or kidney disease?"],
      sugg:[{label:"Yes", go:"glp1:qualify:yes", collect:true},{label:"No", go:"glp1:qualify:no", collect:true},{label:"I'm not sure", go:"glp1:unsure", collect:true}] };
  },
  "glp1:qualify:yes"(){
    return { text:["You likely qualify for the Medicare Bridge — a flat $50 a month for covered GLP-1 medication."],
      why:"The Bridge is for members with a BMI of 27+ and a qualifying condition. Your provider confirms it and handles the authorizations.",
      callout:"You and your provider decide together whether a GLP-1 is part of your plan.",
      sugg:[{label:"Which medications are covered?", go:"meds"},{label:"How does the $50 Bridge work?", go:"bridge"}, READY] };
  },
  "glp1:qualify:no"(){
    return { text:["You may not qualify for covered medication right now — and that's actually a great fit for our program.","We focus on losing fat and building strength through nutrition and movement, so you can get results without medication."],
      sugg:[{label:"How does that work?", go:"program"}, READY] };
  },
  "glp1:unsure"(){
    return { text:["No problem — your provider checks this carefully during your visit, using your height, weight, and health history.","Either way, Bold can help."],
      sugg:[READY, {label:"Tell me about the program", go:"program"}] };
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
  visit(){
    return { text:["Your first visit is a 45-minute video call with your Bold provider, right from home — no travel and no waiting room.","Here's how it works:"],
      steps:["We email you a Zoom link before your appointment.","At your time, tap the link — it opens the video call.","Keep your phone nearby. If Zoom acts up, your provider can call you as a backup."],
      callout:"Want a quick 2-minute test so you feel ready? I can walk you through it, one step at a time.",
      sugg:[READY, {label:"Do a Zoom test", go:"zoomTest"},{label:"What should I have ready?", go:"prep"}] };
  },
  book(){
    const idLine = MODE==="known"
      ? `Based on your goals, <b>${PROFILE.provider}</b> looks like a great fit. I already have your insurance and contact details on file, so there's nothing to spell out.`
      : `Based on your goals, ${PROFILE.provider} looks like a great fit. I'll confirm your insurance and contact details in a moment — you can snap a photo of your card instead of spelling it out.`;
    return { text:["Wonderful — let's get you scheduled.", idLine, "Here are the next openings:"],
      sugg:[{label:"Thursday, 10:00 AM", go:"booked", collect:true},{label:"Friday, 2:30 PM", go:"booked", collect:true},{label:"A different day", go:"booked", collect:true}] };
  },
  booked(){
    return { text:["You're all set. You'll get an email with your Zoom link and a reminder before the visit.","You can call or text 424-577-5266 anytime with questions. We're glad you're here."],
      sugg:[{label:"Do a Zoom test", go:"zoomTest"},{label:"Ask another question", go:"menu"}] };
  },
  zoomTest(){
    return { text:["Wonderful. When you're ready, I'll send a test link to your email and stay with you through each step — nothing to figure out on your own.","There's no rush. We can do it now or closer to your appointment."],
      sugg:[READY, {label:"Ask something else", go:"menu"}] };
  },

  /* ---------- INTAKE (launched from the home to-do) ---------- */
  intakeStart(){
    return {
      text:[`Hi ${PROFILE.name} — let's finish your weight-management intake. It's just a couple of quick questions, and I already have most of your history from sign-up, so nothing to repeat.`,
            `Your ${PROFILE.planName} coverage is confirmed, so your visit is ${PROFILE.visitCost}. Ready to run through the rest?`],
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
      text:["Perfect — that's your intake complete. ✓",
            "That was the last form standing between you and your visit, so I can take it off hold. The last step is confirming your appointment time."],
      callout:"Back on your home screen, your intake now shows as done.",
      sugg:[{label:`Confirm ${PROFILE.apptProposed}`, go:"booked", collect:true},{label:"Pick a different time", go:"book"},{label:"Not right now", go:"menu"}]
    };
  },
  intakeChanged(){
    intakeComplete = true;
    return {
      text:["Thanks for telling me — I've flagged it so your provider can review it with you on the call. Nothing you need to do now.",
            "That completes your intake. ✓ Ready to confirm your visit?"],
      sugg:[{label:`Confirm ${PROFILE.apptProposed}`, go:"booked", collect:true},{label:"Pick a different time", go:"book"},{label:"Ask something else", go:"menu"}]
    };
  },
  prep(){
    return { text:["Not much at all — just your phone or computer, a quiet spot, and a list of any questions on your mind.","Your provider handles the rest."],
      sugg:[{label:"How does the visit work?", go:"visit"},{label:"Ask something else", go:"menu"}] };
  },
  program(){
    return { text:["Bold is a weight program built for adults over 65. The goal is to lose fat while keeping your muscle and strength — so you stay strong and independent.","Your provider looks at your whole health, then builds a personal Action Plan: nutrition, movement, and medication if it's the right fit for you."],
      callout:"We go beyond just a number on the scale, and we work alongside your regular doctor — not instead of them.",
      sugg:[{label:"How is this different from my PCP?", go:"pcp"},{label:"Am I eligible for medication?", go:"glp1"}, READY] };
  },
  pcp(){
    return { text:["Your primary care doctor can prescribe medication, but usually doesn't have time to guide the lifestyle side — the nutrition, the side effects, the long-term plan.","Bold fills that gap and coordinates with your doctor, so you have one connected plan for losing weight safely."],
      sugg:[READY, {label:"Tell me more about the program", go:"program"}] };
  },
  menu(){ return { text:["Of course — what would you like to know?"], sugg: MENU_PILLS.map(p=>({label:p.label, go:p.go})) }; },
  escalate(){
    return { text:["I want to make sure you get the right answer on this one, so I'll pass you to a real person on your care team.","You can reach your Care Coordinator at 424-577-5266 — call or text. They'll follow up quickly."],
      sugg: MENU_PILLS.map(p=>({label:p.label, go:p.go})) };
  }
};
const MENU_PILLS = [
  {label:"What will this cost me?", go:"cost"},
  {label:"Am I eligible for medication?", go:"glp1"},
  {label:"How does the video visit work?", go:"visit"},
  {label:"Book my first visit", go:"book"}
];

function resolve(go){
  if(go.startsWith("cost:")) return NODES["cost:*"](go.split(":")[1]);
  if(go.startsWith("glp1:card:")) return NODES["glp1:card:*"](go.split(":")[2]);
  if(NODES[go]) return NODES[go]();
  return NODES.escalate();
}
function routeText(t){
  const s=t.toLowerCase(); const has=(...w)=>w.some(x=>s.includes(x));
  if(has("cost","price","pay","copay","co-pay","afford","expensive","much","$","deductible")) return "cost";
  if(has("glp","ozempic","wegovy","zepbound","mounjaro","medication","medicine","drug","shot","injection","eligible","qualify","bridge")) return "glp1";
  if(has("book","schedule","sign up","get started","opening","ready to book")) return "book";
  if(has("zoom","video","visit","appointment","call","download","telehealth","virtual","in person","in-person","office","ready")) return "visit";
  if(has("what is bold","program","muscle","strength","pcp","doctor","how does bold","difference")) return "program";
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
function choose(p){ addMe(p.label); go(p.go); }
function go(id){ typing(); setTimeout(()=>{ untype(); addBot(resolve(id)); },460); }
function sendText(){ const t=ta.value.trim(); if(!t) return; addMe(t); ta.value=""; ta.style.height="auto"; sendBtn.disabled=true; const id=routeText(t); typing(); setTimeout(()=>{ untype(); addBot(resolve(id)); },500); }

function knownCardHTML(){
  return `<div class="known-card">
    <div class="kh"><span class="badge"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.7 6.5L9 1" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>What Bold already has for you</div>
    <div class="kgrid">
      <div class="krow"><span class="kk">Coverage</span><span class="kv">${PROFILE.planName} · member ${PROFILE.memberId}</span></div>
      <div class="krow"><span class="kk">Your visit</span><span class="kv">$0 copay — fully covered</span></div>
      <div class="krow"><span class="kk">Medication</span><span class="kv">Bridge eligible · ${PROFILE.bridgeCopay}</span></div>
      <div class="krow"><span class="kk">Provider match</span><span class="kv">${PROFILE.provider} · ready to book</span></div>
    </div>
    <p class="known-note">I use these so you never have to repeat yourself.</p></div>`;
}
function greet(intake){
  thread.innerHTML="";
  if(MODE==="known"){
    const c=document.createElement("div"); c.innerHTML=knownCardHTML(); thread.appendChild(c.firstChild);
    if(intake){ addBot(NODES.intakeStart()); return; }
    addBot({ text:[`Hi ${PROFILE.name}, I'm Bold AI, your care coordinator. I already have your sign-up details, so I can give you real answers — not guesses.`,"What's on your mind? Tap a topic below, or type your own question anytime."], sugg: MENU_PILLS.map(p=>({label:p.label, go:p.go})) });
  } else {
    const c=document.createElement("div"); c.innerHTML=`<div class="guest-card">Guest mode — no onboarding data yet. I'll collect what I need through quick taps, never letter-by-letter spelling.</div>`; thread.appendChild(c.firstChild);
    addBot({ text:["Hi, I'm Bold AI, your care coordinator. I can help with cost, coverage, medication, and how the visit works — and I'll get you to a real person whenever you need one.","What would you like to know? Tap a topic, or type your own question."], sugg: MENU_PILLS.map(p=>({label:p.label, go:p.go})) });
  }
}

/* ===== inbox ===== */
const inbox=document.getElementById("inbox");
function convData(){
  const aiPreview = MODE==="known" ? `Hi ${PROFILE.name} — I've got your sign-up details. Ask me anything.` : "Hi! I can help with cost, coverage, and booking.";
  return [
    { id:"ai", av:'<div class="av ai"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" fill="#fff"/><circle cx="18.5" cy="17.5" r="2.2" fill="#fff"/></svg></div>',
      name:"Bold AI", ai:true, role:"Care Coordinator · instant answers", preview:aiPreview, time:"now", unread:true },
    { id:"team", av:'<div class="av team"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="#fff" stroke-width="1.6"/><circle cx="16.5" cy="10" r="2.4" stroke="#fff" stroke-width="1.6"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M15 19c0-2 .8-3.6 2.2-4.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg></div>',
      name:"Bold Care Team", role:"Nurses & coordinators · Mon–Fri, 8–6", preview:"We'll confirm your coverage before your visit.", time:"9:12 AM", unread:false },
    { id:"doc", av:'<div class="av doc">SN</div>',
      name:"Dr. Nguyen", role:"Your Bold provider", preview:"Looking forward to meeting you at your first visit.", time:"Fri", unread:false }
  ];
}
function renderInbox(){
  inbox.innerHTML="";
  convData().forEach(c=>{
    const row=document.createElement("div"); row.className="conv";
    row.innerHTML = c.av +
      `<div class="mid">
         <div class="top"><div class="nm">${c.name}${c.ai?' <span class="aitag">AI</span>':''}</div><div class="tm">${c.time}</div></div>
         <div class="rl">${c.role}</div>
         <div class="pv">${c.preview}</div>
       </div>` + (c.unread?'<div class="unread"></div>':'');
    row.onclick=()=>openConv(c.id);
    inbox.appendChild(row);
  });
  const note=document.createElement("div"); note.className="inbox-note";
  note.innerHTML="Bold AI answers instantly, any hour. For anything clinical, it hands you to your care team or doctor.";
  inbox.appendChild(note);
}

/* ===== simple threads (team / doctor) ===== */
const SIMPLE = {
  team:{ av:'<div class="av team"><svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="#fff" stroke-width="1.6"/><circle cx="16.5" cy="10" r="2.4" stroke="#fff" stroke-width="1.6"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M15 19c0-2 .8-3.6 2.2-4.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg></div>',
    name:"Bold Care Team", role:"Nurses & coordinators",
    msgs:[`Hi ${PROFILE.name}, this is Maria from the Bold Care Team. We'll confirm your coverage and cost before your visit — message us here anytime.`],
    lock:"Concept screen — a real coordinator replies within 1 business day." },
  doc:{ av:'<div class="av doc">SN</div>', name:"Dr. Nguyen", role:"Your Bold provider",
    msgs:[`Hi ${PROFILE.name}, I'm Dr. Nguyen. I'll see you at your first visit. Feel free to leave any questions here beforehand.`],
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

/* ===== home / today ===== */
function renderHome(){
  const tick=document.getElementById("intake-tick");
  const task=document.getElementById("task-intake");
  const btn=document.getElementById("intake-btn");
  const count=document.getElementById("todo-count");
  if(intakeComplete){
    task.classList.add("done");
    tick.innerHTML=`<svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.2 7.5L11 1" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    btn.textContent="Done"; count.textContent="1 of 4 done";
  } else {
    task.classList.remove("done"); tick.innerHTML=""; btn.textContent="Start ›"; count.textContent="0 of 4 done";
  }
}
function launchIntake(){
  chatStarted=true; greet(true); showPage("page-chat");
}

/* ===== toast ===== */
let toastT;
function toast(msg){
  const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2200);
}

/* ===== page nav ===== */
function showPage(id){
  ["page-home","page-inbox","page-chat","page-simple"].forEach(p=>{ document.getElementById(p).hidden = (p!==id); });
  if(id==="page-home") renderHome();
}
let chatStarted=false;
function openConv(id){
  if(id==="ai"){ if(!chatStarted){ greet(); chatStarted=true; } showPage("page-chat"); }
  else openSimple(id);
}
function navTo(dest){
  if(dest==="home") showPage("page-home");
  else if(dest==="messages") showPage("page-inbox");
  else toast(dest==="care" ? "Care tab — concept screen" : "My Health tab — concept screen");
}

/* ===== wiring ===== */
document.getElementById("inbox-back").onclick = ()=>{ window.location.href = WIREFRAMES_URL; };
document.getElementById("chat-back").onclick = ()=>showPage(intakeComplete||!chatFromInbox ? "page-home" : "page-inbox");
document.getElementById("simple-back").onclick = ()=>showPage("page-inbox");
topicsBtn.onclick = ()=>go("menu");
sendBtn.onclick = sendText; sendBtn.disabled = true;
ta.addEventListener("input", ()=>{ ta.style.height="auto"; ta.style.height=Math.min(ta.scrollHeight,90)+"px"; sendBtn.disabled=!ta.value.trim(); });
ta.addEventListener("keydown", e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendText(); } });

/* home: intake to-do launches Bold AI; on-hold card too; consents show a concept toast */
let chatFromInbox=false;
document.getElementById("intake-btn").onclick = ()=>{ chatFromInbox=false; launchIntake(); };
document.getElementById("onhold").onclick = ()=>{ chatFromInbox=false; launchIntake(); };
document.querySelectorAll(".task[data-consent]").forEach(el=>{
  el.querySelector(".btn").onclick=()=>toast(el.dataset.consent+" — opens a review-and-sign page (concept)");
});

/* bottom nav (both root screens) */
document.querySelectorAll(".bottomnav").forEach(nav=>{
  nav.addEventListener("click", e=>{ const it=e.target.closest(".navitem"); if(it) navTo(it.dataset.nav); });
});

/* inbox conversations */
const _openConv=openConv;
openConv=function(id){ if(id==="ai") chatFromInbox=true; _openConv(id); };

document.getElementById("seg").addEventListener("click", e=>{
  const btn=e.target.closest("button"); if(!btn) return;
  document.querySelectorAll("#seg button").forEach(b=>b.classList.remove("on")); btn.classList.add("on");
  MODE=btn.dataset.mode; chatStarted=false; intakeComplete=false; renderInbox(); renderHome();
});

renderInbox(); showPage("page-home");
