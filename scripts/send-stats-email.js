const { createClient } = require('@supabase/supabase-js')
const ws = require('ws')
global.WebSocket = ws
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const PLAYER_IDS = {
  kubele: 'a5b84a2d-58e6-4bf6-877f-be814a993db6',
  pici:   '38dd6159-1b85-4e87-9176-6a494597216f',
}

const COMP_IDS = {  extraliga: '5cc76adb-b3e0-404b-9095-7dd4a41edb4e',
  ms:        'f0375c91-5b76-475e-afab-3d867b6b02d1',
  olympiada: 'c85830b0-612f-4390-88de-0b8775430460',
  pohar:     '254d4b5e-cb32-4c44-8b00-3010f895359c',
}

const REPRE_COMP_IDS = new Set([COMP_IDS.ms, COMP_IDS.olympiada])

async function fetchAll(table, query) {
  let data = [], from = 0, ps = 1000
  while (true) {
    const { data: pg } = await (query || supabase.from(table).select('*')).range(from, from + ps - 1)
    if (!pg || !pg.length) break
    data = data.concat(pg)
    if (pg.length < ps) break
    from += ps
  }
  return data
}

function toiToSec(t) {
  if (!t || t === '00:00') return 0
  const p = t.split(':')
  return (parseInt(p[0]) || 0) * 60 + (parseInt(p[1]) || 0)
}
function secToToi(s) {
  const m = Math.floor(s / 60), ss = s % 60
  return `${m}:${ss.toString().padStart(2, '0')}`
}

function calcManagerStats(ownerId, allMatches, teams, stats) {
  const ownerTeamIds = new Set(teams.filter(t => t.owner_id === ownerId).map(t => t.id))
  const ownerTeamAbbrs = new Set(teams.filter(t => ownerTeamIds.has(t.id)).map(t => t.team_abbr).filter(Boolean))
  const playedMatches = allMatches.filter(m => m.home_score != null && (ownerTeamIds.has(m.home_team) || ownerTeamIds.has(m.away_team)))
  let gp=0, w=0, l=0, wReg=0, lReg=0, wOT=0, lOT=0, wSN=0, lSN=0
  let gf=0, ga=0, shots=0, hits=0, ppg=0, shg=0
  let homeW=0, homeL=0, awayW=0, awayL=0
  let biggestWin=null, biggestWinDiff=0, biggestLoss=null, biggestLossDiff=0
  let mostGoalsMatch=null, mostGoalsTotal=0
  let longestWinStreak=0, longestLoseStreak=0, curWin=0, curLose=0
  let shutouts=0

  playedMatches.forEach(m => {
    const isHome = ownerTeamIds.has(m.home_team)
    const tg = isHome ? Number(m.home_score) : Number(m.away_score)
    const og = isHome ? Number(m.away_score) : Number(m.home_score)
    let st = null; try { st = m.stats ? JSON.parse(m.stats) : null } catch(e) {}
    const isSN = st && (st[20]==='1'||st[20]==='2')
    const isOT = st && !isSN && (st[9]==='11'||st[19]==='11')
    const won = tg > og, lost = tg < og
    gp++; gf += tg; ga += og
    const total = tg + og
    if(total > mostGoalsTotal){ mostGoalsTotal = total; mostGoalsMatch = m }
    if(won){
      w++; if(isSN) wSN++; else if(isOT) wOT++; else wReg++
      if(isHome) homeW++; else awayW++
      curWin++; curLose = 0
      if(curWin > longestWinStreak) longestWinStreak = curWin
      if(tg-og > biggestWinDiff){ biggestWinDiff = tg-og; biggestWin = m }
    } else if(lost){
      l++; if(isSN) lSN++; else if(isOT) lOT++; else lReg++
      if(isHome) homeL++; else awayL++
      curLose++; curWin = 0
      if(curLose > longestLoseStreak) longestLoseStreak = curLose
      if(og-tg > biggestLossDiff){ biggestLossDiff = og-tg; biggestLoss = m }
    } else { curWin = 0; curLose = 0 }
    if(og === 0) shutouts++
    stats.filter(r => r.match_id === m.id && ownerTeamAbbrs.has(r.team_abbr) && !r.is_goalie).forEach(r => {
      shots += r.shots||0; hits += r.hits||0; ppg += r.ppg||0; shg += r.shg||0
    })
  })

  const winPct = gp > 0 ? Math.round(w/gp*100) : 0
  const avgGf = gp > 0 ? (gf/gp).toFixed(2) : '0'
  const avgGa = gp > 0 ? (ga/gp).toFixed(2) : '0'

  function fmtMatch(m) {
    const homeTeam = teams.find(t => t.id === m.home_team)
    const awayTeam = teams.find(t => t.id === m.away_team)
    const suffix = m.result_type && m.result_type !== 'REG' ? ` (${m.result_type})` : ''
    return `${homeTeam?.name||'?'} ${m.home_score}:${m.away_score}${suffix} ${awayTeam?.name||'?'}`
  }

  return { gp, w, l, wReg, lReg, wOT, lOT, wSN, lSN, gf, ga, shots, hits, ppg, shg,
    homeW, homeL, awayW, awayL, shutouts, longestWinStreak, longestLoseStreak,
    winPct, avgGf, avgGa, mostGoalsTotal,
    biggestWinStr: biggestWin ? fmtMatch(biggestWin) : '—',
    biggestLossStr: biggestLoss ? fmtMatch(biggestLoss) : '—',
    mostGoalsStr: mostGoalsMatch ? fmtMatch(mostGoalsMatch) : '—',
  }
}

async function main() {  const now = new Date()

const [statsRaw, teams, seasons, stages, matches] = await Promise.all([
    fetchAll('player_match_stats'),
    fetchAll('teams'),
    fetchAll('seasons'),
    fetchAll('stages'),
    fetchAll('matches'),
  ])
  const stats = statsRaw || []

  const teamMap = {}
  teams.forEach(t => { if (t.team_abbr) teamMap[t.team_abbr] = t })

  const seasonCompMap = {}
  seasons.forEach(s => { seasonCompMap[s.id] = s.competition_id })

  const matchById = {}
  matches.forEach(m => { matchById[m.id] = m })

  const stageMap = {}
  stages.forEach(s => { stageMap[s.id] = s })

  const playoffNames = ['Čtvrtfinále', 'Semifinále', 'Finále', 'O 3. místo', 'Playoff', 'Baráž', 'Osmifinále']

  // Obohacení stats o compId
  const enriched = stats.map(r => {
    const match = matchById[r.match_id]
    const compId = match ? (seasonCompMap[match.season_id] || '') : ''
    const stage = match ? stageMap[match.stage_id] : null
    const isPlayoff = stage ? (stage.parent_stage_id !== null || playoffNames.some(n => stage.name?.startsWith(n))) : false
    return { ...r, compId, isPlayoff, match }
  })

  // ── Agregace hráčů (bez brankářů) ──────────────────────────────
  function aggregatePlayers(rows) {
    const map = {}
    rows.filter(r => !r.is_goalie).forEach(r => {
      const key = r.player_id ? String(r.player_id) : (r.player_name || '').toLowerCase().trim() + '_' + r.team_abbr
      if (!map[key]) map[key] = { name: r.player_name, team: r.team_abbr, gp: 0, goals: 0, assists: 0, points: 0, plus_minus: 0, ppg: 0, shg: 0, shots: 0, pim: 0, hits: 0, toi_sec: 0 }
      const p = map[key]
      p.gp++; p.goals += r.goals || 0; p.assists += r.assists || 0; p.points += (r.goals || 0) + (r.assists || 0)
      p.plus_minus += r.plus_minus || 0; p.ppg += r.ppg || 0; p.shg += r.shg || 0
      p.shots += r.shots || 0; p.pim += r.pim || 0; p.hits += r.hits || 0
      p.toi_sec += toiToSec(r.toi)
    })
    return Object.values(map).sort((a, b) => b.points - a.points || b.goals - a.goals)
  }

  // ── Agregace brankářů ───────────────────────────────────────────
  function aggregateGoalies(rows, allMatches_) {
    const map = {}
    rows.filter(r => r.is_goalie && toiToSec(r.toi) > 0).forEach(r => {
      const key = r.player_id ? String(r.player_id) : (r.player_name || '').toLowerCase().trim() + '_' + r.team_abbr
      if (!map[key]) map[key] = { name: r.player_name, team: r.team_abbr, gp: 0, sa: 0, ga: 0, gw: 0, gl: 0 }
      const g = map[key]
      g.gp++; g.sa += r.goalie_sa || 0; g.ga += r.goalie_ga || 0
      const m = r.match
      if (m && m.home_score != null) {
        const homeTeam = teams.find(t => t.id === m.home_team)
        const isHome = homeTeam?.team_abbr === r.team_abbr
        const hg = Number(m.home_score), ag = Number(m.away_score)
        if (isHome ? hg > ag : ag > hg) g.gw++; else g.gl++
      }
    })
    return Object.values(map)
      .filter(g => g.sa > 0)
      .sort((a, b) => {
        const svA = (a.sa - a.ga) / a.sa, svB = (b.sa - b.ga) / b.sa
        return svB - svA
      })
  }

  // ── Agregace týmů ───────────────────────────────────────────────
  function aggregateTeams(compId) {
    const compMatches = matches.filter(m => m.home_score != null && seasonCompMap[m.season_id] === compId)
    const compMatchIds = new Set(compMatches.map(m => m.id))
    const map = {}

    compMatches.forEach(m => {
      const homeTeam = teams.find(t => t.id === m.home_team)
      const awayTeam = teams.find(t => t.id === m.away_team)
      ;[[homeTeam, Number(m.home_score), Number(m.away_score)], [awayTeam, Number(m.away_score), Number(m.home_score)]].forEach(([team, tg, og]) => {
        if (!team?.team_abbr) return
        const abbr = team.team_abbr
        if (!map[abbr]) map[abbr] = { team: abbr, gp: 0, gf: 0, ga: 0, w: 0, l: 0, vp: 0, pp: 0, vot: 0, pot: 0, vsn: 0, psn: 0, shots: 0, ppg: 0, shg: 0, hits: 0 }
        const e = map[abbr]
        e.gp++; e.gf += tg; e.ga += og
        let st = null; try { st = m.stats ? JSON.parse(m.stats) : null } catch (e) {}
        const isSN = st && (st[20] === '1' || st[20] === '2')
        const isOT = st && !isSN && (st[9] === '11' || st[19] === '11')
        const won = tg > og
        if (won) { e.w++; if (isSN) e.vsn++; else if (isOT) e.vot++; else e.vp++ }
        else { e.l++; if (isSN) e.psn++; else if (isOT) e.pot++; else e.pp++ }
      })
    })

    stats.filter(r => compMatchIds.has(r.match_id) && !r.is_goalie).forEach(r => {
      const abbr = r.team_abbr
      if (!map[abbr]) return
      map[abbr].shots += r.shots || 0
      map[abbr].ppg += r.ppg || 0
      map[abbr].shg += r.shg || 0
      map[abbr].hits += r.hits || 0
    })

    return Object.values(map).sort((a, b) => b.w - a.w || (b.gf - b.ga) - (a.gf - a.ga))
  }

function aggregateTeamsAll() {
    const map = {}
    matches.filter(m => m.home_score != null).forEach(m => {
      const homeTeam = teams.find(t => t.id === m.home_team)
      const awayTeam = teams.find(t => t.id === m.away_team)
      ;[[homeTeam, Number(m.home_score), Number(m.away_score)], [awayTeam, Number(m.away_score), Number(m.home_score)]].forEach(([team, tg, og]) => {
        if (!team?.team_abbr) return
        const abbr = team.team_abbr
        if (!map[abbr]) map[abbr] = { team: abbr, gp: 0, gf: 0, ga: 0, w: 0, l: 0, vp: 0, pp: 0, vot: 0, pot: 0, vsn: 0, psn: 0, shots: 0, ppg: 0, shg: 0, hits: 0 }
        const e = map[abbr]
        e.gp++; e.gf += tg; e.ga += og
        let st = null; try { st = m.stats ? JSON.parse(m.stats) : null } catch (err) {}
        const isSN = st && (st[20] === '1' || st[20] === '2')
        const isOT = st && !isSN && (st[9] === '11' || st[19] === '11')
        const won = tg > og
        if (won) { e.w++; if (isSN) e.vsn++; else if (isOT) e.vot++; else e.vp++ }
        else { e.l++; if (isSN) e.psn++; else if (isOT) e.pot++; else e.pp++ }
      })
    })
    stats.filter(r => !r.is_goalie).forEach(r => {
      const abbr = r.team_abbr
      if (!map[abbr]) return
      map[abbr].shots += r.shots || 0
      map[abbr].ppg += r.ppg || 0
      map[abbr].shg += r.shg || 0
      map[abbr].hits += r.hits || 0
    })
    return Object.values(map).sort((a, b) => b.w - a.w || (b.gf - b.ga) - (a.gf - a.ga))
  }
  
  // ── Renderovací pomocníci ───────────────────────────────────────
  const th = (label) => `<th style="padding:7px 8px;text-align:center;background:#0b2a3c;color:#7ab0cc;font-size:11px;font-weight:700;text-transform:uppercase;white-space:nowrap;">${label}</th>`
  const thL = (label) => `<th style="padding:7px 8px;text-align:left;background:#0b2a3c;color:#7ab0cc;font-size:11px;font-weight:700;text-transform:uppercase;">${label}</th>`
  const td = (val, color = '') => `<td style="padding:6px 8px;text-align:center;${color ? `color:${color};font-weight:700;` : ''}">${val}</td>`
  const tdL = (val) => `<td style="padding:6px 8px;text-align:left;font-weight:600;">${val}</td>`
  const teamName = (abbr) => teamMap[abbr]?.name || abbr || '—'
  const rowBg = (i) => i % 2 === 0 ? 'white' : '#f7fbff'

  function playerTableHtml(players, limit = 30) {
    const top = players.slice(0, limit)
    return `<table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr>${thL('#')}${thL('Hráč')}${th('Tým')}${th('Z')}${th('G')}${th('A')}${th('B')}${th('B/Z')}${th('+/-')}${th('PP')}${th('SHG')}${th('ST')}${th('TM')}${th('HIT')}</tr></thead>
      <tbody>${top.map((p, i) => {
        const bz = p.gp > 0 ? (p.points / p.gp).toFixed(2) : '—'
        const pmColor = p.plus_minus > 0 ? '#16a34a' : p.plus_minus < 0 ? '#dc2626' : '#888'
        const pmStr = p.plus_minus > 0 ? `+${p.plus_minus}` : String(p.plus_minus)
        return `<tr style="background:${rowBg(i)};border-bottom:1px solid #f0f0f0;">
          ${tdL(i + 1)}${tdL(p.name)}
          <td style="padding:6px 8px;text-align:center;"><span style="background:#e8f0f8;color:#1a5276;font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;">${p.team || '—'}</span></td>
          ${td(p.gp)}
          <td style="padding:6px 8px;text-align:center;font-weight:${p.goals ? '800' : '400'};color:${p.goals ? '#16a34a' : '#aaa'};">${p.goals}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:${p.assists ? '700' : '400'};color:${p.assists ? '#2f9ec9' : '#aaa'};">${p.assists}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:800;background:#fff8e0;">${p.points}</td>
          ${td(bz, '#888')}
          <td style="padding:6px 8px;text-align:center;font-weight:700;color:${pmColor};">${pmStr}</td>
          ${td(p.ppg)}${td(p.shg)}${td(p.shots)}${td(p.pim)}${td(p.hits)}
        </tr>`
      }).join('')}</tbody>
    </table>`
  }

  function goalieTableHtml(goalies) {
    return `<table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr>${thL('#')}${thL('Brankář')}${th('Tým')}${th('Z')}${th('Zákroky')}${th('GA')}${th('GAA')}${th('SV%')}${th('V')}${th('P')}</tr></thead>
      <tbody>${goalies.map((g, i) => {
        const sv = g.sa - g.ga
        const svpct = g.sa > 0 ? ((sv / g.sa) * 100).toFixed(1) + '%' : '—'
        const gaa = g.gp > 0 ? (g.ga / g.gp).toFixed(2) : '—'
        return `<tr style="background:${rowBg(i)};border-bottom:1px solid #f0f0f0;">
          ${tdL(i + 1)}${tdL(g.name)}
          <td style="padding:6px 8px;text-align:center;"><span style="background:#e8f0f8;color:#1a5276;font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;">${g.team || '—'}</span></td>
          ${td(g.gp)}${td(sv)}${td(g.ga, '#dc2626')}${td(gaa)}
          <td style="padding:6px 8px;text-align:center;font-weight:800;color:#f59e0b;background:#fff8e0;">${svpct}</td>
          ${td(g.gw, '#16a34a')}${td(g.gl, '#dc2626')}
        </tr>`
      }).join('')}</tbody>
    </table>`
  }

  function teamTableHtml(teamStats) {
    return `<table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr>${thL('#')}${thL('Tým')}${th('Z')}${th('Skóre')}${th('+/-')}${th('V%')}${th('V')}${th('P')}${th('VP')}${th('PP')}${th('VOT')}${th('POT')}${th('VSN')}${th('PSN')}${th('Střely')}${th('PP G')}${th('SHG')}${th('Hity')}</tr></thead>
      <tbody>${teamStats.map((t, i) => {
        const diff = t.gf - t.ga
        const winPct = t.gp > 0 ? Math.round(t.w / t.gp * 100) + '%' : '—'
        const diffColor = diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : '#888'
        return `<tr style="background:${rowBg(i)};border-bottom:1px solid #f0f0f0;">
          ${tdL(i + 1)}
          <td style="padding:6px 8px;text-align:left;font-weight:700;">${teamName(t.team)}</td>
          ${td(t.gp)}
          <td style="padding:6px 8px;text-align:center;font-weight:700;">${t.gf}:${t.ga}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:700;color:${diffColor};">${diff > 0 ? '+' : ''}${diff}</td>
          ${td(winPct, '#1a5276')}
          ${td(t.w, '#16a34a')}${td(t.l, '#dc2626')}
          ${td(t.vp)}${td(t.pp)}${td(t.vot)}${td(t.pot)}${td(t.vsn)}${td(t.psn)}
          ${td(t.shots)}${td(t.ppg)}${td(t.shg)}${td(t.hits)}
        </tr>`
      }).join('')}</tbody>
    </table>`
  }

  function section(title, content) {
    return `
      <div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid #e0ecf8;">
        <div style="font-size:15px;font-weight:800;color:#0b2a3c;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #e8f0f8;">${title}</div>
        <div style="overflow-x:auto;">${content}</div>
      </div>`
  }

 // ── Sestavení emailu ─────────────────────────────────────────────
  const k = calcManagerStats(PLAYER_IDS.kubele, matches, teams, stats)
  const p = calcManagerStats(PLAYER_IDS.pici, matches, teams, stats)

  function mgrRow(label, kVal, pVal) {
    return `<tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:7px 10px;text-align:right;font-weight:800;color:#0b5394;">${kVal}</td>
      <td style="padding:7px 10px;text-align:center;font-size:11px;font-weight:700;color:#7ab0cc;text-transform:uppercase;letter-spacing:.05em;">${label}</td>
      <td style="padding:7px 10px;text-align:left;font-weight:800;color:#7c1a5a;">${pVal}</td>
    </tr>`
  }

  function mgrRecord(label, val, color='#f7f9fb') {
    return val === '—' ? '' : `
      <div style="padding:8px 12px;background:${color};border-radius:8px;margin-bottom:6px;">
        <div style="font-size:10px;font-weight:700;color:#7ab0cc;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px;">${label}</div>
        <div style="font-size:12px;font-weight:700;color:#0b2a3c;">${val}</div>
      </div>`
  }

  const allPlayers = aggregatePlayers(enriched)
  const allGoalies = aggregateGoalies(enriched, matches)

  const allTeamStats = aggregateTeamsAll()
  const poharTeams = aggregateTeams(COMP_IDS.pohar)
  const msTeams = aggregateTeams(COMP_IDS.ms)
  const olympiadaTeams = aggregateTeams(COMP_IDS.olympiada)
  // Hráči jen z reprezentačních soutěží
  const reprePlayers = aggregatePlayers(enriched.filter(r => REPRE_COMP_IDS.has(r.compId)))
  const repreGoalies = aggregateGoalies(enriched.filter(r => REPRE_COMP_IDS.has(r.compId)), matches)
  const poharPlayers = aggregatePlayers(enriched.filter(r => r.compId === COMP_IDS.pohar))
  const poharGoalies = aggregateGoalies(enriched.filter(r => r.compId === COMP_IDS.pohar), matches)

  let html = `
    <div style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;background:#f0f4f8;padding:20px;">
      <div style="background:linear-gradient(135deg,#0b2a3c,#1a5276);padding:20px;border-radius:12px;margin-bottom:20px;">
        <h1 style="color:white;margin:0;font-size:22px;">📊 Statistiky — Přehled</h1>
        <p style="color:#7ab0cc;margin:6px 0 0;font-size:13px;">Vygenerováno ${now.toLocaleDateString('cs-CZ')}</p>
      </div>

     <div style="font-size:14px;font-weight:800;color:#0b2a3c;margin:0 0 10px;padding:10px 14px;background:#e8f4fd;border-radius:8px;border-left:4px solid #2f9ec9;">
        🏒 Týmové statistiky — všechny soutěže celkem
      </div>
      ${section('🏒 Všechny týmy', allTeamStats.length ? teamTableHtml(allTeamStats) : '<div style="color:#aaa;padding:10px;">Žádné záznamy.</div>')}

      <div style="font-size:14px;font-weight:800;color:#0b2a3c;margin:20px 0 10px;padding:10px 14px;background:#e8f4fd;border-radius:8px;border-left:4px solid #2f9ec9;">
        👤 Hráčské statistiky — celkové (všechny soutěže)
      </div>
      ${section('🏅 Top střelci a nahrávači', playerTableHtml(allPlayers, 50))}
      ${section('🥅 Brankáři', goalieTableHtml(allGoalies))}

      <div style="font-size:14px;font-weight:800;color:#0b2a3c;margin:20px 0 10px;padding:10px 14px;background:#e8f4fd;border-radius:8px;border-left:4px solid #2f9ec9;">
        🏆 Pohár — statistiky
      </div>
      ${section('👤 Hráči — Pohár', playerTableHtml(poharPlayers))}
      ${section('🥅 Brankáři — Pohár', poharGoalies.length ? goalieTableHtml(poharGoalies) : '<div style="color:#aaa;padding:10px;">Žádné záznamy.</div>')}
      ${section('🏒 Týmové statistiky — Pohár', poharTeams.length ? teamTableHtml(poharTeams) : '<div style="color:#aaa;padding:10px;">Žádné záznamy.</div>')}
      <div style="font-size:14px;font-weight:800;color:#0b2a3c;margin:20px 0 10px;padding:10px 14px;background:#e8f4fd;border-radius:8px;border-left:4px solid #2f9ec9;">
        🌍 Mistrovství světa — statistiky
      </div>
      ${section('👤 Hráči — MS', playerTableHtml(reprePlayers.filter(p => enriched.some(r => r.compId === COMP_IDS.ms && r.player_name === p.name))))}
      ${section('🥅 Brankáři — MS', repreGoalies.length ? goalieTableHtml(repreGoalies.filter(g => enriched.some(r => r.compId === COMP_IDS.ms && r.player_name === g.name))) : '<div style="color:#aaa;padding:10px;">Žádné záznamy.</div>')}
      ${section('🏒 Týmové statistiky — MS', msTeams.length ? teamTableHtml(msTeams) : '<div style="color:#aaa;padding:10px;">Žádné záznamy.</div>')}
      <div style="font-size:14px;font-weight:800;color:#0b2a3c;margin:20px 0 10px;padding:10px 14px;background:#e8f4fd;border-radius:8px;border-left:4px solid #2f9ec9;">
        🏅 Olympiáda — statistiky
      </div>
      ${section('👤 Hráči — Olympiáda', playerTableHtml(enriched.filter(r => r.compId === COMP_IDS.olympiada) ? aggregatePlayers(enriched.filter(r => r.compId === COMP_IDS.olympiada)) : []))}
      ${section('🥅 Brankáři — Olympiáda', goalieTableHtml(aggregateGoalies(enriched.filter(r => r.compId === COMP_IDS.olympiada), matches)))}
    ${section('🏒 Týmové statistiky — Olympiáda', olympiadaTeams.length ? teamTableHtml(olympiadaTeams) : '<div style="color:#aaa;padding:10px;">Žádné záznamy.</div>')}

      <div style="font-size:14px;font-weight:800;color:#0b2a3c;margin:20px 0 10px;padding:10px 14px;background:#e8f4fd;border-radius:8px;border-left:4px solid #2f9ec9;">
        🏆 Manažerské statistiky
      </div>
      <div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid #e0ecf8;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th style="padding:8px 10px;text-align:right;background:#0b5394;color:white;border-radius:8px 0 0 0;">🔵 Kubele</th>
              <th style="padding:8px 10px;text-align:center;background:#0b2a3c;color:#7ab0cc;font-size:11px;text-transform:uppercase;letter-spacing:.05em;">Statistika</th>
              <th style="padding:8px 10px;text-align:left;background:#7c1a5a;color:white;border-radius:0 8px 0 0;">🟣 Pici</th>
            </tr>
          </thead>
          <tbody>
            ${mgrRow('Zápasy', k.gp, p.gp)}
            ${mgrRow('Výhry', `${k.w} (${k.wReg}+${k.wOT}OT+${k.wSN}SN)`, `${p.w} (${p.wReg}+${p.wOT}OT+${p.wSN}SN)`)}
            ${mgrRow('Prohry', `${k.l} (${k.lReg}+${k.lOT}OT+${k.lSN}SN)`, `${p.l} (${p.lReg}+${p.lOT}OT+${p.lSN}SN)`)}
            ${mgrRow('Úspěšnost', `${k.winPct}%`, `${p.winPct}%`)}
            ${mgrRow('Skóre', `${k.gf}:${k.ga}`, `${p.gf}:${p.ga}`)}
            ${mgrRow('Průměr G/Z', `${k.avgGf} / ${k.avgGa}`, `${p.avgGf} / ${p.avgGa}`)}
            ${mgrRow('Domácí V–P', `${k.homeW}–${k.homeL}`, `${p.homeW}–${p.homeL}`)}
            ${mgrRow('Venkovní V–P', `${k.awayW}–${k.awayL}`, `${p.awayW}–${p.awayL}`)}
            ${mgrRow('Čistá konta', k.shutouts, p.shutouts)}
            ${mgrRow('Nejd. série výher', k.longestWinStreak, p.longestWinStreak)}
            ${mgrRow('Střely', k.shots, p.shots)}
            ${mgrRow('PP góly', k.ppg, p.ppg)}
          </tbody>
        </table>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="background:white;border-radius:12px;padding:14px;border:1px solid #e0ecf8;border-top:3px solid #0b5394;">
          <div style="font-size:12px;font-weight:800;color:#0b5394;margin-bottom:10px;">🔵 Kubele — Rekordy</div>
          ${mgrRecord('🏆 Nejvyšší výhra', k.biggestWinStr, '#f0fdf4')}
          ${mgrRecord('💔 Nejvyšší prohra', k.biggestLossStr, '#fef2f2')}
          ${mgrRecord(`⚽ Nejvíce gólů (${k.mostGoalsTotal})`, k.mostGoalsStr, '#fff8e0')}
        </div>
        <div style="background:white;border-radius:12px;padding:14px;border:1px solid #e0ecf8;border-top:3px solid #7c1a5a;">
          <div style="font-size:12px;font-weight:800;color:#7c1a5a;margin-bottom:10px;">🟣 Pici — Rekordy</div>
          ${mgrRecord('🏆 Nejvyšší výhra', p.biggestWinStr, '#f0fdf4')}
          ${mgrRecord('💔 Nejvyšší prohra', p.biggestLossStr, '#fef2f2')}
          ${mgrRecord(`⚽ Nejvíce gólů (${p.mostGoalsTotal})`, p.mostGoalsStr, '#fff8e0')}
        </div>
      </div>

      <div style="text-align:center;font-size:11px;color:#aaa;margin-top:16px;">
        Extraliga U dvou Blbounů · automatický email · statistiky
      </div>
    </div>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: ['pickapavel@gmail.com'],
      subject: `📊 Statistiky přehled ${now.toLocaleDateString('cs-CZ')} — Extraliga U dvou Blbounů`,
      html
    })
  })

  const result = await response.json()
  console.log('Stats email odeslán:', result)
}

main().catch(console.error)
