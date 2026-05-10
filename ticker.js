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

function isClubTeam(team, compMap){
  if(!team.competition_id) return true
  const comp = compMap[team.competition_id]
  if(!comp) return true
  const name = (comp.name || '').toLowerCase()
  return name.includes('extraliga') || name.includes('liga')
}

const style = document.createElement('style')
style.textContent = `
#ticker-bar {
  background: #0a2233;
  display: flex;
  align-items: center;
  height: 130px;
  overflow: hidden;
  user-select: none;
  border-bottom: 3px solid #163a52;
  position: relative;
  z-index: 1000;
  touch-action: pan-x;
}
#ticker-track-wrap {
  flex: 1;
  overflow: hidden;
  height: 100%;
  position: relative;
  cursor: grab;
}
#ticker-track-wrap.dragging { cursor: grabbing; }
#ticker-track {
  display: flex;
  height: 100%;
  transition: transform .25s ease;
  align-items: center;
}
#ticker-track.no-transition { transition: none; }
.ticker-btn {
  background: rgba(255,255,255,.06);
  border: none;
  color: #7ab0cc;
  width: 30px;
  height: 100%;
  cursor: pointer;
  font-size: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s;
  z-index: 2;
}
.ticker-btn:hover { background: rgba(255,255,255,.14); color: white; }
.ticker-btn:disabled { opacity: .2; cursor: default; }

.t-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 10px 14px;
  cursor: pointer;
  flex-shrink: 0;
  gap: 6px;
  transition: background .15s;
  box-sizing: border-box;
  min-width: 220px;
}
.t-box:hover { background: rgba(255,255,255,.05); }

.t-divider {
  width: 2px;
  height: 68px;
  background: rgba(255,255,255,.28);
  flex-shrink: 0;
  align-self: center;
  border-radius: 1px;
}

.t-logo {
  width: 32px;
  height: 32px;
  object-fit: cover;
  flex-shrink: 0;
}
.t-logo.t-logo-club {
  background: white;
  border-radius: 5px;
}
.t-logo.t-logo-national {
  background: transparent;
  border-radius: 50%;
}

.t-team-row {
  display: flex;
  align-items: center;
  gap: 7px;
}
.t-team-name {
  font-size: 13px;
  font-weight: 700;
  color: #c8e0f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  font-family: Arial, sans-serif;
}
.t-score-badge {
  background: #0d2f44;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 5px;
  min-width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
  padding: 0 7px;
  font-family: Arial, sans-serif;
}
.t-score-badge.empty {
  color: #4a7a99;
  font-size: 16px;
  font-weight: 400;
}
.t-score-badge.empty {
  color: #4a7a99;
  font-size: 14px;
  font-weight: 400;
}

.t-bottom {
  display: flex;
  gap: 5px;
  margin-top: 2px;
}
.t-odd {
  background: #1a5276;
  color: #ffd166;
  font-size: 13px;
  font-weight: 700;
  padding: 5px 4px;
  border-radius: 4px;
  flex: 1;
  text-align: center;
  font-family: Arial, sans-serif;
}
.t-stats-btn {
  background: #1a5276;
  color: #a8d4ee;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  text-align: center;
  font-family: Arial, sans-serif;
  width: 100%;
  letter-spacing: .03em;
}
.t-bets-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 0;
}
.t-bet {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 4px;
  text-align: left;
  font-family: Arial, sans-serif;
  white-space: nowrap;
}
.t-bet.won  { background: #14532d; color: #4ade80; }
.t-bet.lost { background: #450a0a; color: #f87171; }
.t-bet.pending { background: #1a3a52; color: #7ab0cc; }

.t-separator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 14px;
  flex-shrink: 0;
  gap: 6px;
  min-width: 100px;
  cursor: default;
  background: rgba(47,158,201,.07);
  border-left: 1px solid rgba(47,158,201,.3);
  border-right: 1px solid rgba(47,158,201,.3);
}
.t-sep-name {
  font-size: 10px;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: .07em;
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

function addDivider(track){
  const d = document.createElement('div')
  d.className = 't-divider'
  track.appendChild(d)
}

function logoClass(team, compMap){
  return isClubTeam(team, compMap) ? 't-logo-club' : 't-logo-national'
}

async function loadTicker(){
  try {
    const [teams, seasons, matches, competitions, betsRaw, playersRaw] = await Promise.all([
      sbFetch('teams', '*'),
      sbFetch('seasons', '*', 'order=created_at.asc'),
      sbFetch('matches', 'id,season_id,home_team,away_team,home_score,away_score,played,played_at,round,result_type'),
      sbFetch('competitions', '*'),
      sbFetch('bets', 'match_id,player_id,tip,amount,potential_win,status'),
      sbFetch('players', 'id,name'),
    ])

    const track = document.getElementById('ticker-track')
    const trackWrap = document.getElementById('ticker-track-wrap')
    const btnPrev = document.getElementById('ticker-prev')
    const btnNext = document.getElementById('ticker-next')

    let currentPx = 0
    const SCROLL_STEP = 2
    let boxWidth = 222

    function getMaxPx(){ return Math.max(0, track.scrollWidth - trackWrap.offsetWidth) }
    function updateButtons(){
      btnPrev.disabled = currentPx <= 0
      btnNext.disabled = currentPx >= getMaxPx()
    }
    function scrollToPx(px, animated){
      if(!animated) track.classList.add('no-transition')
      currentPx = Math.max(0, Math.min(px, getMaxPx()))
      track.style.transform = `translateX(-${currentPx}px)`
      if(!animated) requestAnimationFrame(() => track.classList.remove('no-transition'))
      updateButtons()
    }
    btnPrev.onclick = () => scrollToPx(currentPx - SCROLL_STEP * boxWidth, true)
    btnNext.onclick = () => scrollToPx(currentPx + SCROLL_STEP * boxWidth, true)

    let dragStartX = 0, dragStartPx = 0, isDragging = false
    trackWrap.addEventListener('mousedown', e => {
      isDragging = true; dragStartX = e.clientX; dragStartPx = currentPx
      trackWrap.classList.add('dragging')
    })
    window.addEventListener('mousemove', e => {
      if(!isDragging) return
      scrollToPx(dragStartPx + (dragStartX - e.clientX), false)
    })
    window.addEventListener('mouseup', () => {
      isDragging = false; trackWrap.classList.remove('dragging')
    })
    trackWrap.addEventListener('touchstart', e => {
      dragStartX = e.touches[0].clientX; dragStartPx = currentPx
    }, { passive: true })
    trackWrap.addEventListener('touchmove', e => {
      scrollToPx(dragStartPx + (dragStartX - e.touches[0].clientX), false)
    }, { passive: true })

    const teamMap = {}
    ;(teams||[]).forEach(t => teamMap[t.id] = t)
    const compMap = {}
    ;(competitions||[]).forEach(c => compMap[c.id] = c)
    const allMatches = matches || []
    const allSeasons = seasons || []

    // Sázky — indexované podle match_id
    const betsByMatch = {}
    ;(betsRaw||[]).forEach(b => {
      if(!betsByMatch[b.match_id]) betsByMatch[b.match_id] = []
      betsByMatch[b.match_id].push(b)
    })
    const playersList = playersRaw || []

    const seasonsByComp = {}
    allSeasons.forEach(s => {
      if(!seasonsByComp[s.competition_id]) seasonsByComp[s.competition_id] = []
      seasonsByComp[s.competition_id].push(s)
    })
    const seasonsWithMatches = new Set(allMatches.map(m => m.season_id))
    const activeSeasons = []
    Object.values(seasonsByComp).forEach(list => {
      const withMatches = list.filter(s => seasonsWithMatches.has(s.id))
      if(withMatches.length > 0) activeSeasons.push(withMatches[withMatches.length - 1])
    })
    const activeSeasonIds = new Set(activeSeasons.map(s => s.id))

    // Pouze poslední odehraný zápas
    const played = allMatches
      .filter(m => m.played === true && m.home_score != null && activeSeasonIds.has(m.season_id))
      .sort((a,b) => {
        if(!a.played_at && !b.played_at) return 0
        if(!a.played_at) return 1
        if(!b.played_at) return -1
        return new Date(a.played_at) - new Date(b.played_at)
      })
      .slice(-1)

    const upcomingBySeason = {}
    activeSeasons.forEach(season => {
      const unplayed = allMatches
        .filter(m => m.played === false && m.home_score === null && m.season_id === season.id)
        .sort((a,b) => Number(a.round) - Number(b.round))
        .slice(0, 2)
      if(unplayed.length > 0) upcomingBySeason[season.id] = { season, matches: unplayed }
    })

    track.innerHTML = ''

    // Pomocná funkce pro čitelný label tipu
    function getTipLabel(tip, homeSN, awaySN) {
      const map = {
        "1":        `Výhra ${homeSN}`,
        "2":        `Výhra ${awaySN}`,
        "0":        "Remíza",
        "11":       `Neprohra ${homeSN}`,
        "22":       `Neprohra ${awaySN}`,
        "no_draw":  "Nebude remíza",
        "vdr_home": `Do rozh. ${homeSN}`,
        "vdr_away": `Do rozh. ${awaySN}`,
      }
      return tip.split(",").map(t => map[t] || t).join(" + ")
    }

    // Nadcházející zápasy
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

      matches.forEach((m, i) => {
        const home = teamMap[m.home_team]
        const away = teamMap[m.away_team]
        if(!home || !away) return
        const odds = calculateOdds(home.rating_form || 1000, away.rating_form || 1000)
        const box = document.createElement('div')
        box.className = 't-box'
        box.onclick = () => { window.location.href = `vsad-si.html?id=${m.id}` }
        box.innerHTML = `
          <div class="t-team-row">
            <img class="t-logo ${logoClass(home, compMap)}" src="./logos/${home.logo}" onerror="this.style.display='none'">
            <span class="t-team-name">${getShortName(home)}</span>
            <span class="t-score-badge empty">–</span>
          </div>
          <div class="t-team-row">
            <img class="t-logo ${logoClass(away, compMap)}" src="./logos/${away.logo}" onerror="this.style.display='none'">
            <span class="t-team-name">${getShortName(away)}</span>
            <span class="t-score-badge empty">–</span>
          </div>
          <div class="t-bottom">
            <span class="t-odd">${odds.home}</span>
            <span class="t-odd">${odds.draw}</span>
            <span class="t-odd">${odds.away}</span>
          </div>
        `
        track.appendChild(box)
        if(i < matches.length - 1) addDivider(track)
      })
    })

    // Poslední odehraný zápas s tipy — úplně napravo
    played.forEach((m) => {
      const home = teamMap[m.home_team]
      const away = teamMap[m.away_team]
      if(!home || !away) return

      const homeSN = getShortName(home)
      const awaySN = getShortName(away)
      const matchBets = betsByMatch[m.id] || []

      function betHtml(playerName) {
        const player = playersList.find(p => p.name === playerName)
        if(!player) return `<span class="t-bet pending">${playerName}: —</span>`
        const bet = matchBets.find(b => b.player_id === player.id)
        if(!bet) return `<span class="t-bet pending">${playerName}: bez tipu</span>`
        if(bet.status === 'won')
          return `<span class="t-bet won">${playerName}: +${Math.round(bet.potential_win - bet.amount).toLocaleString('cs-CZ')} Kč</span>`
        if(bet.status === 'lost')
          return `<span class="t-bet lost">${playerName}: -${Math.round(bet.amount).toLocaleString('cs-CZ')} Kč</span>`
        const label = getTipLabel(bet.tip, homeSN, awaySN)
        return `<span class="t-bet pending">${playerName}: ${label}</span>`
      }

      addDivider(track)
      const box = document.createElement('div')
      box.className = 't-box'
      box.onclick = () => { window.location.href = `statistiky-zapasu.html?id=${m.id}` }
      box.innerHTML = `
        <div class="t-team-row">
          <img class="t-logo ${logoClass(home, compMap)}" src="./logos/${home.logo}" onerror="this.style.display='none'">
          <span class="t-team-name">${homeSN}</span>
          <span class="t-score-badge">${m.home_score}</span>
        </div>
        <div class="t-team-row">
          <img class="t-logo ${logoClass(away, compMap)}" src="./logos/${away.logo}" onerror="this.style.display='none'">
          <span class="t-team-name">${awaySN}</span>
          <span class="t-score-badge">${m.away_score}</span>
        </div>
        <div class="t-bets-col">
          ${betHtml('Kubele')}
          ${betHtml('Pici')}
        </div>
      `
      track.appendChild(box)
    })

    const firstBox = track.querySelector('.t-box')
    if(firstBox) boxWidth = firstBox.offsetWidth + 2
    scrollToPx(getMaxPx(), true)
    updateButtons()

  } catch(err) {
    console.error('Ticker error:', err)
  }
}

loadTicker()

})()
