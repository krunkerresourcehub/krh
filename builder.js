/* ---------------- icon set (inline SVG, not unicode glyphs) ---------------- */
/* using real SVG here instead of unicode symbols (⌂, </> etc.) because those
   glyphs are missing in Orbitron/Rajdhani and rendered as blank boxes for
   Home and Scripts specifically. SVG with stroke="currentColor" always renders. */
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h5V14h3v5.5h5V10"/></svg>',
  crosshair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="7.5"/><line x1="12" y1="2.5" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21.5" y2="12"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6"/></svg>',
  braces: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 4c-2 0-3 1-3 3v3c0 1-.6 2-2 2 1.4 0 2 1 2 2v3c0 2 1 3 3 3"/><path d="M15.5 4c2 0 3 1 3 3v3c0 1 .6 2 2 2-1.4 0-2 1-2 2v3c0 2-1 3-3 3"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.6 7-11.6A7 7 0 0 0 5 9.4C5 14.4 12 21 12 21Z"/><circle cx="12" cy="9.4" r="2.3"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M9 3h6l6 6-9 12L3 9Z"/><path d="M3 9h18M9 3l1.5 6L12 21M15 3l-1.5 6L12 21"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="8.5 8 4 12 8.5 16"/><polyline points="15.5 8 20 12 15.5 16"/><line x1="14" y1="5.5" x2="10" y2="18.5"/></svg>',
  guide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/></svg>',
  news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4a1 1 0 0 0 1 1h2l4.5 4V5L6 9H4a1 1 0 0 0-1 1Z"/><path d="M16 8.5a4 4 0 0 1 0 7M19 6a7.5 7.5 0 0 1 0 12"/></svg>',
  clients: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 20c0-3 2.5-5.2 5.5-5.2S14.5 17 14.5 20"/><circle cx="17" cy="9.5" r="2.4"/><path d="M14.8 15c2.7.3 4.7 2.3 4.7 5"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none"/></svg>',
  server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="6" rx="1.4"/><rect x="3.5" y="14" width="17" height="6" rx="1.4"/><circle cx="7" cy="7" r=".9" fill="currentColor" stroke="none"/><circle cx="7" cy="17" r=".9" fill="currentColor" stroke="none"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.65-.2.65-.45v-1.7c-2.65.55-3.2-1.2-3.2-1.2-.45-1.1-1.05-1.4-1.05-1.4-.85-.55.05-.55.05-.55.95.05 1.45.95 1.45.95.85 1.4 2.2 1 2.75.75.1-.6.35-1 .6-1.25-2.1-.25-4.35-1.05-4.35-4.65 0-1.05.35-1.85.95-2.55-.1-.25-.4-1.25.1-2.55 0 0 .8-.25 2.6.95a9 9 0 0 1 4.75 0c1.8-1.2 2.6-.95 2.6-.95.5 1.3.2 2.3.1 2.55.6.7.95 1.5.95 2.55 0 3.6-2.25 4.4-4.35 4.65.35.3.65.9.65 1.8v2.65c0 .25.15.55.65.45A9.5 9.5 0 0 0 12 2.5Z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v12"/><polyline points="7 11 12 16 17 11"/><path d="M4.5 17v2.2A1.3 1.3 0 0 0 5.8 20.5h12.4a1.3 1.3 0 0 0 1.3-1.3V17"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3.5 12.3 8l4.5 1.3L12.3 10.6 11 15.1 9.7 10.6 5.2 9.3 9.7 8Z"/><path d="M18 14.5 18.7 17l2.5.7-2.5.7L18 21l-.7-2.6-2.5-.7 2.5-.7Z"/></svg>',
};
function icon(key){ return ICONS[key] || ''; }

/* Cross-origin files (e.g. Supabase Storage) ignore the <a download="..."> filename hint —
   browsers only honor it for same-origin links. So for real remote file downloads we fetch
   the file as a blob and trigger the download from a same-origin blob: URL instead, which
   always respects our chosen filename. */
async function downloadFileByUrl(url, filename, btn){
  const originalText = btn ? btn.textContent : null;
  if(btn){ btn.disabled = true; btn.textContent = 'Downloading...'; }
  try {
    const res = await fetch(url);
    if(!res.ok) throw new Error('Download failed (' + res.status + ')');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
  } catch(e) {
    alert('Could not download the file automatically. Opening it in a new tab instead — use "Save As" there.');
    window.open(url, '_blank', 'noopener');
  } finally {
    if(btn){ btn.disabled = false; btn.textContent = originalText; }
  }
}

/* Makes any element with [data-post-id] inside `container` clickable,
   navigating to that post's dedicated detail page — unless the click
   started on a button/link/input inside the card (so Download, Edit,
   Delete, Description-toggle etc. keep working normally). */
function wireCardNavigation(container){
  if(!container) return;
  container.querySelectorAll('[data-post-id]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if(e.target.closest('button, a, input, textarea')) return;
      const id = card.getAttribute('data-post-id');
      window.location.href = `community/post.html?id=${encodeURIComponent(id)}`;
    });
  });
}

/* Batch-fetches like/dislike counts, the current user's own reaction, and
   which of these posts (if any) they've saved — one query each, not one
   per card, to avoid hammering Supabase with N+1 requests in a gallery. */
async function fetchReactionData(postIds, userId){
  const counts = {}, mine = {}, saved = {};
  postIds.forEach(id => { counts[id] = { like: 0, dislike: 0 }; });
  if(!postIds.length) return { counts, mine, saved };

  const { data: reactions } = await sb.from('post_reactions').select('post_id,user_id,type').in('post_id', postIds);
  (reactions || []).forEach(r => {
    if(counts[r.post_id]) counts[r.post_id][r.type]++;
    if(userId && r.user_id === userId) mine[r.post_id] = r.type;
  });

  if(userId){
    const { data: saves } = await sb.from('post_saves').select('post_id').eq('user_id', userId).in('post_id', postIds);
    (saves || []).forEach(s => { saved[s.post_id] = true; });
  }

  return { counts, mine, saved };
}

async function toggleReaction(postId, type, userId){
  const { data: existing } = await sb.from('post_reactions').select('id,type').eq('post_id', postId).eq('user_id', userId).maybeSingle();
  if(existing && existing.type === type){
    await sb.from('post_reactions').delete().eq('id', existing.id);
    return null;
  }
  if(existing){
    await sb.from('post_reactions').update({ type }).eq('id', existing.id);
    return type;
  }
  await sb.from('post_reactions').insert({ post_id: postId, user_id: userId, type });
  return type;
}

async function toggleSave(postId, userId){
  const { data: existing } = await sb.from('post_saves').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle();
  if(existing){
    await sb.from('post_saves').delete().eq('id', existing.id);
    return false;
  }
  await sb.from('post_saves').insert({ post_id: postId, user_id: userId });
  return true;
}

function reactionButtonsHtml(postId, counts, myReaction, isSaved){
  const c = counts || { like: 0, dislike: 0 };
  return `
    <button class="gallery-btn reaction-btn${myReaction === 'like' ? ' active-like' : ''}" data-reaction="like" data-post-react="${postId}">\u{1F44D} ${c.like}</button>
    <button class="gallery-btn reaction-btn${myReaction === 'dislike' ? ' active-dislike' : ''}" data-reaction="dislike" data-post-react="${postId}">\u{1F44E} ${c.dislike}</button>
    <button class="gallery-btn reaction-btn${isSaved ? ' active-save' : ''}" data-save-post="${postId}">${isSaved ? '\u2605' : '\u2606'} ${isSaved ? 'Saved' : 'Save'}</button>
  `;
}

/* Wires up reaction/save buttons rendered by reactionButtonsHtml. `reload`
   is called after a successful toggle so the caller can refresh counts. */
function wireReactionButtons(container, currentUser, reload){
  if(!container) return;

  container.querySelectorAll('[data-reaction]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if(!currentUser){ alert('Log in to like or dislike posts.'); return; }
      btn.disabled = true;
      const postId = btn.getAttribute('data-post-react');
      const type = btn.getAttribute('data-reaction');
      try {
        await toggleReaction(postId, type, currentUser.id);
        reload();
      } catch(err){
        alert('Something went wrong: ' + err.message);
        btn.disabled = false;
      }
    });
  });

  container.querySelectorAll('[data-save-post]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if(!currentUser){ alert('Log in to save posts.'); return; }
      btn.disabled = true;
      const postId = btn.getAttribute('data-save-post');
      try {
        await toggleSave(postId, currentUser.id);
        reload();
      } catch(err){
        alert('Something went wrong: ' + err.message);
        btn.disabled = false;
      }
    });
  });
}

/* ---------------- data model (from mindmap) ---------------- */
const DATA = [
  { id:'home', label:'Home', color:'blue', glyph:'home' },

  { id:'crosshair', label:'Crosshair', color:'green', glyph:'crosshair',
    children:[
      { id:'crosshair-maker', label:'Custom Crosshair Maker' },
      { id:'crosshair-crosshairs', label:'Crosshairs' },
      { id:'crosshair-scope', label:'Scope' },
      { id:'crosshair-hitmarker', label:'Hitmarker' },
      { id:'crosshair-overlay', label:'Overlay', children:[
          { id:'crosshair-overlay-damage', label:'Damage Overlays' },
          { id:'crosshair-overlay-game', label:'Game Overlays' },
        ] },
      { id:'crosshair-icons', label:'Icons', children:[
          { id:'crosshair-icons-kill', label:'Kill' },
          { id:'crosshair-icons-death', label:'Death' },
          { id:'crosshair-icons-ammo', label:'Ammo' },
          { id:'crosshair-icons-streak', label:'Streak Counter' },
        ] },
    ] },

  { id:'settings', label:'Settings', color:'green', glyph:'gear',
    children:[
      { id:'settings-generator', label:'Generator' },
      { id:'settings-ready', label:'Ready Settings' },
    ] },

  { id:'css', label:'CSS', color:'green', glyph:'braces',
    children:[
      { id:'css-setup-guide', label:'CSS Setup Guide' },
      { id:'css-generator', label:'CSS Generator' },
      { id:'css-official', label:'Official / Original CSS' },
      { id:'css-ready', label:'Ready CSS' },
    ] },

  { id:'maps', label:'Maps', color:'orange', glyph:'pin',
    children:[
      { id:'maps-official', label:'Official Maps', children:[
          { id:'maps-official-pubs', label:'Pubs' },
          { id:'maps-official-parkour', label:'Parkour' },
          { id:'maps-official-raids', label:'Raids' },
        ] },
      { id:'maps-custom', label:'Custom Maps', children:[
          { id:'maps-official-infected', label:'Infected' },
          { id:'maps-official-tdm', label:'TDM' },
          { id:'maps-custom-parkour', label:'Parkour' },
        ] },
    ] },

  { id:'mods', label:'Mods', color:'purple', glyph:'diamond',
    children:[
      { id:'mods-guide', label:'Modding Guide' },
      { id:'mods-files', label:'Mods Files' },
    ] },

  { id:'scripts', label:'Scripts', color:'purple', glyph:'code',
    children:[
      { id:'scripts-krunkscript', label:'KrunkScript', children:[
          { id:'scripts-krunkscript-generator', label:'Generator' },
          { id:'scripts-krunkscript-usable', label:'Usable KrunkScripts' },
          { id:'scripts-krunkscript-docs', label:'Krunker Docs / Documentation', children:[
              { id:'scripts-krunkscript-docs-kr', label:'KR Docs' },
              { id:'scripts-krunkscript-docs-swatdoge', label:'Swatdoge' },
            ] },
        ] },
      { id:'scripts-userscript', label:'UserScript', children:[
          { id:'scripts-userscript-setup-guide', label:'UserScript Setup Guide' },
          { id:'scripts-userscript-legal', label:'Legal Script' },
          { id:'scripts-userscript-hack', label:'Hack Script' },
        ] },
    ] },

  { id:'guides', label:'Guides', color:'cyan', glyph:'guide',
    children:[
      { id:'guides-tips', label:'Pubs' },
      { id:'guides-raids', label:'Raids', children:[
          { id:'guides-raids-tortuga', label:'Tortuga' },
          { id:'guides-raids-khepri', label:'Khepri', children:[
              { id:'guides-raids-khepri-pharoah', label:'Pharoah' },
              { id:'guides-raids-khepri-osiris', label:'Osiris' },
            ] },
          { id:'guides-raids-soul-sanctum', label:'Soul Sanctum' },
          { id:'guides-raids-laboratory', label:'Laboratory' },
          { id:'guides-raids-zombie', label:'Zombie' },
          { id:'guides-raids-arg', label:'Arg' },
          { id:'guides-raids-bastion', label:'Bastion' },
        ] },
    ] },

  { id:'news', label:'News', color:'cyan', glyph:'news',
    children:[
      { id:'news-updates', label:'Krunker Updates' },
      { id:'news-events', label:'Krunker Events' },
    ] },

  { id:'clients', label:'Clients', color:'cyan', glyph:'clients' },

  { id:'servers', label:'Servers', color:'cyan', glyph:'server',
    children:[
      { id:'servers-game', label:'Krunker Game Servers' },
      { id:'servers-discord', label:'Krunker Discord Community Servers' },
    ] },

  { id:'about', label:'About Us', color:'cyan', glyph:'info',
    children:[
      { id:'about-discord', label:'Discord' },
      { id:'about-youtube', label:'YouTube' },
    ] },
];

const COLOR_VAR = { blue:'var(--blue)', green:'var(--green)', orange:'var(--orange)', purple:'var(--purple)', cyan:'var(--cyan)' };

/* ---------------- state ---------------- */
let activeMainId = DATA[0].id;
let selectedId = DATA[0].id;
let expanded = new Set();
let manualEmbedNodeId = null; /* set when "Create Post" is clicked on a placeholder page */
let gallerySearchQuery = ''; /* current search text for whichever community gallery is on screen */
let gallerySearchNodeId = null; /* which node the query above belongs to, so switching pages resets it */

function findMain(id){ return DATA.find(n => n.id === id); }
function findPath(nodes, id, trail=[]){
  for(const n of nodes){
    const next = [...trail, n];
    if(n.id === id) return next;
    if(n.children){ const r = findPath(n.children, id, next); if(r) return r; }
  }
  return null;
}
function fullPath(id){
  for(const main of DATA){ const p = findPath([main], id); if(p) return p; }
  return null;
}

/* ---------------- render: main tabs ---------------- */
function renderTabs(){
  const wrap = document.getElementById('mainTabs');
  wrap.innerHTML = '';
  DATA.forEach(main => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (main.id === activeMainId ? ' active' : '');
    btn.style.setProperty('--c', COLOR_VAR[main.color]);
    btn.innerHTML = `<span class="glyph">${icon(main.glyph)}</span>${main.label}`;
    btn.addEventListener('click', () => {
      activeMainId = main.id;
      expanded = new Set([main.id]);
      selectedId = main.id;
      renderAll();
    });
    wrap.appendChild(btn);
  });
}

/* ---------------- render: sidebar tree ---------------- */
function renderTree(){
  const main = findMain(activeMainId);
  document.getElementById('sidebarLabel').textContent = main.label;
  const root = document.getElementById('sidebarTree');
  root.innerHTML = '';
  root.appendChild(buildList([main], main.color));
}
function buildList(nodes, color){
  const ul = document.createElement('ul');
  ul.className = 'tree';
  nodes.forEach(node => {
    const li = document.createElement('li');
    li.className = 'node' + (expanded.has(node.id) ? ' expanded' : '');

    const row = document.createElement('button');
    row.className = 'node-row' + (node.id === selectedId ? ' selected' : '');
    row.style.setProperty('--c', COLOR_VAR[color]);
    row.innerHTML = `<span class="dot"></span><span>${node.label}</span>` +
      (node.children && node.children.length ? '<span class="caret">▶</span>' : '');
    row.addEventListener('click', () => {
      selectedId = node.id;
      if(node.children && node.children.length){
        if(expanded.has(node.id)) expanded.delete(node.id); else expanded.add(node.id);
      }
      renderAll();
    });
    li.appendChild(row);

    if(node.children && node.children.length){
      li.appendChild(buildList(node.children, color));
    }
    ul.appendChild(li);
  });
  return ul;
}

/* ---------------- render: content ---------------- */
/* Leaf nodes that get real embedded tools instead of the generic
   placeholder. Rendered as a full-bleed iframe so the tool's own
   CSS/JS never collides with the hub's. */
const EMBEDS = {
  'settings-generator': 'generator.html',
  'css-generator': 'css-generator.html',
  'css-official': 'official-css.html',
  'crosshair-maker': 'crosshair-maker.html',
  'servers-game': 'game-servers.html',
  'scripts-krunkscript-generator': 'ks-generator.html',
  'scripts-krunkscript-docs-kr': 'kr-docs/index.html',
  'scripts-krunkscript-docs-swatdoge': 'https://krdocs.swatdoge.eu/',
};

/* Leaf nodes that get a real downloadable resource list instead of the
   generic placeholder. Each entry is one userscript/tool package, with
   full metadata (description, features, tags) sourced from each script's
   own repo/readme. */
const TAG_COLORS = {
  Userscript:'#22d3ee', Software:'#38bdf8', 'External Program':'#38bdf8',
  'In-Game':'#a3e635', Hub:'#e879f9', Tools:'#8b5cf6', Utility:'#2dd4bf',
  UI:'#60a5fa', Enhancement:'#fb923c', Performance:'#4ade80', compatible:'#94a3b8',
};

/* Leaf nodes that already show a curated RESOURCE_LISTS grid, but should
   ALSO let the community post their own submissions below it. */
const COMMUNITY_SECTIONS = {
  'scripts-userscript-legal': { cat:'scripts-userscript-legal', title:'Legal Script', filetype:'txt,js,json', desc:true },
};

const RESOURCE_LISTS = {
  'scripts-userscript-legal': [
    {
      slug:'bulk-quicksell', title:'Bulk Quick Sell', version:null,
      icon:'fa-tags', g1:'#f97316', g2:'#dc2626',
      tags:['Userscript','Hub','Tools','Utility'],
      desc:'Select and sell multiple inventory items at once instead of one-by-one clicking.',
      fullDesc:'A quality-of-life userscript that adds checkboxes to your Krunker inventory, letting you select multiple items and sell them all at once with a single button click. Features a clean control panel, "Select All" functionality, and automatic dropdown selection to streamline the tedious selling process.',
      features:['Checkboxes for each inventory item','Elegant and intuitive control panel','\u201cSelect All\u201d button to save time','Automatic selection of \u201cAll items\u201d when selling','Real-time counter of selected items','Uses Krunker\u2019s native selling system','Non-intrusive interface in the top-left corner','Confirmation before execution to avoid mistakes'],
      files:[ {label:'app.js', path:'resources/userscripts/legal/bulk-quicksell/app.js'} ],
      readme:'resources/userscripts/legal/bulk-quicksell/readme.md',
      github:'https://github.com/LombreBlanche34/krunker_bulk_quicksell',
    },
    {
      slug:'bullet-low', title:'Bullet Low', version:'1.0.0',
      icon:'fa-gun', g1:'#ef4444', g2:'#e11d48',
      tags:['Userscript','In-Game','compatible'],
      desc:'Change the color of your ammo when it goes below a certain %.',
      fullDesc:'Changes the color of your ammo counter when it drops below a certain percentage of max capacity (#FF0000 / 25% by default), so a low mag is obvious at a glance.',
      features:['Custom ammo color','Configurable low-ammo threshold'],
      files:[ {label:'bullet_low.js', path:'resources/userscripts/legal/bullet-low/bullet_low.js'} ],
      readme:'resources/userscripts/legal/bullet-low/readme.md',
      github:'https://github.com/LombreBlanche34/krunker_bullet_low/',
    },
    {
      slug:'clan-average-stats', title:'Clan Level Statistics & Chart', version:null,
      icon:'fa-chart-line', g1:'#d946ef', g2:'#7c3aed',
      tags:['Userscript','Hub','Tools','UI'],
      desc:'Displays level statistics and visual charts for clan members across all ranks.',
      fullDesc:'A lightweight userscript that extracts member levels from all clan ranks, calculates average levels per category, and renders an interactive Chart.js visualization with personal level tracking in the Krunker.io clan hub.',
      features:['Real-time statistics by rank (Commanders, Captains, Soldiers, Recruits)','Interactive chart with Chart.js tracking level progression','Personal indicator of your level within the clan','Collapsible panel to save screen space','Automatic calculation of global and category averages','Non-intrusive design integrated into the clan hub','Cyan visual marker for your personal position','Lightweight and optimized for minimal performance impact'],
      files:[ {label:'statsclanhub.js', path:'resources/userscripts/legal/clan-average-stats/statsclanhub.js'} ],
      readme:'resources/userscripts/legal/clan-average-stats/README.md',
      preview:['resources/userscripts/legal/clan-average-stats/example.png'],
      github:'https://github.com/LombreBlanche34/krunker_clan_average_stats',
    },
    {
      slug:'clan-score-chart', title:'Clan Score Chart', version:null,
      icon:'fa-chart-bar', g1:'#10b981', g2:'#0d9488',
      tags:['Userscript','In-Game','Tools','UI'],
      desc:'Displays a dynamic bar chart of clan members\u2019 scores with customizable player count.',
      fullDesc:'A lightweight userscript that visualizes clan member performance through an interactive bar chart. Updates automatically when switching to the clan tab and lets you choose how many top performers to display (5 to 50 players).',
      features:['Real-time visualization of member scores','Customizable selector for number of players displayed','Smooth animations and elegant transitions','Non-intrusive design integrated into the interface','Automatic update when switching tabs','Interactive tooltips to display exact scores','Optimized performance with no impact on the game','Quickly identify the clan\u2019s top players'],
      files:[ {label:'clan_chart.js', path:'resources/userscripts/legal/clan-score-chart/clan_chart.js'} ],
      readme:'resources/userscripts/legal/clan-score-chart/readme.md',
      preview:['resources/userscripts/legal/clan-score-chart/example.png'],
      github:'https://github.com/LombreBlanche34/krunker_clan_score_chart',
    },
    {
      slug:'headshot-streak-sound', title:'Headshot Streak Sounds', version:null,
      icon:'fa-bullseye', g1:'#a855f7', g2:'#db2777',
      tags:['Userscript','In-Game','compatible'],
      desc:'Plays streak sounds when you get consecutive headshot kills.',
      fullDesc:'A userscript that monitors the in-game chat to detect headshot kills. When you chain multiple headshots in a row, it automatically plays the corresponding streak sound (streak 2, streak 3, etc.), adding an extra layer of satisfaction to your gameplay.',
      features:['Automatic headshot detection via chat','Progressive streak sounds based on headshot count','Real-time tracking of consecutive kills','Automatic reset between streaks','No impact on performance','Native game sounds for an immersive experience','Compatible with all game modes','Simple and automatic installation'],
      files:[ {label:'headshot.js', path:'resources/userscripts/legal/headshot-streak-sound/headshot.js'} ],
      github:'https://github.com/LombreBlanche34/krunker_headshot_streak_sound',
    },
    {
      slug:'kovaaks-sim', title:'Kovaaks Sandbox', version:'1.0.1',
      icon:'fa-bullseye', g1:'#f59e0b', g2:'#ea580c',
      tags:['Userscript','In-Game','Enhancement','Performance','compatible'],
      desc:'Transform Krunker into a Kovaak\u2019s-like aim trainer with custom sounds and effects.',
      fullDesc:'A comprehensive aim training enhancement that removes your weapon sounds, adds kill sounds, and implements pitch-based hit feedback. Perfect for players who want a more focused aim training experience similar to Kovaaks.',
      features:['Removes your weapon firing sounds','Custom kill sound','Pitch effect on hitmarkers','Lightweight and optimized for smooth gameplay'],
      files:[ {label:'kovaaks_simulator.js', path:'resources/userscripts/legal/kovaaks-sim/kovaaks_simulator.js'} ],
      readme:'resources/userscripts/legal/kovaaks-sim/readme.md',
      github:'https://github.com/LombreBlanche34/krunker_kovaaks_sim',
    },
    {
      slug:'lobby-finder', title:'Krunker Matchmaker', version:'1.0.2',
      icon:'fa-users', g1:'#6366f1', g2:'#9333ea',
      tags:['Userscript','In-Game','Tools','Utility','compatible'],
      desc:'Browse and join Krunker.io lobbies directly from the main page.',
      fullDesc:'Two lightweight userscripts to browse and join Krunker.io lobbies directly from the main page. Choose between fast cached data or real-time accurate server information to find the perfect lobby.',
      features:['Browse available public lobbies in your region','Display player count, map, mode and remaining time','Join any lobby with one click','Press F2 to refresh the lobby list','Fast version (API cache) or accurate (real-time data)','Avoid \u201clobby full\u201d errors with accurate version','Clean interface that doesn\u2019t interfere with gameplay','Automatic filtering of custom and non-FFA lobbies'],
      files:[
        {label:'matchmaker.js (fast)', path:'resources/userscripts/legal/lobby-finder/matchmaker.js'},
        {label:'precise_matchmaker.js (accurate)', path:'resources/userscripts/legal/lobby-finder/precise_matchmaker.js'},
      ],
      readme:'resources/userscripts/legal/lobby-finder/readme.md',
      preview:['resources/userscripts/legal/lobby-finder/example.png'],
      github:'https://github.com/LombreBlanche34/krunker_lobby_finder',
    },
    {
      slug:'no-custom-weapon-sounds', title:'No Custom Weapon Sounds', version:'1.0.0',
      icon:'fa-rotate-right', g1:'#60a5fa', g2:'#2563eb',
      tags:['Userscript','In-Game','compatible'],
      desc:'Replace custom weapon sounds by default sound.',
      fullDesc:'Forces the default sound (works with mods) in place of any custom weapon sound. You can independently choose whether this applies to your own weapon sounds and/or enemy weapon sounds via settings.js.',
      features:['No custom weapons sounds','Works for your sound and enemy sounds independently'],
      files:[ {label:'no_custom-weapon-sounds.js', path:'resources/userscripts/legal/no-custom-weapon-sounds/no_custom-weapon-sounds.js'} ],
      readme:'resources/userscripts/legal/no-custom-weapon-sounds/README.md',
      github:'https://github.com/LombreBlanche34/krunker_no_custom_weapon_sounds/',
    },
    {
      slug:'onetap-hating', title:'One-Tap Death Counter', version:'1.0.0',
      icon:'fa-crosshairs', g1:'#ef4444', g2:'#e11d48',
      tags:['Userscript','In-Game','Tools','UI','compatible'],
      desc:'Tracks how many times you die to one-tap weapons with real-time statistics.',
      fullDesc:'A lightweight userscript that monitors your deaths to one-tap weapons (Sniper, Crossbow, Infiltrator, Thrown Knives) in Krunker.io. Available in two versions: basic (resets per lobby) and persistent (saves across sessions). Displays a clean HUD counter showing your one-tap death ratio in real-time.',
      features:['Real-time tracking of one-tap deaths','Persistent version with statistics saving','Automatic kill feed analysis via chat','Clean and non-intrusive HUD counter','Detects Sniper, Crossbow, Infiltrator and thrown knives','Zero impact on game performance','Death ratio displayed in real-time (X/Y)','Customizable to track other weapons'],
      files:[
        {label:'onetap_hating.js (per-lobby)', path:'resources/userscripts/legal/onetap-hating/onetap_hating.js'},
        {label:'onetap_hating_persistent.js (saved)', path:'resources/userscripts/legal/onetap-hating/onetap_hating_persistent.js'},
      ],
      readme:'resources/userscripts/legal/onetap-hating/README.md',
      preview:['resources/userscripts/legal/onetap-hating/example.png'],
      github:'https://github.com/LombreBlanche34/krunker_onetap_hating',
    },
    {
      slug:'ranked-external-queue', title:'External Ranked Queue', version:null,
      icon:'fa-desktop', g1:'#22d3ee', g2:'#2563eb',
      tags:['Software','External Program'],
      desc:'External ranked queue manager for maps & region selection for EVERY client.',
      fullDesc:'An external queue manager for Krunker Ranked. Allows you to stay in the ranked queue while switching lobbies, choose preferred maps, and select your region with a standalone desktop application.',
      features:['Stay in ranked queue while switching lobbies','Choose preferred maps before queueing','Region selection support','Standalone external application (not a userscript)','Automatic detection of ranked matchmaking','Lightweight and fast interface','Works with EVERY client'],
      files:[
        {label:'app.py', path:'resources/userscripts/legal/ranked-external-queue/app.py'},
        {label:'requirements.txt', path:'resources/userscripts/legal/ranked-external-queue/requirements.txt'},
      ],
      readme:'resources/userscripts/legal/ranked-external-queue/README.md',
      preview:['resources/userscripts/legal/ranked-external-queue/Auth_page.png','resources/userscripts/legal/ranked-external-queue/Queue_page.png'],
      github:'https://github.com/LombreBlanche34/krunker_ranked_external_queue',
      note:'Standalone Python app, not a browser userscript \u2014 see the readme for setup.',
    },
    {
      slug:'ranked-kill-feed', title:'Ranked Killfeed', version:'1.0.1',
      icon:'fa-skull-crossbones', g1:'#c084fc', g2:'#22c55e',
      tags:['Userscript','In-Game','compatible'],
      desc:'Shows the weapon of the enemy who has just died (AK dead, SMG dead, SNIPER dead\u2026).',
      fullDesc:'Shows the weapon of the enemy who has just died (AK dead, SMG dead, SNIPER dead\u2026), reading kills from your allies straight off the kill feed instead of the chat.',
      features:['No need to read the chat','Instant information about enemy weapons'],
      files:[ {label:'ranked_killfeed.js', path:'resources/userscripts/legal/ranked-kill-feed/ranked_killfeed.js'} ],
      readme:'resources/userscripts/legal/ranked-kill-feed/readme.md',
      preview:['resources/userscripts/legal/ranked-kill-feed/example.png'],
      video:'resources/userscripts/legal/ranked-kill-feed/example.mp4',
      github:'https://github.com/LombreBlanche34/krunker_ranked_kill_feed/tree/main',
    },
    {
      slug:'rankedlb-search-users', title:'Better Ranked Leaderboard', version:null,
      icon:'fa-magnifying-glass', g1:'#fb923c', g2:'#f43f5e',
      tags:['Userscript','In-Game','compatible'],
      desc:'Remove the players limit and add a search bar for username.',
      fullDesc:'Removes the players limit on the ranked leaderboard (1000 players / page instead of the default cap) and adds a search bar so you can jump straight to a specific player.',
      features:['No players limit','Search bar for username'],
      files:[ {label:'rankedLB_searchUsers.js', path:'resources/userscripts/legal/rankedlb-search-users/rankedLB_searchUsers.js'} ],
      readme:'resources/userscripts/legal/rankedlb-search-users/readme.md',
      preview:['resources/userscripts/legal/rankedlb-search-users/example_1.png'],
      github:'https://github.com/LombreBlanche34/krunker_rankedLB_searchUsers',
    },
  ],
};

function tagChip(tag){
  const c = TAG_COLORS[tag] || '#94a3b8';
  return `<span class="tag-chip" style="--tc:${c}">${tag}</span>`;
}

function renderResourceList(node, main, path, crumbs, color){
  const list = RESOURCE_LISTS[node.id];
  if(gallerySearchNodeId !== node.id){ gallerySearchQuery = ''; gallerySearchNodeId = node.id; }
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="breadcrumb">${crumbs}</div>
    <div class="content-head">
      <div class="content-icon">${icon(main.glyph)}</div>
      <h2>${node.label}</h2>
    </div>
    <p class="content-desc">Community-made userscripts that only use Krunker\u2019s own client-side systems \u2014 quality-of-life and UI additions, no game manipulation. Click a card to see the full rundown, or grab a file straight away.</p>
    <div class="meta-strip">
      <span class="chip">${main.label}</span>
      <span class="chip" id="resourceCountChip">${list.length} script${list.length>1?'s':''}</span>
    </div>
    <div class="search-bar-wrap">
      <svg class="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" id="resourceSearchInput" class="search-bar-input" placeholder="Search ${list.length} scripts by name or tag..." autocomplete="off">
    </div>
    <div class="resource-grid" id="resourceGrid">
      ${list.map((item,i) => `
        <div class="resource-card" data-idx="${i}" data-search="${escapeHtml((item.title + ' ' + item.tags.join(' ')).toLowerCase())}" style="--g1:${item.g1}; --g2:${item.g2}">
          <div class="resource-card-glow"></div>
          <div class="resource-card-top">
            <div class="resource-icon"><i class="fas ${item.icon}"></i></div>
            <h3>${item.title}</h3>
          </div>
          <p class="resource-desc">${item.desc}</p>
          <div class="resource-tags">${item.tags.map(tagChip).join('')}</div>
          <div class="resource-actions">
            ${item.files.map(f => `<a class="btn-download" href="${f.path}" download onclick="event.stopPropagation()">\u2913 ${f.label}</a>`).join('')}
            ${item.github ? `<a class="btn-readme" href="${item.github}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><i class="fab fa-github"></i> Code</a>` : ''}
          </div>
          <div class="resource-preview-hint"><i class="fas fa-eye"></i> Click to preview</div>
        </div>`).join('')}
      <div class="gallery-empty" id="resourceSearchEmpty" style="display:none;">No scripts match your search.</div>
    </div>
    <div class="status-note">Use at your own risk. Always review a script before running it, and keep your userscript manager up to date.</div>
    ${COMMUNITY_SECTIONS[node.id] ? `
      <div class="content-head" style="margin-top:26px;">
        <h2 style="margin:0;">Community Submissions</h2>
      </div>
      ${manualEmbedNodeId === node.id
        ? `<iframe class="embed-frame" src="community/section.html?cat=${encodeURIComponent(COMMUNITY_SECTIONS[node.id].cat)}&title=${encodeURIComponent(COMMUNITY_SECTIONS[node.id].title)}${COMMUNITY_SECTIONS[node.id].filetype ? `&filetype=${encodeURIComponent(COMMUNITY_SECTIONS[node.id].filetype)}` : ''}${COMMUNITY_SECTIONS[node.id].desc ? '&desc=1' : ''}" title="${COMMUNITY_SECTIONS[node.id].title} community submissions" loading="lazy"></iframe>`
        : `<button class="btn-createpost" id="btnCreatePostResource" style="margin-bottom:0;">Create Post</button>`}
    ` : ''}
    ${FILE_GALLERY_SECTIONS[node.id] ? `
      <div class="gallery-wrap">
        <h3 class="gallery-heading">${FILE_GALLERY_SECTIONS[node.id].title || 'Community Files'}</h3>
        <div class="search-bar-wrap">
          <svg class="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="search-bar-input" id="gallerySearchInput" placeholder="Search community posts by title..." value="${escapeHtml(gallerySearchQuery)}" autocomplete="off">
        </div>
        <div class="file-gallery" id="fileGallery"><div class="gallery-empty">Loading...</div></div>
      </div>
    ` : ''}
  `;

  if(COMMUNITY_SECTIONS[node.id] && manualEmbedNodeId !== node.id){
    document.getElementById('btnCreatePostResource').addEventListener('click', () => {
      manualEmbedNodeId = node.id;
      renderResourceList(node, main, path, crumbs, color);
    });
  }

  if(FILE_GALLERY_SECTIONS[node.id]){
    loadFileGallery(FILE_GALLERY_SECTIONS[node.id].cat, gallerySearchQuery);
  }

  const gallerySearchInput = document.getElementById('gallerySearchInput');
  if(gallerySearchInput){
    let gallerySearchDebounce = null;
    gallerySearchInput.addEventListener('input', (e) => {
      clearTimeout(gallerySearchDebounce);
      const thisNodeId = node.id;
      gallerySearchDebounce = setTimeout(() => {
        gallerySearchQuery = e.target.value.trim();
        gallerySearchNodeId = thisNodeId;
        if(FILE_GALLERY_SECTIONS[thisNodeId]) loadFileGallery(FILE_GALLERY_SECTIONS[thisNodeId].cat, gallerySearchQuery);
      }, 300);
    });
  }

  const resourceSearchInput = document.getElementById('resourceSearchInput');
  const resourceCards = Array.from(document.querySelectorAll('#resourceGrid .resource-card'));
  const resourceEmptyState = document.getElementById('resourceSearchEmpty');
  const resourceCountChip = document.getElementById('resourceCountChip');
  resourceSearchInput.addEventListener('input', () => {
    const q = resourceSearchInput.value.trim().toLowerCase();
    let visible = 0;
    resourceCards.forEach(card => {
      const match = !q || card.getAttribute('data-search').includes(q);
      card.style.display = match ? '' : 'none';
      if(match) visible++;
    });
    resourceEmptyState.style.display = visible === 0 ? '' : 'none';
    resourceCountChip.textContent = `${visible} script${visible !== 1 ? 's' : ''}${q ? ' found' : ''}`;
  });

  el.querySelectorAll('.resource-card').forEach(card => {
    card.addEventListener('click', () => openResourceModal(list[+card.getAttribute('data-idx')]));
  });
}

function openResourceModal(item){
  const modal = document.getElementById('resourceModal');
  document.getElementById('modalIcon').innerHTML = `<i class="fas ${item.icon}"></i>`;
  document.getElementById('modalIcon').style.background = `linear-gradient(135deg, ${item.g1}, ${item.g2})`;
  document.getElementById('modalTitle').textContent = item.title + (item.version ? `  \u00b7  v${item.version}` : '');
  document.getElementById('modalTags').innerHTML = item.tags.map(tagChip).join('');
  document.getElementById('modalDesc').textContent = item.fullDesc || item.desc;

  const media = [];
  if(item.video) media.push(`<video src="${item.video}" class="modal-media-item" controls muted loop playsinline></video>`);
  (item.preview||[]).forEach(p => media.push(`<img src="${p}" class="modal-media-item" alt="${item.title} preview">`));
  document.getElementById('modalMedia').innerHTML = media.length
    ? media.join('')
    : `<div class="modal-media-empty"><i class="fas fa-image"></i><span>No preview available</span></div>`;

  document.getElementById('modalFeatures').innerHTML = item.features.map(f =>
    `<li><i class="fas fa-check-circle"></i><span>${f}</span></li>`).join('');

  const actions = [];
  if(item.note) actions.push(`<p class="modal-note">${item.note}</p>`);
  document.getElementById('modalActions').innerHTML = `
    ${item.note ? `<p class="modal-note">${item.note}</p>` : ''}
    <div class="modal-actions-row">
      ${item.files.map(f => `<a class="btn-download btn-lg" href="${f.path}" download>\u2913 ${f.label}</a>`).join('')}
      ${item.github ? `<a class="btn-readme btn-lg" href="${item.github}" target="_blank" rel="noopener"><i class="fab fa-github"></i> View Code</a>` : ''}
      ${item.readme ? `<a class="btn-readme btn-lg" href="${item.readme}" target="_blank" rel="noopener"><i class="fas fa-file-lines"></i> Readme</a>` : ''}
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeResourceModal(){
  document.getElementById('resourceModal').classList.remove('active');
  document.body.style.overflow = '';
  document.querySelectorAll('.modal-media-item').forEach(m => { if(m.tagName === 'VIDEO') m.pause(); });
}
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('resourceModal');
  if(!overlay) return;
  document.getElementById('modalClose').addEventListener('click', closeResourceModal);
  overlay.addEventListener('click', e => { if(e.target === overlay) closeResourceModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeResourceModal(); });
});

/* Leaf nodes that render a simple "join / follow" link card instead of
   the generic placeholder. */
const LINK_PAGES = {
  'about-discord': {
    label:'Discord', icon:'fa-discord', iconType:'fab',
    blurb:'Join our Discord servers for community chat, support, and updates.',
    links:[
      { url:'https://discord.gg/vpXbhyBMhe', cta:'Join Krunker Resource Hub' },
      { url:'https://discord.gg/HVpGk9a5Cu', cta:'Join Aura Gangs Team' },
    ],
  },
};

function renderLinkPage(node, main, crumbs){
  const link = LINK_PAGES[node.id];
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="breadcrumb">${crumbs}</div>
    <div class="content-head">
      <div class="content-icon">${icon(main.glyph)}</div>
      <h2>${node.label}</h2>
    </div>
    <p class="content-desc">${link.blurb}</p>
    <div class="meta-strip">
      <span class="chip">${main.label}</span>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:12px;">
      ${link.links.map(l => `
        <a class="link-cta" href="${l.url}" target="_blank" rel="noopener">
          <i class="${link.iconType} ${link.icon}"></i>
          <span>${l.cta}</span>
        </a>
      `).join('')}
    </div>
  `;
}

/* Leaf nodes that render a searchable directory of Discord server
   invites, with a best-effort live icon preview, a copy-link button
   and an open-in-new-tab button per card. */
const DISCORD_SERVER_LISTS = {
  'servers-discord': {
    title: 'Krunker Discord Community Servers',
    intro: 'Community, clan, trading and competitive Discord servers around Krunker.io.',
    submitNote: 'Please join the Krunker Resource Hub server and make a ticket in there if you want to put your server in here.',
    servers: [
      { name: "Krunker Resource Hub", url: "https://discord.gg/vpXbhyBMhe" },
      { name: "Krunker Bunker", url: "https://discord.gg/krunker" },
      { name: "Map Makers Of Krunker", url: "https://discord.com/servers/map-makers-of-krunker-484192043833491487" },
      { name: "Krunker Pro Circuit", url: "https://discord.gg/kpc-672146248182136863" },
      { name: "North American Competitive Krunker", url: "https://discord.gg/nJmqWam3tj" },
      { name: "Krunker Market & Trading", url: "https://discord.gg/kmt" },
      { name: "Krunker Trading", url: "https://discord.gg/krunker-trading-1290880126468227083" },
      { name: "Krunker Korea", url: "https://discord.gg/CMjXHQdZJ5" },
      { name: "Krunker Design Hub", url: "https://discord.gg/cUA2cXN9Jz" },
      { name: "Krunker Parkour Hub", url: "https://discord.gg/uFfme37GqY" },
      { name: "Krunker Police Civilian Group", url: "https://discord.gg/WTYTpH8RKB" },
      { name: "M3OW Clan", url: "https://discord.gg/beSgj73vku" },
      { name: "ax clan", url: "https://discord.gg/UBrhqWrA3t" },
      { name: "24/7 Clan", url: "https://discord.gg/6kX2WjP" },
      { name: "-525 Clan", url: "https://discord.gg/efRWZyJFM5" },
      { name: "Hovi Clan", url: "https://discord.gg/6tvsyxc29U" },
      { name: "Keybi Hub", url: "https://discord.gg/qxUWAa68sx" },
      { name: "crosshair server", url: "https://discord.gg/crosshair-server-952475775901237258" },
      { name: "Competitive Krunker Asia", url: "https://discord.gg/bRs2PVzZza" },
      { name: "Krunker Infect", url: "https://discord.gg/jGuvhTEFUB" },
      { name: "Krunker Mumbai", url: "https://discord.gg/Sce5p7GGey" },
      { name: "rise clan", url: "https://discord.gg/Zdsb4CSm6C" },
      { name: "Krunker Events", url: "https://discord.gg/aFmGg9s8s8" },
      { name: "Krunker Middle East", url: "https://discord.gg/WpeVEcJ4ep" },
      { name: "guts clan", url: "https://discord.gg/FjhQvnyKhQ" },
      { name: "ZombWorlds_Server", url: "https://discord.gg/PrW7suqVWK" },
      { name: "Krunker Indonesia Community", url: "https://discord.gg/NNXpvJ4aWX" },
      { name: "QAZ Clan", url: "https://discord.gg/HwrVg32BGa" },
      { name: "\u311eClan", url: "https://discord.gg/YDt5P4tsJy" },
      { name: "\u521d\u6200 Clan", url: "https://discord.gg/hEBXqhYQTV" },
      { name: "Pandora Clan", url: "https://discord.gg/sh-pandora-657419822157791262" },
      { name: "YAHU Clan", url: "https://discord.gg/yNf5YrYAzX" },
      { name: "THE PARADOX", url: "https://discord.gg/cJ3dQSV8ag" },
      { name: "Rampage Clan", url: "https://discord.gg/5HmkV4dr7p" },
      { name: "Vamp Clan", url: "https://discord.gg/NVpwMqGZxG" },
      { name: "O2 Clan", url: "https://discord.gg/znETdAhAj8" },
      { name: "Krunker Pickups International", url: "https://discord.gg/KUfVUxXrYS" },
      { name: "Gin Clan", url: "https://discord.gg/gwn7252rcf" },
      { name: "Romulus Server", url: "https://discord.gg/7FHP9PDFXB" },
      { name: "Arnas Server", url: "https://discord.gg/mUfnXnfTpd" },
      { name: "Tiranga", url: "https://discord.gg/Drp2udwUra" },
      { name: "cry clan", url: "https://discord.gg/7JjaNqvW4c" },
      { name: "PC7 Client", url: "https://discord.gg/BxweEFyZFm" },
      { name: "-TW- Clan", url: "https://discord.gg/ctxjz53dj6" },
      { name: "kbot", url: "https://discord.gg/3BnFPUK8dA" },
      { name: "PSVM Clan", url: "https://discord.gg/mGnNxbuyeh" },
      { name: "Snap Clan", url: "https://discord.gg/ZUJ6fVaVGh" },
      { name: "MKS Dev", url: "https://discord.gg/bWYBKkzVfz" },
      { name: "Slytherin Clan", url: "https://discord.gg/bhyJ6EgvJ2" },
      { name: "Doge", url: "https://discord.gg/9G9GQ9rf7F" },
      { name: "MAR2 Clan", url: "https://discord.gg/SfaufxzPuW" },
      { name: "Cute Clan", url: "https://discord.gg/Df3A89u7" },
      { name: "Turf Clan", url: "https://discord.gg/3JRw8St7b4" },
    ],
  },
};

function extractInviteCode(url){
  const m = url.match(/discord\.(?:gg|com\/invite)\/([^\/?#]+)/i);
  return m ? m[1] : null;
}

function initialsAvatar(name){
  const clean = name.replace(/[^\p{L}\p{N}]/gu, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if(!parts.length) return '?';
  if(parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function renderDiscordServers(node, main, crumbs){
  const section = DISCORD_SERVER_LISTS[node.id];
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="breadcrumb">${crumbs}</div>
    <div class="content-head">
      <div class="content-icon">${icon(main.glyph)}</div>
      <h2>${node.label}</h2>
    </div>
    <p class="content-desc">${escapeHtml(section.intro)}</p>
    ${section.submitNote ? `
    <div class="discord-submit-note">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <span>${section.submitNote}</span>
    </div>` : ''}
    <div class="meta-strip">
      <span class="chip">${escapeHtml(main.label)}</span>
      <span class="chip" id="discordCountChip">${section.servers.length} server${section.servers.length > 1 ? 's' : ''}</span>
    </div>
    <div class="search-bar-wrap">
      <svg class="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" id="discordSearchInput" class="search-bar-input" placeholder="Search ${section.servers.length} servers by name..." autocomplete="off">
    </div>
    <div class="discord-server-grid" id="discordServerGrid">
      ${section.servers.map((s, i) => `
        <div class="discord-server-card" data-name="${escapeHtml(s.name.toLowerCase())}">
          <div class="discord-server-icon" id="discordIcon-${i}">${escapeHtml(initialsAvatar(s.name))}</div>
          <div class="discord-server-info">
            <div class="discord-server-name">${escapeHtml(s.name)}</div>
            <div class="discord-server-url">${escapeHtml(s.url.replace(/^https?:\/\//,''))}</div>
          </div>
          <div class="discord-server-actions">
            <button class="gallery-btn" data-copy="${escapeHtml(s.url)}">Copy</button>
            <a class="gallery-btn" href="${escapeHtml(s.url)}" target="_blank" rel="noopener">Open</a>
          </div>
        </div>
      `).join('')}
      <div class="gallery-empty" id="discordSearchEmpty" style="display:none;">No servers match your search.</div>
    </div>
  `;

  /* Search / filter */
  const searchInput = document.getElementById('discordSearchInput');
  const cards = Array.from(document.querySelectorAll('#discordServerGrid .discord-server-card'));
  const emptyState = document.getElementById('discordSearchEmpty');
  const countChip = document.getElementById('discordCountChip');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const match = !q || card.getAttribute('data-name').includes(q);
      card.style.display = match ? '' : 'none';
      if(match) visible++;
    });
    emptyState.style.display = visible === 0 ? '' : 'none';
    countChip.textContent = `${visible} server${visible !== 1 ? 's' : ''}${q ? ' found' : ''}`;
  });

  /* Copy-link buttons */
  el.querySelectorAll('.discord-server-actions [data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(url);
      } catch(err) {
        const ta = document.createElement('textarea');
        ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch(e2) {}
        document.body.removeChild(ta);
      }
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1500);
    });
  });

  /* Best-effort live server icon fetch (Discord public invite API).
     Runs sequentially with a small stagger to avoid hammering the
     endpoint; silently keeps the initials fallback on any failure. */
  section.servers.forEach((s, i) => {
    const code = extractInviteCode(s.url);
    if(!code) return;
    setTimeout(() => {
      fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=false`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if(!data || !data.guild || !data.guild.icon) return;
          const iconEl = document.getElementById(`discordIcon-${i}`);
          if(!iconEl) return;
          const ext = data.guild.icon.startsWith('a_') ? 'gif' : 'png';
          const img = document.createElement('img');
          img.src = `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.${ext}?size=64`;
          img.alt = '';
          img.loading = 'lazy';
          img.onerror = () => {};
          iconEl.textContent = '';
          iconEl.appendChild(img);
        })
        .catch(() => {});
    }, i * 120);
  });
}

/* Leaf nodes that show a searchable directory of Krunker client
   downloads (unofficial clients on GitHub, plus the official
   installer), using the same stacked file-list layout as the static
   map downloads (Maps > Official Maps > Pubs etc.) — one row per
   client, with a Download action opening its release/installer page. */
const CLIENT_DOWNLOAD_LISTS = {
  'clients': {
    title: 'Krunker Client Downloads',
    intro: 'Unofficial third-party Krunker clients, plus the official installer. Third-party clients are made by independent developers, not Krunker.io or the Krunker Resource Hub team — download at your own discretion.',
    clients: [
      { name: "Official Client", url: "https://client2.krunker.io/setup.exe/" },
      { name: "Kute Client", url: "https://github.com/NullDev/Kute/releases" },
      { name: "Water Client", url: "https://github.com/ghostypostie/Water/releases/" },
      { name: "Idkr Client", url: "https://github.com/idkr-client/idkr/releases/" },
      { name: "Kpal Client", url: "https://github.com/kpal81xd/krunker-kpal-client-RELEASE/releases" },
      { name: "Crankshaft", url: "https://github.com/KraXen72/crankshaft/releases/" },
      { name: "Glorp Client", url: "https://github.com/slavcp/glorp/releases/" },
      { name: "Client++ Pico", url: "https://files.cuffuffles.dev/Client++%20Pico.exe" },
      { name: "Serpent Client", url: "https://github.com/SerpentKR/client-download/releases" },
      { name: "sealfr0 Client", url: "https://github.com/sealfr0/client--/releases" },
      { name: "Krunker Cheats Client", url: "https://github.com/Quirify1/Krunker-Cheats-Client/releases/" },
    ],
  },
};

function renderClientDownloads(node, main, crumbs){
  const section = CLIENT_DOWNLOAD_LISTS[node.id];
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="breadcrumb">${crumbs}</div>
    <div class="content-head">
      <div class="content-icon">${icon(main.glyph)}</div>
      <h2>${node.label}</h2>
    </div>
    <p class="content-desc">${escapeHtml(section.intro)}</p>
    <div class="meta-strip">
      <span class="chip">${escapeHtml(main.label)}</span>
      <span class="chip" id="clientCountChip">${section.clients.length} client${section.clients.length > 1 ? 's' : ''}</span>
    </div>
    <div class="search-bar-wrap">
      <svg class="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" id="clientSearchInput" class="search-bar-input" placeholder="Search ${section.clients.length} clients by name..." autocomplete="off">
    </div>
    <div class="file-gallery" id="clientFileGallery">
      ${section.clients.map(c => `
        <div class="file-card" data-title="${escapeHtml(c.name.toLowerCase())}">
          <div class="file-icon">\uD83D\uDCBB</div>
          <div class="file-info">
            <div class="gallery-title">${escapeHtml(c.name)}</div>
            <div class="gallery-meta">${escapeHtml(c.url.replace(/^https?:\/\//,''))}</div>
          </div>
          <div class="gallery-actions">
            <a class="gallery-btn" href="${escapeHtml(c.url)}" target="_blank" rel="noopener">Download</a>
          </div>
        </div>
      `).join('')}
      <div class="gallery-empty" id="clientSearchEmpty" style="display:none;">No clients match your search.</div>
    </div>
  `;

  const searchInput = document.getElementById('clientSearchInput');
  const cards = Array.from(document.querySelectorAll('#clientFileGallery .file-card'));
  const emptyState = document.getElementById('clientSearchEmpty');
  const countChip = document.getElementById('clientCountChip');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const match = !q || card.getAttribute('data-title').includes(q);
      card.style.display = match ? '' : 'none';
      if(match) visible++;
    });
    emptyState.style.display = visible === 0 ? '' : 'none';
    countChip.textContent = `${visible} client${visible !== 1 ? 's' : ''}${q ? ' found' : ''}`;
  });
}

/* Leaf nodes that show a curated list of YouTube video guides with
   thumbnail, title, and a short written summary of the video. */
const VIDEO_GUIDE_SECTIONS = {
  'css-setup-guide': {
    intro: 'Video tutorials on setting up and installing CSS in Krunker.',
    videos: [
      {
        id: 'b82BEE-1psg',
        url: 'https://youtu.be/b82BEE-1psg?t=27',
        title: 'Krunker CSS, Mods & UserScripts — Complete Beginner\u2019s Guide',
        summary: 'Explains what CSS actually does in Krunker \u2014 it restyles the game\u2019s UI (buttons, layout, everything you see) without changing how the game works. Shows where to find public, already-working CSS code, then walks through turning that code into a working style: creating a "css" folder in your Resource Swapper, saving the code as a .css file inside it, and restarting your client to see it applied.',
      },
      {
        id: 'dDiSRh3f7wU',
        url: 'https://youtu.be/dDiSRh3f7wU',
        title: 'Krunker CSS, Mods & UserScripts — Complete Beginner\u2019s Guide',
        summary: 'Explains what CSS actually does in Krunker \u2014 it restyles the game\u2019s UI (buttons, layout, everything you see) without changing how the game works. Shows where to find public, already-working CSS code, then walks through turning that code into a working style: creating a "css" folder in your Resource Swapper, saving the code as a .css file inside it, and restarting your client to see it applied.',
      },
      {
        id: 'XdWRIjCArgU',
        url: 'https://youtu.be/XdWRIjCArgU',
        title: 'Krunker CSS, Mods & UserScripts — Complete Beginner\u2019s Guide',
        summary: 'Explains what CSS actually does in Krunker \u2014 it restyles the game\u2019s UI (buttons, layout, everything you see) without changing how the game works. Shows where to find public, already-working CSS code, then walks through turning that code into a working style: creating a "css" folder in your Resource Swapper, saving the code as a .css file inside it, and restarting your client to see it applied.',
      },
    ],
  },
};

function videoGuideCardsHtml(videos){
  return `
    <div class="video-guide-grid">
      ${videos.map(v => `
        <a class="video-guide-card" href="${v.url}" target="_blank" rel="noopener">
          <img class="video-guide-thumb" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="${escapeHtml(v.title)}" loading="lazy">
          <div class="video-guide-info">
            <div class="video-guide-title">${escapeHtml(v.title)}</div>
            <div class="video-guide-summary">${escapeHtml(v.summary)}</div>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

function renderVideoGuide(node, main, crumbs){
  const section = VIDEO_GUIDE_SECTIONS[node.id];
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="breadcrumb">${crumbs}</div>
    <div class="content-head">
      <div class="content-icon">${icon(main.glyph)}</div>
      <h2>${node.label}</h2>
    </div>
    <p class="content-desc">${escapeHtml(section.intro)}</p>
    ${videoGuideCardsHtml(section.videos)}
  `;
}

/* Dedicated content for the Mods > Modding Guide page: what a mod is, how to
   build one manually via the Resource Swapper, video walkthroughs, useful
   community resources, and the weapon_X naming/multiplier reference tables. */
const MODS_GUIDE_CONTENT = {
  intro: 'A mod doesn\u2019t change how Krunker\u2019s code works \u2014 it swaps out the assets that code uses, like textures, sounds, and 3D models. You can upload a finished mod straight to Krunker, but you can also build and test one locally first (handy for works-in-progress, or if you\u2019d rather not clutter Krunker\u2019s public mod list) using the Resource Swapper.',
  steps: [
    'Open your Krunker client, then go to Settings \u2192 Client \u2192 Resource Swapper, and open that folder.',
    'Inside it, create a new folder named after the asset type you\u2019re replacing \u2014 for example "textures", "sound" (no trailing "s"), or "models".',
    'Drop your replacement texture, sound, or model files into that folder, matching Krunker\u2019s original file names (see the weapon reference tables below for weapon file names).',
    'In your Resource Swapper settings, make sure "Autoload Mod" is turned off \u2014 otherwise Krunker will keep loading your last uploaded mod instead of these local files.',
    'Restart your Krunker client so it picks up the new files.',
  ],
  videos: [
    {
      id: 'b82BEE-1psg',
      url: 'https://youtu.be/b82BEE-1psg',
      title: 'Krunker CSS, Mods & UserScripts — Complete Beginner\u2019s Guide',
      summary: 'Covers the basics: CSS restyles Krunker\u2019s UI, mods swap out visual/audio assets like textures, sounds, and models, and userscripts are JavaScript code that can change how the game behaves \u2014 powerful, but risky if you install the wrong one. Also walks through building a mod manually via the Resource Swapper, dropping texture/sound/model files into swapper subfolders.',
    },
    {
      id: 'febRLmORZyw',
      url: 'https://www.youtube.com/watch?v=febRLmORZyw&t=312s',
      title: 'How to Dye Krunker Mods (Tutorial)',
      summary: 'Tutorial on dyeing (recoloring) Krunker weapon mods \u2014 linked to start at the relevant section (5:12).',
    },
  ],
  resources: [
    {
      title: 'KEA \u2014 Krunker Expanded Assets',
      desc: 'Community asset repo for modding \u2014 use it alongside the weapon reference tables below.',
      url: 'https://github.com/KrunkerDesignHub/KEA-Krunker_Expanded_Assets',
      icon: 'github',
    },
    {
      title: 'Krunker Mod ZIP',
      desc: 'Download all of Krunker\u2019s original mod assets in one ZIP \u2014 useful as a base to edit from.',
      url: 'https://krunker.io/modzip/',
      icon: 'download',
    },
    {
      title: 'Krunker Shader Maker',
      desc: 'Build custom shaders for Krunker \u2014 also part of the modding toolkit.',
      url: 'https://hitthemoney.com/krunker-shader-maker/',
      icon: 'sparkles',
    },
  ],
  tables: [
    {
      title: 'Weapon Multiplier (Dye Setup in Blender)',
      note: 'The x-value is the color/dye multiplier to use when setting a weapon up in Blender.',
      headers: ['Weapon File(s)', 'Weapon', 'Multiplier'],
      rows: [
        ['weapon_1', 'Sniper Rifle', 'x100'],
        ['weapon_2', 'Assault Rifle', 'x100'],
        ['weapon_3', 'Pistol', 'x2500'],
        ['weapon_4', 'Submachine Gun', 'x100'],
        ['weapon_5, weapon_5_e', 'Revolver', 'x250'],
        ['weapon_6_0 (weapon_6_38 for texture)', 'Shotgun', 'x0.1'],
        ['weapon_7', 'Machine Gun', 'x100'],
        ['weapon_8_0', 'Semi Auto', 'x100'],
        ['weapon_9', 'Rocket Launcher', 'x100'],
        ['weapon_10_0', 'Akimbo Uzi', 'x1'],
        ['weapon_11, weapon_11_e', 'Desert Eagle', 'x1'],
        ['weapon_12_5, weapon_12_5_e', 'Alien Blaster', 'x1'],
        ['weapon_14', 'Crossbow', 'x100'],
        ['weapon_15', 'Famas', 'x100'],
        ['weapon_16', 'Sawed off', 'x1'],
        ['weapon_17', 'Auto Pistol', 'x100'],
        ['weapon_19', 'Blaster', 'x100'],
        ['weapon_21, weapon_21_e', 'Grappler', 'x1'],
        ['weapon_22', 'Techy-9', 'x100'],
        ['weapon_23', 'Noob tube', 'x1'],
        ['weapon_25, weapon_25_e', 'Zapper', 'x1'],
        ['weapon_28', 'Akimbo Pistol', 'x1'],
        ['weapon_29', 'Infiltrator/Charge Rifle', 'x100'],
        ['weapon_31', 'Compressor', 'x1'],
      ],
    },
    {
      title: 'Weapon File Naming (Mod Files)',
      note: 'Use these exact weapon_X names when naming files inside your mod / Resource Swapper folder.',
      headers: ['Weapon File(s)', 'Weapon'],
      rows: [
        ['weapon_0', 'Fists'],
        ['weapon_1', 'Sniper Rifle'],
        ['weapon_2', 'Assault Rifle'],
        ['weapon_3', 'Pistol'],
        ['weapon_4', 'Submachine Gun'],
        ['weapon_5, weapon_5_e', 'Revolver'],
        ['weapon_6_0 (weapon_6_38 for texture)', 'Shotgun'],
        ['weapon_7', 'Machine Gun'],
        ['weapon_8_0', 'Semi Auto'],
        ['weapon_9', 'Rocket Launcher'],
        ['weapon_10_0', 'Akimbo Uzi'],
        ['weapon_11, weapon_11_e', 'Desert Eagle'],
        ['weapon_12_5', 'Alien Blaster'],
        ['weapon_13', 'Old Alien Blaster'],
        ['weapon_14', 'Crossbow'],
        ['weapon_15', 'Famas'],
        ['weapon_16', 'Sawed off'],
        ['weapon_17', 'Auto Pistol'],
        ['weapon_18', 'Bomb'],
        ['weapon_19', 'Blaster'],
        ['weapon_20', 'Build Tool'],
        ['weapon_21, weapon_21_e', 'Grappler'],
        ['weapon_22', 'Techy-9'],
        ['weapon_23', 'Noob tube'],
        ['weapon_24', 'Slimer'],
        ['weapon_25, weapon_25_e', 'Zapper'],
        ['weapon_26', 'Juggernaut'],
        ['weapon_27', 'Unreleased grenade launcher'],
        ['weapon_28', 'Akimbo Pistol'],
        ['weapon_29', 'Infiltrator/Charge Rifle'],
        ['weapon_31', 'Compressor'],
      ],
    },
  ],
};

function renderModsGuide(node, main, crumbs){
  const c = MODS_GUIDE_CONTENT;
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="breadcrumb">${crumbs}</div>
    <div class="content-head">
      <div class="content-icon">${icon(main.glyph)}</div>
      <h2>${node.label}</h2>
    </div>
    <p class="content-desc">${escapeHtml(c.intro)}</p>

    <h3 class="mod-guide-heading">How to Mod Manually (Resource Swapper)</h3>
    <ol class="mod-guide-steps">
      ${c.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
    </ol>

    <h3 class="mod-guide-heading">Video Guides</h3>
    ${videoGuideCardsHtml(c.videos)}

    <h3 class="mod-guide-heading">Useful Resources</h3>
    <div class="mod-guide-resources">
      ${c.resources.map(r => `
        <a class="mod-guide-resource-card" href="${r.url}" target="_blank" rel="noopener">
          <div class="mod-guide-resource-icon">${icon(r.icon)}</div>
          <div>
            <div class="mod-guide-resource-title">${escapeHtml(r.title)}</div>
            <div class="mod-guide-resource-desc">${escapeHtml(r.desc)}</div>
          </div>
        </a>
      `).join('')}
    </div>

    ${c.tables.map(t => `
      <h3 class="mod-guide-heading">${escapeHtml(t.title)}</h3>
      <p class="mod-guide-table-note">${escapeHtml(t.note)}</p>
      <div class="mod-guide-table-wrap">
        <table class="mod-guide-table">
          <thead><tr>${t.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
          <tbody>
            ${t.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    `).join('')}
  `;
}


/* ---------- Guides > Pubs (Noob-to-Pro movement/aim guide) ---------- */
const TIPS_KEY_LEGEND = [
  ['W','Move Forward'],['A','Move Left'],['S','Move Backward'],['D','Move Right'],
  ['SPACE','Jump'],['SHIFT','Slide / Crouch'],['LMB','Left Mouse Button / Shoot'],
  ['RMB','Right Mouse Button / Aim / ADS'],['R','Reload'],['1–6','Weapon Slots'],
  ['Mouse ← / →','Move your mouse left or right'],
];

function tSub(v){ return {t:'sub', v}; }
function tKb(label, code){ return {t:'kb', label, code}; }
function tText(v){ return {t:'text', v}; }
function tSeq(v){ return {t:'seq', v}; }
function tSteps(v){ return {t:'steps', v}; }
function tList(v){ return {t:'list', v}; }
function tDrill(title, code, text){ return {t:'drill', title, code, text}; }
function tNote(title, v){ return {t:'note', title, v}; }
function tDiagram(v){ return {t:'diagram', v}; }

const TIPS_GUIDE_LEVELS = [
  { badge:'🟢', title:'Level 1 — Beginner', sections:[
    { n:1, title:'Basic Movement', blocks:[
      tSub('Forward Movement'), tKb('Keybind','W'), tText('Hold W to move forward.'),
      tSub('Left Movement'), tKb('Keybind','A'),
      tSub('Right Movement'), tKb('Keybind','D'),
      tSub('Backward Movement'), tKb('Keybind','S'),
      tSub('Diagonal Movement'), tKb('Use','W + A'), tSeq('or: W + D'),
      tText('Diagonal movement is extremely important because many advanced movement techniques are built around combining forward and directional inputs.'),
      tDrill('Practice Drill', 'W → W + A → W → W + D', 'Walk around an empty area using this sequence. Focus on keeping your camera under control while changing direction.'),
    ]},
    { n:2, title:'Basic Jumping', blocks:[
      tSub('Forward Jump'), tSeq('W → SPACE'),
      tSteps(['Hold W.','Press SPACE.','Keep your mouse pointed toward the direction you want to travel.']),
      tSub('Jump Left'), tSeq('W + A → SPACE'),
      tSub('Jump Right'), tSeq('W + D → SPACE'),
      tText('Do not worry about speed yet. Your first goal is to become comfortable controlling your character while airborne.'),
    ]},
    { n:3, title:'Basic Strafing', blocks:[
      tText('Strafing means moving sideways while maintaining control of your aim and movement.'),
      tSub('Left Strafe'), tSeq('A'),
      tSub('Right Strafe'), tSeq('D'),
      tText('A simple movement pattern is:'), tSeq('A → D → A → D'),
      tText('As you improve, combine strafing with mouse movement and shooting.'),
      tDrill('Practice Drill', 'A → D → A → D', 'Move using this pattern while keeping your crosshair aimed at the same point. The goal is to separate movement control from aim control.'),
    ]},
    { n:4, title:'Basic Bunny Hop', blocks:[
      tText('Start with:'), tSeq('W → SPACE → SPACE → SPACE'),
      tText('The important part is the timing between jumps, not simply pressing SPACE as quickly as possible.'),
      tText('Once you are comfortable:'), tSeq('W + A/D → SPACE → SPACE'),
      tText('Practice maintaining your movement without constantly stopping.'),
      tNote('Common Mistakes', ['Spamming SPACE without timing','Losing forward momentum','Looking at the ground','Moving the mouse too aggressively']),
    ]},
  ]},

  { badge:'🔵', title:'Level 2 — Slide & Movement', sections:[
    { n:5, title:'Basic Slide', blocks:[
      tText('For this movement pattern:'), tSeq('W + A/D → SPACE → SHIFT'),
      tSub('Slide Left'), tSeq('W + A → SPACE → SHIFT'),
      tSub('Slide Right'), tSeq('W + D → SPACE → SHIFT'),
      tSub('Input Order'),
      tSteps(['Hold W.','Add A or D depending on your direction.','Press SPACE.','Press SHIFT at the correct timing.','Continue controlling your direction with A/D and your mouse.']),
      tText('The timing between SPACE and SHIFT is important. Practice the sequence slowly before trying to perform it at full speed.'),
    ]},
    { n:6, title:'Slide-Hop', blocks:[
      tText('A basic slide-hop sequence is:'), tSeq('W + A/D → SPACE → SHIFT → SPACE'),
      tSub('Left Version'), tSeq('W + A → SPACE → SHIFT → SPACE'),
      tSub('Right Version'), tSeq('W + D → SPACE → SHIFT → SPACE'),
      tText('The goal is to connect the movement instead of stopping after the slide.'),
      tSub('Practice'),
      tText('Start slowly:'), tSeq('W + A → SPACE → SHIFT'),
      tText('Once consistent, add the next:'), tSeq('SPACE'),
      tText('Then practice the entire sequence without stopping.'),
    ]},
    { n:7, title:'Slide Direction Change', blocks:[
      tText('Example:'), tSeq('W + A → SPACE → SHIFT → D → Mouse →'),
      tText('You start moving left, enter the slide, then transition toward the right. The goal is to learn how to change your trajectory without completely losing control.'),
    ]},
  ]},

  { badge:'🔵', title:'Level 3 — Air Strafing', sections:[
    { n:8, title:'Basic Air Strafe', blocks:[
      tText('Air strafing is the technique of controlling your movement while airborne using directional inputs and mouse movement.'),
      tSub('Left Air Strafe'), tSeq('W + A → SPACE → Mouse ←'),
      tSub('Right Air Strafe'), tSeq('W + D → SPACE → Mouse →'),
      tSub('Basic Process'),
      tSteps(['Start moving with W.','Press SPACE.','Hold A or D.','Move your mouse toward the direction you want to travel.','Maintain control of your trajectory.','Prepare for your landing.']),
      tText('Do not simply hold A or D. Your mouse movement is also part of controlling the trajectory.'),
    ]},
    { n:9, title:'Air-Strafe Direction Change', blocks:[
      tSub('Left → Right'), tSeq('W + A → SPACE → Mouse ← → D → Mouse →'),
      tSub('Right → Left'), tSeq('W + D → SPACE → Mouse → → A → Mouse ←'),
      tText('Practice changing direction while airborne without losing control.'),
    ]},
    { n:10, title:'Air-Strafe Landing Control', blocks:[
      tText('Air strafing is not only about moving through the air. You also need to control where you land.'),
      tText('Example:'), tSeq('W + A → SPACE → Mouse ← → Trajectory → Landing'),
      tText('Practice landing on:'),
      tList(['Platforms','Rooftops','Small gaps','High ground','Shortcuts']),
      tText('Once you can consistently land where you intend to, start increasing your movement speed.'),
    ]},
  ]},

  { badge:'🟣', title:'Level 4 — Movement Combinations', sections:[
    { n:11, title:'Run → Jump → Air Strafe', blocks:[
      tText('Input:'), tSeq('W → SPACE → A/D → Mouse ←/→ → LAND'),
      tText('This is one of the fundamental movement chains. The objective is to keep your movement connected instead of resetting after every jump.'),
    ]},
    { n:12, title:'Run → Slide → Jump', blocks:[
      tText('Input:'), tSeq('W + A/D → SPACE → SHIFT → SPACE'),
      tText('This combines your basic movement, jump, slide, and jump timing. Practice both directions:'),
      tSub('Left'), tSeq('W + A → SPACE → SHIFT → SPACE'),
      tSub('Right'), tSeq('W + D → SPACE → SHIFT → SPACE'),
    ]},
    { n:13, title:'Slide → Air Strafe', blocks:[
      tText('Example:'), tSeq('W + A → SPACE → SHIFT → SPACE → D → Mouse →'),
      tText('This is an advanced version of the basic slide movement. You are combining: forward movement + directional movement + jump + slide + air control.'),
    ]},
    { n:14, title:'Continuous Movement', blocks:[
      tText('The goal of advanced movement is to avoid constantly resetting your movement. Instead of:'),
      tSeq('Jump → Stop → Slide → Stop → Jump'),
      tText('work toward:'),
      tSeq('Move → Jump → Slide → Jump → Air Strafe → Land → Continue'),
      tText('The smoother your transitions become, the more consistent your movement will feel.'),
    ]},
  ]},

  { badge:'🎯', title:'Level 5 — Aim', sections:[
    { n:15, title:'Crosshair Placement', blocks:[
      tText('Keep your crosshair positioned where an enemy is likely to appear. While moving:'), tSeq('W/A/D + Mouse'),
      tText('Practice keeping your crosshair at a consistent height instead of constantly looking at the ground.'),
      tDrill('Practice Drill', null, 'Walk around a map and keep your crosshair aligned with common enemy positions.'),
    ]},
    { n:16, title:'Tracking', blocks:[
      tText('Tracking means continuously following a moving target with your crosshair. Basic input:'), tSeq('A/D + Mouse Tracking + LMB'),
      tText('Your movement and mouse should work together.'),
      tSub('Practice'),
      tText('Follow a moving target without making unnecessary large mouse movements. Focus on:'),
      tList(['Smooth mouse control','Consistent tracking','Controlled movement','Keeping the target near your crosshair']),
    ]},
    { n:17, title:'Flicking', blocks:[
      tText('Flicking is quickly moving your crosshair toward a target. Basic sequence:'), tSeq('Locate Target → Mouse Flick → LMB'),
      tSub('Target Switching Drill'), tSeq('Target A → Flick → Target B → Flick → Target C → Flick'),
      tText('Focus on accuracy first. Speed will improve naturally as your mouse control becomes more consistent.'),
    ]},
    { n:18, title:'Strafe + Aim', blocks:[
      tSub('Left'), tSeq('A + Mouse Tracking + LMB'),
      tSub('Right'), tSeq('D + Mouse Tracking + LMB'),
      tText('The objective is to keep moving while maintaining your aim. Do not stop moving every time you shoot.'),
    ]},
  ]},

  { badge:'🔥', title:'Level 6 — Movement + Aim', sections:[
    { n:19, title:'Jump Shot', blocks:[
      tSub('Basic'), tSeq('W → SPACE → Mouse → Target → LMB'),
      tSub('Advanced'), tSeq('W + A → SPACE → Mouse → Target → LMB'),
      tText('The challenge is maintaining your aim while your character is airborne.'),
    ]},
    { n:20, title:'Slide Shot', blocks:[
      tText('Input:'), tSeq('W + A/D → SPACE → SHIFT → Mouse → Target → LMB'),
      tText('You are now combining movement, slide timing, aim, and shooting. Practice the movement without shooting first. Once the movement becomes consistent, add LMB.'),
    ]},
    { n:21, title:'Air-Strafe + Aim', blocks:[
      tText('Input:'), tSeq('W + A/D → SPACE → Mouse ←/→ → Track Target → LMB'),
      tText('This is one of the more difficult beginner-to-advanced combinations because you have to control:'),
      tList(['Keyboard movement','Air trajectory','Mouse movement','Target tracking','Shooting']),
      tText('Practice each component separately before combining them.'),
    ]},
  ]},

  { badge:'🔴', title:'Level 7 — Advanced Movement', sections:[
    { n:22, title:'Momentum Management', blocks:[
      tText('Advanced players need to understand when to:'), tSeq('Maintain → Change → Stop → Reposition'),
      tText('Example:'), tSeq('W → SPACE → A + Mouse ← → D + Mouse → → LAND → W'),
      tText('Do not sacrifice control just to move faster. Good movement is not necessarily the fastest movement; it is movement that you can consistently control.'),
    ]},
    { n:23, title:'Direction Breaking', blocks:[
      tText('Example:'), tSeq('W + A → SPACE → SHIFT → D → Mouse → → SPACE'),
      tText('The objective is to change your movement pattern so that your trajectory is less predictable. Avoid using exactly the same movement pattern every time you fight.'),
    ]},
    { n:24, title:'Dodge Movement', blocks:[
      tSub('Basic'), tSeq('A → D → A → D'),
      tSub('Advanced'), tSeq('A → SPACE → Mouse ← → D → Mouse →'),
      tSub('Combined'), tSeq('A → SPACE → SHIFT → D → Air Strafe'),
      tText('The purpose is to make your movement harder to predict while keeping enough control to aim.'),
    ]},
  ]},
];

const TIPS_GUIDE_COMBOS = [
  { title:'Combo 1 — Basic Strafe Shoot', seq:'A + LMB → D + LMB', stars:2, text:'Practice moving left and right while maintaining your aim.' },
  { title:'Combo 2 — Jump Strafe', seq:'W + A → SPACE → Mouse ← → LMB', stars:3, text:'Use your air movement while maintaining your aim.' },
  { title:'Combo 3 — Slide Attack', seq:'W + A/D → SPACE → SHIFT → Mouse → Target → LMB', stars:3, text:'Combines your slide movement with combat.' },
  { title:'Combo 4 — Air-Strafe Attack', seq:'W + A → SPACE → Mouse ← → D → Mouse → → LMB', stars:4, text:'Practice the air movement first, then add aiming and shooting.' },
  { title:'Combo 5 — Advanced Movement Chain', seq:'W + A → SPACE → SHIFT → SPACE → D → Mouse → → Track Target → LMB → Reposition', stars:5, text:'This combines forward movement, strafe, jump, slide, air control, aim, shooting, and repositioning. Do not try to learn this combo immediately — build it from the individual techniques first.' },
];

const TIPS_GUIDE_LEVEL9 = [
  { n:25, title:'Map Awareness', blocks:[
    tText('Learn the location of:'),
    tList(['Spawns','Common routes','Chokepoints','High ground','Cover','Shortcuts','Escape routes','Air-strafe spots']),
    tText('The better you know the map, the easier it becomes to predict where players can appear.'),
  ]},
  { n:26, title:'Peeking', blocks:[
    tSub('Basic'), tSeq('Move → Peek → Mouse → LMB → Reposition'),
    tText('Avoid repeatedly exposing yourself from exactly the same angle. After an engagement, consider changing your position.'),
  ]},
  { n:27, title:'Repositioning', blocks:[
    tText('After an engagement:'), tSeq('Shoot → Move → Change Angle → Check Surroundings'),
    tText('Do not automatically stay in the same position after winning a fight.'),
  ]},
];

const TIPS_GUIDE_SPOT_EXAMPLE = {
  intro: 'The Air-Strafe Spots section should be organized by map. Each spot should contain:',
  fields: ['Map: Map Name','Spot: Spot Name','Difficulty: Beginner / Intermediate / Advanced','Purpose: Shortcut / High Ground / Escape / Surprise Angle','Starting Position: Where to begin','Keybinds: Required inputs','Mouse Direction: Left / Right / Combination','Landing Point: Where you should land'],
  exampleTitle: 'Example — Air-Strafe Shortcut',
  diagram: 'START\n ↓\nW + A\n ↓\nSPACE\n ↓\nMouse ←\n ↓\nD\n ↓\nMouse →\n ↓\nLAND',
  uses: ['Shortcut','High-ground access','Escape route','Surprise angle','Faster rotation'],
  mistakes: ['Starting the jump from the wrong position','Turning the mouse too aggressively','Losing momentum','Landing too early','Looking away from the landing point'],
};

const TIPS_GUIDE_TRAINING = [
  { title:'Beginner — 15–20 Minutes', groups:[
    { label:'Movement', items:['W/A/S/D','Jump','Basic strafing','Basic slide'] },
    { label:'Aim', items:['Crosshair placement','Tracking'] },
  ]},
  { title:'Intermediate — 20–30 Minutes', groups:[
    { label:'Practice', items:['Bunny hopping','Slide-hop','Air strafing','Direction changes','Strafe + aim','Jump + aim'] },
  ]},
  { title:'Advanced — 30–45 Minutes', groups:[
    { label:'Practice', items:['Slide → Jump','Air-strafe chains','Movement + tracking','Jump shots','Slide shots','Map shortcuts','Air-strafe spots'] },
  ]},
  { title:'Pro Training — 45+ Minutes', groups:[
    { label:'Combine', items:['Movement + Aim + Combat + Game Sense — the goal is not simply to perform difficult movement, but to perform it consistently while fighting real players.'] },
  ]},
];

const TIPS_GUIDE_PROGRESSION = [
  { badge:'🟢', title:'Noob', items:['Understand W/A/S/D','Understand SPACE','Understand SHIFT','Basic jumping','Basic strafing','Basic aiming'] },
  { badge:'🔵', title:'Intermediate', items:['Bunny hop','Slide','Slide-hop','Air strafe','Tracking','Flicking','Movement + aim'] },
  { badge:'🟣', title:'Advanced', items:['Direction changes','Momentum control','Air-strafe combinations','Combat movement','Advanced shortcuts','Map movement'] },
  { badge:'🔴', title:'Pro', items:['Consistent movement','Consistent aim','Movement + aim simultaneously','Advanced combat combinations','Map awareness','Repositioning','Adapt movement to the situation'] },
];

const TIPS_GUIDE_RULES = [
  'Learn control before speed.',
  'Learn movement before combining it with combat.',
  'Practice each key combination separately.',
  'Add mouse control after the keyboard input becomes comfortable.',
  'Add shooting only after the movement is consistent.',
  'Do not use the same movement pattern in every fight.',
  'Advanced movement is useful only when you can control it.',
  'Map knowledge is just as important as mechanical skill.',
  'Practice difficult movement in an empty/private environment before trying to use it in serious matches.',
  'The goal is not to look flashy — the goal is consistent movement, accurate aim, and good decision-making.',
];

/* Community-submitted YouTube tips & tricks videos for the Pubs guide page.
   Titles/summaries marked verified were confirmed against real search results;
   the rest use a neutral placeholder until a real title/summary is supplied,
   to avoid inventing descriptions for videos that couldn't be looked up. */
const TIPS_GUIDE_VIDEOS = [
  {
    id: 'bq4lkv9yHqA',
    url: 'https://www.youtube.com/watch?v=bq4lkv9yHqA&pp=ygUMa3J1bmtlciB0aXBz',
    title: 'Krunker.io Tips and Tricks You MUST KNOW! (Beginner Tutorial)',
    summary: 'A beginner-focused rundown of Krunker tips aimed at new players jumping in.',
  },
  {
    id: 'f_bHavL8Y88',
    url: 'https://youtu.be/f_bHavL8Y88?si=w9T9j-22va3Hxthl',
    title: 'BEST KRUNKER MOVEMENT TUTORIAL',
    summary: 'A tutorial-format breakdown of how Krunker movement works, centered on Slide Hopping — move forward, jump, then crouch mid-air to chain the slide — plus extra movement tips from the creator\\u2019s own experience.',
  },
  {
    id: 'gq_6XLgxGlI',
    url: 'https://youtu.be/gq_6XLgxGlI?si=YERiQnWUc84XykWt',
    title: 'Krunker Tips & Tricks',
    summary: 'Community-submitted Krunker tips & tricks video — open it on YouTube to watch.',
  },
  {
    id: 'LpcaVmjMMEk',
    url: 'https://youtu.be/LpcaVmjMMEk?si=GhWgYBVHwkor26XX',
    title: 'Krunker Tips & Tricks',
    summary: 'Community-submitted Krunker tips & tricks video — open it on YouTube to watch.',
  },
  {
    id: 'rAnjh2hIQMU',
    url: 'https://youtu.be/rAnjh2hIQMU?si=Bq7BLzTcyyQ0mSOT',
    title: 'Krunker Tips & Tricks',
    summary: 'Community-submitted Krunker tips & tricks video — open it on YouTube to watch.',
  },
  {
    id: 'oUxMo3zlfWY',
    url: 'https://youtu.be/oUxMo3zlfWY?si=dO7EXfD0NnF3rFkT',
    title: 'Krunker Tips & Tricks',
    summary: 'Community-submitted Krunker tips & tricks video — open it on YouTube to watch.',
  },
  {
    id: 'E2ZDTMXLGkI',
    url: 'https://youtu.be/E2ZDTMXLGkI?si=P3pTh7OujKQxXRQV',
    title: 'Krunker Tips & Tricks',
    summary: 'Community-submitted Krunker tips & tricks video — open it on YouTube to watch.',
  },
  {
    id: '8peFf1k2F0c',
    url: 'https://youtu.be/8peFf1k2F0c?si=HX-IR1CAEEnwSOaI',
    title: 'Krunker Tips & Tricks',
    summary: 'Community-submitted Krunker tips & tricks video — open it on YouTube to watch.',
  },
  {
    id: 'H4HRtb98ZB8',
    url: 'https://www.youtube.com/watch?v=H4HRtb98ZB8&t=404s&pp=ygUMa3J1bmtlciB0aXBz',
    title: 'STEP-BY-STEP Guide to Advanced Krunker Movement',
    summary: 'A step-by-step advanced movement guide, chaptered from the basics and bunny-hopping through strafing and beyond.',
  },
  {
    id: 'UVsUuDud_IY',
    url: 'https://youtu.be/UVsUuDud_IY?si=JdBOa6PD7SNt68I1',
    title: 'Krunker Tips & Tricks',
    summary: 'Community-submitted Krunker tips & tricks video — open it on YouTube to watch.',
  },
  {
    id: 'NXw2MJR1JA0',
    url: 'https://youtu.be/NXw2MJR1JA0?si=mta3NyuxWAxAsaC5',
    title: 'Krunker Tips & Tricks',
    summary: 'Community-submitted Krunker tips & tricks video — open it on YouTube to watch.',
  },
  {
    id: 'AnSbnTQoFB4',
    url: 'https://youtu.be/AnSbnTQoFB4?si=z4Z9Sd3DYBAQSDUs',
    title: 'Krunker Tips & Tricks',
    summary: 'Community-submitted Krunker tips & tricks video — open it on YouTube to watch.',
  },
  {
    id: '1Z7Ez2bCzSo',
    url: 'https://youtu.be/1Z7Ez2bCzSo?si=msnlAg94CkF5MNzV',
    title: 'Krunker Tips & Tricks',
    summary: 'Community-submitted Krunker tips & tricks video — open it on YouTube to watch.',
  },
];

function tipsBlocksHtml(blocks){
  return blocks.map(b => {
    if(b.t === 'sub') return `<div class="tips-sub">${escapeHtml(b.v)}</div>`;
    if(b.t === 'kb') return `<div class="tips-kb"><span class="tips-kb-label">${escapeHtml(b.label)}:</span><span class="tips-seq">${escapeHtml(b.code)}</span></div>`;
    if(b.t === 'text') return `<p class="tips-p">${escapeHtml(b.v)}</p>`;
    if(b.t === 'seq') return `<div class="tips-seq">${escapeHtml(b.v)}</div>`;
    if(b.t === 'steps') return `<ol class="mod-guide-steps tips-steps">${b.v.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>`;
    if(b.t === 'list') return `<ul class="tips-list">${b.v.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>`;
    if(b.t === 'drill') return `<div class="tips-callout tips-callout-drill"><div class="tips-callout-title">${escapeHtml(b.title || 'Practice Drill')}</div>${b.code ? `<div class="tips-seq">${escapeHtml(b.code)}</div>` : ''}${b.text ? `<p class="tips-p">${escapeHtml(b.text)}</p>` : ''}</div>`;
    if(b.t === 'note') return `<div class="tips-callout tips-callout-note"><div class="tips-callout-title">${escapeHtml(b.title)}</div><ul class="tips-list">${b.v.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul></div>`;
    return '';
  }).join('');
}

function tipsSectionHtml(section){
  return `
    <div class="tips-section">
      <h3 class="mod-guide-heading">${section.n ? `${section.n}. ` : ''}${escapeHtml(section.title)}</h3>
      ${tipsBlocksHtml(section.blocks)}
    </div>
  `;
}

function tipsStars(n){
  return `<span class="tips-stars" aria-label="${n} out of 5 difficulty">${'★'.repeat(n)}${'☆'.repeat(5-n)}</span>`;
}

function renderTipsGuide(node, main, crumbs){
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="breadcrumb">${crumbs}</div>
    <div class="content-head">
      <div class="content-icon">${icon(main.glyph)}</div>
      <h2>${node.label}</h2>
    </div>
    <p class="content-desc">Krunker — Noob to Pro Guide. A full movement and aim progression: read the notation once, then work through the levels below in order, from your first W → SPACE jump all the way to advanced combat combinations and map/game-sense.</p>

    <h3 class="mod-guide-heading">How to Read This Guide</h3>
    <p class="tips-p">This guide uses the following notation:</p>
    <div class="tips-legend">
      ${TIPS_KEY_LEGEND.map(([k,v]) => `<div class="tips-legend-row"><span class="tips-seq tips-legend-key">${escapeHtml(k)}</span><span class="tips-legend-desc">${escapeHtml(v)}</span></div>`).join('')}
    </div>
    <div class="tips-callout tips-callout-note">
      <div class="tips-callout-title">Important</div>
      <p class="tips-p" style="margin-bottom:0">The → arrow means the order or timing of the inputs. It does not necessarily mean every key should be held at the same time. Keybinds can be changed in your settings, so make sure to adjust the instructions if you use a custom setup.</p>
    </div>

    ${TIPS_GUIDE_LEVELS.map(level => `
      <h3 class="tips-level-heading">${level.badge} ${escapeHtml(level.title)}</h3>
      ${level.sections.map(tipsSectionHtml).join('')}
    `).join('')}

    <h3 class="tips-level-heading">⚔️ Level 8 — Combat Combinations</h3>
    <div class="tips-combo-grid">
      ${TIPS_GUIDE_COMBOS.map(c => `
        <div class="tips-combo-card">
          <div class="tips-combo-title">${escapeHtml(c.title)}</div>
          <div class="tips-seq">${escapeHtml(c.seq)}</div>
          <div class="tips-combo-diff">Difficulty: ${tipsStars(c.stars)}</div>
          <p class="tips-p" style="margin-bottom:0">${escapeHtml(c.text)}</p>
        </div>
      `).join('')}
    </div>

    <h3 class="tips-level-heading">🧠 Level 9 — Game Sense</h3>
    <p class="tips-p">Movement and aim are only part of becoming a strong player.</p>
    ${TIPS_GUIDE_LEVEL9.map(tipsSectionHtml).join('')}

    <h3 class="tips-level-heading">🗺️ Level 10 — Air-Strafe Spots</h3>
    <p class="tips-p">${escapeHtml(TIPS_GUIDE_SPOT_EXAMPLE.intro)}</p>
    <div class="tips-callout">
      <div class="tips-callout-title">Spot Information</div>
      <ul class="tips-list">${TIPS_GUIDE_SPOT_EXAMPLE.fields.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
    </div>
    <div class="tips-sub" style="margin-top:22px">${escapeHtml(TIPS_GUIDE_SPOT_EXAMPLE.exampleTitle)}</div>
    <pre class="tips-diagram">${escapeHtml(TIPS_GUIDE_SPOT_EXAMPLE.diagram)}</pre>
    <div class="tips-two-col">
      <div class="tips-callout">
        <div class="tips-callout-title">Uses</div>
        <ul class="tips-list">${TIPS_GUIDE_SPOT_EXAMPLE.uses.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
      </div>
      <div class="tips-callout tips-callout-note">
        <div class="tips-callout-title">Common Mistakes</div>
        <ul class="tips-list">${TIPS_GUIDE_SPOT_EXAMPLE.mistakes.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
      </div>
    </div>

    <h3 class="tips-level-heading">🏋️ Level 11 — Training Routine</h3>
    <div class="tips-training-grid">
      ${TIPS_GUIDE_TRAINING.map(tier => `
        <div class="tips-training-card">
          <div class="tips-combo-title">${escapeHtml(tier.title)}</div>
          ${tier.groups.map(g => `
            <div class="tips-sub" style="margin-top:12px">${escapeHtml(g.label)}</div>
            <ul class="tips-list">${g.items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
          `).join('')}
        </div>
      `).join('')}
    </div>

    <h3 class="tips-level-heading">🏆 Noob → Pro Progression</h3>
    <div class="tips-training-grid">
      ${TIPS_GUIDE_PROGRESSION.map(tier => `
        <div class="tips-training-card">
          <div class="tips-combo-title">${tier.badge} ${escapeHtml(tier.title)}</div>
          <ul class="tips-list">${tier.items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
        </div>
      `).join('')}
    </div>

    <h3 class="mod-guide-heading">⭐ Golden Rules</h3>
    <ol class="mod-guide-steps tips-steps">
      ${TIPS_GUIDE_RULES.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
    </ol>

    <h3 class="mod-guide-heading">Video Guides</h3>
    ${videoGuideCardsHtml(TIPS_GUIDE_VIDEOS)}
  `;
}

/* Dedicated content for the Scripts > UserScript > UserScript Setup Guide page. */
const SCRIPTS_GUIDE_CONTENT = {
  intro: 'UserScripts are pieces of JavaScript code that can change how Krunker actually behaves \u2014 not just how it looks. That makes them extremely powerful, but also risky: it\u2019s the same category of script that in-game hackers rely on, so installing the wrong one can get your account banned. Always know exactly what a script does before you install it.',
  steps: [
    'Open your Krunker client, then go to Settings \u2192 Client \u2192 UserScripts, and open that folder.',
    'Drop your .js userscript file(s) into that folder (if you see an existing "social" folder in there, leave it alone).',
    'Restart your Krunker client so it picks up the new scripts.',
  ],
  bonusHeading: 'Bonus: Add a Custom Killstreak Sound',
  bonusSteps: [
    'Download a killstreak sound-pack tool (an .exe) \u2014 see Useful Resources below.',
    'Right-click the .exe and choose Open.',
    'In your client, copy the path to your UserScripts folder, then paste it into the tool as the game script path.',
    'Preview the different killstreak sounds using the site linked below, and pick one you like.',
    'Click Activate on your chosen sound pack, close the tool, and restart Krunker.',
  ],
  examplesHeading: 'Example UserScripts Covered in the Video',
  examples: [
    'A script that plays the headshot sound on every kill, not just headshot kills.',
    'A script that pops up a little emote/GIF whenever you get a kill.',
    'A script that mutes the headshot sound entirely.',
    'A script that changes the in-game sky color.',
    'A Valorant-style killstreak sound pack, triggered on kill streaks.',
  ],
  videos: [
    {
      id: 'b82BEE-1psg',
      url: 'https://youtu.be/b82BEE-1psg?t=115',
      title: 'Krunker CSS, Mods & UserScripts — Complete Beginner\u2019s Guide',
      summary: 'Explains what a userscript is and why it\u2019s riskier than CSS or mods, then walks through installing userscripts via the UserScripts folder, adding a Valorant-style killstreak sound pack, and testing a handful of example scripts in-game.',
    },
  ],
  resources: [
    {
      title: 'Krunker Design Hub Discord',
      desc: 'Community Discord for Krunker CSS, mods, GFX, and userscripts.',
      url: 'https://discord.gg/GJnT4eP8eA',
      icon: 'server',
    },
    {
      title: 'Arnas Discord',
      desc: 'Source Discord for userscripts \u2014 download and share userscripts here.',
      url: 'https://discord.gg/yCwMKFfZ3g',
      icon: 'server',
    },
    {
      title: 'Valorant Kill Banners',
      desc: 'Preview Valorant-style killstreak sounds before adding one to Krunker.',
      url: 'https://kingdomarchives.com/killbanners',
      icon: 'sparkles',
    },
  ],
};

function renderScriptsGuide(node, main, crumbs){
  const c = SCRIPTS_GUIDE_CONTENT;
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="breadcrumb">${crumbs}</div>
    <div class="content-head">
      <div class="content-icon">${icon(main.glyph)}</div>
      <h2>${node.label}</h2>
    </div>
    <p class="content-desc">${escapeHtml(c.intro)}</p>

    <h3 class="mod-guide-heading">How to Install a UserScript</h3>
    <ol class="mod-guide-steps">
      ${c.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
    </ol>

    <h3 class="mod-guide-heading">${escapeHtml(c.bonusHeading)}</h3>
    <ol class="mod-guide-steps">
      ${c.bonusSteps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
    </ol>

    <h3 class="mod-guide-heading">${escapeHtml(c.examplesHeading)}</h3>
    <ol class="mod-guide-steps">
      ${c.examples.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
    </ol>

    <h3 class="mod-guide-heading">Video Guide</h3>
    ${videoGuideCardsHtml(c.videos)}

    <h3 class="mod-guide-heading">Useful Resources</h3>
    <div class="mod-guide-resources">
      ${c.resources.map(r => `
        <a class="mod-guide-resource-card" href="${r.url}" target="_blank" rel="noopener">
          <div class="mod-guide-resource-icon">${icon(r.icon)}</div>
          <div>
            <div class="mod-guide-resource-title">${escapeHtml(r.title)}</div>
            <div class="mod-guide-resource-desc">${escapeHtml(r.desc)}</div>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

/* Static, repo-bundled official map files (Pubs / Parkour / Raids under
   Maps > Official Maps). These aren't community posts — the .json files
   ship in resources/maps/ and are served same-origin, so a plain
   <a download> link works fine without the cross-origin blob trick. */
const STATIC_MAP_LISTS = {
  'maps-official-pubs': {
    title: 'Official Pub Maps',
    intro: 'Original Krunker public-match maps, ready to drop into your Resource Swapper or map editor.',
    files: [
      { title: 'Arena', path: 'resources/maps/pubs/Arena.json' },
      { title: 'Atomic', path: 'resources/maps/pubs/Atomic.json' },
      { title: 'Bazaar', path: 'resources/maps/pubs/Bazaar.json' },
      { title: 'Bureau', path: 'resources/maps/pubs/Bureau.json' },
      { title: 'Burg', path: 'resources/maps/pubs/Burg.json' },
      { title: 'Citadel', path: 'resources/maps/pubs/Citadel.json' },
      { title: 'Clockwork', path: 'resources/maps/pubs/Clockwork.json' },
      { title: 'Erupt', path: 'resources/maps/pubs/Erupt.json' },
      { title: 'Eterno Simulator', path: 'resources/maps/pubs/Eterno Simulator.json' },
      { title: 'Evacuation', path: 'resources/maps/pubs/Evacuation.json' },
      { title: 'Freight', path: 'resources/maps/pubs/Freight.json' },
      { title: 'Frontier', path: 'resources/maps/pubs/Frontier.json' },
      { title: 'Habitat', path: 'resources/maps/pubs/Habitat.json' },
      { title: 'HQ', path: 'resources/maps/pubs/HQ.json' },
      { title: 'Industry', path: 'resources/maps/pubs/Industry.json' },
      { title: 'Kanji', path: 'resources/maps/pubs/Kanji.json' },
      { title: 'Krunk Plaza', path: 'resources/maps/pubs/Krunk_Plaza.json' },
      { title: 'Lagoon', path: 'resources/maps/pubs/Lagoon.json' },
      { title: 'Littletown', path: 'resources/maps/pubs/Littletown.json' },
      { title: 'Lostworld', path: 'resources/maps/pubs/Lostworld.json' },
      { title: 'Lumber', path: 'resources/maps/pubs/Lumber.json' },
      { title: 'Lush', path: 'resources/maps/pubs/Lush.json' },
      { title: 'Oasis', path: 'resources/maps/pubs/Oasis.json' },
      { title: 'Old Burg', path: 'resources/maps/pubs/Old_Burg.json' },
      { title: 'Sandstorm', path: 'resources/maps/pubs/Sandstorm.json' },
      { title: 'Shipment', path: 'resources/maps/pubs/Shipment.json' },
      { title: 'Shipyard', path: 'resources/maps/pubs/Shipyard.json' },
      { title: 'Site', path: 'resources/maps/pubs/Site.json' },
      { title: 'SkyTemple', path: 'resources/maps/pubs/SkyTemple.json' },
      { title: 'Stalk Factory', path: 'resources/maps/pubs/Stalk Factory.json' },
      { title: 'Stockade', path: 'resources/maps/pubs/Stockade.json' },
      { title: 'Subzero', path: 'resources/maps/pubs/Subzero.json' },
      { title: 'Throwback', path: 'resources/maps/pubs/Throwback.json' },
      { title: 'Tropicano', path: 'resources/maps/pubs/Tropicano.json' },
      { title: 'Undergrowth', path: 'resources/maps/pubs/Undergrowth.json' },
      { title: 'Vivo', path: 'resources/maps/pubs/Vivo.json' },
    ],
  },
  'maps-official-parkour': {
    title: 'Official Parkour Maps',
    intro: 'Official Krunker parkour maps.',
    files: [
      { title: 'Slide Moonlight', path: 'resources/maps/parkour/Slide Moonlight.json' },
      { title: 'Eterno Jump', path: 'resources/maps/parkour/eterno_jump.json' },
    ],
  },
  'maps-official-raids': {
    title: 'Official Raids Maps',
    intro: 'Official Krunker Raids game-mode maps.',
    files: [
      { title: 'Facility', path: 'resources/maps/raids/Facility.json' },
      { title: 'Khepri', path: 'resources/maps/raids/Khepri.json' },
      { title: 'Laboratory', path: 'resources/maps/raids/Laboratory.json' },
      { title: 'Soul Sanctum', path: 'resources/maps/raids/Soul Sanctum.json' },
      { title: 'Tortuga', path: 'resources/maps/raids/Tortuga.json' },
    ],
  },
  'maps-official-infected': {
    title: 'Custom Infected Maps',
    intro: 'A curated batch of community-made Infected / Zombie maps, ready to drop into your Resource Swapper or map editor.',
    files: [
      { title: "5torm5iege_save", path: "resources/maps/custom/infected/5torm5iege_save.txt" },
      { title: "ALG_VINITS MAP", path: "resources/maps/custom/infected/ALG_VINITS MAP.txt" },
      { title: "Alien_Attack", path: "resources/maps/custom/infected/Alien_Attack.json" },
      { title: "Best_Zombie_inf", path: "resources/maps/custom/infected/Best_Zombie_inf.json" },
      { title: "Builder_Boys", path: "resources/maps/custom/infected/Builder_Boys.json" },
      { title: "BuildSurvival", path: "resources/maps/custom/infected/BuildSurvival.json" },
      { title: "Bulwark2.0", path: "resources/maps/custom/infected/Bulwark2.0.json" },
      { title: "Cod1_Zombies", path: "resources/maps/custom/infected/Cod1_Zombies.json" },
      { title: "CONTAGIOUS", path: "resources/maps/custom/infected/CONTAGIOUS.json" },
      { title: "craftzombies(dead)", path: "resources/maps/custom/infected/craftzombies(dead).json" },
      { title: "craftzombies", path: "resources/maps/custom/infected/craftzombies.json" },
      { title: "Crown_Castle", path: "resources/maps/custom/infected/Crown_Castle.json" },
      { title: "DJ_BlueCove", path: "resources/maps/custom/infected/DJ_BlueCove.json" },
      { title: "DodgeZombieTEST", path: "resources/maps/custom/infected/DodgeZombieTEST.json" },
      { title: "Downhill_Zombies", path: "resources/maps/custom/infected/Downhill_Zombies.json" },
      { title: "Escape_Zombies_", path: "resources/maps/custom/infected/Escape_Zombies_.json" },
      { title: "European_zombies_save", path: "resources/maps/custom/infected/European_zombies_save.txt" },
      { title: "Extinction", path: "resources/maps/custom/infected/Extinction.json" },
      { title: "Extinction0", path: "resources/maps/custom/infected/Extinction0.json" },
      { title: "Extinction1", path: "resources/maps/custom/infected/Extinction1.json" },
      { title: "Extinction2", path: "resources/maps/custom/infected/Extinction2.json" },
      { title: "Extinction_2", path: "resources/maps/custom/infected/Extinction_2.json" },
      { title: "Extraction_H1", path: "resources/maps/custom/infected/Extraction_H1.json" },
      { title: "fort_krunk", path: "resources/maps/custom/infected/fort_krunk.json" },
      { title: "fortress_zombies", path: "resources/maps/custom/infected/fortress_zombies.json" },
      { title: "Future_Zombs", path: "resources/maps/custom/infected/Future_Zombs.json" },
      { title: "Hardline_Begins", path: "resources/maps/custom/infected/Hardline_Begins.json" },
      { title: "Hardline_Fall", path: "resources/maps/custom/infected/Hardline_Fall.json" },
      { title: "Hell_ofZombies", path: "resources/maps/custom/infected/Hell_ofZombies.json" },
      { title: "Hell_ofZombies_save", path: "resources/maps/custom/infected/Hell_ofZombies_save.txt" },
      { title: "Human_Downfall", path: "resources/maps/custom/infected/Human_Downfall.json" },
      { title: "Human_Run", path: "resources/maps/custom/infected/Human_Run.json" },
      { title: "Hyperspace", path: "resources/maps/custom/infected/Hyperspace.json" },
      { title: "inf_knightfall", path: "resources/maps/custom/infected/inf_knightfall.json" },
      { title: "Infect_Everest", path: "resources/maps/custom/infected/Infect_Everest.json" },
      { title: "Infect_The_King", path: "resources/maps/custom/infected/Infect_The_King.json" },
      { title: "Infected_Redking", path: "resources/maps/custom/infected/Infected_Redking.json" },
      { title: "Justmoobing", path: "resources/maps/custom/infected/Justmoobing.json" },
      { title: "Minecraft_Zombie", path: "resources/maps/custom/infected/Minecraft_Zombie.json" },
      { title: "Mud_Run", path: "resources/maps/custom/infected/Mud_Run.json" },
      { title: "OceanDefense", path: "resources/maps/custom/infected/OceanDefense.json" },
      { title: "OOFSQUARED", path: "resources/maps/custom/infected/OOFSQUARED.json" },
      { title: "parkour_nuclear", path: "resources/maps/custom/infected/parkour_nuclear.json" },
      { title: "Pirates_Zombies", path: "resources/maps/custom/infected/Pirates_Zombies.json" },
      { title: "Plants_VS_Zombie", path: "resources/maps/custom/infected/Plants_VS_Zombie.json" },
      { title: "PurpleCastle", path: "resources/maps/custom/infected/PurpleCastle.json" },
      { title: "ROBOT_ZOMBIES", path: "resources/maps/custom/infected/ROBOT_ZOMBIES.json" },
      { title: "SimpleZombies", path: "resources/maps/custom/infected/SimpleZombies.json" },
      { title: "Snow_Zombies", path: "resources/maps/custom/infected/Snow_Zombies.json" },
      { title: "SpaceZombies", path: "resources/maps/custom/infected/SpaceZombies.json" },
      { title: "StormSiege", path: "resources/maps/custom/infected/StormSiege.json" },
      { title: "SuperZombieLand", path: "resources/maps/custom/infected/SuperZombieLand.json" },
      { title: "TheKrunkRooms", path: "resources/maps/custom/infected/TheKrunkRooms.json" },
      { title: "TropicalDefense", path: "resources/maps/custom/infected/TropicalDefense.json" },
      { title: "Uphill_Zombies", path: "resources/maps/custom/infected/Uphill_Zombies.json" },
      { title: "Wasteland_Escape", path: "resources/maps/custom/infected/Wasteland_Escape.json" },
      { title: "ZBuild", path: "resources/maps/custom/infected/ZBuild.json" },
      { title: "Zombie Mountain", path: "resources/maps/custom/infected/Zombie Mountain.json" },
      { title: "Zombie-StarWars", path: "resources/maps/custom/infected/Zombie-StarWars.json" },
      { title: "Zombie_AIO", path: "resources/maps/custom/infected/Zombie_AIO.json" },
      { title: "Zombie_ArcticOps", path: "resources/maps/custom/infected/Zombie_ArcticOps.json" },
      { title: "Zombie_Assault_save", path: "resources/maps/custom/infected/Zombie_Assault_save.txt" },
      { title: "Zombie_Barnyard", path: "resources/maps/custom/infected/Zombie_Barnyard.json" },
      { title: "Zombie_Bastion", path: "resources/maps/custom/infected/Zombie_Bastion.json" },
      { title: "Zombie_berserk", path: "resources/maps/custom/infected/Zombie_berserk.json" },
      { title: "Zombie_Bulwark", path: "resources/maps/custom/infected/Zombie_Bulwark.json" },
      { title: "Zombie_Bunker", path: "resources/maps/custom/infected/Zombie_Bunker.json" },
      { title: "Zombie_Catapult", path: "resources/maps/custom/infected/Zombie_Catapult.json" },
      { title: "Zombie_Cave!", path: "resources/maps/custom/infected/Zombie_Cave!.json" },
      { title: "Zombie_chill", path: "resources/maps/custom/infected/Zombie_chill.json" },
      { title: "Zombie_Def_Ultra", path: "resources/maps/custom/infected/Zombie_Def_Ultra.json" },
      { title: "ZOMBIE_DEFENCE_4", path: "resources/maps/custom/infected/ZOMBIE_DEFENCE_4.json" },
      { title: "Zombie_Diggers", path: "resources/maps/custom/infected/Zombie_Diggers.json" },
      { title: "Zombie_Discovery", path: "resources/maps/custom/infected/Zombie_Discovery.json" },
      { title: "Zombie_Downgrade", path: "resources/maps/custom/infected/Zombie_Downgrade.json" },
      { title: "Zombie_echo", path: "resources/maps/custom/infected/Zombie_echo.json" },
      { title: "Zombie_Epic_H1", path: "resources/maps/custom/infected/Zombie_Epic_H1.json" },
      { title: "Zombie_Exploring", path: "resources/maps/custom/infected/Zombie_Exploring.json" },
      { title: "Zombie_Flavor", path: "resources/maps/custom/infected/Zombie_Flavor.json" },
      { title: "Zombie_Flight", path: "resources/maps/custom/infected/Zombie_Flight.json" },
      { title: "Zombie_Flop", path: "resources/maps/custom/infected/Zombie_Flop.json" },
      { title: "Zombie_Fun_Run", path: "resources/maps/custom/infected/Zombie_Fun_Run.json" },
      { title: "Zombie_go_around", path: "resources/maps/custom/infected/Zombie_go_around.json" },
      { title: "Zombie_High", path: "resources/maps/custom/infected/Zombie_High.json" },
      { title: "Zombie_Hospital", path: "resources/maps/custom/infected/Zombie_Hospital.json" },
      { title: "Zombie_Hour", path: "resources/maps/custom/infected/Zombie_Hour.json" },
      { title: "Zombie_Intrusion", path: "resources/maps/custom/infected/Zombie_Intrusion.json" },
      { title: "Zombie_KINGDOM", path: "resources/maps/custom/infected/Zombie_KINGDOM.json" },
      { title: "Zombie_LostWorld", path: "resources/maps/custom/infected/Zombie_LostWorld.json" },
      { title: "Zombie_Manor_H1", path: "resources/maps/custom/infected/Zombie_Manor_H1.json" },
      { title: "Zombie_MiniGames", path: "resources/maps/custom/infected/Zombie_MiniGames.json" },
      { title: "Zombie_Mutants", path: "resources/maps/custom/infected/Zombie_Mutants.json" },
      { title: "Zombie_Odyssey(owner ded)", path: "resources/maps/custom/infected/Zombie_Odyssey(owner ded).json" },
      { title: "Zombie_Onward!", path: "resources/maps/custom/infected/Zombie_Onward!.json" },
      { title: "Zombie_Overrun", path: "resources/maps/custom/infected/Zombie_Overrun.json" },
      { title: "zombie_parkore2", path: "resources/maps/custom/infected/zombie_parkore2.json" },
      { title: "zombie_parkore3", path: "resources/maps/custom/infected/zombie_parkore3.json" },
      { title: "Zombie_Party", path: "resources/maps/custom/infected/Zombie_Party.json" },
      { title: "Zombie_Pathmaker", path: "resources/maps/custom/infected/Zombie_Pathmaker.json" },
      { title: "Zombie_Payday", path: "resources/maps/custom/infected/Zombie_Payday.json" },
      { title: "Zombie_Peninsula", path: "resources/maps/custom/infected/Zombie_Peninsula.json" },
      { title: "Zombie_Planet", path: "resources/maps/custom/infected/Zombie_Planet.json" },
      { title: "Zombie_Quarry", path: "resources/maps/custom/infected/Zombie_Quarry.json" },
      { title: "Zombie_Scifi", path: "resources/maps/custom/infected/Zombie_Scifi.json" },
      { title: "Zombie_Siege_", path: "resources/maps/custom/infected/Zombie_Siege_.json" },
      { title: "Zombie_Slinger", path: "resources/maps/custom/infected/Zombie_Slinger.json" },
      { title: "Zombie_Soccer1", path: "resources/maps/custom/infected/Zombie_Soccer1.json" },
      { title: "Zombie_Soul", path: "resources/maps/custom/infected/Zombie_Soul.json" },
      { title: "Zombie_Space_Run", path: "resources/maps/custom/infected/Zombie_Space_Run.json" },
      { title: "Zombie_Storm", path: "resources/maps/custom/infected/Zombie_Storm.json" },
      { title: "Zombie_Surrender", path: "resources/maps/custom/infected/Zombie_Surrender.json" },
      { title: "Zombie_Swim", path: "resources/maps/custom/infected/Zombie_Swim.json" },
      { title: "Zombie_Syncrasy", path: "resources/maps/custom/infected/Zombie_Syncrasy.json" },
      { title: "Zombie_TowerUP(ded)", path: "resources/maps/custom/infected/Zombie_TowerUP(ded).json" },
      { title: "Zombie_Universe", path: "resources/maps/custom/infected/Zombie_Universe.json" },
      { title: "Zombie_Upgrade", path: "resources/maps/custom/infected/Zombie_Upgrade.json" },
      { title: "Zombie_VS_Human", path: "resources/maps/custom/infected/Zombie_VS_Human.json" },
      { title: "Zombie_VS_Human_save", path: "resources/maps/custom/infected/Zombie_VS_Human_save.txt" },
      { title: "Zombie_Walls_2", path: "resources/maps/custom/infected/Zombie_Walls_2.json" },
      { title: "Zombie_WAR#U2622", path: "resources/maps/custom/infected/Zombie_WAR#U2622.json" },
      { title: "Zombie_Workshop", path: "resources/maps/custom/infected/Zombie_Workshop.json" },
      { title: "Zombie_Z-DAY", path: "resources/maps/custom/infected/Zombie_Z-DAY.json" },
      { title: "zombieadventure3", path: "resources/maps/custom/infected/zombieadventure3.json" },
      { title: "ZombieAlert", path: "resources/maps/custom/infected/ZombieAlert.json" },
      { title: "ZombieColors", path: "resources/maps/custom/infected/ZombieColors.json" },
      { title: "ZombieDefence__5", path: "resources/maps/custom/infected/ZombieDefence__5.json" },
      { title: "ZombieDisaster", path: "resources/maps/custom/infected/ZombieDisaster.json" },
      { title: "zombiejungle", path: "resources/maps/custom/infected/zombiejungle.json" },
      { title: "ZombieParadise", path: "resources/maps/custom/infected/ZombieParadise.json" },
      { title: "ZombiePartyLand", path: "resources/maps/custom/infected/ZombiePartyLand.json" },
      { title: "ZombieRush_2022", path: "resources/maps/custom/infected/ZombieRush_2022.json" },
      { title: "ZombieRush_2O22", path: "resources/maps/custom/infected/ZombieRush_2O22.json" },
      { title: "Zombies_Building", path: "resources/maps/custom/infected/Zombies_Building.json" },
      { title: "Zombies_Europe", path: "resources/maps/custom/infected/Zombies_Europe.json" },
      { title: "Zombies_Invader", path: "resources/maps/custom/infected/Zombies_Invader.json" },
      { title: "Zombies_iscoming", path: "resources/maps/custom/infected/Zombies_iscoming.json" },
      { title: "Zombies_Island", path: "resources/maps/custom/infected/Zombies_Island.json" },
      { title: "Zombies_River", path: "resources/maps/custom/infected/Zombies_River.json" },
      { title: "Zombies_Royales", path: "resources/maps/custom/infected/Zombies_Royales.json" },
      { title: "Zombies_school", path: "resources/maps/custom/infected/Zombies_school.json" },
      { title: "Zombies_UFO", path: "resources/maps/custom/infected/Zombies_UFO.json" },
      { title: "ZombieSkate", path: "resources/maps/custom/infected/ZombieSkate.json" },
      { title: "ZombieVsMartian", path: "resources/maps/custom/infected/ZombieVsMartian.json" },
      { title: "Zombs_Undertale", path: "resources/maps/custom/infected/Zombs_Undertale.json" },
      { title: "ZombWorlds", path: "resources/maps/custom/infected/ZombWorlds.json" },
      { title: "ZombWorlds3", path: "resources/maps/custom/infected/ZombWorlds3.json" },
      { title: "ZWRevenge", path: "resources/maps/custom/infected/ZWRevenge.json" },
    ],
  },
  'maps-custom-parkour': {
    title: 'Custom Parkour Maps',
    intro: 'A curated batch of community-made Parkour, Slide & Bhop maps.',
    files: [
      { title: "--BhopDreams--", path: "resources/maps/custom/parkour/--BhopDreams--.json" },
      { title: "-Lake_Parkour-", path: "resources/maps/custom/parkour/-Lake_Parkour-.json" },
      { title: "A_Basic_parkour", path: "resources/maps/custom/parkour/A_Basic_parkour.json" },
      { title: "Acid_Run", path: "resources/maps/custom/parkour/Acid_Run.json" },
      { title: "Aqua_Run", path: "resources/maps/custom/parkour/Aqua_Run.json" },
      { title: "Bhop_dojo", path: "resources/maps/custom/parkour/Bhop_dojo.json" },
      { title: "Bhop_Giant_Steps", path: "resources/maps/custom/parkour/Bhop_Giant_Steps.json" },
      { title: "bhop_Levels_6.4", path: "resources/maps/custom/parkour/bhop_Levels_6.4.json" },
      { title: "bhop_Spiral", path: "resources/maps/custom/parkour/bhop_Spiral.json" },
      { title: "Bhop_VIP", path: "resources/maps/custom/parkour/Bhop_VIP.json" },
      { title: "Chocolate_Run", path: "resources/maps/custom/parkour/Chocolate_Run.json" },
      { title: "Death_Run", path: "resources/maps/custom/parkour/Death_Run.json" },
      { title: "Flood_Escape", path: "resources/maps/custom/parkour/Flood_Escape.json" },
      { title: "Fun_Parkour!", path: "resources/maps/custom/parkour/Fun_Parkour!.json" },
      { title: "FUN_PARKOUR_4", path: "resources/maps/custom/parkour/FUN_PARKOUR_4.json" },
      { title: "Futuristic_Bhop", path: "resources/maps/custom/parkour/Futuristic_Bhop.json" },
      { title: "Lava_Run", path: "resources/maps/custom/parkour/Lava_Run.json" },
      { title: "Nuclear_Escape", path: "resources/maps/custom/parkour/Nuclear_Escape.json" },
      { title: "Parkour Tower", path: "resources/maps/custom/parkour/Parkour Tower.json" },
      { title: "Parkour_Battle", path: "resources/maps/custom/parkour/Parkour_Battle.json" },
      { title: "Parkour_OldBrick", path: "resources/maps/custom/parkour/Parkour_OldBrick.json" },
      { title: "Puzzleparkour", path: "resources/maps/custom/parkour/Puzzleparkour.json" },
      { title: "Sand_Run", path: "resources/maps/custom/parkour/Sand_Run.json" },
      { title: "Santas_Parkour!", path: "resources/maps/custom/parkour/Santas_Parkour!.json" },
      { title: "Slide_Australia", path: "resources/maps/custom/parkour/Slide_Australia.json" },
      { title: "slide_ColourSea", path: "resources/maps/custom/parkour/slide_ColourSea.json" },
      { title: "slide_Dynamo", path: "resources/maps/custom/parkour/slide_Dynamo.json" },
      { title: "slide_Iucy", path: "resources/maps/custom/parkour/slide_Iucy.json" },
      { title: "slide_Liminal", path: "resources/maps/custom/parkour/slide_Liminal.json" },
      { title: "slide_Miasma", path: "resources/maps/custom/parkour/slide_Miasma.json" },
      { title: "Slide_Party", path: "resources/maps/custom/parkour/Slide_Party.json" },
      { title: "slide_Twain", path: "resources/maps/custom/parkour/slide_Twain.json" },
      { title: "Super_Parkour!", path: "resources/maps/custom/parkour/Super_Parkour!.json" },
      { title: "Venom_Run", path: "resources/maps/custom/parkour/Venom_Run.json" },
      { title: "YouTube_Parkour", path: "resources/maps/custom/parkour/YouTube_Parkour.json" },
    ],
  },
  'maps-official-tdm': {
    title: 'Custom TDM Maps',
    intro: 'A curated batch of community-made TDM / general-purpose maps.',
    files: [
      { title: "AIM_Room", path: "resources/maps/custom/tdm/AIM_Room.json" },
      { title: "Black_Tower", path: "resources/maps/custom/tdm/Black_Tower.json" },
      { title: "Celeste", path: "resources/maps/custom/tdm/Celeste.json" },
      { title: "Dungeon_Mystery", path: "resources/maps/custom/tdm/Dungeon_Mystery.json" },
      { title: "FightTeams", path: "resources/maps/custom/tdm/FightTeams.json" },
      { title: "Football-stadium", path: "resources/maps/custom/tdm/Football-stadium.json" },
      { title: "Last_Defence", path: "resources/maps/custom/tdm/Last_Defence.json" },
      { title: "Pool_Scene1", path: "resources/maps/custom/tdm/Pool_Scene1.json" },
      { title: "That_Level_Again", path: "resources/maps/custom/tdm/That_Level_Again.json" },
      { title: "Tower_Of_God#U267f", path: "resources/maps/custom/tdm/Tower_Of_God#U267f.json" },
      { title: "Trench_War_H1", path: "resources/maps/custom/tdm/Trench_War_H1.json" },
      { title: "Valorant.Ascent", path: "resources/maps/custom/tdm/Valorant.Ascent.json" },
      { title: "War_of_the_Egg", path: "resources/maps/custom/tdm/War_of_the_Egg.json" },
    ],
  },
};

function renderMapList(node, main, crumbs){
  const section = STATIC_MAP_LISTS[node.id];
  if(gallerySearchNodeId !== node.id){ gallerySearchQuery = ''; gallerySearchNodeId = node.id; }
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="breadcrumb">${crumbs}</div>
    <div class="content-head">
      <div class="content-icon">${icon(main.glyph)}</div>
      <h2>${node.label}</h2>
    </div>
    <p class="content-desc">${escapeHtml(section.intro)}</p>
    <div class="meta-strip">
      <span class="chip">${escapeHtml(main.label)}</span>
      <span class="chip" id="mapCountChip">${section.files.length} map${section.files.length > 1 ? 's' : ''}</span>
    </div>
    <div class="search-bar-wrap">
      <svg class="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" id="mapSearchInput" class="search-bar-input" placeholder="Search ${section.files.length} maps by name..." autocomplete="off">
    </div>
    <div class="file-gallery" id="mapFileGallery">
      ${section.files.map(f => {
        const ext = (f.path.split('.').pop() || 'json').toLowerCase();
        return `
        <div class="file-card" data-title="${escapeHtml(f.title.toLowerCase())}">
          <div class="file-icon">\uD83D\uDDFA\uFE0F</div>
          <div class="file-info">
            <div class="gallery-title">${escapeHtml(f.title)}</div>
            <div class="gallery-meta">.${escapeHtml(ext)} map file</div>
          </div>
          <div class="gallery-actions">
            <a class="gallery-btn" href="${encodeURI(f.path)}" download="${escapeHtml(f.title)}.${escapeHtml(ext)}">Download</a>
          </div>
        </div>
      `;
      }).join('')}
      <div class="gallery-empty" id="mapSearchEmpty" style="display:none;">No maps match your search.</div>
    </div>
    ${POST_LINKS[node.id] ? `<button class="btn-createpost" id="btnCreatePost">Create Post</button>` : ''}
    ${FILE_GALLERY_SECTIONS[node.id] ? `
      <div class="gallery-wrap">
        <h3 class="gallery-heading">${FILE_GALLERY_SECTIONS[node.id].title || 'Community Files'}</h3>
        <div class="search-bar-wrap">
          <svg class="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="search-bar-input" id="gallerySearchInput" placeholder="Search community posts by title..." value="${escapeHtml(gallerySearchQuery)}" autocomplete="off">
        </div>
        <div class="file-gallery" id="fileGallery"><div class="gallery-empty">Loading...</div></div>
      </div>
    ` : ''}
  `;

  const searchInput = document.getElementById('mapSearchInput');
  const cards = Array.from(document.querySelectorAll('#mapFileGallery .file-card'));
  const emptyState = document.getElementById('mapSearchEmpty');
  const countChip = document.getElementById('mapCountChip');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const match = !q || card.getAttribute('data-title').includes(q);
      card.style.display = match ? '' : 'none';
      if(match) visible++;
    });
    emptyState.style.display = visible === 0 ? '' : 'none';
    countChip.textContent = `${visible} map${visible !== 1 ? 's' : ''}${q ? ` found` : ''}`;
  });

  if(POST_LINKS[node.id]){
    document.getElementById('btnCreatePost').addEventListener('click', () => {
      manualEmbedNodeId = node.id;
      renderContent();
    });
  }

  if(FILE_GALLERY_SECTIONS[node.id]){
    loadFileGallery(FILE_GALLERY_SECTIONS[node.id].cat, gallerySearchQuery);
  }

  const gallerySearchInput = document.getElementById('gallerySearchInput');
  if(gallerySearchInput){
    let gallerySearchDebounce = null;
    gallerySearchInput.addEventListener('input', (e) => {
      clearTimeout(gallerySearchDebounce);
      const thisNodeId = node.id;
      gallerySearchDebounce = setTimeout(() => {
        gallerySearchQuery = e.target.value.trim();
        gallerySearchNodeId = thisNodeId;
        if(FILE_GALLERY_SECTIONS[thisNodeId]) loadFileGallery(FILE_GALLERY_SECTIONS[thisNodeId].cat, gallerySearchQuery);
      }, 300);
    });
  }
}


/* Leaf nodes that stay as a plain placeholder by default, but offer a
   "Create Post" button that loads the real community post page on demand. */
const POST_LINKS = {
  'crosshair-crosshairs': 'community/crosshairs.html',
  'crosshair-scope': 'community/image-section.html?cat=crosshair-scope&title=Scope',
  'crosshair-hitmarker': 'community/image-section.html?cat=crosshair-hitmarker&title=Hitmarker',
  'crosshair-overlay-damage': 'community/image-section.html?cat=crosshair-overlay-damage&title=Damage%20Overlay',
  'crosshair-overlay-game': 'community/image-section.html?cat=crosshair-overlay-game&title=Game%20Overlay',
  'crosshair-icons-kill': 'community/image-section.html?cat=crosshair-icons-kill&title=Kill%20Icon',
  'crosshair-icons-death': 'community/image-section.html?cat=crosshair-icons-death&title=Death%20Icon',
  'crosshair-icons-ammo': 'community/image-section.html?cat=crosshair-icons-ammo&title=Ammo%20Icon',
  'crosshair-icons-streak': 'community/image-section.html?cat=crosshair-icons-streak&title=Streak%20Counter%20Icon',
  'settings-ready': 'community/section.html?cat=settings-ready&title=Ready%20Settings&filetype=txt&desc=1',
  'css-ready': 'community/css-post.html',
  'maps-official-infected': 'community/section.html?cat=maps-official-infected&title=Infected&filetype=txt,js&desc=1',
  'maps-official-tdm': 'community/section.html?cat=maps-official-tdm&title=TDM&filetype=txt,js&desc=1',
  'maps-custom-parkour': 'community/section.html?cat=maps-custom-parkour&title=Parkour&filetype=txt,js&desc=1',
  'mods-files': 'community/section.html?cat=mods-files&title=Mods%20Files&filetype=zip&desc=1',
  'scripts-userscript-hack': 'community/section.html?cat=scripts-userscript-hack&title=Hack%20Script&filetype=txt,js,json&desc=1',
  'scripts-krunkscript-usable': 'community/section.html?cat=scripts-krunkscript-usable&title=Usable%20KrunkScripts&filetype=txt,js,json&desc=1&multiple=1',
};

/* Leaf nodes that should show a live-rendered community gallery
   (decoded from posted codes) directly on the placeholder page. */
const GALLERY_SECTIONS = {
  'crosshair-crosshairs': { cat: 'crosshair', title: 'Community Crosshairs' },
  'crosshair-scope': { cat: 'crosshair-scope', title: 'Community Scopes' },
  'crosshair-hitmarker': { cat: 'crosshair-hitmarker', title: 'Community Hitmarkers' },
  'crosshair-overlay-damage': { cat: 'crosshair-overlay-damage', title: 'Community Damage Overlays' },
  'crosshair-overlay-game': { cat: 'crosshair-overlay-game', title: 'Community Game Overlays' },
  'crosshair-icons-kill': { cat: 'crosshair-icons-kill', title: 'Community Kill Icons' },
  'crosshair-icons-death': { cat: 'crosshair-icons-death', title: 'Community Death Icons' },
  'crosshair-icons-ammo': { cat: 'crosshair-icons-ammo', title: 'Community Ammo Icons' },
  'crosshair-icons-streak': { cat: 'crosshair-icons-streak', title: 'Community Streak Counter Icons' },
};

/* Leaf nodes that show a live-rendered community FILE gallery (uploaded
   documents like .txt, not images) directly on the placeholder page. */
const FILE_GALLERY_SECTIONS = {
  'settings-ready': { cat: 'settings-ready', title: 'Community Ready Settings', ext: 'txt' },
  'maps-official-infected': { cat: 'maps-official-infected', title: 'Community Infected Maps', ext: 'txt,js' },
  'maps-official-tdm': { cat: 'maps-official-tdm', title: 'Community TDM Maps', ext: 'txt,js' },
  'maps-custom-parkour': { cat: 'maps-custom-parkour', title: 'Community Parkour Maps', ext: 'txt,js' },
  'mods-files': { cat: 'mods-files', title: 'Community Mods Files', ext: 'zip' },
  'scripts-userscript-legal': { cat: 'scripts-userscript-legal', title: 'Community Legal Scripts', ext: 'txt,js,json' },
  'scripts-userscript-hack': { cat: 'scripts-userscript-hack', title: 'Community Hack Scripts', ext: 'txt,js,json' },
  'scripts-krunkscript-usable': { cat: 'scripts-krunkscript-usable', title: 'Community KrunkScripts', ext: 'txt,js,json' },
};

/* Leaf nodes that post Name + multiple preview screenshots + a single
   .txt/.css file (content is JSON: {file_url, file_name, previews[]}). */
const CSS_GALLERY_SECTIONS = {
  'css-ready': { cat: 'css-ready', title: 'Community Ready CSS' },
};

function renderContent(){
  const path = fullPath(selectedId) || [findMain(activeMainId)];
  const node = path[path.length - 1];
  const main = path[0];
  const color = COLOR_VAR[main.color];

  const el = document.getElementById('content');
  el.style.setProperty('--c', color);

  const crumbs = path.map((n,i) =>
    (i === path.length-1 ? `<b>${n.label.toUpperCase()}</b>` : n.label.toUpperCase())
  ).join(' <span class="sep">/</span> ');

  const kids = node.children && node.children.length ? node.children : null;

  if(manualEmbedNodeId !== node.id) manualEmbedNodeId = null;
  if(gallerySearchNodeId !== node.id){ gallerySearchQuery = ''; gallerySearchNodeId = node.id; }

  if(POST_LINKS[node.id] && manualEmbedNodeId === node.id){
    el.innerHTML = `
      <div class="breadcrumb">${crumbs}</div>
      <div class="content-head">
        <div class="content-icon">${icon(main.glyph)}</div>
        <h2>${node.label}</h2>
      </div>
      <iframe class="embed-frame" src="${POST_LINKS[node.id]}" title="${node.label}" loading="lazy"></iframe>
    `;
    return;
  }

  if(EMBEDS[node.id]){
    el.innerHTML = `
      <div class="breadcrumb">${crumbs}</div>
      <div class="content-head">
        <div class="content-icon">${icon(main.glyph)}</div>
        <h2>${node.label}</h2>
      </div>
      <iframe class="embed-frame" src="${EMBEDS[node.id]}" title="${node.label}" loading="lazy"></iframe>
    `;
    return;
  }

  if(RESOURCE_LISTS[node.id]){
    renderResourceList(node, main, path, crumbs, color);
    return;
  }

  if(LINK_PAGES[node.id]){
    renderLinkPage(node, main, crumbs);
    return;
  }

  if(VIDEO_GUIDE_SECTIONS[node.id]){
    renderVideoGuide(node, main, crumbs);
    return;
  }

  if(node.id === 'mods-guide'){
    renderModsGuide(node, main, crumbs);
    return;
  }

  if(node.id === 'scripts-userscript-setup-guide'){
    renderScriptsGuide(node, main, crumbs);
    return;
  }

  if(node.id === 'guides-tips'){
    renderTipsGuide(node, main, crumbs);
    return;
  }

  if(STATIC_MAP_LISTS[node.id]){
    renderMapList(node, main, crumbs);
    return;
  }

  if(DISCORD_SERVER_LISTS[node.id]){
    renderDiscordServers(node, main, crumbs);
    return;
  }

  if(CLIENT_DOWNLOAD_LISTS[node.id]){
    renderClientDownloads(node, main, crumbs);
    return;
  }

  if(node.id === 'home'){
    const HOME_SHORTCUT_DESC = {
      crosshair: 'Crosshairs, overlays &amp; icons',
      settings: 'Pro player settings',
      css: 'Custom CSS codes',
      maps: 'Official &amp; custom map collection',
      mods: 'Game modifications',
      scripts: 'KrunkScript &amp; userscripts',
      guides: 'Tips, tricks &amp; raid walkthroughs',
      news: 'Krunker updates &amp; events',
      clients: 'Official &amp; custom clients',
      servers: 'Game &amp; Discord servers',
      about: 'Who we are',
    };
    const shortcuts = DATA.filter(m => m.id !== 'home');
    el.innerHTML = `
      <div class="breadcrumb">${crumbs}</div>
      <div class="content-head">
        <div class="content-icon">${icon(main.glyph)}</div>
        <h2>${node.label}</h2>
      </div>
      <p class="content-desc">Krunker Resource Hub is a community-run library built for one purpose: making it easy to find and use everything that customizes your Krunker.io experience. Instead of digging through scattered Discord servers, forum posts, and dead links, everything here — crosshairs, CSS, settings, maps, mods, and scripts — lives in one organized, searchable place. Pick a section below to jump straight in.</p>
      <div class="home-shortcut-grid">
        ${shortcuts.map(m => `
          <button class="home-shortcut-card" data-id="${m.id}" style="--c:${COLOR_VAR[m.color]}">
            <span class="home-shortcut-icon">${icon(m.glyph)}</span>
            <span class="home-shortcut-text">
              <span class="home-shortcut-title">${m.label}</span>
              <span class="home-shortcut-desc">${HOME_SHORTCUT_DESC[m.id] || ''}</span>
            </span>
          </button>`).join('')}
      </div>
      <p class="content-desc">On the customization side, you'll find ready-made crosshairs, hitmarkers, overlays, and kill/death/ammo/streak icons alongside official and community-made settings and CSS themes. If nothing pre-made fits what you're after, the built-in Custom Crosshair Maker and CSS Generator let you design your own from scratch and export it straight into your Resource Swapper.</p>
      <p class="content-desc">Beyond visuals, the Maps section carries the official Pubs, Parkour, and Raids map files plus community-made Infected, TDM, and Parkour maps. The Mods and Scripts sections cover modding guides, mod files, KrunkScript generators and usable scripts, and UserScripts — including setup guides for players who are new to any of this.</p>
      <p class="content-desc">For everything that isn't a downloadable file, there's a Guides section covering tips & tricks and boss-by-boss Raids walkthroughs (Tortuga, Khepri, Soul Sanctum, Laboratory, and more), plus News, Clients, and Servers pages tracking Krunker updates, events, and community Discord/game servers.</p>
      <p class="content-desc">Create a free account to post your own crosshairs, settings, and CSS for others to use, save the resources you like for later, and message other members of the community. Krunker Resource Hub is made by the Aura Gangs Team — it's a fan-run community project, not an official Krunker.io site.</p>
    `;
    el.querySelectorAll('.home-shortcut-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        activeMainId = id;
        expanded = new Set([id]);
        selectedId = id;
        renderAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    return;
  }

  el.innerHTML = `
    <div class="breadcrumb">${crumbs}</div>
    <div class="content-head">
      <div class="content-icon">${icon(main.glyph)}</div>
      <h2>${node.label}</h2>
    </div>
    <p class="content-desc">${describe(node, main, path)}</p>
    <div class="meta-strip">
      <span class="chip">${main.label}</span>
      ${kids ? `<span class="chip">${kids.length} subsection${kids.length>1?'s':''}</span>` : `<span class="chip">Resource page</span>`}
    </div>
    ${kids ? `<div class="child-grid">${kids.map(k => `
        <button class="child-card" data-id="${k.id}">
          <span class="dot"></span>
          <span>${k.label}</span>
        </button>`).join('')}</div>` : ''}
    ${POST_LINKS[node.id] ? `<button class="btn-createpost" id="btnCreatePost">Create Post</button>` : ''}
    <div class="status-note">This section mirrors the site mindmap — structure only, content to be filled in as the hub is built out.</div>
    ${GALLERY_SECTIONS[node.id] ? `
      <div class="gallery-wrap">
        <h3 class="gallery-heading">${GALLERY_SECTIONS[node.id].title || 'Community Posts'}</h3>
        <div class="search-bar-wrap">
          <svg class="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="search-bar-input" id="gallerySearchInput" placeholder="Search by title..." value="${escapeHtml(gallerySearchQuery)}" autocomplete="off">
        </div>
        <div class="crosshair-gallery" id="crosshairGallery"><div class="gallery-empty">Loading...</div></div>
      </div>
    ` : ''}
    ${FILE_GALLERY_SECTIONS[node.id] ? `
      <div class="gallery-wrap">
        <h3 class="gallery-heading">${FILE_GALLERY_SECTIONS[node.id].title || 'Community Files'}</h3>
        <div class="search-bar-wrap">
          <svg class="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="search-bar-input" id="gallerySearchInput" placeholder="Search by title..." value="${escapeHtml(gallerySearchQuery)}" autocomplete="off">
        </div>
        <div class="file-gallery" id="fileGallery"><div class="gallery-empty">Loading...</div></div>
      </div>
    ` : ''}
    ${CSS_GALLERY_SECTIONS[node.id] ? `
      <div class="gallery-wrap">
        <h3 class="gallery-heading">${CSS_GALLERY_SECTIONS[node.id].title || 'Community Posts'}</h3>
        <div class="search-bar-wrap">
          <svg class="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="search-bar-input" id="gallerySearchInput" placeholder="Search by title..." value="${escapeHtml(gallerySearchQuery)}" autocomplete="off">
        </div>
        <div class="crosshair-gallery" id="cssGallery"><div class="gallery-empty">Loading...</div></div>
      </div>
    ` : ''}
  `;

  if(POST_LINKS[node.id]){
    document.getElementById('btnCreatePost').addEventListener('click', () => {
      manualEmbedNodeId = node.id;
      renderContent();
    });
  }

  if(GALLERY_SECTIONS[node.id]){
    loadCrosshairGallery(GALLERY_SECTIONS[node.id].cat, gallerySearchQuery);
  }

  if(FILE_GALLERY_SECTIONS[node.id]){
    loadFileGallery(FILE_GALLERY_SECTIONS[node.id].cat, gallerySearchQuery);
  }

  if(CSS_GALLERY_SECTIONS[node.id]){
    loadCssGallery(gallerySearchQuery);
  }

  const gallerySearchInput = document.getElementById('gallerySearchInput');
  if(gallerySearchInput){
    let gallerySearchDebounce = null;
    gallerySearchInput.addEventListener('input', (e) => {
      clearTimeout(gallerySearchDebounce);
      const thisNodeId = node.id;
      gallerySearchDebounce = setTimeout(() => {
        gallerySearchQuery = e.target.value.trim();
        gallerySearchNodeId = thisNodeId;
        if(GALLERY_SECTIONS[thisNodeId]) loadCrosshairGallery(GALLERY_SECTIONS[thisNodeId].cat, gallerySearchQuery);
        if(FILE_GALLERY_SECTIONS[thisNodeId]) loadFileGallery(FILE_GALLERY_SECTIONS[thisNodeId].cat, gallerySearchQuery);
        if(CSS_GALLERY_SECTIONS[thisNodeId]) loadCssGallery(gallerySearchQuery);
      }, 300);
    });
  }

  el.querySelectorAll('.child-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      selectedId = id;
      const p = fullPath(id);
      p.forEach(n => { if(n.children && n.children.length) expanded.add(n.id); });
      renderAll();
    });
  });
}

async function loadCrosshairGallery(cat, searchQuery){
  const container = document.getElementById('crosshairGallery');
  if(!container || typeof sb === 'undefined') return;
  const q = (searchQuery || '').trim();

  try {
    const currentUser = typeof getSessionUser === 'function' ? await getSessionUser() : null;

    let query = sb
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username,display_name,avatar_url)')
      .eq('status', 'published')
      .eq('category', cat)
      .order('created_at', { ascending: false })
      .limit(24);
    if(q) query = query.ilike('title', `%${q}%`);

    const { data, error } = await query;

    if(error){ container.innerHTML = `<div class="gallery-empty">Failed to load: ${escapeHtml(error.message)}</div>`; return; }
    if(!data.length){ container.innerHTML = `<div class="gallery-empty">${q ? 'No posts match your search.' : 'Nothing posted here yet. Be the first!'}</div>`; return; }
    if(document.getElementById('crosshairGallery') !== container) return; /* navigated away */

    const { counts: reactionCounts, mine: myReactions, saved: mySaves } = await fetchReactionData(data.map(p => p.id), currentUser?.id);

    container.innerHTML = data.map((p, i) => {
      let parsed = null;
      try { parsed = JSON.parse(p.content); } catch(e) { /* legacy plain URL or crosshair code */ }
      const previews = Array.isArray(parsed?.previews) ? parsed.previews : [];
      const imageUrl = parsed?.file_url || previews[0] || (/^https?:\/\//.test(p.content) ? p.content : null);
      const description = parsed?.description || '';
      const isImage = !!imageUrl;
      const isOwner = currentUser && p.author_id === currentUser.id;
      const extraImages = previews.length > 1 ? previews.length - 1 : 0;
      return `
      <div class="gallery-card" data-post-id="${p.id}">
        ${isImage
          ? `<img class="gallery-canvas" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(p.title)}">`
          : `<canvas class="gallery-canvas" id="ghCanvas${i}" width="120" height="120"></canvas>`}
        ${extraImages ? `<div class="gallery-meta">+${extraImages} more image${extraImages > 1 ? 's' : ''}</div>` : ''}
        <div class="gallery-title">${escapeHtml(p.title)}</div>
        <div class="gallery-meta">by ${escapeHtml(p.profiles?.display_name || '?')} · ${formatDate(p.created_at)}</div>
        ${parsed ? `<div class="gallery-desc" id="ch-desc-${p.id}" style="display:none;">${description ? escapeHtml(description) : 'No description provided.'}</div>` : ''}
        <div class="gallery-actions">
          ${reactionButtonsHtml(p.id, reactionCounts[p.id], myReactions[p.id], mySaves[p.id])}
          ${parsed ? `<button class="gallery-btn" data-action="toggle-desc" data-id="${p.id}">Description</button>` : ''}
          ${isImage
            ? (previews.length > 1
                ? `<button class="gallery-btn" data-action="download-all" data-urls="${encodeURIComponent(JSON.stringify(previews))}" data-name="${encodeURIComponent((p.title || 'overlay').replace(/[^a-z0-9-_]+/gi, '_').toLowerCase())}">Download ${previews.length} Images</button>`
                : `<button class="gallery-btn" data-action="download-remote" data-url="${encodeURIComponent(imageUrl)}" data-filename="${encodeURIComponent((p.title || 'crosshair').replace(/[^a-z0-9-_]+/gi, '_').toLowerCase() + '.png')}">Download PNG</button>`)
            : `<button class="gallery-btn" data-action="download" data-code="${encodeURIComponent(p.content)}" data-name="${escapeHtml(p.title)}">Download PNG</button>`}
          ${isOwner ? `
            <button class="gallery-btn" data-action="edit" data-id="${p.id}" data-title="${escapeHtml(p.title)}" data-desc="${encodeURIComponent(description)}" data-isjson="${parsed ? '1' : '0'}" data-fileurl="${encodeURIComponent(imageUrl || '')}" data-previews="${encodeURIComponent(JSON.stringify(previews))}">Edit</button>
            <button class="gallery-btn" data-action="delete" data-id="${p.id}">Delete</button>
          ` : ''}
        </div>
      </div>
    `;
    }).join('');
    wireCardNavigation(container);
    wireReactionButtons(container, currentUser, () => loadCrosshairGallery(cat, q));

    data.forEach((p, i) => {
      let parsed = null;
      try { parsed = JSON.parse(p.content); } catch(e) { /* not JSON */ }
      const imageUrl = parsed?.file_url || parsed?.previews?.[0] || (/^https?:\/\//.test(p.content) ? p.content : null);
      if(imageUrl) return; /* real image, nothing to draw */
      const canvas = document.getElementById(`ghCanvas${i}`);
      if(!canvas) return;
      const state = typeof decodeCrosshairCode === 'function' ? decodeCrosshairCode(p.content) : null;
      const ctx = canvas.getContext('2d');
      if(state){
        renderCrosshairToCanvas(canvas, state);
      } else {
        ctx.fillStyle = 'rgba(166,176,214,.55)';
        ctx.font = '11px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Invalid code', canvas.width/2, canvas.height/2);
      }
    });

    container.querySelectorAll('[data-action="download-remote"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = decodeURIComponent(btn.getAttribute('data-url'));
        const filename = decodeURIComponent(btn.getAttribute('data-filename'));
        downloadFileByUrl(url, filename, btn);
      });
    });
    container.querySelectorAll('[data-action="download-all"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const urls = JSON.parse(decodeURIComponent(btn.getAttribute('data-urls') || '[]'));
        const base = decodeURIComponent(btn.getAttribute('data-name') || 'image');
        const original = btn.textContent;
        btn.disabled = true;
        for(let k = 0; k < urls.length; k++){
          btn.textContent = `Downloading ${k + 1}/${urls.length}...`;
          const ext = (urls[k].split('?')[0].split('.').pop() || 'png').toLowerCase();
          await downloadFileByUrl(urls[k], `${base}-${k + 1}.${ext}`, null);
        }
        btn.disabled = false; btn.textContent = original;
      });
    });
    container.querySelectorAll('[data-action="download"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = decodeURIComponent(btn.getAttribute('data-code'));
        const name = btn.getAttribute('data-name') || 'crosshair';
        const state = typeof decodeCrosshairCode === 'function' ? decodeCrosshairCode(code) : null;
        if(!state){ alert('Could not decode this crosshair code.'); return; }
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 400; exportCanvas.height = 400;
        renderCrosshairToCanvas(exportCanvas, state);
        const link = document.createElement('a');
        link.download = name.replace(/[^a-z0-9-_]+/gi, '_').toLowerCase() + '.png';
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
      });
    });
    container.querySelectorAll('[data-action="toggle-desc"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const el = document.getElementById(`ch-desc-${id}`);
        if (!el) return;
        const showing = el.style.display !== 'none';
        el.style.display = showing ? 'none' : 'block';
        btn.textContent = showing ? 'Description' : 'Hide Description';
      });
    });
    container.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const currentTitle = btn.getAttribute('data-title');
        const isJson = btn.getAttribute('data-isjson') === '1';

        const newTitle = prompt('Edit title:', currentTitle);
        if (newTitle === null) return; /* cancelled */
        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle) { alert('Title cannot be empty.'); return; }

        const updatePayload = { title: trimmedTitle };

        if (isJson) {
          const currentDesc = decodeURIComponent(btn.getAttribute('data-desc') || '');
          const newDesc = prompt('Edit description:', currentDesc);
          if (newDesc === null) return; /* cancelled */
          const fileUrl = decodeURIComponent(btn.getAttribute('data-fileurl') || '');
          const previews = JSON.parse(decodeURIComponent(btn.getAttribute('data-previews') || '[]'));
          const payload = { file_url: fileUrl, description: newDesc.trim() };
          if(previews.length) payload.previews = previews;
          updatePayload.content = JSON.stringify(payload);
        }

        const { error } = await sb.from('posts').update(updatePayload).eq('id', id);
        if(error){ alert('Failed to update: ' + error.message); return; }
        loadCrosshairGallery(cat, q);
      });
    });

    container.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if(!confirm('Delete this crosshair post? This cannot be undone.')) return;
        const id = btn.getAttribute('data-id');
        const { error } = await sb.from('posts').delete().eq('id', id);
        if(error){ alert('Failed to delete: ' + error.message); return; }
        loadCrosshairGallery(cat, q);
      });
    });
  } catch(e) {
    if(container) container.innerHTML = `<div class="gallery-empty">Failed to load gallery.</div>`;
  }
}

async function loadFileGallery(cat, searchQuery){
  const container = document.getElementById('fileGallery');
  if(!container || typeof sb === 'undefined') return;
  const q = (searchQuery || '').trim();

  try {
    const currentUser = typeof getSessionUser === 'function' ? await getSessionUser() : null;

    let query = sb
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username,display_name,avatar_url)')
      .eq('status', 'published')
      .eq('category', cat)
      .order('created_at', { ascending: false })
      .limit(50);
    if(q) query = query.ilike('title', `%${q}%`);

    const { data, error } = await query;

    if(error){ container.innerHTML = `<div class="gallery-empty">Failed to load: ${escapeHtml(error.message)}</div>`; return; }
    if(!data.length){ container.innerHTML = `<div class="gallery-empty">${q ? 'No posts match your search.' : 'Nothing posted here yet. Be the first!'}</div>`; return; }
    if(document.getElementById('fileGallery') !== container) return; /* navigated away */

    const { counts: reactionCounts, mine: myReactions, saved: mySaves } = await fetchReactionData(data.map(p => p.id), currentUser?.id);

    container.innerHTML = data.map(p => {
      const isOwner = currentUser && p.author_id === currentUser.id;
      let files = [{ file_url: p.content, file_name: '' }];
      let description = '';
      let isJsonContent = false;
      try {
        const parsed = JSON.parse(p.content);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.files) && parsed.files.length) {
            files = parsed.files.map(f => ({ file_url: f.file_url, file_name: f.file_name || '' }));
            description = parsed.description || '';
            isJsonContent = true;
          } else if (parsed.file_url) {
            files = [{ file_url: parsed.file_url, file_name: parsed.file_name || '' }];
            description = parsed.description || '';
            isJsonContent = true;
          }
        }
      } catch (e) { /* not JSON — treat content as a plain file URL, as before */ }

      const isMulti = files.length > 1;
      const downloadButtonsHtml = files.map((f, idx) => {
        const urlExt = (f.file_url || '').split('.').pop().split(/[?#]/)[0];
        const safeExt = /^[a-z0-9]{1,8}$/i.test(urlExt) ? urlExt.toLowerCase() : '';
        const baseName = (f.file_name ? f.file_name.replace(/\.[a-z0-9]{1,8}$/i, '') : (p.title || 'file')).replace(/[^a-z0-9-_]+/gi, '_').toLowerCase();
        const filename = safeExt ? `${baseName}.${safeExt}` : baseName;
        const label = isMulti ? (f.file_name || `File ${idx + 1}`) : 'Download';
        return `<button class="gallery-btn" data-action="download-remote" data-url="${encodeURIComponent(f.file_url)}" data-filename="${encodeURIComponent(filename)}">${isMulti ? '\u2913 ' + escapeHtml(label) : label}</button>`;
      }).join('');

      return `
      <div class="file-card" data-post-id="${p.id}">
        <div class="file-icon">📄</div>
        <div class="file-info">
          <div class="gallery-title">${escapeHtml(p.title)}</div>
          <div class="gallery-meta">by ${escapeHtml(p.profiles?.display_name || '?')} · ${formatDate(p.created_at)}${isMulti ? ` · ${files.length} files` : ''}</div>
          ${isJsonContent ? `<div class="gallery-desc" id="desc-${p.id}" style="display:none;">${description ? escapeHtml(description) : 'No description provided.'}</div>` : ''}
        </div>
        <div class="gallery-actions">
          ${reactionButtonsHtml(p.id, reactionCounts[p.id], myReactions[p.id], mySaves[p.id])}
          ${isJsonContent ? `<button class="gallery-btn" data-action="toggle-desc" data-id="${p.id}">Description</button>` : ''}
          ${downloadButtonsHtml}
          ${isOwner ? `
            <button class="gallery-btn" data-action="edit" data-id="${p.id}" data-title="${escapeHtml(p.title)}" data-desc="${encodeURIComponent(description)}" data-isjson="${isJsonContent ? '1' : '0'}" data-files="${encodeURIComponent(JSON.stringify(files))}">Edit</button>
            <button class="gallery-btn" data-action="delete" data-id="${p.id}">Delete</button>
          ` : ''}
        </div>
      </div>
    `;
    }).join('');
    wireCardNavigation(container);
    wireReactionButtons(container, currentUser, () => loadFileGallery(cat, q));

    container.querySelectorAll('[data-action="download-remote"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = decodeURIComponent(btn.getAttribute('data-url'));
        const filename = decodeURIComponent(btn.getAttribute('data-filename'));
        downloadFileByUrl(url, filename, btn);
      });
    });

    container.querySelectorAll('[data-action="toggle-desc"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const el = document.getElementById(`desc-${id}`);
        if (!el) return;
        const showing = el.style.display !== 'none';
        el.style.display = showing ? 'none' : 'block';
        btn.textContent = showing ? 'Description' : 'Hide Description';
      });
    });

    container.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const currentTitle = btn.getAttribute('data-title');
        const isJson = btn.getAttribute('data-isjson') === '1';

        const newTitle = prompt('Edit title:', currentTitle);
        if (newTitle === null) return; /* cancelled */
        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle) { alert('Title cannot be empty.'); return; }

        const updatePayload = { title: trimmedTitle };

        if (isJson) {
          const currentDesc = decodeURIComponent(btn.getAttribute('data-desc') || '');
          const newDesc = prompt('Edit description:', currentDesc);
          if (newDesc === null) return; /* cancelled */
          const files = JSON.parse(decodeURIComponent(btn.getAttribute('data-files') || '[]'));
          if (files.length > 1) {
            updatePayload.content = JSON.stringify({ files, description: newDesc.trim() });
          } else {
            const f = files[0] || { file_url: '', file_name: '' };
            updatePayload.content = JSON.stringify({ file_url: f.file_url, file_name: f.file_name, description: newDesc.trim() });
          }
        }

        const { error } = await sb.from('posts').update(updatePayload).eq('id', id);
        if(error){ alert('Failed to update: ' + error.message); return; }
        loadFileGallery(cat, q);
      });
    });

    container.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if(!confirm('Delete this post? This cannot be undone.')) return;
        const id = btn.getAttribute('data-id');
        const { error } = await sb.from('posts').delete().eq('id', id);
        if(error){ alert('Failed to delete: ' + error.message); return; }
        loadFileGallery(cat, q);
      });
    });
  } catch(e) {
    if(container) container.innerHTML = `<div class="gallery-empty">Failed to load gallery.</div>`;
  }
}

async function loadCssGallery(searchQuery){
  const container = document.getElementById('cssGallery');
  if(!container || typeof sb === 'undefined') return;
  const cat = 'css-ready';
  const q = (searchQuery || '').trim();

  try {
    const currentUser = typeof getSessionUser === 'function' ? await getSessionUser() : null;

    let query = sb
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username,display_name,avatar_url)')
      .eq('status', 'published')
      .eq('category', cat)
      .order('created_at', { ascending: false })
      .limit(24);
    if(q) query = query.ilike('title', `%${q}%`);

    const { data, error } = await query;

    if(error){ container.innerHTML = `<div class="gallery-empty">Failed to load: ${escapeHtml(error.message)}</div>`; return; }
    if(!data.length){ container.innerHTML = `<div class="gallery-empty">${q ? 'No posts match your search.' : 'Nothing posted here yet. Be the first!'}</div>`; return; }
    if(document.getElementById('cssGallery') !== container) return; /* navigated away */

    const { counts: reactionCounts, mine: myReactions, saved: mySaves } = await fetchReactionData(data.map(p => p.id), currentUser?.id);

    container.innerHTML = data.map(p => {
      let parsed = null;
      try { parsed = JSON.parse(p.content); } catch(e) { /* legacy/plain content */ }
      const previews = parsed?.previews || [];
      const fileUrl = parsed?.file_url || (parsed ? null : p.content);
      const fileName = parsed?.file_name || (p.title || 'file') + '.txt';
      const description = parsed?.description || '';
      const isOwner = currentUser && p.author_id === currentUser.id;

      const previewHtml = previews.length
        ? `<img class="gallery-canvas" src="${escapeHtml(previews[0])}" alt="${escapeHtml(p.title)}">`
        : `<div class="gallery-canvas" style="display:flex;align-items:center;justify-content:center;color:var(--text-2);font-size:24px;">📄</div>`;

      return `
      <div class="gallery-card" data-post-id="${p.id}">
        ${previewHtml}
        ${previews.length > 1 ? `<div class="gallery-meta">+${previews.length - 1} more preview${previews.length - 1 > 1 ? 's' : ''}</div>` : ''}
        <div class="gallery-title">${escapeHtml(p.title)}</div>
        <div class="gallery-meta">by ${escapeHtml(p.profiles?.display_name || '?')} · ${formatDate(p.created_at)}</div>
        ${parsed ? `<div class="gallery-desc" id="css-desc-${p.id}" style="display:none;">${description ? escapeHtml(description) : 'No description provided.'}</div>` : ''}
        <div class="gallery-actions">
          ${reactionButtonsHtml(p.id, reactionCounts[p.id], myReactions[p.id], mySaves[p.id])}
          ${parsed ? `<button class="gallery-btn" data-action="toggle-desc" data-id="${p.id}">Description</button>` : ''}
          ${fileUrl ? `<button class="gallery-btn" data-action="download-remote" data-url="${encodeURIComponent(fileUrl)}" data-filename="${encodeURIComponent(fileName)}">Download</button>` : ''}
          ${isOwner ? `
            <button class="gallery-btn" data-action="edit" data-id="${p.id}" data-title="${escapeHtml(p.title)}" data-desc="${encodeURIComponent(description)}" data-isjson="${parsed ? '1' : '0'}" data-fileurl="${encodeURIComponent(fileUrl || '')}" data-filename="${encodeURIComponent(parsed?.file_name || '')}" data-previews="${encodeURIComponent(JSON.stringify(previews))}">Edit</button>
            <button class="gallery-btn" data-action="delete" data-id="${p.id}">Delete</button>
          ` : ''}
        </div>
      </div>
    `;
    }).join('');
    wireCardNavigation(container);
    wireReactionButtons(container, currentUser, () => loadCssGallery(q));

    container.querySelectorAll('[data-action="download-remote"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = decodeURIComponent(btn.getAttribute('data-url'));
        const filename = decodeURIComponent(btn.getAttribute('data-filename'));
        downloadFileByUrl(url, filename, btn);
      });
    });

    container.querySelectorAll('[data-action="toggle-desc"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const el = document.getElementById(`css-desc-${id}`);
        if (!el) return;
        const showing = el.style.display !== 'none';
        el.style.display = showing ? 'none' : 'block';
        btn.textContent = showing ? 'Description' : 'Hide Description';
      });
    });

    container.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const currentTitle = btn.getAttribute('data-title');
        const isJson = btn.getAttribute('data-isjson') === '1';

        const newTitle = prompt('Edit name:', currentTitle);
        if (newTitle === null) return; /* cancelled */
        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle) { alert('Name cannot be empty.'); return; }

        const updatePayload = { title: trimmedTitle };

        if (isJson) {
          const currentDesc = decodeURIComponent(btn.getAttribute('data-desc') || '');
          const newDesc = prompt('Edit description:', currentDesc);
          if (newDesc === null) return; /* cancelled */
          const fileUrl = decodeURIComponent(btn.getAttribute('data-fileurl') || '');
          const fileName = decodeURIComponent(btn.getAttribute('data-filename') || '');
          const previews = JSON.parse(decodeURIComponent(btn.getAttribute('data-previews') || '[]'));
          updatePayload.content = JSON.stringify({ file_url: fileUrl, file_name: fileName, previews, description: newDesc.trim() });
        }

        const { error } = await sb.from('posts').update(updatePayload).eq('id', id);
        if(error){ alert('Failed to update: ' + error.message); return; }
        loadCssGallery(q);
      });
    });

    container.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if(!confirm('Delete this post? This cannot be undone.')) return;
        const id = btn.getAttribute('data-id');
        const { error } = await sb.from('posts').delete().eq('id', id);
        if(error){ alert('Failed to delete: ' + error.message); return; }
        loadCssGallery(q);
      });
    });
  } catch(e) {
    if(container) container.innerHTML = `<div class="gallery-empty">Failed to load gallery.</div>`;
  }
}

function describe(node, main, path){
  if(node.children && node.children.length){
    return `Browse the subsections under ${path.slice(0,-1).map(n=>n.label).join(' / ') || main.label} — pick one below to open its page.`;
  }
  return `Resource page for ${node.label}, filed under ${main.label}${path.length>2 ? ' / ' + path.slice(1,-1).map(n=>n.label).join(' / ') : ''}.`;
}

/* ---------------- render: all ---------------- */
function renderAll(){
  renderTabs();
  renderTree();
  renderContent();
}

expanded.add(DATA[0].id);
renderAll();
