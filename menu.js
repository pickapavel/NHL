;(function(){

const SUPABASE_URL = "https://qaocbodrflsaerxntfui.supabase.co"
const SUPABASE_KEY = "sb_publishable_eIeO9MihyuQDuNHy60Ubrw_8ZuSKPFU"

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
nav {
  background: #0b2a3c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 16px;
  height: 48px;
  position: sticky;
  top: 0;
  z-index: 999;
  border-bottom: 2px solid rgba(240,192,64,.2);
  flex-wrap: wrap;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,.65);
  text-decoration: none;
  transition: all .15s;
  cursor: pointer;
  background: none;
  border: none;
  white-space: nowrap;
  height: 36px;
}
.nav-link:hover {
  background: rgba(255,255,255,.1);
  color: #fff;
}
.nav-link.active {
  background: rgba(255,255,255,.12);
  color: #fff;
}

.nav-link .nav-arrow {
  font-size: 9px;
  opacity: .7;
  transition: transform .15s;
}
.nav-item.open .nav-arrow {
  transform: rotate(180deg);
}

/* DROPDOWN */
.nav-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #0f3550;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 10px;
  padding: 6px;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0,0,0,.35);
  display: none;
  flex-direction: column;
  gap: 2px;
  z-index: 1000;
}
.nav-item.open .nav-dropdown {
  display: flex;
}

.nav-dropdown a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 7px;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,.75);
  text-decoration: none;
  transition: all .15s;
  white-space: nowrap;
}
.nav-dropdown a:hover {
  background: rgba(255,255,255,.1);
  color: #fff;
}
.nav-dropdown a.active {
  background: rgba(255,255,255,.12);
  color: #fff;
}

.nav-divider {
  height: 1px;
  background: rgba(255,255,255,.1);
  margin: 4px 0;
}

@media(max-width:600px){
  nav { justify-content: flex-start; overflow-x: auto; flex-wrap: nowrap; }
  .nav-link { font-size: 12px; padding: 6px 10px; }
}
`
document.head.appendChild(style)

const currentPage = window.location.pathname.split('/').pop() || 'index.html'

function isActive(pages){
  return pages.includes(currentPage) ? 'active' : ''
}

const nav = document.createElement('nav')

const items = [
  {
    type: 'link',
    icon: '⚡',
    label: 'ELH',
    href: 'elh.html',
    pages: ['elh.html', 'index.html', '']
  },
  {
    type: 'link',
    icon: '🏆',
    label: 'Play off',
    href: 'playoff.html',
    pages: ['playoff.html']
  },
  {
    type: 'link',
    icon: '🥇',
    label: 'Olympiáda',
    href: 'olympiada.html',
    pages: ['olympiada.html']
  },
  {
    type: 'link',
    icon: '⭐',
    label: 'Rating',
    href: 'rating.html',
    pages: ['rating.html']
  },
  {
    type: 'link',
    icon: '📋',
    label: 'Sázky – přehled',
    href: 'sazky-prehled.html',
    pages: ['sazky-prehled.html']
  },
  {
    type: 'link',
    icon: '🎲',
    label: 'Sázky',
    href: 'sazky.html',
    pages: ['sazky.html']
  },
  {
    type: 'dropdown',
    icon: '✏️',
    label: 'Zápisy',
    pages: ['zapis.html', 'olympiadaa.html'],
    children: [
      { icon: '📝', label: 'Zápasy', href: 'zapis.html', pages: ['zapis.html'] },
      { icon: '🥇', label: 'Olympiáda', href: 'olympiadaa.html', pages: ['olympiadaa.html'] },
    ]
  },
]

items.forEach(item => {
  const wrap = document.createElement('div')
  wrap.className = 'nav-item'

  if(item.type === 'link'){
    const a = document.createElement('a')
    a.className = 'nav-link ' + isActive(item.pages)
    a.href = item.href
    a.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`
    wrap.appendChild(a)
  } else if(item.type === 'dropdown'){
    const btn = document.createElement('button')
    btn.className = 'nav-link ' + isActive(item.pages)
    btn.innerHTML = `<span>${item.icon}</span><span>${item.label}</span><span class="nav-arrow">▼</span>`
    btn.onclick = (e) => {
      e.stopPropagation()
      const isOpen = wrap.classList.contains('open')
      document.querySelectorAll('.nav-item.open').forEach(el => el.classList.remove('open'))
      if(!isOpen) wrap.classList.add('open')
    }

    const dropdown = document.createElement('div')
    dropdown.className = 'nav-dropdown'

    item.children.forEach((child, i) => {
      if(child.divider){
        const div = document.createElement('div')
        div.className = 'nav-divider'
        dropdown.appendChild(div)
        return
      }
      const a = document.createElement('a')
      a.href = child.href
      a.className = isActive(child.pages)
      a.innerHTML = `<span>${child.icon}</span><span>${child.label}</span>`
      dropdown.appendChild(a)
    })

    wrap.appendChild(btn)
    wrap.appendChild(dropdown)
  }

  nav.appendChild(wrap)
})

// Zavři dropdown při kliknutí mimo
document.addEventListener('click', () => {
  document.querySelectorAll('.nav-item.open').forEach(el => el.classList.remove('open'))
})

function insertNav(){
  const ticker = document.getElementById('ticker-bar')
  if(ticker){
    ticker.insertAdjacentElement('afterend', nav)
  } else {
    document.body.insertBefore(nav, document.body.firstChild)
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', insertNav)
} else {
  insertNav()
}

})()
