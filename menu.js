const MENU_ITEMS = [
 { label: '⚡ ELH',      href: 'elh.html' },
 { label: '🏆 Play off', href: 'playoff.html' },
 { label: '⭐ Rating',   href: 'rating.html' },
 { label: '🎲 Vsaď si',  href: 'vsad-si.html' },
 { label: '📊 Sázky',    href: 'prehled-sazek.html' },
 { label: '✏️ Zápisy',   href: 'zapis.html' },
 { label: '⚙️ Admin',    href: 'admin.html' },
]

;(function(){
 const current = window.location.pathname.split('/').pop()

 const nav = document.createElement('nav')
 nav.style.cssText = `
  background:#0b2a3c;
  padding:0 20px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:4px;
  flex-wrap:wrap;
  position:sticky;
  top:0;
  z-index:999;
  box-shadow:0 2px 8px rgba(0,0,0,.3);
 `

 const logo = document.createElement('img')
 logo.src = './logos/lokomotiva.png'
 logo.style.cssText = 'width:32px;height:32px;object-fit:contain;margin-right:8px;opacity:.9;'
 nav.appendChild(logo)

 MENU_ITEMS.forEach(item=>{
  const a = document.createElement('a')
  a.href = item.href
  a.textContent = item.label
  const isActive = current === item.href || (current==='' && item.href==='elh.html')
  a.style.cssText = `
   color:${isActive ? 'white' : '#7ab0cc'};
   text-decoration:none;
   font-family:'Inter',Arial,sans-serif;
   font-size:13px;
   font-weight:700;
   padding:12px 14px;
   border-radius:6px;
   background:${isActive ? 'rgba(255,255,255,.1)' : 'transparent'};
   transition:all .15s;
   white-space:nowrap;
  `
  a.onmouseover = ()=>{
   if(!isActive){ a.style.background='rgba(255,255,255,.06)'; a.style.color='white' }
  }
  a.onmouseout = ()=>{
   if(!isActive){ a.style.background='transparent'; a.style.color='#7ab0cc' }
  }
  nav.appendChild(a)
 })

 document.body.insertBefore(nav, document.body.firstChild)
})()
