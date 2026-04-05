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

function getShortName(team){
  return team.short_name || team.name
}

async function sbFetch(table, select, params){
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}`
  if(params) url += '&' + params
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  })
  return res.json()
}

const style = document.createElement('style')
style.textContent = `
#ticker-bar {
  background: #0a2233;
  display: flex;
  align-items: center;
  height: 64px;
  overflow: hidden;
  user-select: none;
  border-bottom: 2px solid #0b2a3c;
  position: relative;
  z-index: 1000;
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
  background: rgba(255,255,255,.06);
  border: none;
  color: #7ab0cc;
  width: 28px;
  height: 100%;
  cursor: pointer;
  font-size: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s;
  z-index: 2;
}
.ticker-btn:hover { background: rgba(255,255,255,.12); color: white; }
.ticker-btn:disabled { opacity: .25; cursor: default; }
.t-box {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  cursor: pointer;
  flex-shrink: 0;
  gap: 8px;
  transition: background .15s;
  box-sizing: border-box;
  position: relative;
}
.t-box::after {
  content: '';
  position: absolute;
  right: 0;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: rgba(255,255,255,.25);
  border-radius: 1px;
}
.t-box:hover { background: rgba(255,255,255,.05); }
.t-box.t-played { min-width: 175px; }
.t-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  background: white;
  border-radius: 5px;
  padding: 2px;
  flex-shrink: 0;
}
.t-teams {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}
.t-team-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.t-team-name {
  font-size: 12px;
  font-weight: 600;
  color: #c8e0f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
  font-family: Arial, sans-serif;
}
.t-score-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  flex-shrink: 0;
}
.t-score {
  font-size: 15px;
  font-weight: 800;
  color: white;
  width: 22px;
  text-align: center;
  line-height: 1;
  font-family: Arial, sans-serif;
}
.t-tag {
  font-size: 9px;
  font-weight: 700;
  background: #2f9ec9;
  color: white;
  padding: 1px 5px;
  border-radius: 3px;
  text-align: center;
  margin-top: 1px;
}
.t-box.t-upcoming {
  min-width: 210px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  padding: 6px 14px;
}
.t-upcoming-teams {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
}
.t-upcoming-name {
  font-size: 12px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 72px;
  font-family: Arial, sans-serif;
}
.t-vs {
  font-size: 10px;
  color: #7ab0cc;
  flex-shrink: 0;
  font-family: Arial, sans-serif;
}
.t-odds {
  display: flex;
  gap: 4px;
  align-items: center;
}
.t-odd {
  background: #1a5276;
  color: #ffd166;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  min-width: 36px;
  text-align: center;
  font-family: Arial, sans-serif;
}
.t-separator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 12px;
  flex-shrink: 0;
  gap: 5px;
  min-width: 100px;
  cursor: default;
  background: rgba(47,158,201,.1);
  position: relative;
}
.t-separator::after {
  content: '';
  position: absolute;
  right: 0;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: rgba(47,158,201,.6);
  border-radius: 1px;
}
.t-sep-name {
  font-size: 10px;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: .06em;
  text-align: center;
  line-height: 1.3;
  font-family: Arial, sans-serif;
}
.t-sep-arrow {
  width: 18px;
  height: 18px;
  background: #2f9ec9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
}
`
document.head.appendChild(style)

const bar = document.createElement('div')
bar.id = 'ticker-bar'
bar.innerHTML = `
  <button class="ticker-btn" id="ticker-prev">&#8249;</button>
  <div id="ticker-track-wrap">
    <div id="ticker-track"></div>
  </div>
  <button class="ticker-btn" id="ticker-next">&#8250;</button>
`

function insertTicker(){
  const nav = document.querySelector('nav')
  if(nav){
    document.body.insertBefore(bar, nav)
  } else {
    const observer = new MutationObserver(() => {
      const nav = document.querySelector('nav')
      if(nav){
        observer.disconnect()
        document.body.insertBefore(bar, nav)
      }
    })
    observer.observe(document.body, { childList: true })
    setTimeout(() => {
      if(!bar.parentElement){
        document.body.insertBefore(bar, document.body.firstChild)
      }
    }, 500)
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', insertTicker)
} else {
  insertTicker()
}

async function loadTicker(){
  try {
    const [teams, seasons, matches, competitions] = await Promise.all([
      sbFetch('teams', '*'),
      sbFetch('seasons', '*', 'order=created_at.asc'),
      sbFetch('matches', 'id,season_id,home_team,away_team,home_score,away_score,played,played_at,round,result_type'),
      sbFetch('competitions', '*'),
    ])

    const track = document.getElementById('ticker-track')
    const btnPrev = document.getElementById('ticker-prev')
    const btnNext = document.getElementById('ticker-next')

    let offset = 0
    const SCROLL_STEP = 2
    let boxWidth = 175

    function getVisibleCount(){
      const wrapW = document.getElementById('ticker-track-wrap').offsetWidth
      return Math.floor(wrapW / boxWidth)
    }
    function getTotalBoxes(){ return track.children.length }
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

    const teamMap = {}
    ;(teams||[]).forEach(t => teamMap[t.id] = t)
    const compMap = {}
    ;(competitions||[]).forEach(c => compMap[c.id] = c)
    const allMatches = matches || []
    const allSeasons = seasons || []

    // Pro každou competition vezmi NEJNOVĚJŠÍ sezónu která má zápasy
    const seasonsByComp = {}
    allSeasons.forEach(s => {
      if(!seasonsByComp[s.competition_id]) seasonsByComp[s.competition_id] = []
      seasonsByComp[s.competition_id].push(s)
    })

    // Aktivní sezóny = nejnovější sezóna každé competition která má alespoň 1 zápas
    const seasonsWithMatches = new Set(allMatches.map(m => m.season_id))
    const activeSeasons = []
    Object.values(seasonsByComp).forEach(seasonList => {
      // Seřaď od nejnovější (jsou seřazeny asc, takže poslední = nejnovější)
      const withMatches = seasonList.filter(s => seasonsWithMatches.has(s.id))
      if(withMatches.length > 0){
        activeSeasons.push(withMatches[withMatches.length - 1])
      }
    })

    const activeSeasonIds = new Set(activeSeasons.map(s => s.id))

    // Odehrané – max 100 nejnovějších ze všech aktivních sezón
    const played = allMatches
      .filter(m => m.played && m.home_score != null && activeSeasonIds.has(m.season_id))
      .sort((a,b) => {
        if(!a.played_at && !b.played_at) return 0
        if(!a.played_at) return 1
        if(!b.played_at) return -1
        return new Date(b.played_at) - new Date(a.played_at)
      })
      .slice(0, 100)

    // Nadcházející – 2 nejbližší z každé aktivní sezóny
    const upcomingBySeason = {}
    activeSeasons.forEach(season => {
      const unplayed = allMatches
        .filter(m => !m.played && m.season_id === season.id)
        .sort((a,b) => Number(a.round) - Number(b.round))
        .slice(0, 2)
      if(unplayed.length > 0) upcomingBySeason[season.id] = { season, matches: unplayed }
    })

    track.innerHTML = ''

    // Odehrané zápasy
    played.forEach(m => {
      const home = teamMap[m.home_team]
      const away = teamMap[m.away_team]
      if(!home || !away) return
      const tag = m.result_type === 'SN' ? 'SN' : m.result_type === 'OT' ? 'OT' : ''
      const box = document.createElement('div')
      box.className = 't-box t-played'
      box.onclick = () => { window.location.href = `statistiky-zapasu.html?id=${m.id}` }
      box.innerHTML = `
        <div class="t-teams">
          <div class="t-team-row">
            <img class="t-logo" src="./logos/${home.logo}" onerror="this.style.display='none'">
            <span class="t-team-name">${getShortName(home)}</span>
          </div>
          <div class="t-team-row">
            <img class="t-logo" src="./logos/${away.logo}" onerror="this.style.display='none'">
            <span class="t-team-name">${getShortName(away)}</span>
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

    // Nadcházející zápasy se separátorem
    Object.values(upcomingBySeason).forEach(({ season, matches }) => {
      const comp = compMap[season.competition_id]
      const compName = comp ? comp.name : season.name

      const sep = document.createElement('div')
      sep.className = 't-separator'
      sep.innerHTML = `
        <span class="t-sep-name">${compName}</span>
        <span class="t-sep-arrow">&#8250;</span>
      `
      track.appendChild(sep)

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
            <span class="t-upcoming-name">${getShortName(home)}</span>
            <span class="t-vs">vs</span>
            <img class="t-logo" src="./logos/${away.logo}" onerror="this.style.display='none'">
            <span class="t-upcoming-name">${getShortName(away)}</span>
          </div>
          <div class="t-odds">
            <span class="t-odd">${odds.home}</span>
            <span class="t-odd">${odds.draw}</span>
            <span class="t-odd">${odds.away}</span>
          </div>
        `
        track.appendChild(box)
      })
    })

    const firstBox = track.querySelector('.t-box')
    if(firstBox){
      boxWidth = firstBox.offsetWidth
      const total = track.children.length
      const visible = getVisibleCount()
      scrollTo(Math.max(0, total - visible))
    }
    updateButtons()

  } catch(err) {
    console.error('Ticker error:', err)
  }
}

loadTicker()

})()
