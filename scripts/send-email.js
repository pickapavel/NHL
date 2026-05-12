const { createClient } = require('@supabase/supabase-js')
const ws = require('ws')
global.WebSocket = ws
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function main() {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Načti zápasy odehrané za posledních 24 hodin
const { data: matches } = await supabase
    .from('matches')
    .select('*, seasons(name)')
    .not('home_score', 'is', null)
    .gte('played_at', yesterday.toISOString())

  if (!matches || matches.length === 0) {
    console.log('Žádné zápasy za posledních 24 hodin.')
    return
  }

  // Načti týmy
 const { data: teams } = await supabase.from('teams').select('id,name,logo')
  const teamMap = {}
  ;(teams || []).forEach(t => { teamMap[t.id] = t })
  const BASE_URL = 'https://pickapavel.github.io/NHL'

  // Načti sázky pro tyto zápasy
  const matchIds = matches.map(m => m.id)
  const { data: bets } = await supabase
    .from('bets')
    .select('*, players(name)')
    .in('match_id', matchIds)

  // Načti hráče (sázkaře)
const { data: players } = await supabase.from('players').select('id,name')
  const { data: playerStats } = await supabase
    .from('player_match_stats')
    .select('*')
    .in('match_id', matchIds)
  // Sestav HTML email
  let html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f0f4f8;padding:20px;">
      <div style="background:linear-gradient(135deg,#0b2a3c,#1a5276);padding:20px;border-radius:12px;margin-bottom:20px;">
        <h1 style="color:white;margin:0;font-size:22px;">🏒 Extraliga U dvou Blbounů</h1>
        <p style="color:#7ab0cc;margin:6px 0 0;font-size:13px;">Denní přehled — ${now.toLocaleDateString('cs-CZ')}</p>
      </div>
  `

  for (const match of matches) {
    const home = teamMap[match.home_team]
    const away = teamMap[match.away_team]
    const matchBets = (bets || []).filter(b => b.match_id === match.id)

    let resultType = ''
    if (match.result_type && match.result_type !== 'REG') resultType = ` (${match.result_type})`

    html += `
      <div style="background:white;border-radius:12px;padding:16px;margin-bottom:14px;border:1px solid #e0ecf8;">
        <div style="font-size:11px;color:#7ab0cc;font-weight:700;text-transform:uppercase;margin-bottom:8px;">
          ${match.seasons?.name || ''}
        </div>
      <div style="margin-bottom:14px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="text-align:left;padding:4px 0;">
                ${home?.logo?`<img src="${BASE_URL}/logos/${home.logo}" width="28" height="28" style="vertical-align:middle;border-radius:4px;margin-right:6px;">`:''}
                <span style="font-size:15px;font-weight:700;color:#0b2a3c;vertical-align:middle;">${home?.name || '?'}</span>
              </td>
              <td style="text-align:center;width:100px;">
                <span style="font-size:24px;font-weight:800;color:#0b2a3c;">${match.home_score}</span>
                <span style="font-size:16px;color:#aaa;margin:0 4px;">:</span>
                <span style="font-size:24px;font-weight:800;color:#0b2a3c;">${match.away_score}</span>
                ${resultType?`<div style="font-size:11px;font-weight:700;background:#2f9ec9;color:white;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:4px;">${resultType.replace(/[()]/g,'')}</div>`:''}
              </td>
              <td style="text-align:right;padding:4px 0;">
                <span style="font-size:15px;font-weight:700;color:#0b2a3c;vertical-align:middle;">${away?.name || '?'}</span>
                ${away?.logo?`<img src="${BASE_URL}/logos/${away.logo}" width="28" height="28" style="vertical-align:middle;border-radius:4px;margin-left:6px;">`:''}
              </td>
            </tr>
          </table>
        </div>
    `

    if (matchBets.length > 0) {
      html += `<div style="border-top:1px solid #f0f0f0;padding-top:10px;">`
      html += `<div style="font-size:11px;font-weight:700;color:#7ab0cc;text-transform:uppercase;margin-bottom:8px;">🎲 Sázky</div>`
      for (const bet of matchBets) {
  const playerName = bet.players?.name || '?'
        const won = bet.status === 'won'
        const lost = bet.status === 'lost'
        const statusColor = won ? '#16a34a' : lost ? '#dc2626' : '#888'
        const statusIcon = won ? '✅' : lost ? '❌' : '⏳'
        const statusText = won ? `+${Math.round(bet.potential_win - bet.amount)} Kč` : lost ? `-${Math.round(bet.amount)} Kč` : 'Čeká'
        html += `
          <div style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <div style="font-size:14px;font-weight:700;color:#0b2a3c;">${statusIcon} ${playerName}</div>
              <div style="font-size:14px;font-weight:800;color:${statusColor};">${statusText}</div>
            </div>
            <div style="font-size:12px;color:#888;">Vsazeno: ${Math.round(bet.amount)} Kč · Kurz: ${Number(bet.odds).toFixed(2)}</div>
          </div>
        `
      }
      html += `</div>`
    } else {
      html += `<div style="font-size:12px;color:#aaa;border-top:1px solid #f0f0f0;padding-top:8px;">Žádné sázky na tento zápas.</div>`
    }

    html += `</div>`
  }

  html += `
      <div style="text-align:center;font-size:11px;color:#aaa;margin-top:10px;">
        Extraliga U dvou Blbounů · automatický email
      </div>
    </div>
  `

  // Pošli email přes Resend
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
          to: ['pickapavel@gmail.com'],
      subject: `🏒 Výsledky ${now.toLocaleDateString('cs-CZ')} — Extraliga U dvou Blbounů`,
      html: html
    })
  })

 const result = await response.json()
  console.log('Email odeslán:', result)

  // --- DRUHÝ EMAIL: Hráčské statistiky ---
  let html2 = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#f0f4f8;padding:20px;">
      <div style="background:linear-gradient(135deg,#0b2a3c,#1a5276);padding:20px;border-radius:12px;margin-bottom:20px;">
        <h1 style="color:white;margin:0;font-size:22px;">📊 Hráčské statistiky</h1>
        <p style="color:#7ab0cc;margin:6px 0 0;font-size:13px;">Denní přehled — ${now.toLocaleDateString('cs-CZ')}</p>
      </div>
  `

  for (const match of matches) {
    const home = teamMap[match.home_team]
    const away = teamMap[match.away_team]
    const matchPlayerStats = (playerStats || []).filter(p => p.match_id === match.id)
    if (!matchPlayerStats.length) continue

    const allAbbrs = [...new Set(matchPlayerStats.map(p => p.team_abbr).filter(Boolean))]
    const homeAbbr = allAbbrs[0] || ''
    const awayAbbr = allAbbrs[1] || ''

    // Týmové statistiky ze stats JSON
    let statsHtml = ''
    if (match.stats) {
      const s = JSON.parse(match.stats)
      const rows = [
        ['Střely', s[10], s[0]],
        ['Hity', matchPlayerStats.filter(p=>p.team_abbr===homeAbbr&&!p.is_goalie).reduce((a,p)=>a+(p.hits||0),0),
                matchPlayerStats.filter(p=>p.team_abbr===awayAbbr&&!p.is_goalie).reduce((a,p)=>a+(p.hits||0),0)],
        ['Vhazování', s[12], s[2]],
        ['Čas v útoku', s[13]||'—', s[3]||'—'],
        ['Přesilovky (G/P)', s[14]||'0/0', s[4]||'0/0'],
        ['Oslabení (G/P)', s[15]||'0/0', s[5]||'0/0'],
      ]
      statsHtml = `
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;">
          <tr>
            <th style="text-align:left;padding:6px 8px;background:#0b2a3c;color:#7ab0cc;font-size:11px;text-transform:uppercase;border-radius:6px 0 0 0;">Statistika</th>
            <th style="text-align:center;padding:6px 8px;background:#0b2a3c;color:white;">${home?.name||homeAbbr}</th>
            <th style="text-align:center;padding:6px 8px;background:#0b2a3c;color:white;border-radius:0 6px 0 0;">${away?.name||awayAbbr}</th>
          </tr>
          ${rows.map(([label,hv,av])=>`
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:7px 8px;color:#666;font-weight:600;">${label}</td>
            <td style="padding:7px 8px;text-align:center;font-weight:700;color:#0b2a3c;">${hv}</td>
            <td style="padding:7px 8px;text-align:center;font-weight:700;color:#0b2a3c;">${av}</td>
          </tr>`).join('')}
        </table>
      `
    }

    // Hráči
    function playerTable(abbr, teamName) {
      const pl = matchPlayerStats.filter(p => p.team_abbr === abbr && !p.is_goalie)
        .sort((a,b) => (b.goals+b.assists)-(a.goals+a.assists) || b.goals-a.goals)
      if (!pl.length) return ''
      return `
        <div style="margin-bottom:14px;">
          <div style="font-size:12px;font-weight:700;color:#1a5276;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">${teamName}</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr style="background:#f7f9fb;">
              <th style="text-align:left;padding:5px 6px;color:#888;font-weight:600;">Hráč</th>
              <th style="text-align:center;padding:5px 6px;color:#888;font-weight:600;">TOI</th>
              <th style="text-align:center;padding:5px 6px;color:#27ae60;font-weight:700;">G</th>
              <th style="text-align:center;padding:5px 6px;color:#2f9ec9;font-weight:700;">A</th>
              <th style="text-align:center;padding:5px 6px;color:#0b2a3c;font-weight:700;">Body</th>
              <th style="text-align:center;padding:5px 6px;color:#888;font-weight:600;">+/-</th>
              <th style="text-align:center;padding:5px 6px;color:#e74c3c;font-weight:600;">TM</th>
              <th style="text-align:center;padding:5px 6px;color:#888;font-weight:600;">Střely</th>
              <th style="text-align:center;padding:5px 6px;color:#888;font-weight:600;">Hity</th>
            </tr>
            ${pl.map(p => {
              const pts = p.goals + p.assists
              const pmColor = p.plus_minus > 0 ? '#16a34a' : p.plus_minus < 0 ? '#dc2626' : '#888'
              const pmStr = p.plus_minus > 0 ? `+${p.plus_minus}` : String(p.plus_minus)
              return `<tr style="border-bottom:1px solid #f4f4f4;">
                <td style="padding:6px 6px;font-weight:600;color:#0b2a3c;">${p.player_name}${p.ppg?'<span style="font-size:9px;background:#f3e8ff;color:#7e22ce;padding:1px 4px;border-radius:3px;margin-left:3px;">PP</span>':''}${p.shg?'<span style="font-size:9px;background:#fef3c7;color:#92400e;padding:1px 4px;border-radius:3px;margin-left:3px;">SH</span>':''}</td>
                <td style="padding:6px 6px;text-align:center;color:#888;">${p.toi}</td>
                <td style="padding:6px 6px;text-align:center;font-weight:${p.goals?'800':'400'};color:${p.goals?'#16a34a':'#aaa'};">${p.goals||0}</td>
                <td style="padding:6px 6px;text-align:center;font-weight:${p.assists?'800':'400'};color:${p.assists?'#2f9ec9':'#aaa'};">${p.assists||0}</td>
                <td style="padding:6px 6px;text-align:center;font-weight:${pts?'800':'400'};color:${pts?'#0b2a3c':'#aaa'};">${pts||0}</td>
                <td style="padding:6px 6px;text-align:center;font-weight:700;color:${pmColor};">${pmStr}</td>
                <td style="padding:6px 6px;text-align:center;font-weight:${p.pim?'700':'400'};color:${p.pim?'#dc2626':'#aaa'};">${p.pim||0}</td>
                <td style="padding:6px 6px;text-align:center;color:#555;">${p.shots||0}</td>
                <td style="padding:6px 6px;text-align:center;color:#555;">${p.hits||0}</td>
              </tr>`
            }).join('')}
          </table>
        </div>
      `
    }

    // Brankáři
    function goalieTable() {
      const goalies = matchPlayerStats.filter(p => p.is_goalie && p.toi && p.toi !== '00:00')
      if (!goalies.length) return ''
      const hg = Number(match.home_score), ag = Number(match.away_score)
      return `
        <div style="margin-bottom:14px;">
          <div style="font-size:12px;font-weight:700;color:#1a5276;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">🥅 Brankáři</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr style="background:#f7f9fb;">
              <th style="text-align:left;padding:5px 6px;color:#888;font-weight:600;">Brankář</th>
              <th style="text-align:center;padding:5px 6px;color:#888;font-weight:600;">Tým</th>
              <th style="text-align:center;padding:5px 6px;color:#888;font-weight:600;">TOI</th>
              <th style="text-align:center;padding:5px 6px;color:#888;font-weight:600;">Střel</th>
              <th style="text-align:center;padding:5px 6px;color:#27ae60;font-weight:700;">Zákroků</th>
              <th style="text-align:center;padding:5px 6px;color:#e74c3c;font-weight:600;">Inkasoval</th>
              <th style="text-align:center;padding:5px 6px;color:#f59e0b;font-weight:700;">Úspěšnost</th>
              <th style="text-align:center;padding:5px 6px;color:#888;font-weight:600;">Výsledek</th>
            </tr>
            ${goalies.map(g => {
              const sa = Number(g.goalie_sa)||0, ga2 = Number(g.goalie_ga)||0, sv = sa - ga2
              const svPct = sa > 0 ? ((sv/sa)*100).toFixed(1)+'%' : '—'
              const isHome = g.team_abbr === homeAbbr
              const won = isHome ? hg > ag : ag > hg
              return `<tr style="border-bottom:1px solid #f4f4f4;">
                <td style="padding:6px 6px;font-weight:700;color:#0b2a3c;">${g.player_name}</td>
                <td style="padding:6px 6px;text-align:center;color:#666;">${g.team_abbr}</td>
                <td style="padding:6px 6px;text-align:center;color:#888;">${g.toi}</td>
                <td style="padding:6px 6px;text-align:center;">${sa}</td>
                <td style="padding:6px 6px;text-align:center;font-weight:700;color:#16a34a;">${sv}</td>
                <td style="padding:6px 6px;text-align:center;font-weight:700;color:#dc2626;">${ga2}</td>
                <td style="padding:6px 6px;text-align:center;font-weight:800;color:#f59e0b;">${svPct}</td>
                <td style="padding:6px 6px;text-align:center;font-size:16px;">${won?'✅':'❌'}</td>
              </tr>`
            }).join('')}
          </table>
        </div>
      `
    }

    html2 += `
      <div style="background:white;border-radius:12px;padding:16px;margin-bottom:14px;border:1px solid #e0ecf8;">
        <div style="font-size:11px;color:#7ab0cc;font-weight:700;text-transform:uppercase;margin-bottom:8px;">${match.seasons?.name || ''}</div>
        <div style="font-size:18px;font-weight:800;color:#0b2a3c;margin-bottom:14px;text-align:center;">
          ${home?.name||'?'} ${match.home_score} : ${match.away_score} ${away?.name||'?'}
          ${match.result_type&&match.result_type!=='REG'?`<span style="font-size:11px;background:#2f9ec9;color:white;padding:2px 8px;border-radius:4px;margin-left:6px;">${match.result_type}</span>`:''}
        </div>
        <div style="font-size:13px;font-weight:700;color:#0b2a3c;margin-bottom:8px;">📋 Týmové statistiky</div>
        ${statsHtml}
        <div style="font-size:13px;font-weight:700;color:#0b2a3c;margin-bottom:10px;">👤 Hráči</div>
        ${playerTable(homeAbbr, home?.name||homeAbbr)}
        ${playerTable(awayAbbr, away?.name||awayAbbr)}
        ${goalieTable()}
      </div>
    `
  }

  html2 += `
      <div style="text-align:center;font-size:11px;color:#aaa;margin-top:10px;">
        Extraliga U dvou Blbounů · automatický email
      </div>
    </div>
  `

  const response2 = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: ['pickapavel@gmail.com'],
      subject: `📊 Hráčské statistiky ${now.toLocaleDateString('cs-CZ')} — Extraliga U dvou Blbounů`,
      html: html2
    })
  })
  const result2 = await response2.json()
  console.log('Email 2 odeslán:', result2)
}

main().catch(console.error)
