<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mistrovství světa</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',Arial,sans-serif;background:#0a0e1a;color:#e8eaf0;min-height:100vh;}

.hero{background:linear-gradient(135deg,#0a0e1a 0%,#0d1f3c 40%,#1a0a2e 100%);padding:0 0 40px;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(ellipse at 60% 40%,rgba(212,175,55,0.08) 0%,transparent 60%);pointer-events:none;}
.hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent);}

.hero-inner{max-width:1300px;margin:auto;padding:24px 20px 0;}
.hero-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;}
.hero-logo{display:flex;align-items:center;gap:14px;}
.hero-logo-icon{width:52px;height:52px;background:linear-gradient(135deg,#d4af37,#f5d97a);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 4px 20px rgba(212,175,55,0.3);}
.hero-logo-text{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:white;letter-spacing:.5px;line-height:1.2;}
.hero-logo-sub{font-size:12px;color:rgba(212,175,55,0.8);font-weight:500;letter-spacing:1px;text-transform:uppercase;}

.season-tabs{display:flex;gap:8px;flex-wrap:wrap;}
.season-tab{padding:7px 16px;border-radius:20px;border:1px solid rgba(212,175,55,0.3);background:rgba(212,175,55,0.05);font-size:12px;font-weight:600;cursor:pointer;color:rgba(212,175,55,0.7);transition:all .15s;font-family:'Inter',sans-serif;}
.season-tab:hover{background:rgba(212,175,55,0.15);border-color:rgba(212,175,55,0.6);}
.season-tab.active{background:linear-gradient(135deg,#d4af37,#f5d97a);color:#0a0e1a;border-color:transparent;box-shadow:0 2px 12px rgba(212,175,55,0.4);}

.hero-title{text-align:center;padding:20px 0 30px;}
.hero-title h1{font-family:'Rajdhani',sans-serif;font-size:clamp(32px,5vw,56px);font-weight:700;color:white;letter-spacing:1px;line-height:1.1;}
.hero-title h1 span{background:linear-gradient(135deg,#d4af37,#f5d97a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.hero-title p{color:rgba(255,255,255,0.5);font-size:14px;margin-top:8px;letter-spacing:.5px;}

.main{max-width:1300px;margin:auto;padding:40px 20px;}

.section-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;}
.section-header h2{font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:white;letter-spacing:.5px;}
.section-line{flex:1;height:1px;background:linear-gradient(90deg,rgba(212,175,55,0.4),transparent);}
.section-badge{background:linear-gradient(135deg,#d4af37,#f5d97a);color:#0a0e1a;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:.5px;text-transform:uppercase;}

.groups-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:24px;margin-bottom:48px;}

.group-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;}
.group-card-header{background:linear-gradient(135deg,rgba(212,175,55,0.15),rgba(212,175,55,0.05));padding:14px 20px;border-bottom:1px solid rgba(212,175,55,0.2);display:flex;align-items:center;gap:8px;}
.group-card-header h3{font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#d4af37;letter-spacing:.5px;}
.group-table{width:100%;border-collapse:collapse;}
.group-table thead tr{border-bottom:1px solid rgba(255,255,255,0.06);}
.group-table thead th{padding:10px 12px;text-align:center;font-size:10px;font-weight:600;color:rgba(255,255,255,0.35);letter-spacing:.08em;text-transform:uppercase;}
.group-table thead th.th-team{text-align:left;}
.group-table tbody tr{border-bottom:1px solid rgba(255,255,255,0.04);transition:background .15s;}
.group-table tbody tr:hover{background:rgba(255,255,255,0.04);}
.group-table tbody tr:last-child{border-bottom:none;}
.group-table tbody td{padding:10px 12px;text-align:center;font-size:13px;color:rgba(255,255,255,0.8);}
.group-table tbody td.td-team{text-align:left;}
.gt-rank{font-weight:700;color:rgba(255,255,255,0.4);font-size:12px;width:28px;}
.gt-team-cell{display:flex;align-items:center;gap:10px;}
.gt-logo{width:28px;height:28px;object-fit:contain;border-radius:4px;}
.gt-name{font-weight:600;font-size:13px;color:white;}
.gt-pts{background:linear-gradient(135deg,#d4af37,#f5d97a);color:#0a0e1a;font-weight:700;font-size:13px;padding:3px 10px;border-radius:6px;display:inline-block;min-width:30px;text-align:center;}
.gt-w{color:#4ade80;font-weight:600;}
.gt-l{color:#f87171;font-weight:600;}
.gt-num{color:rgba(255,255,255,0.5);font-weight:500;}

.matches-section{margin-bottom:48px;}
.matches-grid{display:flex;flex-direction:column;gap:8px;}
.match-row{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px 20px;display:grid;grid-template-columns:40px 1fr auto 1fr 160px;align-items:center;gap:12px;transition:all .15s;}
.match-row:hover{background:rgba(255,255,255,0.06);border-color:rgba(212,175,55,0.2);}
.match-row.played{border-color:rgba(74,222,128,0.15);}
.match-round{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;padding:4px 8px;border-radius:6px;text-align:center;font-family:'Rajdhani',sans-serif;}
.match-team{display:flex;align-items:center;gap:10px;}
.match-team.away{flex-direction:row-reverse;}
.match-logo{width:32px;height:32px;object-fit:contain;border-radius:6px;}
.match-name{font-weight:600;font-size:13px;color:white;}
.match-score{text-align:center;}
.score-box{background:rgba(255,255,255,0.08);border-radius:8px;padding:6px 16px;font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:white;min-width:70px;text-align:center;display:inline-block;}
.score-box.played{background:linear-gradient(135deg,rgba(212,175,55,0.2),rgba(212,175,55,0.1));border:1px solid rgba(212,175,55,0.3);}
.score-box.empty{color:rgba(255,255,255,0.25);font-size:14px;}
.match-tag{font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;margin-top:4px;display:inline-block;}
.match-tag.ot{background:rgba(251,191,36,0.2);color:#fbbf24;}
.match-tag.sn{background:rgba(167,139,250,0.2);color:#a78bfa;}
.match-actions{display:flex;gap:6px;justify-content:flex-end;}
.btn-sm{display:inline-flex;align-items:center;gap:4px;border:none;border-radius:7px;cursor:pointer;font-weight:600;font-size:11px;padding:6px 10px;transition:all .15s;white-space:nowrap;font-family:'Inter',sans-serif;}
.btn-detail{background:rgba(30,80,140,0.6);color:#7dd3fc;border:1px solid rgba(125,211,252,0.2);}
.btn-detail:hover{background:rgba(30,80,140,0.9);}
.btn-bet{background:rgba(39,174,96,0.2);color:#4ade80;border:1px solid rgba(74,222,128,0.2);}
.btn-bet:hover{background:rgba(39,174,96,0.4);}

/* BRACKET */
.bracket-section{margin-bottom:48px;}
.bracket-wrap{overflow-x:auto;padding-bottom:12px;}
.bracket{display:flex;gap:0;align-items:stretch;min-width:900px;}
.bracket-round{display:flex;flex-direction:column;flex:1;}
.bracket-round-title{text-align:center;font-size:11px;font-weight:700;color:rgba(212,175,55,0.7);letter-spacing:.08em;text-transform:uppercase;padding:0 8px 16px;font-family:'Rajdhani',sans-serif;}
.bracket-matches{display:flex;flex-direction:column;justify-content:space-around;flex:1;gap:8px;padding:0 8px;}
.bracket-match{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;transition:all .15s;}
.bracket-match:hover{border-color:rgba(212,175,55,0.3);}
.bracket-match.played{border-color:rgba(74,222,128,0.2);}
.bm-team{display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid rgba(255,255,255,0.05);}
.bm-team:last-child{border-bottom:none;}
.bm-team.winner{background:rgba(212,175,55,0.08);}
.bm-logo{width:22px;height:22px;object-fit:contain;border-radius:3px;flex-shrink:0;}
.bm-name{font-size:12px;font-weight:600;color:rgba(255,255,255,0.8);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bm-name.winner{color:#f5d97a;}
.bm-score{font-size:13px;font-weight:700;color:rgba(255,255,255,0.5);}
.bm-score.winner{color:#d4af37;}
.bracket-connector{display:flex;flex-direction:column;justify-content:space-around;width:20px;flex-shrink:0;}
.bc-line{flex:1;border-right:1px solid rgba(212,175,55,0.2);}

.bracket-round-3rd{display:flex;flex-direction:column;justify-content:flex-end;flex:1;}
.bracket-3rd-label{text-align:center;font-size:10px;font-weight:700;color:rgba(167,139,250,0.7);letter-spacing:.08em;text-transform:uppercase;padding:0 8px 8px;font-family:'Rajdhani',sans-serif;}

.empty-bracket{text-align:center;padding:60px 20px;color:rgba(255,255,255,0.2);font-size:14px;}
.empty-bracket .icon{font-size:40px;margin-bottom:12px;}

.loading-state{text-align:center;padding:80px 20px;color:rgba(255,255,255,0.3);}
.loading-state .spinner{width:36px;height:36px;border:3px solid rgba(212,175,55,0.2);border-top-color:#d4af37;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px;}
@keyframes spin{to{transform:rotate(360deg)}}

.filter-bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:20px;}
.filter-select{padding:8px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:white;font-size:13px;font-family:'Inter',sans-serif;cursor:pointer;outline:none;}
.filter-select option{background:#0d1f3c;color:white;}
.filter-select:focus{border-color:rgba(212,175,55,0.4);}

@media(max-width:700px){
  .groups-grid{grid-template-columns:1fr;}
  .match-row{grid-template-columns:32px 1fr auto 1fr;gap:8px;}
  .match-actions{display:none;}
}
</style>
</head>
<body>
<script src="./ticker.js" defer></script>
<script src="./menu.js" defer></script>

<div class="hero">
  <div class="hero-inner">
    <div class="hero-nav">
      <div class="hero-logo">
        <div class="hero-logo-icon">🏒</div>
        <div>
          <div class="hero-logo-text">Mistrovství světa</div>
          <div class="hero-logo-sub">World Championship</div>
        </div>
      </div>
      <div class="season-tabs" id="seasonTabs"></div>
    </div>
    <div class="hero-title">
      <h1>MS <span id="heroSeasonName">—</span></h1>
      <p id="heroSeasonSub">Vyberte sezónu</p>
    </div>
  </div>
</div>

<div class="main">
  <div id="mainContent">
    <div class="loading-state"><div class="spinner"></div><div>Načítám data...</div></div>
  </div>
</div>

<script type="module">
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient("https://qaocbodrflsaerxntfui.supabase.co","sb_publishable_eIeO9MihyuQDuNHy60Ubrw_8ZuSKPFU")
const MS_COMPETITION_ID = "f0375c91-5b76-475e-afab-3d867b6b02d1"

let allSeasons=[], allStages=[], allTeams={}, currentSeasonId=null

async function init(){
  const [sRes,stRes,tRes] = await Promise.all([
    supabase.from("seasons").select("*").eq("competition_id",MS_COMPETITION_ID).order("created_at",{ascending:true}),
    supabase.from("stages").select("*").order("order",{ascending:true}),
    supabase.from("teams").select("*"),
  ])
  allSeasons = sRes.data||[]
  allStages = stRes.data||[]
  ;(tRes.data||[]).forEach(t=>allTeams[t.id]=t)

  const tabs = document.getElementById("seasonTabs")
  tabs.innerHTML=""
  if(!allSeasons.length){
    document.getElementById("mainContent").innerHTML=`<div class="loading-state"><div class="icon">🏒</div><p>Zatím žádná sezóna MS.<br>Vytvoř ji v Zápisech.</p></div>`
    return
  }

  allSeasons.forEach((s,i)=>{
    const btn=document.createElement("button")
    btn.className="season-tab"+(i===allSeasons.length-1?" active":"")
    btn.textContent=s.name
    btn.onclick=()=>{ tabs.querySelectorAll(".season-tab").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); loadSeason(s.id) }
    tabs.appendChild(btn)
  })

  const last=allSeasons[allSeasons.length-1]
  loadSeason(last.id)
}

async function loadSeason(seasonId){
  currentSeasonId=seasonId
  const season=allSeasons.find(s=>s.id===seasonId)
  document.getElementById("heroSeasonName").textContent=season?.name||""
  document.getElementById("heroSeasonSub").textContent=""
  document.getElementById("mainContent").innerHTML=`<div class="loading-state"><div class="spinner"></div><div>Načítám...</div></div>`

  const stages=allStages.filter(s=>s.season_id===seasonId)
  const {data:matches}=await supabase.from("matches").select("*").eq("season_id",seasonId)
  const allM=matches||[]

  const {data:stData}=await supabase.from("season_teams").select("team_id").eq("season_id",seasonId)
  const seasonTeamIds=new Set((stData||[]).map(r=>r.team_id))

  // Roztřiď stages
  const groupStages=stages.filter(s=>!s.parent_stage_id&&(s.name.startsWith("Skupina")||s.name==="Základní část"))
  const playoffParent=stages.find(s=>s.name==="Playoff"&&!s.parent_stage_id)
  const playoffStages=playoffParent?stages.filter(s=>s.parent_stage_id===playoffParent.id):[]
  const qfStages=playoffStages.filter(s=>s.name.startsWith("Čtvrtfinále"))
  const sfStages=playoffStages.filter(s=>s.name.startsWith("Semifinále"))
  const thirdStage=playoffStages.find(s=>s.name==="O 3. místo")
  const finalStage=playoffStages.find(s=>s.name==="Finále")

  let html=""

  // TABULKY SKUPIN
  if(groupStages.length){
    html+=`<div class="section-header"><h2>Základní část</h2><div class="section-line"></div><span class="section-badge">Tabulky</span></div>`
    html+=`<div class="groups-grid">`
    for(const gs of groupStages){
      const gMatches=allM.filter(m=>m.stage_id===gs.id&&m.home_score!=null)
      html+=renderGroupTable(gs,gMatches,seasonTeamIds)
    }
    html+=`</div>`

    // Zápasy základní části
    html+=`<div class="matches-section">`
    html+=`<div class="section-header"><h2>Zápasy základní části</h2><div class="section-line"></div></div>`
    html+=`<div class="matches-grid">`
    for(const gs of groupStages){
      const gMatches=allM.filter(m=>m.stage_id===gs.id)
      if(groupStages.length>1) html+=`<div style="padding:8px 4px;font-size:11px;font-weight:700;color:rgba(212,175,55,0.6);letter-spacing:.08em;text-transform:uppercase;">${gs.name}</div>`
      gMatches.sort((a,b)=>Number(a.round)-Number(b.round)).forEach(m=>{ html+=renderMatchRow(m) })
    }
    html+=`</div></div>`
  }

  // PLAYOFF BRACKET
  if(playoffParent && (qfStages.length||sfStages.length||finalStage)){
    html+=`<div class="bracket-section">`
    html+=`<div class="section-header"><h2>Playoff</h2><div class="section-line"></div><span class="section-badge">Pavouk</span></div>`
    html+=renderBracket(allM, qfStages, sfStages, thirdStage, finalStage)
    html+=`</div>`
  }

  document.getElementById("mainContent").innerHTML=html
}

function renderGroupTable(stage, matches, seasonTeamIds){
  // Zjisti týmy z zápasů nebo ze season_teams
  const teamIds=new Set()
  matches.forEach(m=>{ teamIds.add(m.home_team); teamIds.add(m.away_team) })
  // Pokud ještě nejsou zápasy, zobraz prázdnou tabulku
  const table={}
  ;[...teamIds].forEach(id=>{ table[id]={b:0,z:0,v:0,p:0,vsn:0,psn:0,gf:0,ga:0} })

  matches.forEach(m=>{
    const h=table[m.home_team], a=table[m.away_team]
    if(!h||!a) return
    const hg=Number(m.home_score), ag=Number(m.away_score)
    h.z++;a.z++; h.gf+=hg;h.ga+=ag; a.gf+=ag;a.ga+=hg
    let stats=null; try{stats=m.stats?JSON.parse(m.stats):null}catch(e){}
    const isSN=stats&&(stats[20]==="1"||stats[20]==="2")
    const isOT=stats&&!isSN&&(stats[9]==="11"||stats[19]==="11")
    if(isSN||isOT){
      if(hg>ag){h.vsn++;h.b+=2;a.psn++;a.b+=1}else{a.vsn++;a.b+=2;h.psn++;h.b+=1}
    }else{
      if(hg>ag){h.v++;h.b+=3;a.p++}else{a.v++;a.b+=3;h.p++}
    }
  })

  const arr=Object.values(table).sort((a,b)=>b.b-a.b||(b.gf-b.ga)-(a.gf-a.ga))
  let rows=""
  if(!arr.length){
    rows=`<tr><td colspan="8" style="text-align:center;padding:20px;color:rgba(255,255,255,0.2);font-size:13px;">Zatím žádné zápasy</td></tr>`
  } else {
    arr.forEach((t,i)=>{
      const team=allTeams[t.team]
      if(!team) return
      const pm=t.gf-t.ga
      rows+=`<tr>
        <td class="gt-rank">${i+1}</td>
        <td class="td-team"><div class="gt-team-cell"><img class="gt-logo" src="./logos/${team.logo}" onerror="this.style.display='none'"><span class="gt-name">${team.name}</span></div></td>
        <td><span class="gt-pts">${t.b}</span></td>
        <td class="gt-num">${t.z}</td>
        <td class="gt-w">${t.v}</td>
        <td class="gt-l">${t.p}</td>
        <td class="gt-num">${t.gf}:${t.ga}</td>
        <td class="gt-num" style="color:${pm>0?'#4ade80':pm<0?'#f87171':'rgba(255,255,255,0.4)'}">${pm>0?'+'+pm:pm}</td>
      </tr>`
    })
  }

  // Oprava: přiřadíme team id do objektu
  Object.keys(table).forEach(id=>table[id].team=id)
  const arr2=Object.entries(table).map(([id,v])=>({...v,team:id})).sort((a,b)=>b.b-a.b||(b.gf-b.ga)-(a.gf-a.ga))
  let rows2=""
  if(!arr2.length){
    rows2=`<tr><td colspan="8" style="text-align:center;padding:20px;color:rgba(255,255,255,0.2);font-size:13px;">Zatím žádné zápasy</td></tr>`
  } else {
    arr2.forEach((t,i)=>{
      const team=allTeams[t.team]
      if(!team) return
      const pm=t.gf-t.ga
      rows2+=`<tr>
        <td class="gt-rank">${i+1}</td>
        <td class="td-team"><div class="gt-team-cell"><img class="gt-logo" src="./logos/${team.logo}" onerror="this.style.display='none'"><span class="gt-name">${team.name}</span></div></td>
        <td><span class="gt-pts">${t.b}</span></td>
        <td class="gt-num">${t.z}</td>
        <td class="gt-w">${t.v}</td>
        <td class="gt-l">${t.p}</td>
        <td class="gt-num">${t.gf}:${t.ga}</td>
        <td class="gt-num" style="color:${pm>0?'#4ade80':pm<0?'#f87171':'rgba(255,255,255,0.4)'}">${pm>0?'+'+pm:pm}</td>
      </tr>`
    })
  }

  return `<div class="group-card">
    <div class="group-card-header"><h3>🏒 ${stage.name}</h3></div>
    <table class="group-table">
      <thead><tr>
        <th style="width:28px">#</th>
        <th class="th-team">Tým</th>
        <th>Body</th><th>Z</th><th>V</th><th>P</th><th>Skóre</th><th>+/-</th>
      </tr></thead>
      <tbody>${rows2}</tbody>
    </table>
  </div>`
}

function renderMatchRow(m){
  const home=allTeams[m.home_team], away=allTeams[m.away_team]
  if(!home||!away) return ""
  const played=m.home_score!=null
  let tag=""
  if(played){
    let stats=null; try{stats=m.stats?JSON.parse(m.stats):null}catch(e){}
    const isSN=stats&&(stats[20]==="1"||stats[20]==="2")
    const isOT=stats&&!isSN&&(stats[9]==="11"||stats[19]==="11")
    if(isSN) tag=`<span class="match-tag sn">SN</span>`
    else if(isOT) tag=`<span class="match-tag ot">OT</span>`
  }
  const scoreHtml=played
    ?`<div><span class="score-box played">${m.home_score} : ${m.away_score}</span>${tag}</div>`
    :`<span class="score-box empty">- : -</span>`

  return `<div class="match-row ${played?'played':''}">
    <span class="match-round">${m.round}</span>
    <div class="match-team">
      <img class="match-logo" src="./logos/${home.logo}" onerror="this.style.display='none'">
      <span class="match-name">${home.name}</span>
    </div>
    <div class="match-score">${scoreHtml}</div>
    <div class="match-team away">
      <img class="match-logo" src="./logos/${away.logo}" onerror="this.style.display='none'">
      <span class="match-name">${away.name}</span>
    </div>
    <div class="match-actions">
      <button class="btn-sm btn-detail" onclick="window.location.href='statistiky-zapasu.html?id=${m.id}'">📊 Statistiky</button>
      <button class="btn-sm btn-bet" onclick="window.location.href='vsad-si.html?id=${m.id}'">🎲 Vsaď si</button>
    </div>
  </div>`
}

function renderBracketMatch(m, label){
  if(!m) return `<div class="bracket-match">
    <div class="bm-team"><span class="bm-name" style="color:rgba(255,255,255,0.2);">TBD</span><span class="bm-score">—</span></div>
    <div class="bm-team"><span class="bm-name" style="color:rgba(255,255,255,0.2);">TBD</span><span class="bm-score">—</span></div>
  </div>`
  const home=allTeams[m.home_team], away=allTeams[m.away_team]
  if(!home||!away) return ""
  const played=m.home_score!=null
  const hg=played?Number(m.home_score):null, ag=played?Number(m.away_score):null
  const hWin=played&&hg>ag, aWin=played&&ag>hg
  return `<div class="bracket-match ${played?'played':''}">
    <div class="bm-team ${hWin?'winner':''}">
      <img class="bm-logo" src="./logos/${home.logo}" onerror="this.style.display='none'">
      <span class="bm-name ${hWin?'winner':''}">${home.name}</span>
      <span class="bm-score ${hWin?'winner':''}">${played?hg:'—'}</span>
    </div>
    <div class="bm-team ${aWin?'winner':''}">
      <img class="bm-logo" src="./logos/${away.logo}" onerror="this.style.display='none'">
      <span class="bm-name ${aWin?'winner':''}">${away.name}</span>
      <span class="bm-score ${aWin?'winner':''}">${played?ag:'—'}</span>
    </div>
  </div>`
}

function renderBracket(allM, qfStages, sfStages, thirdStage, finalStage){
  const getMatch=(stage)=>stage?allM.find(m=>m.stage_id===stage.id)||null:null
  const qfMatches=qfStages.map(s=>getMatch(s))
  const sfMatches=sfStages.map(s=>getMatch(s))
  const thirdMatch=getMatch(thirdStage)
  const finalMatch=getMatch(finalStage)

  let html=`<div class="bracket-wrap"><div class="bracket">`

  // ČF
  if(qfStages.length){
    html+=`<div class="bracket-round">
      <div class="bracket-round-title">Čtvrtfinále</div>
      <div class="bracket-matches">`
    qfMatches.forEach((m,i)=>{ html+=renderBracketMatch(m,`ČF${i+1}`) })
    html+=`</div></div>`
    html+=`<div class="bracket-connector">${qfMatches.map(()=>`<div class="bc-line"></div>`).join('')}</div>`
  }

  // SF
  if(sfStages.length){
    html+=`<div class="bracket-round">
      <div class="bracket-round-title">Semifinále</div>
      <div class="bracket-matches">`
    sfMatches.forEach((m,i)=>{ html+=renderBracketMatch(m,`SF${i+1}`) })
    html+=`</div></div>`
    html+=`<div class="bracket-connector">${sfMatches.map(()=>`<div class="bc-line"></div>`).join('')}</div>`
  }

  // Finále + O 3. místo
  html+=`<div class="bracket-round">
    <div class="bracket-round-title">Finále</div>
    <div class="bracket-matches">`
  if(thirdStage){
    html+=`<div style="text-align:center;font-size:10px;font-weight:700;color:rgba(167,139,250,0.6);letter-spacing:.08em;margin-bottom:6px;">O 3. MÍSTO</div>`
    html+=renderBracketMatch(thirdMatch,"O 3.")
    html+=`<div style="height:16px;"></div>`
  }
  html+=`<div style="text-align:center;font-size:10px;font-weight:700;color:rgba(212,175,55,0.8);letter-spacing:.08em;margin-bottom:6px;">🏆 FINÁLE</div>`
  html+=renderBracketMatch(finalMatch,"Finále")
  html+=`</div></div>`

  html+=`</div></div>`
  return html
}

init()
</script>
</body>
</html>
