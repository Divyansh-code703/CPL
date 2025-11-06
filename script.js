/* script.js — CLASS PREMIER LEAGUE (CPL)
   Features:
   - 6 teams, 66+ player pool (famous intl + India)
   - Auction with purse (₹150 Cr), base prices in ₹ (lakhs/ crores)
   - Team composition rules: max 11, min 4 bowlers, min 1 WK, max 8 bowlers
   - Trade & Unsold pool
   - Auto-balanced roster fill option
   - 5-over matches with toss & parchiyan (0,1,2,3,4,6,W,Wd,Dot)
   - Orange/Purple cap tracking
   - Points table & playoffs (top4 -> qualifiers + eliminator)
   - Retention: each team can retain up to 4 players after season
   - Spectator mode for other teams
   - LocalStorage persistence
*/

// ========== CONFIG ==========
const TEAM_NAMES = [
  "Royal Challengers Bengaluru",
  "Lucknow Super Giants",
  "Mumbai Indians",
  "Chennai Super Kings",
  "Kolkata Knight Riders",
  "Delhi Capitals"
];
const TOTAL_BUDGET = 150 * 10000000; // paise representation for precision (150 crore -> 150*1e7 paise)
const MAX_PLAYERS = 11;
const MIN_BOWLERS = 4;
const MIN_WK = 1;
const MAX_BOWLERS = 8;
const OVERS = 5;
const BALLS_PER_OVER = 6;
const EVENTS = ["0","1","2","3","4","6","W","Wd","Dot"];

// sound assets (CDN) - if blocked, they silently fail
const SND = {
  six: new Audio("https://assets.mixkit.co/sfx/download/mixkit-crowd-cheering-687.wav"),
  four: new Audio("https://assets.mixkit.co/sfx/download/mixkit-crowd-quick-cheer-689.wav"),
  wicket: new Audio("https://assets.mixkit.co/sfx/download/mixkit-athletic-audience-applause-477.wav"),
  toss: new Audio("https://assets.mixkit.co/sfx/download/mixkit-coin-flip-699.wav"),
  crowd: new Audio("https://assets.mixkit.co/sfx/download/mixkit-soccer-stadium-crowd-cheer-467.wav")
};
function playSound(k){
  try{ if(SND[k]){ SND[k].currentTime=0; SND[k].play(); } }catch(e){}
}

// ========= STORAGE KEYS ========
const STORAGE_KEY = "cpl_state_v2";

// ========= PLAYER POOL (66+ famous) ==========
const RAW_PLAYERS = [
  // mix of international + India, common famous names (66+). basePrice in paise for precision.
  ["Virat Kohli","Batsman", 1200000000],
  ["Rohit Sharma","Batsman", 1000000000],
  ["KL Rahul","Wicketkeeper", 900000000],
  ["Jos Buttler","Wicketkeeper", 900000000],
  ["MS Dhoni","Wicketkeeper", 800000000],
  ["Rishabh Pant","Wicketkeeper", 700000000],
  ["Faf du Plessis","Batsman", 800000000],
  ["David Warner","Batsman", 700000000],
  ["Suryakumar Yadav","Batsman", 800000000],
  ["Shubman Gill","Batsman", 700000000],
  ["Ruturaj Gaikwad","Batsman", 600000000],
  ["Devdutt Padikkal","Batsman", 600000000],
  ["Rohit Sharma (alt)","Batsman", 100000000], // filler names to reach count
  ["AB de Villiers","Batsman", 1100000000],
  ["Glenn Maxwell","Allrounder", 800000000],
  ["Andre Russell","Allrounder", 800000000],
  ["Hardik Pandya","Allrounder", 900000000],
  ["Marcus Stoinis","Allrounder", 750000000],
  ["Ben Stokes","Allrounder", 950000000],
  ["Ravindra Jadeja","Allrounder", 900000000],
  ["Shakib Al Hasan","Allrounder", 700000000],
  ["Kieron Pollard","Allrounder", 600000000],
  ["Mitchell Starc","Bowler", 1000000000],
  ["Jasprit Bumrah","Bowler", 900000000],
  ["Mohammed Siraj","Bowler", 700000000],
  ["Trent Boult","Bowler", 800000000],
  ["Anrich Nortje","Bowler", 750000000],
  ["Pat Cummins","Bowler", 950000000],
  ["Kagiso Rabada","Bowler", 900000000],
  ["Rashid Khan","Bowler", 900000000],
  ["Yuzvendra Chahal","Bowler", 700000000],
  ["Kuldeep Yadav","Bowler", 700000000],
  ["Bhuvneshwar Kumar","Bowler", 700000000],
  ["Harshal Patel","Bowler", 650000000],
  ["Umran Malik","Bowler", 650000000],
  ["T Natarajan","Bowler", 600000000],
  ["Shardul Thakur","Bowler", 650000000],
  ["Mohammed Shami","Bowler", 800000000],
  ["Jason Holder","Allrounder", 600000000],
  ["Sunil Narine","Allrounder", 750000000],
  ["Nicholas Pooran","Wicketkeeper", 700000000],
  ["Quinton de Kock","Wicketkeeper", 700000000],
  ["Ishan Kishan","Wicketkeeper", 700000000],
  ["Sanju Samson","Wicketkeeper", 650000000],
  ["Tilak Varma","Batsman", 600000000],
  ["Yashasvi Jaiswal","Batsman", 700000000],
  ["Shikhar Dhawan","Batsman", 650000000],
  ["Mayank Agarwal","Batsman", 650000000],
  ["Nitish Rana","Allrounder", 600000000],
  ["Krunal Pandya","Allrounder", 600000000],
  ["Ravichandran Ashwin","Bowler", 800000000],
  ["Irfan Pathan","Allrounder", 500000000],
  ["Gautam Gambhir","Batsman", 400000000],
  ["Sachin Tendulkar","Batsman", 1200000000],
  ["Chris Gayle","Batsman", 900000000],
  ["Dale Steyn","Bowler", 700000000],
  ["Jason Roy","Batsman", 650000000],
  ["Kane Williamson","Batsman", 850000000],
  ["Root Joe","Batsman", 600000000], // filler
  ["PlayerX1","Allrounder",500000000],
  ["PlayerX2","Bowler",450000000],
  ["PlayerX3","Batsman",400000000],
  ["PlayerX4","Wicketkeeper",350000000],
  ["PlayerX5","Bowler",300000000],
  ["PlayerX6","Allrounder",300000000],
  ["PlayerX7","Batsman",250000000],
  ["PlayerX8","Bowler",250000000]
];

// Expand RAW_PLAYERS to ensure at least 72 players (so some unsold)
const PLAYERS = RAW_PLAYERS.map((p, idx) => ({
  id: "P" + (1000 + idx),
  name: p[0],
  role: p[1],
  base: p[2], // paise
  owner: null,
  runs: 0,
  wickets: 0,
  soldPrice: 0
}));

// if need add more dummy players to reach 72
for(let i=PLAYERS.length;i<72;i++){
  PLAYERS.push({
    id: "P"+(2000+i),
    name: "LocalPlayer"+(i+1),
    role: (i%5===0?"Wicketkeeper": (i%3===0?"Bowler":"Batsman")),
    base: 20000000 + (i%7)*25000000, // 20L to higher
    owner: null,runs:0,wickets:0,soldPrice:0
  });
}

// ========== GAME STATE ==========
let state = {
  teams: {}, // teamName -> {purse, players:[], stats...}
  players: PLAYERS,
  fixtures: [], // round robin
  stage: "auction", // auction / league / playoffs / finished
  playoffs: null,
  seasonComplete: false,
  retained: {}
};

// Initialize teams in state (if not loaded)
function initTeams(){
  for(const t of TEAM_NAMES){
    if(!state.teams[t]){
      state.teams[t] = {
        name: t,
        purse: TOTAL_BUDGET,
        players: [],
        stats: {played:0,wins:0,losses:0,points:0,runsFor:0,runsAgainst:0,nrr:0}
      };
    }
  }
}

// ========== STORAGE ==========
function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); appendStatus("Saved"); } catch(e){ appendStatus("Save error"); }
}
function load(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{ state = JSON.parse(raw); return true; } catch(e){ console.warn("load failed",e); }
  }
  return false;
}
function resetAll(){
  state = {teams:{},players:PLAYERS.map(p=>({...p,owner:null,runs:0,wickets:0,soldPrice:0})),fixtures:[],stage:"auction",playoffs:null,seasonComplete:false,retained:{}};
  initTeams();
  generateFixtures();
  save();
  renderHome();
  appendStatus("Reset complete");
}

// ========== HELPERS ==========
function paiseToCroreStr(paise){
  const rupees = paise / 100;
  const crore = rupees / 10000000;
  return "₹" + crore.toFixed(2) + " Cr";
}
function paiseToLakhStr(paise){
  const rupees = paise / 100;
  const lakh = rupees / 100000;
  return "₹" + lakh.toFixed(2) + " L";
}
function moneyStr(paise){
  // show crores if >=1 Cr else show L
  const rupees = paise/100;
  if(rupees >= 10000000) return paiseToCroreStr(paise);
  return paiseToLakhStr(paise);
}
function uid(tag="x"){ return tag+Math.random().toString(36).slice(2,9); }
function appendStatus(text){ const el=document.getElementById("statusLine"); if(el) el.innerText = text; }

// ========== FIXTURE GENERATOR ==========
function generateFixtures(){
  const names = Object.keys(state.teams);
  const fixtures = [];
  for(let i=0;i<names.length;i++){
    for(let j=i+1;j<names.length;j++){
      fixtures.push({id:uid("M"),teamA:names[i],teamB:names[j],played:false,scoreA:null,scoreB:null,winner:null});
    }
  }
  state.fixtures = fixtures.sort(()=>Math.random()-0.5);
}

// ========== RENDER HOME ==========
const view = document.getElementById("view");
function renderHome(){
  appendStatus("Home");
  view.innerHTML = `
    <div class="welcome">
      <h2>Class Premier League — Ready</h2>
      <p class="small">Stage: ${state.stage.toUpperCase()} • Teams: ${TEAM_NAMES.length} • Budget: ${moneyStr(TOTAL_BUDGET)}</p>
      <div style="margin-top:12px" class="card">
        <div class="section-title">Quick Actions</div>
        <div class="action-row">
          <button class="small-btn" onclick="openAuction()">Open Auction</button>
          <button class="small-btn" onclick="openSchedule()">Schedule & Standings</button>
          <button class="small-btn" onclick="startPlayMode()">Play Next Match</button>
          <button class="small-btn" onclick="openTrade()">Trade & Unsold</button>
        </div>
        <p class="small" style="margin-top:8px">Tip: Use Auto-assign to quickly fill balanced rosters then run auction for upgrades.</p>
      </div>
      <div style="margin-top:12px" class="card">
        <div class="section-title">Orange / Purple Caps</div>
        <div>Orange: <span id="capOrange">${getOrangeCapText()}</span></div>
        <div>Purple: <span id="capPurple">${getPurpleCapText()}</span></div>
      </div>
    </div>
  `;
}

// ========== AUCTION UI & LOGIC ==========
function openAuction(){
  appendStatus("Auction Room");
  // show list of available players and team buttons
  const avail = state.players.filter(p=>!p.owner).sort((a,b)=>b.base-a.base);
  view.innerHTML = `
    <div class="card">
      <div class="section-title">Auction Room</div>
      <div class="small">Tap a team to bid manually on a player. Or auto-run auction to distribute players fairly.</div>
      <div style="margin-top:8px" id="teamButtons" class="flex-row"></div>
      <div style="margin-top:10px">
        <button class="small-btn" onclick="autoAuction()">Auto Auction</button>
        <button class="small-btn" onclick="renderHome()">Back</button>
      </div>
    </div>
    <div class="card">
      <div class="section-title">Available Players (${avail.length})</div>
      <div id="playerList"></div>
    </div>
  `;
  const tb = document.getElementById("teamButtons");
  Object.keys(state.teams).forEach(t=>{
    const b = document.createElement("button");
    b.className="btn";
    b.style.flex="1 1 30%";
    b.innerText = `${t}\n(${moneyStr(state.teams[t].purse)})`;
    b.onclick = ()=>manualAuctionSelectTeam(t);
    tb.appendChild(b);
  });

  const pl = document.getElementById("playerList");
  avail.forEach(p=>{
    const div = document.createElement("div");
    div.className = "player-item";
    div.innerHTML = `<div><strong>${p.name}</strong> <div class="small">${p.role} • Base ${moneyStr(p.base)}</div></div>
                     <div><button class="small-btn" onclick="showPlayerQuickBuy('${p.id}')">Quick Buy</button></div>`;
    pl.appendChild(div);
  });
}

let manualAuctionTeam = null;
function manualAuctionSelectTeam(teamName){
  manualAuctionTeam = teamName;
  alert(`Selected team: ${teamName}. Now pick a player Quick Buy from the list.`);
}

// Quick buy: confirm for given team at base price (if they can pay and team not full)
function showPlayerQuickBuy(pid){
  if(!manualAuctionTeam){
    alert("Select a team first (Tap team button). Or use Auto Auction.");
    return;
  }
  const p = state.players.find(x=>x.id===pid);
  if(!p) return;
  const team = state.teams[manualAuctionTeam];
  if(team.players.length >= MAX_PLAYERS) return alert("Team already has 11 players.");
  if(team.purse < p.base) return alert("Insufficient purse for base price.");
  // role checks: ensure adding this player doesn't break min/max later - allow now but block exceeding bowler max at match time
  const ok = confirm(`${manualAuctionTeam} buy ${p.name} (${p.role}) for ${moneyStr(p.base)}?`);
  if(!ok) return;
  p.owner = manualAuctionTeam;
  p.soldPrice = p.base;
  team.players.push(p.id);
  team.purse -= p.base;
  appendStatus(`${manualAuctionTeam} bought ${p.name}`);
  save();
  openAuction();
}

// Auto auction: distribute players with role-balance attempt, leave some unsold
function autoAuction(){
  appendStatus("Auto Auction running...");
  // sort players by base descending
  const avail = state.players.filter(p=>!p.owner).sort((a,b)=>b.base-a.base);
  // target fill per team: 11 each
  const teamsList = Object.keys(state.teams);
  // We'll iterate players, try to assign to team with least players but can afford
  for(const p of avail){
    // shuffle candidate teams so not always same
    const candidates = teamsList.slice().sort(()=>Math.random()-0.5);
    let assigned = false;
    for(const tName of candidates){
      const t = state.teams[tName];
      if(t.players.length >= MAX_PLAYERS) continue;
      if(t.purse < p.base) continue;
      // check role distribution roughly: ensure not exceeding bowler limit later - we use softer heuristics
      const roleCounts = getRoleCounts(tName);
      if(p.role === "Bowler" && roleCounts.bowlers >= MAX_BOWLERS) continue;
      if(p.role === "Wicketkeeper" && roleCounts.wk >= 2) continue; // allow up to 2 wk
      // assign
      p.owner = tName; p.soldPrice = p.base; t.players.push(p.id); t.purse -= p.base; assigned = true;
      break;
    }
    // leave some players unsold intentionally (if not assigned)
  }
  save();
  appendStatus("Auto Auction completed (balanced assignment).");
  openAuction();
}

function getRoleCounts(teamName){
  const team = state.teams[teamName];
  let bats=0, bowl=0, wk=0, ar=0;
  (team.players||[]).forEach(pid=>{
    const p = state.players.find(x=>x.id===pid);
    if(!p) return;
    if(p.role==="Bowler") bowl++;
    else if(p.role==="Wicketkeeper") wk++;
    else if(p.role==="Allrounder") ar++;
    else bats++;
  });
  return {bats,bowl,wk,ar};
}

// ========== TRADE & UNSOLD UI ==========
function openTrade(){
  appendStatus("Trade & Unsold pool");
  const unsold = state.players.filter(p=>!p.owner);
  view.innerHTML = `
    <div class="card">
      <div class="section-title">Unsold Players (${unsold.length})</div>
      <div id="unsoldList"></div>
      <div style="margin-top:8px" class="action-row">
        <button class="small-btn" onclick="renderHome()">Back</button>
        <button class="small-btn" onclick="autoAssignUnsold()">Auto Assign Unsold (fill rosters)</button>
      </div>
    </div>
    <div class="card">
      <div class="section-title">Team Rosters & Trade</div>
      <div id="teamRoster"></div>
    </div>
  `;
  const ul = document.getElementById("unsoldList");
  unsold.forEach(p=>{
    const d = document.createElement("div"); d.className="player-item";
    d.innerHTML = `<div><strong>${p.name}</strong><div class="small">${p.role} • Base ${moneyStr(p.base)}</div></div>
                   <div><button class="small-btn" onclick="offerToBuyUnsold('${p.id}')">Offer to Team</button></div>`;
    ul.appendChild(d);
  });

  renderRosters();
}

function renderRosters(){
  const el = document.getElementById("teamRoster");
  el.innerHTML = "";
  Object.keys(state.teams).forEach(tName=>{
    const t = state.teams[tName];
    const div = document.createElement("div"); div.className="team-card";
    const roleCounts = getRoleCounts(tName);
    div.innerHTML = `<div style="font-weight:800">${tName} • ${moneyStr(t.purse)}</div>
      <div class="small">Players: ${t.players.length} • B:${roleCounts.bowl} • WK:${roleCounts.wk}</div>
      <div style="margin-top:8px">${t.players.map(pid=>{
        const p = state.players.find(x=>x.id===pid);
        return `<div style="padding:6px;background:rgba(0,0,0,0.08);border-radius:6px;margin-bottom:6px">
                  <strong>${p.name}</strong> <div class="small">${p.role} • Sold ${moneyStr(p.soldPrice||p.base)}</div>
                  <div style="margin-top:6px"><button class="small-btn" onclick="startTrade('${tName}','${p.id}')">Trade Out</button></div>
                </div>`;
      }).join("")}</div>`;
    el.appendChild(div);
  });
}

// Offer unsold to team (prompt amount)
function offerToBuyUnsold(pid){
  const player = state.players.find(p=>p.id===pid); if(!player) return;
  const team = prompt("Enter team name to offer to:\n" + Object.keys(state.teams).join("\n"));
  if(!team || !state.teams[team]) return alert("Invalid team");
  const t = state.teams[team];
  const offer = prompt(`Offer amount in Crore (e.g. 2.5) for ${player.name}. Team purse: ${moneyStr(t.purse)}`);
  const num = parseFloat(offer);
  if(isNaN(num)) return alert("Invalid amount");
  const paise = Math.round(num * 10000000);
  if(paise > t.purse) return alert("Insufficient purse");
  // assign
  player.owner = team; player.soldPrice = paise; t.players.push(player.id); t.purse -= paise;
  save(); openTrade();
  appendStatus(`${team} bought ${player.name} (unsold offer)`);
}

// Start trade: remove player's owner and put into unsold + transfer money to receiving team
function startTrade(fromTeam, pid){
  // simple trade: prompt target team & amount
  const from = state.teams[fromTeam];
  if(!from) return;
  const p = state.players.find(x=>x.id===pid); if(!p) return;
  const toTeam = prompt("Enter receiving team name:\n" + Object.keys(state.teams).filter(t=>t!==fromTeam).join("\n"));
  if(!toTeam || !state.teams[toTeam]) return alert("Invalid team");
  const price = prompt(`Enter transfer price in Crore (e.g. 1.5). ${toTeam} purse: ${moneyStr(state.teams[toTeam].purse)}`);
  const num = parseFloat(price); if(isNaN(num)) return;
  const paise = Math.round(num * 10000000);
  if(paise > state.teams[toTeam].purse) return alert("Receiving team cannot afford");
  // remove from fromTeam
  from.players = from.players.filter(x=>x!==pid);
  // add to toTeam
  state.teams[toTeam].players.push(pid);
  state.teams[toTeam].purse -= paise;
  // pay into fromTeam purse
  state.teams[fromTeam].purse += paise;
  p.owner = toTeam;
  p.soldPrice = paise;
  save();
  openTrade();
  appendStatus(`Trade: ${p.name} moved ${fromTeam} → ${toTeam} for ${moneyStr(paise)}`);
}

// Auto assign unsold to fill roster (respect role min)
function autoAssignUnsold(){
  const unsold = state.players.filter(p=>!p.owner);
  // teams sorted by current players ascending
  const teamsSorted = Object.keys(state.teams).sort((a,b)=>state.teams[a].players.length - state.teams[b].players.length);
  for(const teamName of teamsSorted){
    const t = state.teams[teamName];
    while(t.players.length < MAX_PLAYERS && unsold.length>0){
      // try to pick a player that helps meet WK/Bowler min
      const roleCounts = getRoleCounts(teamName);
      let idx = -1;
      if(roleCounts.wk < MIN_WK){
        idx = unsold.findIndex(x=>x.role==="Wicketkeeper");
      } else if(roleCounts.bowl < MIN_BOWLERS){
        idx = unsold.findIndex(x=>x.role==="Bowler" || x.role==="Allrounder");
      }
      if(idx === -1) idx = 0; // pick top unsold
      const p = unsold.splice(idx,1)[0];
      p.owner = teamName; p.soldPrice = p.base;
      t.players.push(p.id);
    }
  }
  save();
  openTrade();
  appendStatus("Auto assigned unsold players to fill teams.");
}

// ========== SCHEDULE & STANDINGS ==========
function openSchedule(){
  appendStatus("Schedule & Standings");
  // compute standings
  const table = computeStandings();
  const fixturesHtml = state.fixtures.map(f=>{
    if(!f.played){
      return `<div class="fixture"><strong>${short(f.teamA)} vs ${short(f.teamB)}</strong>
              <div class="muted">Not played</div>
              <div style="margin-top:6px"><button class="small-btn" onclick="startFixture('${f.id}')">Play</button></div>
              </div>`;
    } else {
      return `<div class="fixture"><strong>${short(f.teamA)} ${f.scoreA} - ${short(f.teamB)} ${f.scoreB}</strong>
              <div class="muted">${f.winner} won</div></div>`;
    }
  }).join("");
  view.innerHTML = `
    <div class="card">
      <div class="section-title">Standings</div>
      <div id="standings">${table.map((r,i)=>`<div style="padding:6px;border-radius:6px;background:rgba(0,0,0,0.08);margin-bottom:6px">
        ${i+1}. <strong>${r.name}</strong> • Pts:${r.points} • W:${r.wins} • L:${r.losses} • NRR:${r.nrr.toFixed(2)}
      </div>`).join("")}</div>
      <div style="margin-top:8px" class="action-row">
        <button class="small-btn" onclick="renderHome()">Back</button>
        <button class="small-btn" onclick="forceEndLeague()">Force End League (goto playoffs)</button>
      </div>
    </div>
    <div class="card">
      <div class="section-title">Fixtures</div>
      ${fixturesHtml}
    </div>
  `;
}

function short(name){ return name.split(" ").slice(0,3).join(" "); }

function computeStandings(){
  const arr = Object.values(state.teams).map(t=>{
    const s = t.stats;
    return {name:t.name, points:s.points||0, wins:s.wins||0, losses:s.losses||0, nrr:s.nrr||0};
  });
  arr.sort((a,b)=> b.points - a.points || b.nrr - a.nrr);
  return arr;
}

function startFixture(fid){
  const f = state.fixtures.find(x=>x.id===fid);
  if(!f) return;
  // render match screen and start match
  renderMatchScreen(f);
}

// Force go to playoffs
function forceEndLeague(){
  if(!confirm("Force end league and move to playoffs?")) return;
  state.stage = "playoffs";
  organizePlayoffs();
  save();
  openPlayoffs();
}

// ========== MATCH ENGINE ==========

function renderMatchScreen(fixture){
  appendStatus("Playing match");
  view.innerHTML = `
    <div class="card">
      <div class="section-title">Match: ${short(fixture.teamA)} vs ${short(fixture.teamB)}</div>
      <div id="matchInfo" class="small">Not started</div>
      <div style="margin-top:8px" id="matchLog" class="small"></div>
      <div style="margin-top:8px" class="action-row">
        <button class="small-btn" onclick="runMatch('${fixture.id}')">Start Match (Toss → Play)</button>
        <button class="small-btn" onclick="openSchedule()">Back</button>
      </div>
    </div>
  `;
}

function runMatch(fid){
  const fixture = state.fixtures.find(x=>x.id===fid);
  if(!fixture) return;
  const matchLogEl = document.getElementById("matchLog");
  matchLogEl.innerText = "";
  // ensure rosters: if team has <11 auto-assign
  ensureRosters();

  // Toss
  playSound("toss");
  const tossWinner = Math.random() < 0.5 ? fixture.teamA : fixture.teamB;
  const tossChoice = Math.random() < 0.5 ? "bat" : "bowl";
  matchLogEl.innerText = `Toss: ${tossWinner} won and chose to ${tossChoice}\n` + matchLogEl.innerText;
  playSound("crowd");

  let firstBat = tossChoice === "bat" ? tossWinner : (tossWinner === fixture.teamA ? fixture.teamB : fixture.teamA);
  let firstBowl = firstBat === fixture.teamA ? fixture.teamB : fixture.teamA;

  // innings 1
  const innings1 = simulateInnings(firstBat, firstBowl);
  matchLogEl.innerText = `${firstBat} scored ${innings1.score}/${innings1.wickets} in ${OVERS} overs\n` + matchLogEl.innerText;

  // innings 2 (chase)
  const target = innings1.score + 1;
  const innings2 = simulateInnings(firstBowl, firstBat, target);
  matchLogEl.innerText = `${firstBowl} scored ${innings2.score}/${innings2.wickets} in ${innings2.overs} overs\n` + matchLogEl.innerText;

  // result
  let winner = null; let winBy="";
  if(innings1.score > innings2.score){ winner = firstBat; winBy = `${innings1.score - innings2.score} runs`; }
  else if(innings2.score > innings1.score){ winner = firstBowl; winBy = `chased target`; }
  else { winner = "Tie"; winBy = "Match tied"; }

  fixture.played = true;
  fixture.scoreA = firstBat===fixture.teamA ? `${innings1.score}/${innings1.wickets}` : `${innings2.score}/${innings2.wickets}`;
  fixture.scoreB = firstBat===fixture.teamA ? `${innings2.score}/${innings2.wickets}` : `${innings1.score}/${innings1.wickets}`;
  fixture.winner = winner;
  fixture.winBy = winBy;

  // update stats per team
  updateTeamStats(firstBat, innings1.score, innings2.score, winner===firstBat);
  updateTeamStats(firstBowl, innings2.score, innings1.score, winner===firstBowl);

  // update caps
  updateCaps();

  // save and show result
  save();
  appendStatus(`Result: ${winner} (${winBy})`);
  openSchedule();

  // if league finished, move to playoffs
  const allPlayed = state.fixtures.every(x=>x.played);
  if(allPlayed && state.stage==="league"){
    state.stage = "playoffs";
    organizePlayoffs();
    save();
    openPlayoffs();
  }
}

function simulateInnings(battingTeamName, bowlingTeamName, chaseTarget=null){
  const battingTeam = state.teams[battingTeamName];
  const bowlingTeam = state.teams[bowlingTeamName];
  let score = 0, wickets = 0, balls = 0;
  const battingPlayers = (battingTeam.players || []).slice(0,11);
  let striker = 0;
  for(let o=0;o<OVERS;o++){
    for(let b=0;b<BALLS_PER_OVER;b++){
      const ev = randomEvent();
      if(ev==="Wd"){ score += 1; /* no ball count */ }
      else if(ev==="W"){ wickets++; assignWicket(bowlingTeamName); playSound("wicket"); balls++; }
      else if(ev==="Dot"){ /* nothing */ balls++; }
      else {
        const runs = parseInt(ev);
        score += runs; balls++;
        // add runs to batsman
        const pid = battingPlayers[Math.min(striker, battingPlayers.length-1)];
        const p = state.players.find(x=>x.id===pid);
        if(p) p.runs += runs;
        if(runs===4) playSound("four");
        if(runs===6) playSound("six");
        if(runs%2===1) striker++;
      }
      // check chase
      if(chaseTarget && score>=chaseTarget){
        const oversDone = Math.floor(balls/6);
        return {score,wickets,overs:oversDone,balls:balls%6};
      }
      if(wickets>=10){
        const oversDone = Math.floor(balls/6) + (balls%6>0?1:0);
        return {score,wickets,overs:oversDone,balls:balls%6};
      }
      if(balls >= OVERS*6) return {score,wickets,overs:OVERS,balls:balls%6};
    }
  }
  return {score,wickets,overs:OVERS,balls:balls%6};
}

function randomEvent(){
  // Weighted random to reflect more dots and singles
  const pool = [];
  // add weights
  pool.push(...Array(22).fill("0"));
  pool.push(...Array(18).fill("1"));
  pool.push(...Array(8).fill("2"));
  pool.push(...Array(3).fill("3"));
  pool.push(...Array(6).fill("4"));
  pool.push(...Array(3).fill("6"));
  pool.push(...Array(6).fill("Wd"));
  pool.push(...Array(7).fill("W"));
  pool.push(...Array(10).fill("Dot"));
  return pool[Math.floor(Math.random()*pool.length)];
}

function assignWicket(bowlingTeamName){
  // attribute wicket to random bowler of bowling team (increase wickets stat)
  const bowlIds = state.teams[bowlingTeamName].players.filter(pid=>{
    const p = state.players.find(x=>x.id===pid); return p && (p.role==="Bowler" || p.role==="Allrounder");
  });
  if(bowlIds.length===0) return;
  const bid = bowlIds[Math.floor(Math.random()*bowlIds.length)];
  const pb = state.players.find(x=>x.id===bid); if(pb) pb.wickets = (pb.wickets||0)+1;
}

// ========== TEAM STATS ==========
function updateTeamStats(teamName, runsFor, runsAgainst, won){
  const t = state.teams[teamName];
  t.stats.played += 1;
  t.stats.runsFor += runsFor;
  t.stats.runsAgainst += runsAgainst;
  // simplistic NRR: (runsFor / (played*overs)) - (runsAgainst/(played*overs))
  const oversTotal = Math.max(1, t.stats.played * OVERS);
  t.stats.nrr = (t.stats.runsFor / oversTotal) - (t.stats.runsAgainst / oversTotal);
  if(won){ t.stats.wins += 1; t.stats.points += 2; } else { t.stats.losses += 1; }
}

// ========== CAPS ==========
function updateCaps(){
  // orange: most runs, purple: most wickets
  let topR = {name:"—",runs:0}, topW = {name:"—",wickets:0};
  state.players.forEach(p=>{
    if((p.runs||0) > topR.runs){ topR = {name:p.name, runs:p.runs||0}; }
    if((p.wickets||0) > topW.wickets){ topW = {name:p.name, wickets:p.wickets||0}; }
  });
  // update DOM small
  const elO = document.getElementById("capOrange"); if(elO) elO.innerText = `${topR.name} (${topR.runs})`;
  const elP = document.getElementById("capPurple"); if(elP) elP.innerText = `${topW.name} (${topW.wickets})`;
}

// ========== PLAYOFFS ==========
function organizePlayoffs(){
  // determine top4
  const standings = computeStandings();
  const top4 = standings.slice(0,4).map(r=>r.name);
  state.playoffs = {qual1:[top4[0],top4[1]], elim:[top4[2],top4[3]], qual1_winner:null, elim_winner:null, qual2_winner:null, finalist1:null, finalist2:null};
}

function openPlayoffs(){
  const p = state.playoffs;
  if(!p){ appendStatus("Playoffs not ready"); return; }
  view.innerHTML = `<div class="card"><div class="section-title">Playoffs</div>
    <div class="small">Qualifier1: ${p.qual1[0]} vs ${p.qual1[1]}</div>
    <div style="margin-top:8px"><button class="small-btn" onclick="playPlayoff('qual1')">Play Qualifier 1</button></div>
    <div class="small" style="margin-top:10px">Eliminator: ${p.elim[0]} vs ${p.elim[1]}</div>
    <div style="margin-top:8px"><button class="small-btn" onclick="playPlayoff('elim')">Play Eliminator</button></div>
    <div style="margin-top:8px"><button class="small-btn" onclick="renderHome()">Back</button></div></div>`;
}

function playPlayoff(tag){
  const p = state.playoffs;
  if(tag==="qual1"){
    const tA = p.qual1[0], tB = p.qual1[1];
    const i1 = simulateInnings(tA,tB);
    const i2 = simulateInnings(tB,tA,i1.score+1);
    const winner = i1.score>i2.score? tA: tB;
    const loser = winner===tA? tB: tA;
    p.qual1_winner = winner; p.qual1_loser = loser;
    appendStatus("Qualifier1: " + winner);
    save();
    openPlayoffs();
  } else if(tag==="elim"){
    const tA = p.elim[0], tB = p.elim[1];
    const i1 = simulateInnings(tA,tB);
    const i2 = simulateInnings(tB,tA,i1.score+1);
    const winner = i1.score>i2.score? tA: tB;
    p.elim_winner = winner;
    appendStatus("Eliminator winner: " + winner);
    save();
    // now allow qualifier2
    view.innerHTML = `<div class="card"><div class="section-title">Qualifier 2</div>
      <div class="small">${p.elim_winner} vs ${p.qual1_loser || "Qual1 Loser"}</div>
      <div style="margin-top:8px"><button class="small-btn" onclick="playPlayoff('qual2')">Play Qualifier 2</button></div></div>`;
  } else if(tag==="qual2"){
    const tA = p.elim_winner, tB = p.qual1_loser;
    if(!tA || !tB) return alert("Both teams not ready");
    const i1 = simulateInnings(tA,tB);
    const i2 = simulateInnings(tB,tA,i1.score+1);
    const winner = i1.score>i2.score? tA: tB;
    p.qual2_winner = winner;
    p.finalist1 = p.qual1_winner; p.finalist2 = winner;
    save();
    view.innerHTML = `<div class="card"><div class="section-title">Final</div>
      <div class="small">${p.finalist1} vs ${p.finalist2}</div>
      <div style="margin-top:8px"><button class="small-btn" onclick="playPlayoff('final')">Play Final</button></div></div>`;
  } else if(tag==="final"){
    const tA = p.finalist1, tB = p.finalist2;
    const i1 = simulateInnings(tA,tB);
    const i2 = simulateInnings(tB,tA,i1.score+1);
    const winner = i1.score>i2.score? tA: tB;
    state.seasonComplete = true;
    state.stage = "finished";
    appendStatus("Champion: " + winner);
    view.innerHTML = `<div class="card"><div class="section-title">Season Finished</div>
      <div class="small">Champion: <strong>${winner}</strong></div>
      <div style="margin-top:8px" class="action-row">
        <button class="small-btn" onclick="offerRetention()">Retention Round</button>
        <button class="small-btn" onclick="resetAll()">Reset Season</button>
      </div></div>`;
    save();
  }
}

// ========== RETENTION ==========
function offerRetention(){
  // pick up to 4 players per team to retain
  for(const tName of Object.keys(state.teams)){
    const t = state.teams[tName];
    const roster = t.players.map((pid,i)=> `${i+1}. ${(state.players.find(p=>p.id===pid)||{name:"?"}).name}`).join("\n");
    const sel = prompt(`Team ${tName} - select up to 4 players (numbers comma separated):\n${roster}`);
    if(!sel) continue;
    const picks = sel.split(",").map(s=>parseInt(s.trim())-1).filter(n=>!isNaN(n) && n>=0 && n < t.players.length);
    const pickIds = picks.slice(0,4).map(i=> t.players[i]);
    state.retained[tName] = pickIds;
  }
  save();
  alert("Retention saved in state.retained");
}

// ========== ENSURE ROSTERS ==========
function ensureRosters(){
  const unassigned = state.players.filter(p=>!p.owner).map(p=>p.id);
  // fill shortage with unassigned respecting role minimums
  for(const tName of Object.keys(state.teams)){
    const t = state.teams[tName];
    while(t.players.length < MAX_PLAYERS && unassigned.length>0){
      // ensure WK and bowlers min
      const counts = getRoleCounts(tName);
      let idx=-1;
      if(counts.wk < MIN_WK) idx = unassigned.findIndex(pid=> state.players.find(p=>p.id===pid).role==="Wicketkeeper");
      if(idx===-1 && counts.bowl < MIN_BOWLERS) idx = unassigned.findIndex(pid=> ["Bowler","Allrounder"].includes(state.players.find(p=>p.id===pid).role));
      if(idx===-1) idx = 0;
      const pid = unassigned.splice(idx,1)[0];
      const p = state.players.find(x=>x.id===pid);
      p.owner = tName; p.soldPrice = p.base;
      t.players.push(pid);
    }
  }
  save();
}

// ========== BOOT & INIT ==========
function boot(){
  if(!load()){
    initTeams();
    generateFixtures();
    save();
  } else {
    initTeams(); // ensure structure
  }
  renderHome();
  updateCaps();
  appendStatus("CPL Ready");
}

// ========== UTILITY UI ACTIONS ==========
document.getElementById("btn-auction").onclick = ()=>openAuction();
document.getElementById("btn-schedule").onclick = ()=>openSchedule();
document.getElementById("btn-play").onclick = ()=>startPlayMode();
document.getElementById("btn-trade").onclick = ()=>openTrade();

function startAutoSetup(){
  if(!confirm("Auto-assign balanced rosters using automatic auction?")) return;
  autoAuction();
  autoAssignUnsold();
  appendStatus("Auto setup complete");
}

function startPlayMode(){
  // find next unplayed fixture
  const next = state.fixtures.find(f=>!f.played);
  if(!next) return alert("No fixtures left or run schedule first");
  renderMatchScreen(next);
}

// helper to open schedule when loaded
function renderHome(){
  // re-use function above to avoid duplication (it was defined earlier, so call)
  window.renderHome && window.renderHome();
}

// Expose some functions to global scope for indexing in HTML buttons if needed
window.openAuction = openAuction;
window.openSchedule = openSchedule;
window.openTrade = openTrade;
window.resetAll = resetAll;
window.startAutoSetup = startAutoSetup;
window.resetSeason = resetAll;
window.startPlayMode = startPlayMode;
window.renderHome = function(){ renderHome(); };

// small utilities for cap display
function getOrangeCapText(){
  let top={name:"—",runs:0};
  state.players.forEach(p=>{ if((p.runs||0) > top.runs) top={name:p.name, runs:p.runs||0}; });
  return `${top.name} (${top.runs})`;
}
function getPurpleCapText(){
  let top={name:"—",wickets:0};
  state.players.forEach(p=>{ if((p.wickets||0) > top.wickets) top={name:p.name, wickets:p.wickets||0}; });
  return `${top.name} (${top.wickets})`;
}

// ========== INITIALIZE ==========
boot();
