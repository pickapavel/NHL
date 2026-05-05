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
    .order('id', { ascending: false })
    .limit(5)

  if (!matches || matches.length === 0) {
    console.log('Žádné zápasy za posledních 24 hodin.')
    return
  }

  // Načti týmy
  const { data: teams } = await supabase.from('teams').select('id,name,logo')
  const teamMap = {}
  ;(teams || []).forEach(t => { teamMap[t.id] = t })

  // Načti sázky pro tyto zápasy
  const matchIds = matches.map(m => m.id)
  const { data: bets } = await supabase
    .from('bets')
    .select('*, players(name)')
    .in('match_id', matchIds)

  // Načti hráče (sázkaře)
  const { data: players } = await supabase.from('players').select('id,name')

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
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div style="font-size:15px;font-weight:700;color:#0b2a3c;">${home?.name || '?'}</div>
          <div style="font-size:22px;font-weight:800;color:#0b2a3c;background:#f0f4f8;padding:6px 16px;border-radius:8px;">
            ${match.home_score} : ${match.away_score}${resultType}
          </div>
          <div style="font-size:15px;font-weight:700;color:#0b2a3c;">${away?.name || '?'}</div>
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
        const statusText = won ? `✅ Výhra +${Math.round(bet.potential_win - bet.amount)} Kč` : lost ? `❌ Prohra -${Math.round(bet.amount)} Kč` : '⏳ Čeká'
        html += `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #f7f7f7;">
            <div style="font-size:13px;font-weight:600;color:#0b2a3c;">${playerName}</div>
            <div style="font-size:12px;color:#555;">Vsazeno: ${Math.round(bet.amount)} Kč · Kurz: ${bet.odds}</div>
            <div style="font-size:12px;font-weight:700;color:${statusColor};">${statusText}</div>
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
}

main().catch(console.error)
