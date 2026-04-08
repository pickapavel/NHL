;(function(){

const style = document.createElement('style')
style.textContent = `
/* ── DESKTOP NAV ── */
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
.nav-link:hover { background: rgba(255,255,255,.1); color: #fff; }
.nav-link.active { background: rgba(255,255,255,.12); color: #fff; }
.nav-link .nav-arrow { font-size: 9px; opacity: .7; transition: transform .15s; }
.nav-item.open .nav-arrow { transform: rotate(180deg); }

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
.nav-item.open .nav-dropdown { display: flex; }

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
.nav-dropdown a:hover { background: rgba(255,255,255,.1); color: #fff; }
.nav-dropdown a.active { background: rgba(255,255,255,.12); color: #fff; }

.nav-divider { height: 1px; background: rgba(255,255,255,.1); margin: 4px 0; }

/* hamburger — skrytý na desktopu */
.nav-hamburger { display: none; }

/* ── MOBILNÍ OVERLAY ── */
.nav-mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 998;
  background: rgba(0,0,0,.5);
}
.nav-mobile-overlay.open { display: block; }

.nav-mobile-menu {
  position: fixed;
  top: 0; right: 0;
  width: 280px;
  height: 100%;
  background: #0b2a3c;
  z-index: 999;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform .25s ease;
  padding-bottom: 40px;
}
.nav-mobile-menu.open { transform: translateX(0); }

.nav-mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,.1);
}
.nav-mobile-title {
  font-family: 'Inter', Arial, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}
.nav-mobile-close {
  background: none;
  border: none;
  color: rgba(255,255,255,.65);
  font-size: 22px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1;
  transition: background .15s;
}
.nav-mobile-close:hover { background: rgba(255,255,255,.1); color: #fff; }

.nav-mobile-items {
  padding: 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-mobile-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 8px;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,.75);
  text-decoration: none;
  transition: background .15s;
}
.nav-mobile-link:hover { background: rgba(255,255,255,.08); color: #fff; }
.nav-mobile-link.active { background: rgba(255,255,255,.12); color: #fff; }

.nav-mobile-group-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 8px;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,.75);
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background .15s;
}
.nav-mobile-group-btn:hover { background: rgba(255,255,255,.08); color: #fff; }
.nav-mobile-group-btn.active { color: #fff; }
.nav-mobile-group-arrow {
  margin-left: auto;
  font-size: 10px;
  opacity: .6;
  transition: transform .2s;
}
.nav-mobile-group.open .nav-mobile-group-arrow { transform: rotate(180deg); }

.nav-mobile-group-children {
  display: none;
  flex-direction: column;
  gap: 1px;
  padding: 4px 0 4px 20px;
}
.nav-mobile-group.open .nav-mobile-group-children { display: flex; }

.nav-mobile-child {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 7px;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,.6);
  text-decoration: none;
  transition: background .15s;
}
.nav-mobile-child:hover { background: rgba(255,255,255,.08); color: #fff; }
.nav-mobile-child.active { background: rgba(255,255,255,.1); color: #fff; }

.nav-mobile-sep {
  height: 1px;
  background: rgba(255,255,255,.08);
  margin: 6px 4px;
}

/* ── RESPONSIVE ── */
@media(max-width: 700px){
  nav {
    justify-content: space-between;
    padding: 0 16px;
  }
  .nav-desktop-items { display: none; }
  .nav-hamburger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: rgba(255,255,255,.8);
    font-size: 22px;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 8px;
    transition: background .15s;
  }
  .nav-hamburger:hover { background: rgba(255,255,255,.1); }
  .nav-logo-mobile {
    font-family: 'Inter', Arial, sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
  }
}
@media(min-width: 701px){
  .nav-desktop-items { display: flex; align-items: center; gap: 4px; }
  .nav-mobile-menu, .nav-mobile-overlay { display: none !important; }
}
`
document.head.appendChild(style)

const currentPage = window.location.pathname.split('/').pop() || 'index.html'

function isActive(pages){
  return pages.includes(currentPage) ? 'active' : ''
}

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
    href: 'prehledsazek.html',
    pages: ['prehledsazek.html']
  },
  {
    type: 'dropdown',
    icon: '🎲',
    label: 'Sázky',
    pages: ['sazky.html', 'sazkyoh.html', 'sazkyms.html', 'sazkypohár.html'],
    children: [
      { icon: '🏒', label: 'Extraliga',         href: 'sazky.html',       pages: ['sazky.html'] },
      { icon: '🥇', label: 'Olympiáda',         href: 'sazkyoh.html',     pages: ['sazkyoh.html'] },
      { icon: '🌍', label: 'Mistrovství světa', href: 'sazkyms.html',     pages: ['sazkyms.html'] },
      { icon: '🤪', label: 'Blbounský pohár',   href: 'sazkypohár.html',  pages: ['sazkypohár.html'] },
    ]
  },
  {
    type: 'dropdown',
    icon: '✏️',
    label: 'Zápisy',
    pages: ['zapis.html', 'olympiadaa.html'],
    children: [
      { icon: '📝', label: 'Zápasy',    href: 'zapis.html',      pages: ['zapis.html'] },
      { icon: '🥇', label: 'Olympiáda', href: 'olympiadaa.html', pages: ['olympiadaa.html'] },
    ]
  },
]

// ── DESKTOP NAV ──
const nav = document.createElement('nav')

// Logo vlevo na mobilu
const logoMobile = document.createElement('span')
logoMobile.className = 'nav-logo-mobile'
logoMobile.textContent = '🏒 ELH'
nav.appendChild(logoMobile)

// Desktop položky
const desktopItems = document.createElement('div')
desktopItems.className = 'nav-desktop-items'

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
    item.children.forEach(child => {
      const a = document.createElement('a')
      a.href = child.href
      a.className = isActive(child.pages)
      a.innerHTML = `<span>${child.icon}</span><span>${child.label}</span>`
      dropdown.appendChild(a)
    })
    wrap.appendChild(btn)
    wrap.appendChild(dropdown)
  }

  desktopItems.appendChild(wrap)
})
nav.appendChild(desktopItems)

// Hamburger tlačítko
const hamburger = document.createElement('button')
hamburger.className = 'nav-hamburger'
hamburger.innerHTML = '☰'
hamburger.setAttribute('aria-label', 'Menu')
nav.appendChild(hamburger)

// ── MOBILNÍ MENU ──
const overlay = document.createElement('div')
overlay.className = 'nav-mobile-overlay'

const mobileMenu = document.createElement('div')
mobileMenu.className = 'nav-mobile-menu'

// Header mobilního menu
const mobileHeader = document.createElement('div')
mobileHeader.className = 'nav-mobile-header'
mobileHeader.innerHTML = `<span class="nav-mobile-title">🏒 Menu</span>`
const closeBtn = document.createElement('button')
closeBtn.className = 'nav-mobile-close'
closeBtn.innerHTML = '✕'
closeBtn.onclick = closeMobileMenu
mobileHeader.appendChild(closeBtn)
mobileMenu.appendChild(mobileHeader)

// Položky mobilního menu
const mobileItems = document.createElement('div')
mobileItems.className = 'nav-mobile-items'

items.forEach((item, idx) => {
  if(item.type === 'link'){
    const a = document.createElement('a')
    a.className = 'nav-mobile-link ' + isActive(item.pages)
    a.href = item.href
    a.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`
    a.onclick = closeMobileMenu
    mobileItems.appendChild(a)
  } else if(item.type === 'dropdown'){
    // Oddělovač před dropdown skupinami
    if(idx > 0){
      const sep = document.createElement('div')
      sep.className = 'nav-mobile-sep'
      mobileItems.appendChild(sep)
    }

    const group = document.createElement('div')
    group.className = 'nav-mobile-group'

    const groupBtn = document.createElement('button')
    groupBtn.className = 'nav-mobile-group-btn ' + isActive(item.pages)
    groupBtn.innerHTML = `<span>${item.icon}</span><span>${item.label}</span><span class="nav-mobile-group-arrow">▼</span>`
    groupBtn.onclick = () => {
      const isOpen = group.classList.contains('open')
      group.classList.toggle('open', !isOpen)
    }

    const children = document.createElement('div')
    children.className = 'nav-mobile-group-children'

    item.children.forEach(child => {
      const a = document.createElement('a')
      a.className = 'nav-mobile-child ' + isActive(child.pages)
      a.href = child.href
      a.innerHTML = `<span>${child.icon}</span><span>${child.label}</span>`
      a.onclick = closeMobileMenu
      children.appendChild(a)
    })

    // Pokud je některá child aktivní, otevři skupinu
    if(isActive(item.pages)) group.classList.add('open')

    group.appendChild(groupBtn)
    group.appendChild(children)
    mobileItems.appendChild(group)
  }
})

mobileMenu.appendChild(mobileItems)
overlay.appendChild(mobileMenu)

// Otevření/zavření
hamburger.onclick = (e) => {
  e.stopPropagation()
  openMobileMenu()
}
overlay.addEventListener('click', (e) => {
  if(e.target === overlay) closeMobileMenu()
})

function openMobileMenu(){
  overlay.classList.add('open')
  mobileMenu.classList.add('open')
  document.body.style.overflow = 'hidden'
}
function closeMobileMenu(){
  overlay.classList.remove('open')
  mobileMenu.classList.remove('open')
  document.body.style.overflow = ''
}

// Zavři desktop dropdown při kliknutí mimo
document.addEventListener('click', () => {
  document.querySelectorAll('.nav-item.open').forEach(el => el.classList.remove('open'))
})

function insertNav(){
  const ticker = document.getElementById('ticker-bar')
  if(ticker){
    ticker.insertAdjacentElement('afterend', nav)
    ticker.insertAdjacentElement('afterend', overlay)
  } else {
    document.body.insertBefore(overlay, document.body.firstChild)
    document.body.insertBefore(nav, document.body.firstChild)
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', insertNav)
} else {
  insertNav()
}

})()
