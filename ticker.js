;(function(){

const SUPABASE_URL = "https://qaocbodrflsaerxntfui.supabase.co"
const SUPABASE_KEY = "sb_publishable_eIeO9MihyuQDuNHy60Ubrw_8ZuSKPFU"

const HOME_ADV = 80

function calculateOdds(homeRating, awayRating){
  const homeAdj = homeRating + HOME_ADV
  const diff = Math.abs(homeAdj - awayRating)
  let drawProb = 0.25 * Math.exp(-diff / 400)
  drawProb = Math.max(0.10, Math.min(0.30, drawProb))
  const probHomeRaw = 1 / (1 + Math.pow(10, (awayRating - homeAdj) / 400))
  const probAwayRaw = 1 - probHomeRaw
  const probHome = probHomeRaw * (1 - drawProb)
  const probAway = probAwayRaw * (1 - drawProb)
  return {
    home: (1 / probHome).toFixed(2),
    draw: (1 / drawProb).toFixed(2),
    away: (1 / probAway).toFixed(2),
  }
}

// Injektuj styly
const style = document.createElement('style')
style.textContent = `
#ticker-bar {
  background: #0b2a3c;
  display: flex;
  align-items: center;
  position: relative;
  height: 64px;
  overflow: hidden;
  user-select: none;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
#ticker-track-wrap {
  flex: 1;
  overflow: hidden;
  height: 100%;
  position: relative;
}
#ticker-track {
  display: flex;
  height: 100%;
  transition: transform .25s ease;
}
.ticker-btn {
  background: rgba(255,255,255,.08);
  border: none;
  color: white;
  width: 32px;
  height: 100%;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s;
  z-index: 2;
}
.ticker-btn:hover { background: rgba(255,255,255,.16); }
.ticker-btn:disabled { opacity: .3; cursor: default; }

/* Box obecný */
.t-box {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  border-right: 1px solid rgba(255,255,255,.07);
  cursor: pointer;
  flex-shrink: 0;
  min-width: 160px;
  gap: 8px;
  transition: background .15s;
  box-sizing: border-box;
}
.t-box:hover { background: rgba(255,255,255,.05); }

/* Soutěž box (nadcházející bez zápasu) */
.t-box.t-league {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  min-width: 130px;
  cursor: default;
}
.t-league-name {
  font-size: 11px;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: .04em;
  line-height: 1.2;
}
.t-league-arrow {
  width: 20px;
  height: 20px;
  background: #2f9ec9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  flex-shrink: 0;
}

/* Odehraný zápas */
.t-box.t-played {
  min-width: 170px;
  gap: 6px;
}
.t-logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
  background: white;
  border-radius: 4px;
  padding: 2px;
  flex-shrink: 0;
}
.t-teams {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.t-team-row {
  display: flex;
  align-items: center;
  gap: 5px;
}
.t-team-name {
  font-size: 11px;
  color: #a8d4ee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}
.t-score-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  flex-shrink: 0;
}
.t-score {
  font-size: 13px;
  font-weight: 800;
  color: white;
  width: 20px;
  text-align: center;
  line-height: 1;
}
.t-tag {
  font-size: 9px;
  font-weight: 700;
  background: #2f9ec9;
  color: white;
  padding: 1px 4px;
  border-radius: 3px;
  text-align: center;
}

/* Nadcházející zápas */
.t-box.t-upcoming {
  min-width: 200px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 3px;
  padding: 4px 12px;
}
.t-upcoming-teams {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}
.t-upcoming-name {
  font-size: 11px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70px;
}
.t-vs {
  font-size: 10px;
  color: #7ab0cc;
  flex-shrink: 0;
}
.t-odds {
  display: flex;
  gap: 4px;
  align-items: center;
}
.t-odd {
  background: #1a5276;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 34px;
  text-align: center;
}
.t-odd.t-odd-mid {
  background: #1a4a3c;
}

/* Separátor soutěže */
.t-separator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 10px;
  border-right: 1px solid rgba(255,255,255,.07);
  flex-shrink: 0;
  gap: 4px;
  min-width: 110px;
  cursor: default;
}
.t-sep-name {
  font-size: 10px;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: .05em;
  text-align: center;
  line-height: 1.2;
}
.t-sep-arrow {
  width: 18px;
  height: 18px;
  background: #2f9ec9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  flex-shrink: 0;
}
`
document.head.appendChild(style)

// Vytvoř HTML strukturu
const bar = document.createElement('div')
bar.id = 'ticker-bar'
bar.innerHTML = `
  <button class="ticker-btn" id="ticker-prev">&#8249;</button>
  <div id="ticker-track-wrap">
    <div id="ticker-track"></div>
  </div>
  <button class="ticker-btn" id="ticker-next">&#8250;</button>
`
document.body.insertBefore(bar, document.body.firstChild)

const track = document.getElementById('ticker-track')
const btnPrev = document.getElementById('ticker-prev')
const btnNext = document.getElementById('ticker-next')

let offset = 0
const SCROLL_STEP = 2 // počet boxů na jedno kliknutí
let boxWidth = 170

function getVisibleCount(){
  const wrapW = document.getElementById('ticker-track-wrap').offsetWidth
  return Math.floor(wrapW / boxWidth)
}

function getTotalBoxes(){
  return track.children.length
}

function updateButtons(){
  btnPrev.disabled = offset <= 0
  btnNext.disabled = offset >= getTotalBoxes() - getVisibleCount()
}

function scrollTo(newOffset){
  const max = Math.max(0, getTotalBoxes() - getVisibleCount())
  offset = Math.max(0, Math.min(newOffset, max))
  track.style.transform = `translateX(-${offset * boxWidth}px)`
  updateButtons()
}

btnPrev.onclick = () => scrollTo(offset - SCROLL_STEP)
btnNext.onclick = () => scrollTo(offset + SCROLL_STEP)

// Zkrácení názvu týmu
function shortName(name){
  return name
    .replace(/^HC\s+/i, '')
    .replace(/^HK\s+/i, '')
    .split(' ')[0]
}

// Načti data
async function loadTicker(){
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm')
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Načti týmy
  const { data: teams } = await sb.from('teams').select('*')
  const teamMap = {}
  ;(teams||[]).forEach(t => teamMap[t.id] = t)

  // Načti sezóny + jejich zápasy – zjisti aktivní sezóny
  const { data: seasons } = await sb.from('seasons').select('*')
  const { data: allMatches } = await sb.from('matches').select('id,season_id,home_team,away_team,home_score,away_score,played,played_at,round,result_type,stage_id')

  if(!allMatches || !allMatches.length) return

  // Zjisti aktivní sezóny = sezóny které mají alespoň 1 zápas
  const activeSeasonsIds = new Set()
  allMatches.forEach(m => activeSeasonsIds.add(m.season_id))

  const activeSeasons = (seasons||[]).filter(s => activeSeasonsIds.has(s.id))

  // Název soutěže – potřebujeme competition
  const { data: competitions } = await sb.from('competitions').select('*')
  const compMap = {}
  ;(competitions||[]).forEach(c => compMap[c.id] = c)

  const seasonMap = {}
  ;(seasons||[]).forEach(s => seasonMap[s.id] = s)

  // Odehrané zápasy – max 100 nejnovějších podle played_at
  const played = allMatches
    .filter(m => m.played && m.home_score != null)
    .sort((a,b) => {
      if(!a.played_at && !b.played_at) return 0
      if(!a.played_at) return 1
      if(!b.played_at) return -1
      return new Date(b.played_at) - new Date(a.played_at)
    })
    .slice(0, 100)

  // Nadcházející zápasy – 2 nejbližší z každé aktivní sezóny
  const upcoming = []
  activeSeasons.forEach(season => {
    const seasonUnplayed = allMatches
      .filter(m => !m.played && m.season_id === season.id)
      .sort((a,b) => Number(a.round) - Number(b.round))
      .slice(0, 2)
    seasonUnplayed.forEach(m => upcoming.push({ ...m, _season: season }))
  })

  // Vykresli track
  track.innerHTML = ''

  // Nejdřív nadcházející (vpravo – přidáme je na konec)
  // Skupinuj upcoming podle sezóny
  const upcomingBySeason = {}
  upcoming.forEach(m => {
    const sid = m.season_id
    if(!upcomingBySeason[sid]) upcomingBySeason[sid] = []
    upcomingBySeason[sid].push(m)
  })

  // Odehrané zápasy
  played.forEach(m => {
    const home = teamMap[m.home_team]
    const away = teamMap[m.away_team]
    if(!home || !away) return

    const tag = m.result_type === 'SN' ? 'SN' : m.result_type === 'OT' ? 'OT' : ''

    const box = document.createElement('div')
    box.className = 't-box t-played'
    box.title = `${home.name} vs ${away.name}`
    box.onclick = () => { window.location.href = `statistiky-zapasu.html?id=${m.id}` }
    box.innerHTML = `
      <div class="t-teams">
        <div class="t-team-row">
          <img class="t-logo" src="./logos/${home.logo}" onerror="this.style.display='none'">
          <span class="t-team-name">${shortName(home.name)}</span>
        </div>
        <div class="t-team-row">
          <img class="t-logo" src="./logos/${away.logo}" onerror="this.style.display='none'">
          <span class="t-team-name">${shortName(away.name)}</span>
        </div>
      </div>
      <div class="t-score-col">
        <span class="t-score">${m.home_score}</span>
        <span class="t-score">${m.away_score}</span>
        ${tag ? `<span class="t-tag">${tag}</span>` : ''}
      </div>
    `
    track.appendChild(box)
  })

  // Nadcházející zápasy (na konci, skupinované se separátorem soutěže)
  Object.entries(upcomingBySeason).forEach(([seasonId, matches]) => {
    const season = seasonMap[seasonId]
    const comp = season ? compMap[season.competition_id] : null
    const compName = comp ? comp.name : (season ? season.name : '?')

    // Separátor soutěže
    const sep = document.createElement('div')
    sep.className = 't-separator'
    sep.innerHTML = `
      <span class="t-sep-name">${compName}</span>
      <span class="t-sep-arrow">&#8250;</span>
    `
    track.appendChild(sep)

    // Zápasy
    matches.forEach(m => {
      const home = teamMap[m.home_team]
      const away = teamMap[m.away_team]
      if(!home || !away) return

      const odds = calculateOdds(home.rating_form || 1000, away.rating_form || 1000)

      const box = document.createElement('div')
      box.className = 't-box t-upcoming'
      box.onclick = () => { window.location.href = `vsad-si.html?id=${m.id}` }
      box.innerHTML = `
        <div class="t-upcoming-teams">
          <img class="t-logo" src="./logos/${home.logo}" onerror="this.style.display='none'">
          <span class="t-upcoming-name">${shortName(home.name)}</span>
          <span class="t-vs">vs</span>
          <img class="t-logo" src="./logos/${away.logo}" onerror="this.style.display='none'">
          <span class="t-upcoming-name">${shortName(away.name)}</span>
        </div>
        <div class="t-odds">
          <span class="t-odd">${odds.home}</span>
          <span class="t-odd t-odd-mid">${odds.draw}</span>
          <span class="t-odd">${odds.away}</span>
        </div>
      `
      track.appendChild(box)
    })
  })

  // Změř skutečnou šířku boxu
  const firstBox = track.querySelector('.t-box')
  if(firstBox) boxWidth = firstBox.offsetWidth

  // Scrolluj na konec (nadcházející jsou vpravo)
  const total = track.children.length
  const visible = getVisibleCount()
  scrollTo(Math.max(0, total - visible))

  updateButtons()
}

loadTicker()

})()
