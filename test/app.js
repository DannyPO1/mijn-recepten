(() => {
  'use strict';
  const APP_VERSION = '1.7.1';
  const DB_NAME = 'mijn-recepten-test-db';
  const DB_VERSION = 1;
  const STORE = 'appState';
  const STATE_KEY = 'main';
  const $ = (id) => document.getElementById(id);
  const uid = () => (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  const days = [
    {key:'ma',label:'Maandag',short:'MA'}, {key:'di',label:'Dinsdag',short:'DI'},
    {key:'wo',label:'Woensdag',short:'WO'}, {key:'do',label:'Donderdag',short:'DO'},
    {key:'vr',label:'Vrijdag',short:'VR'}, {key:'za',label:'Zaterdag',short:'ZA'}, {key:'zo',label:'Zondag',short:'ZO'}
  ];
  const defaultState = () => ({version:1,recipes:[
    {id:uid(),name:'Havermout-bananenpannenkoeken',category:'Ontbijt',servings:4,prep:5,cook:15,description:'Ontbijt om vooruit te maken.',ingredients:[{id:uid(),name:'Eieren',qty:'4',unit:'stuks',optional:false},{id:uid(),name:'Havermout',qty:'260',unit:'g',optional:false},{id:uid(),name:'Bananen',qty:'4',unit:'stuks',optional:false}],steps:[{id:uid(),text:'Prak de bananen en meng met de eieren en havermout.'},{id:uid(),text:'Bak kleine pannenkoeken in een licht ingevette koekenpan tot ze aan beide kanten gaar zijn.'}],notes:'Hoeveelheden voor vier porties. Pas de ingrediënten aan als jouw eigen recept afwijkt.',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
    {id:uid(),name:'Mexicaanse vulling',category:'Avondeten',servings:4,prep:15,cook:25,description:'Basis voor bijvoorbeeld wraps of een rijstschotel.',ingredients:[],steps:[],notes:'Vul hier de ingrediënten en bereidingsstappen van jouw eerdere recept in.',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
    {id:uid(),name:'Kip-flatbread',category:'Avondeten',servings:2,prep:15,cook:15,description:'Een gerecht met kip en flatbread.',ingredients:[],steps:[],notes:'Vul hier jouw exacte recept in.',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
    {id:uid(),name:'Kip met rijst',category:'Avondeten',servings:2,prep:10,cook:25,description:'Een basisgerecht dat je naar wens kunt aanpassen.',ingredients:[],steps:[],notes:'Vul hier jouw exacte recept in.',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
  ],week:{},shopping:[],lastExport:null});

  let db = null;
  let state = null;
  let activeCategory = 'Alles';
  let pendingImport = null;
  let pendingRecipeImport = null;
  let toastTimer = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('Deze browser ondersteunt geen IndexedDB.'));
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE, {keyPath:'key'});
      };
      request.onsuccess = () => { db = request.result; resolve(db); };
      request.onerror = () => reject(request.error || new Error('Opslag kon niet worden geopend.'));
    });
  }
  function readState() {
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(STATE_KEY);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  }
  function writeState() {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({key:STATE_KEY,value:state});
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Opslaan mislukt.'));
      tx.onabort = () => reject(tx.error || new Error('Opslaan afgebroken.'));
    });
  }
  async function persist() {
    try { await writeState(); }
    catch (err) { console.error(err); showToast('Opslaan is niet gelukt. Maak een back-up en probeer opnieuw.'); }
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function showToast(message) {
    const el = $('toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }
  const THEME_KEY = 'mijn-recepten-test-theme';
  function applyTheme(theme, announce=false) {
    const chosen = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = chosen;
    try { localStorage.setItem(THEME_KEY, chosen); } catch (_) {}
    const button = $('themeToggle');
    const icon = $('themeToggleIcon');
    const meta = $('themeColorMeta');
    if (button) {
      button.setAttribute('aria-label', chosen === 'dark' ? 'Lichte modus inschakelen' : 'Donkere modus inschakelen');
      button.setAttribute('title', chosen === 'dark' ? 'Lichte modus inschakelen' : 'Donkere modus inschakelen');
    }
    if (icon) icon.textContent = chosen === 'dark' ? '☀' : '☾';
    if (meta) meta.setAttribute('content', chosen === 'dark' ? '#171a17' : '#f7f5ef');
    if (announce) showToast(chosen === 'dark' ? 'Donkere modus ingeschakeld' : 'Lichte modus ingeschakeld');
  }
  function initTheme() {
    let saved = 'light';
    try { saved = localStorage.getItem(THEME_KEY) || 'light'; } catch (_) {}
    applyTheme(saved);
  }

  function navigate(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.nav === name));
    if (name === 'recipes') renderRecipes();
    if (name === 'week') renderWeek();
    if (name === 'shopping') renderShopping();
    if (name === 'home') renderHome();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function recipeIcon(category) { return ({'Ontbijt':'🥞','Lunch':'🥪','Avondeten':'🍽️','Mealprep':'🥡','Snack':'🍎','Overig':'✨','Kinderen':'🧒','Bijgerecht':'🥕','Mexicaans':'🌮','Rijst & Bowls':'🍚','Wraps & Flatbreads':'🌯','Pasta':'🍝','Salades':'🥗','Kip':'🍗'})[category] || '🍴'; }
  function categoryLabel(category) { return `${recipeIcon(category)} ${category || 'Overig'}`; }
  function totalMinutes(recipe) { return (Number(recipe.prep)||0) + (Number(recipe.cook)||0); }
  function recipePhoto(recipe) {
    const name = (recipe.name || '').toLocaleLowerCase('nl');
    const category = (recipe.category || '').toLocaleLowerCase('nl');
    if (name.includes('pannenkoek') || name.includes('havermout')) return 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=82';
    if (name.includes('kip') || category.includes('kip')) return 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=82';
    if (name.includes('mexica') || name.includes('wrap') || name.includes('flatbread') || category.includes('mexica') || category.includes('wrap')) return 'https://images.unsplash.com/photo-1551509966-5e6b0a9f4b1e?auto=format&fit=crop&w=900&q=82';
    if (name.includes('salade') || category.includes('salade')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82';
    if (name.includes('pasta') || category.includes('pasta')) return 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=82';
    if (name.includes('rijst') || name.includes('bowl') || category.includes('rijst')) return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=82';
    if (category.includes('ontbijt')) return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=82';
    return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82';
  }
  function renderCard(recipe) {
    const ingredientCount = (recipe.ingredients || []).filter(i => i.name && i.name.trim()).length;
    const photo = recipePhoto(recipe);
    return `<article class="recipe-card" data-open-recipe="${esc(recipe.id)}" tabindex="0" role="button" aria-label="Open ${esc(recipe.name)}"><div class="recipe-art"><img class="recipe-photo" src="${photo}" alt="" loading="lazy" onerror="this.style.display='none'"><span class="category-pill">${esc(recipe.category || 'Overig')}</span></div><div class="recipe-card-body"><h3>${esc(recipe.name)}</h3><p class="recipe-description">${esc(recipe.description || (ingredientCount ? ingredientCount + ' ingrediënten' : 'Recept nog aanvullen'))}</p><div class="recipe-meta"><span>◷ ${totalMinutes(recipe)} min.</span><span>♧ ${Number(recipe.servings)||1} porties</span></div></div></article>`;
  }
  function renderHome() {
    $('recipeCount').textContent = `${state.recipes.length} ${state.recipes.length === 1 ? 'recept' : 'recepten'}`;
    $('shoppingCount').textContent = `${state.shopping.length} artikelen`;
    const recent = [...state.recipes].sort((a,b) => (b.updatedAt||'').localeCompare(a.updatedAt||'')).slice(0,4);
    $('recentRecipes').innerHTML = recent.length ? recent.map(renderCard).join('') : `<div class="empty-small">Je recepten verschijnen hier zodra je ze toevoegt.</div>`;
  }
  function renderFilters() {
    const categories = ['Alles',...new Set(state.recipes.map(r=>r.category || 'Overig'))];
    $('categoryFilters').innerHTML = categories.map(c=>`<button class="filter-chip ${activeCategory===c?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
  }
  function renderRecipes() {
    renderFilters();
    const q = $('recipeSearch').value.trim().toLocaleLowerCase('nl');
    const list = state.recipes.filter(r => (activeCategory === 'Alles' || (r.category||'Overig') === activeCategory) && (!q || [r.name,r.description,r.category,...(r.ingredients||[]).map(i=>i.name)].join(' ').toLocaleLowerCase('nl').includes(q)));
    $('allRecipes').innerHTML = list.map(renderCard).join('');
    $('recipesEmpty').classList.toggle('hidden', list.length > 0);
    $('allRecipes').classList.toggle('hidden', list.length === 0);
  }
  function openRecipeEditor(recipe=null) {
    $('recipeForm').reset(); $('recipeId').value = recipe?.id || '';
    $('recipeDialogTitle').textContent = recipe ? 'Recept aanpassen' : 'Nieuw recept';
    $('recipeName').value = recipe?.name || '';
    $('recipeCategory').value = recipe?.category || 'Avondeten';
    $('recipeServings').value = recipe?.servings || 2;
    $('recipePrep').value = recipe?.prep ?? 10; $('recipeCook').value = recipe?.cook ?? 20;
    $('recipeDescription').value = recipe?.description || ''; $('recipeNotes').value = recipe?.notes || '';
    $('ingredientEditor').innerHTML = ''; $('stepEditor').innerHTML = '';
    (recipe?.ingredients?.length ? recipe.ingredients : [{name:'',qty:'',unit:''}]).forEach(addIngredientRow);
    (recipe?.steps?.length ? recipe.steps : [{text:''}]).forEach(addStepRow);
    $('recipeDialog').showModal();
  }
  function addIngredientRow(item={}) {
    const row = document.createElement('div'); row.className = 'ingredient-row';
    row.innerHTML = `<input class="ing-name" aria-label="Ingrediënt" placeholder="Ingrediënt" value="${esc(item.name||'')}"><input class="ing-qty" aria-label="Hoeveelheid" inputmode="decimal" placeholder="Aantal" value="${esc(item.qty??'')}"><input class="ing-unit" aria-label="Eenheid" placeholder="Eenheid" value="${esc(item.unit||'')}"><button type="button" class="remove-row" aria-label="Ingrediënt verwijderen">×</button>`;
    row.querySelector('.remove-row').addEventListener('click',()=>{row.remove();if(!$('ingredientEditor').children.length)addIngredientRow();});
    $('ingredientEditor').appendChild(row);
  }
  function addStepRow(item={}) {
    const row = document.createElement('div'); row.className = 'step-row';
    row.innerHTML = `<span class="step-number">${$('stepEditor').children.length+1}</span><textarea class="step-text" rows="2" placeholder="Beschrijf deze stap…">${esc(item.text||'')}</textarea><button type="button" class="remove-row" aria-label="Stap verwijderen">×</button>`;
    row.querySelector('.remove-row').addEventListener('click',()=>{row.remove();if(!$('stepEditor').children.length)addStepRow();renumberSteps();});
    $('stepEditor').appendChild(row);
  }
  function renumberSteps() { [...$('stepEditor').children].forEach((r,i)=>r.querySelector('.step-number').textContent=i+1); }
  async function saveRecipe(event) {
    event.preventDefault();
    const id = $('recipeId').value || uid();
    const old = state.recipes.find(r=>r.id===id);
    const ingredients = [...$('ingredientEditor').querySelectorAll('.ingredient-row')].map(row=>({id:uid(),name:row.querySelector('.ing-name').value.trim(),qty:row.querySelector('.ing-qty').value.trim(),unit:row.querySelector('.ing-unit').value.trim(),optional:false})).filter(i=>i.name);
    const steps = [...$('stepEditor').querySelectorAll('.step-row')].map(row=>({id:uid(),text:row.querySelector('.step-text').value.trim()})).filter(s=>s.text);
    const recipe = {id,name:$('recipeName').value.trim(),category:$('recipeCategory').value,servings:Math.max(1,Number($('recipeServings').value)||1),prep:Math.max(0,Number($('recipePrep').value)||0),cook:Math.max(0,Number($('recipeCook').value)||0),description:$('recipeDescription').value.trim(),ingredients,steps,notes:$('recipeNotes').value.trim(),createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
    if (!recipe.name) return;
    if (old) state.recipes = state.recipes.map(r=>r.id===id?recipe:r); else state.recipes.unshift(recipe);
    await persist(); $('recipeDialog').close(); renderAll(); showToast(old?'Recept bijgewerkt':'Recept opgeslagen');
  }
  function openRecipeDetail(id) {
    const r = state.recipes.find(x=>x.id===id); if (!r) return;
    const ingredients = (r.ingredients||[]).filter(i=>i.name);
    $('recipeDetail').innerHTML = `<div class="detail-cover"><span>${recipeIcon(r.category)}</span><button type="button" class="icon-button" id="closeDetail" aria-label="Sluiten">×</button></div><div class="detail-content"><p class="eyebrow">${esc(r.category||'Overig').toLocaleUpperCase('nl')}</p><h2>${esc(r.name)}</h2><p class="muted">${esc(r.description||'Geen omschrijving toegevoegd.')}</p><div class="recipe-meta"><span>◷ ${totalMinutes(r)} min.</span><span>♧ ${r.servings} porties</span><span>${ingredients.length} ingrediënten</span></div><div class="detail-top-actions"><button type="button" class="primary-button" id="detailAddShopping">＋ Boodschappen</button><button type="button" class="secondary-button" id="detailEdit">Bewerken</button></div><div class="detail-section"><h3>Ingrediënten</h3>${ingredients.length?ingredients.map(i=>`<div class="detail-ingredient"><span>${esc(i.name)}</span><span>${esc([i.qty,i.unit].filter(Boolean).join(' '))}</span></div>`).join(''):'<p class="muted">Nog geen ingrediënten ingevuld. Bewerk het recept om ze toe te voegen.</p>'}</div><div class="detail-section"><h3>Bereiding</h3>${r.steps?.length?r.steps.map((s,i)=>`<div class="detail-step"><span class="detail-step-num">${i+1}</span><p>${esc(s.text)}</p></div>`).join(''):'<p class="muted">Nog geen bereidingsstappen toegevoegd.</p>'}</div>${r.notes?`<div class="detail-section"><h3>Eigen notities</h3><p class="muted">${esc(r.notes)}</p></div>`:''}<div class="button-row" style="margin-top:24px"><button type="button" class="secondary-button" id="detailPlan">Plan in weekmenu</button><button type="button" class="danger-button" id="detailDelete">Verwijderen</button></div></div>`;
    $('detailDialog').showModal();
    $('closeDetail').onclick=()=> $('detailDialog').close();
    $('detailEdit').onclick=()=>{ $('detailDialog').close(); openRecipeEditor(r); };
    $('detailAddShopping').onclick=async()=>{addRecipeToShopping(r,r.servings);await persist();$('detailDialog').close();renderAll();navigate('shopping');showToast('Ingrediënten toegevoegd');};
    $('detailPlan').onclick=()=>{ $('detailDialog').close(); openWeekPicker(null,r.id); };
    $('detailDelete').onclick=async()=>{if(confirm(`Weet je zeker dat je “${r.name}” wilt verwijderen?`)){state.recipes=state.recipes.filter(x=>x.id!==id);Object.keys(state.week).forEach(k=>{if(state.week[k]?.recipeId===id)delete state.week[k];});await persist();$('detailDialog').close();renderAll();showToast('Recept verwijderd');}};
  }
  function renderWeek() {
    $('weekDays').innerHTML = days.map(d=>{
      const meal = state.week[d.key]; const recipe = meal && state.recipes.find(r=>r.id===meal.recipeId);
      return `<div class="week-day"><div class="day-label"><strong>${d.label}</strong><small>${d.short}</small></div><div class="week-meal">${recipe?`<strong>${esc(recipe.name)}</strong><small>${meal.servings} personen · ${totalMinutes(recipe)} min.</small>`:`<strong class="muted">Nog niets gepland</strong><small>Voeg een gerecht toe</small>`}</div><button class="day-add" data-week-day="${d.key}" aria-label="${recipe?'Wijzig':'Voeg toe'} op ${d.label}">${recipe?'⋯':'＋'}</button></div>`;
    }).join('');
  }
  function openWeekPicker(dayKey, recipeId='') {
    $('weekDayKey').value=dayKey||'';
    $('weekRecipeSelect').innerHTML='<option value="">Selecteer een recept…</option>'+state.recipes.map(r=>`<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
    const current = dayKey ? state.week[dayKey] : null;
    $('weekRecipeSelect').value=recipeId || current?.recipeId || '';
    $('weekServings').value=current?.servings||state.recipes.find(r=>r.id===recipeId)?.servings||2;
    $('removeWeekMeal').classList.toggle('hidden',!current);
    $('weekPickerDialog').showModal();
  }
  async function saveWeekMeal(event) {
    event.preventDefault(); const key=$('weekDayKey').value; const recipeId=$('weekRecipeSelect').value; if(!key){showToast('Kies eerst een dag in het weekmenu.');return;}
    if(recipeId) state.week[key]={recipeId,servings:Math.max(1,Number($('weekServings').value)||1)}; else delete state.week[key];
    await persist();$('weekPickerDialog').close();renderWeek();renderHome();showToast('Weekmenu bijgewerkt');
  }
  function normalizeName(name) { return String(name||'').trim().toLocaleLowerCase('nl').replace(/\s+/g,' '); }
  function parseQty(value) {
    if(value===undefined||value===null||String(value).trim()==='')return null;
    const str=String(value).trim().replace(',','.'); const m=str.match(/^(-?\d+(?:\.\d+)?)$/); return m?Number(m[1]):null;
  }
  function unitKey(unit) { const u=normalizeName(unit); const aliases={gram:'g',grammen:'g',gr:'g',kilogram:'kg',kilo:'kg',milliliter:'ml',milliliter:'ml',liter:'l',st:'stuks',stuk:'stuks',eieren:'stuks',el:'el',eetlepel:'el',eetlepels:'el',tl:'tl',theelepel:'tl',theelepels:'tl',blikje:'blik',blikjes:'blik'}; return aliases[u]||u; }
  function canConvert(a,b) { const x=unitKey(a),y=unitKey(b); if(x===y)return true; return ({kg:['g'],g:['kg'],l:['ml'],ml:['l'],el:['tl'],tl:['el']})[x]?.includes(y)||false; }
  function convertQty(q,from,to) { const x=unitKey(from),y=unitKey(to); if(x===y)return q; if(x==='kg'&&y==='g')return q*1000;if(x==='g'&&y==='kg')return q/1000;if(x==='l'&&y==='ml')return q*1000;if(x==='ml'&&y==='l')return q/1000;if(x==='el'&&y==='tl')return q*3;if(x==='tl'&&y==='el')return q/3;return q; }
  function formatQty(n) { if(Math.abs(n-Math.round(n))<0.00001)return String(Math.round(n)); return String(Math.round(n*100)/100).replace('.',','); }
  function buildShoppingFromWeek() {
    const items=[];
    Object.entries(state.week).forEach(([dayKey,meal])=>{
      const r=state.recipes.find(x=>x.id===meal.recipeId); if(!r)return;
      const ratio=(Number(meal.servings)||r.servings||1)/(Number(r.servings)||1);
      (r.ingredients||[]).forEach(ing=>{
        if(!ing.name?.trim())return;
        const qty=parseQty(ing.qty); const unit=ing.unit||''; const name=ing.name.trim();
        const sourceDetail={recipeName:r.name,qty:qty===null?null:qty*ratio,unit};
        const existing=items.find(i=>normalizeName(i.name)===normalizeName(name) && (unitKey(i.unit)===unitKey(unit)||canConvert(i.unit,unit)) && i.qty!==null && qty!==null);
        if(existing){
          const add=convertQty(qty*ratio,unit,existing.unit);existing.qty+=add;
          existing.sources=[...new Set([...(existing.sources||[]),r.name])];
          existing.sourceDetails.push({...sourceDetail,qty:qty===null?null:convertQty(qty*ratio,unit,existing.unit),unit:existing.unit});
        } else items.push({id:uid(),name,qty:qty===null?null:qty*ratio,unit,checked:false,group:guessGroup(name),sources:[r.name],sourceDetails:[sourceDetail],note:qty===null?'Hoeveelheid naar smaak of niet opgegeven':''});
      });
    });
    return items.map(i=>({...i,displayQty:i.qty===null?'':formatQty(i.qty)}));
  }
  function guessGroup(name) {
    const n=normalizeName(name);
    if(/kip|kipfilet|gehakt|rund|vlees|ei|eieren|vis|zalm/.test(n))return 'Vlees, vis & eieren';
    if(/ui|knoflook|paprika|tomaat|sla|wortel|komkommer|courgette|groente|citroen|limoen|banaan|aardappel|koriander|peterselie|spinazie/.test(n))return 'Groente & fruit';
    if(/rijst|pasta|wrap|flatbread|brood|havermout|bloem|meel|noedel|couscous/.test(n))return 'Granen & brood';
    if(/melk|yoghurt|kaas|room|boter/.test(n))return 'Zuivel';
    return 'Overig';
  }
  function seedLegacySourceDetails(item) {
    if(Array.isArray(item.sourceDetails) && item.sourceDetails.length)return item.sourceDetails;
    // Older shopping entries did not retain quantities per recipe. Keep their total under a neutral heading rather than inventing per-recipe quantities.
    item.sourceDetails=[{recipeName:'Overige boodschappen',qty:item.qty??null,unit:item.unit||''}];
    return item.sourceDetails;
  }
  function appendSourceDetails(target, incoming) {
    const details=seedLegacySourceDetails(target);
    const additions=Array.isArray(incoming.sourceDetails)&&incoming.sourceDetails.length?incoming.sourceDetails:[{recipeName:'Overige boodschappen',qty:incoming.qty??null,unit:incoming.unit||''}];
    target.sourceDetails=[...details,...additions];
  }
  async function createWeekShopping() {
    const generated=buildShoppingFromWeek(); if(!generated.length){showToast('Er zijn geen ingrediënten in je weekmenu gevonden.');return;}
    const existing=state.shopping; generated.forEach(g=>{
      const found=existing.find(x=>normalizeName(x.name)===normalizeName(g.name)&&unitKey(x.unit)===unitKey(g.unit));
      if(found && found.qty!==null && g.qty!==null){
        appendSourceDetails(found,g);
        found.qty+=g.qty;found.sources=[...new Set([...(found.sources||[]),...(g.sources||[])])];
      } else if(!found)existing.push(g);
    });
    state.shopping=existing;await persist();renderShopping();renderHome();navigate('shopping');showToast('Boodschappen uit weekmenu toegevoegd');
  }
  function addRecipeToShopping(recipe, targetServings) {
    const ratio=(Number(targetServings)||recipe.servings||1)/(Number(recipe.servings)||1);
    (recipe.ingredients||[]).filter(i=>i.name?.trim()).forEach(ing=>{
      const qty=parseQty(ing.qty);const unit=ing.unit||'';const name=ing.name.trim();
      const detail={recipeName:recipe.name,qty:qty===null?null:qty*ratio,unit};
      const found=state.shopping.find(x=>normalizeName(x.name)===normalizeName(name)&&unitKey(x.unit)===unitKey(unit)&&x.qty!==null&&qty!==null);
      if(found){appendSourceDetails(found,{sourceDetails:[detail],qty:detail.qty,unit});found.qty+=qty*ratio;found.sources=[...new Set([...(found.sources||[]),recipe.name])];}
      else state.shopping.push({id:uid(),name,qty:qty===null?null:qty*ratio,unit,checked:false,group:guessGroup(name),sources:[recipe.name],sourceDetails:[detail],note:''});
    });
  }
  function renderShopping() {
    const groups={};state.shopping.forEach(i=>(groups[i.group||'Overig']??=[]).push(i));
    const keys=Object.keys(groups).sort((a,b)=>['Groente & fruit','Vlees, vis & eieren','Zuivel','Granen & brood','Overig'].indexOf(a)-['Groente & fruit','Vlees, vis & eieren','Zuivel','Granen & brood','Overig'].indexOf(b));
    $('shoppingItems').innerHTML=state.shopping.length?keys.map(group=>`<div class="shopping-group"><h3>${esc(group)}</h3>${groups[group].map(i=>`<label class="shopping-item ${i.checked?'done':''}"><input type="checkbox" data-check-item="${esc(i.id)}" ${i.checked?'checked':''}><span class="item-name">${esc(i.name)}</span><span class="item-qty">${esc([i.qty===null?'':formatQty(i.qty),i.unit].filter(Boolean).join(' '))}</span><button type="button" data-delete-item="${esc(i.id)}" aria-label="Verwijder ${esc(i.name)}">×</button></label>`).join('')}</div>`).join(''):`<div class="empty-state"><div class="empty-icon">☷</div><h3>Je lijst is nog leeg</h3><p>Voeg een artikel toe of genereer boodschappen vanuit je weekmenu.</p><button class="secondary-button" data-nav="week">Naar weekmenu</button></div>`;
    $('shoppingTotal').textContent=state.shopping.length;$('shoppingDone').textContent=state.shopping.filter(i=>i.checked).length;
  }
  function shoppingText() {
    const byRecipe=new Map();
    state.shopping.filter(i=>!i.checked).forEach(item=>{
      const details=Array.isArray(item.sourceDetails)&&item.sourceDetails.length?item.sourceDetails:seedLegacySourceDetails(item);
      details.forEach(detail=>{
        const recipeName=(detail.recipeName||'Overige boodschappen').trim()||'Overige boodschappen';
        if(!byRecipe.has(recipeName))byRecipe.set(recipeName,new Map());
        const ingredients=byRecipe.get(recipeName);
        const key=normalizeName(item.name)+'|'+unitKey(detail.unit||item.unit||'');
        const qty=detail.qty===undefined?item.qty:detail.qty;
        const unit=detail.unit||item.unit||'';
        if(ingredients.has(key)){
          const old=ingredients.get(key);
          if(old.qty!==null&&qty!==null&&unitKey(old.unit)===unitKey(unit))old.qty+=qty;
          else if(old.qty===null&&qty!==null){old.qty=qty;old.unit=unit;}
        } else ingredients.set(key,{name:item.name,qty:qty===undefined?null:qty,unit});
      });
    });
    return [...byRecipe.entries()].map(([recipe,ingredients])=>[recipe,...[...ingredients.values()].map(i=>`- ${i.name}${i.qty!==null&&i.qty!==undefined?' — '+formatQty(i.qty)+(i.unit?' '+i.unit:''):i.unit?' — '+i.unit:''}`)].join('\n')).join('\n\n');
  }
  async function shareShopping() {
    const text=shoppingText();if(!text){showToast('Geen openstaande boodschappen om te delen.');return;}
    if(navigator.share){try{await navigator.share({title:'Boodschappen — Mijn Recepten',text});showToast('Deelmenu geopend');return;}catch(err){if(err?.name==='AbortError')return;}}
    try{await navigator.clipboard.writeText(text);showToast('Lijst gekopieerd. Open Opdrachten of plak de lijst.');}
    catch{downloadBlob(new Blob([text],{type:'text/plain;charset=utf-8'}),'boodschappen.txt');showToast('Tekstbestand gemaakt om te delen.');}
  }
  function downloadBlob(blob, filename) {
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function makeBackup() {
    const backup={app:'Mijn Recepten',schemaVersion:1,exportedAt:new Date().toISOString(),data:state};
    const date=new Date().toISOString().slice(0,10);
    downloadBlob(new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'}),`mijn-recepten-back-up-${date}.json`);
    state.lastExport=backup.exportedAt;persist();showToast('Back-upbestand aangemaakt. Bewaar het in iCloud Drive.');
  }
  function validateBackup(obj) {
    const data=obj?.data||obj;
    if(!data||!Array.isArray(data.recipes))throw new Error('Dit bestand bevat geen herkenbare receptenlijst.');
    if(data.recipes.some(r=>!r||typeof r.name!=='string'))throw new Error('Een of meer recepten zijn ongeldig.');
    return {version:1,recipes:data.recipes.map(r=>({...r,id:r.id||uid(),ingredients:Array.isArray(r.ingredients)?r.ingredients:[],steps:Array.isArray(r.steps)?r.steps:[],updatedAt:r.updatedAt||new Date().toISOString()})),week:data.week&&typeof data.week==='object'?data.week:{},shopping:Array.isArray(data.shopping)?data.shopping:[],lastExport:data.lastExport||null};
  }
  function mergeState(incoming) {
    const recipes=[...state.recipes];incoming.recipes.forEach(r=>{const index=recipes.findIndex(x=>x.id===r.id||normalizeName(x.name)===normalizeName(r.name));if(index>=0)recipes[index]={...recipes[index],...r,id:recipes[index].id};else recipes.push(r);});
    const shopping=[...state.shopping];incoming.shopping.forEach(i=>{if(!shopping.some(x=>normalizeName(x.name)===normalizeName(i.name)&&unitKey(x.unit)===unitKey(i.unit)))shopping.push({...i,id:i.id||uid()});});
    state={version:1,recipes,week:{...state.week,...incoming.week},shopping,lastExport:state.lastExport};
  }
  async function handleImport(file) {
    if(!file)return;
    try {const parsed=JSON.parse(await file.text());pendingImport=validateBackup(parsed);$('importSummary').textContent=`Bestand bevat ${pendingImport.recipes.length} recepten, ${Object.keys(pendingImport.week).length} geplande maaltijden en ${pendingImport.shopping.length} boodschappenartikelen.`;$('importOptions').classList.remove('hidden');showToast('Back-up gecontroleerd. Kies samenvoegen of vervangen.');}
    catch(err){pendingImport=null;$('importOptions').classList.add('hidden');showToast(err.message||'Dit bestand kan niet worden gelezen.');}
    $('importFile').value='';
  }
  function normalizeImportedRecipe(raw) {
    if(!raw || typeof raw.name !== 'string' || !raw.name.trim()) throw new Error('Elk recept moet een naam hebben.');
    const ingredients = Array.isArray(raw.ingredients) ? raw.ingredients.map(item => {
      if(typeof item === 'string') return {id:uid(),name:item.trim(),qty:'',unit:'',optional:false};
      if(!item || typeof item.name !== 'string' || !item.name.trim()) throw new Error(`Ongeldig ingrediënt in recept “${raw.name}”.`);
      return {id:item.id||uid(),name:item.name.trim(),qty:item.qty===null?'':String(item.qty??''),unit:String(item.unit??''),optional:Boolean(item.optional)};
    }).filter(i=>i.name) : [];
    const steps = Array.isArray(raw.steps) ? raw.steps.map(step => typeof step === 'string' ? {id:uid(),text:step.trim()} : {id:step?.id||uid(),text:String(step?.text??step?.instruction??'').trim()}).filter(s=>s.text) : [];
    const now=new Date().toISOString();
    return {id:raw.id||uid(),name:raw.name.trim(),category:['Ontbijt','Lunch','Avondeten','Mealprep','Snack','Overig','Kinderen','Bijgerecht','Mexicaans','Rijst & Bowls','Wraps & Flatbreads','Pasta','Salades','Kip'].includes(raw.category)?raw.category:'Overig',servings:Math.max(1,Number(raw.servings)||2),prep:Math.max(0,Number(raw.prep)||0),cook:Math.max(0,Number(raw.cook)||0),description:String(raw.description||''),ingredients,steps,notes:String(raw.notes||''),createdAt:raw.createdAt||now,updatedAt:now};
  }
  async function handleRecipeImport(file) {
    if(!file)return;
    try {
      const parsed=JSON.parse(await file.text());
      const rawRecipes=Array.isArray(parsed)?parsed:(Array.isArray(parsed?.recipes)?parsed.recipes:(Array.isArray(parsed?.data?.recipes)?parsed.data.recipes:null));
      if(!rawRecipes) throw new Error('Geen recepten gevonden. Gebruik een JSON-bestand met een recipes-lijst.');
      if(!rawRecipes.length) throw new Error('Het bestand bevat nog geen recepten.');
      pendingRecipeImport=rawRecipes.map(normalizeImportedRecipe);
      const existingNames=new Set(state.recipes.map(r=>normalizeName(r.name)));
      const newCount=pendingRecipeImport.filter(r=>!existingNames.has(normalizeName(r.name))).length;
      const duplicateCount=pendingRecipeImport.length-newCount;
      $('recipeImportSummary').textContent=`${pendingRecipeImport.length} recepten gevonden: ${newCount} nieuw en ${duplicateCount} met een naam die al bestaat. Voorbeeld: ${pendingRecipeImport.slice(0,5).map(r=>r.name).join(', ')}${pendingRecipeImport.length>5?'…':''}.`;
      $('recipeImportOptions').classList.remove('hidden');
      showToast('Receptenbestand gecontroleerd. Kies hoe je wilt importeren.');
    } catch(err) {pendingRecipeImport=null;$('recipeImportOptions').classList.add('hidden');showToast(err.message||'Dit receptenbestand kan niet worden gelezen.');}
    $('recipeImportFile').value='';
  }
  async function doRecipeImport(updateExisting) {
    if(!pendingRecipeImport?.length)return;
    const before=state.recipes.length;let added=0,updated=0,skipped=0;
    for(const imported of pendingRecipeImport) {
      const index=state.recipes.findIndex(r=>normalizeName(r.name)===normalizeName(imported.name));
      if(index<0) {state.recipes.unshift({...imported,id:uid()});added++;}
      else if(updateExisting) {state.recipes[index]={...state.recipes[index],...imported,id:state.recipes[index].id,createdAt:state.recipes[index].createdAt||imported.createdAt};updated++;}
      else skipped++;
    }
    pendingRecipeImport=null;$('recipeImportOptions').classList.add('hidden');
    await persist();renderAll();
    showToast(`Import klaar: ${added} toegevoegd, ${updated} bijgewerkt, ${skipped} overgeslagen.`);
  }
  async function doImport(mode) {
    if(!pendingImport)return;
    if(mode==='replace'&&!confirm('Dit vervangt alle huidige recepten, weekmenu-items en boodschappen. Maak eerst een back-up als je de huidige gegevens wilt bewaren. Doorgaan?'))return;
    if(mode==='merge')mergeState(pendingImport);else state=pendingImport;
    pendingImport=null;$('importOptions').classList.add('hidden');await persist();renderAll();showToast(mode==='merge'?'Back-up samengevoegd':'Back-up teruggezet');
  }
  function renderAll() {renderHome();renderRecipes();renderWeek();renderShopping();}
  document.querySelectorAll('[data-app-version]').forEach(el => { el.textContent = el.closest('.topbar') ? `v${APP_VERSION}` : APP_VERSION; });

  function bindEvents() {
    document.querySelectorAll('[data-nav]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.nav)));
    $('exportBackup').addEventListener('click',makeBackup);
    $('themeToggle').addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true));
    $('addRecipeTop').addEventListener('click',()=>openRecipeEditor());$('addRecipeEmpty').addEventListener('click',()=>openRecipeEditor());
    $('closeRecipe').addEventListener('click',()=> $('recipeDialog').close());$('cancelRecipe').addEventListener('click',()=> $('recipeDialog').close());$('recipeForm').addEventListener('submit',saveRecipe);
    $('addIngredient').addEventListener('click',()=>addIngredientRow());$('addStep').addEventListener('click',()=>{addStepRow();renumberSteps();});
    $('recipeSearch').addEventListener('input',renderRecipes);
    $('categoryFilters').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;activeCategory=b.dataset.category;renderRecipes();});
    document.body.addEventListener('click',e=>{const card=e.target.closest('[data-open-recipe]');if(card)openRecipeDetail(card.dataset.openRecipe);const day=e.target.closest('[data-week-day]');if(day)openWeekPicker(day.dataset.weekDay);const nav=e.target.closest('[data-nav]');if(nav&&!nav.classList.contains('tab'))navigate(nav.dataset.nav);});
    $('clearWeek').addEventListener('click',async()=>{if(confirm('Alle geplande maaltijden verwijderen?')){state.week={};await persist();renderWeek();showToast('Weekmenu leeggemaakt');}});
    $('weekPickerForm').addEventListener('submit',saveWeekMeal);$('closeWeekPicker').addEventListener('click',()=> $('weekPickerDialog').close());
    $('removeWeekMeal').addEventListener('click',async()=>{const key=$('weekDayKey').value;if(key)delete state.week[key];await persist();$('weekPickerDialog').close();renderWeek();showToast('Maaltijd verwijderd');});
    $('makeWeekList').addEventListener('click',createWeekShopping);
    $('clearShopping').addEventListener('click',async()=>{if(confirm('De volledige boodschappenlijst wissen?')){state.shopping=[];await persist();renderShopping();renderHome();showToast('Boodschappenlijst gewist');}});
    $('shoppingItems').addEventListener('change',async e=>{const cb=e.target.closest('[data-check-item]');if(!cb)return;const item=state.shopping.find(i=>i.id===cb.dataset.checkItem);if(item)item.checked=cb.checked;await persist();renderShopping();renderHome();});
    $('shoppingItems').addEventListener('click',async e=>{const b=e.target.closest('[data-delete-item]');if(!b)return;state.shopping=state.shopping.filter(i=>i.id!==b.dataset.deleteItem);await persist();renderShopping();renderHome();});
    $('addManualItem').addEventListener('click',addManualShopping);$('manualItem').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addManualShopping();}});$('shareShopping').addEventListener('click',shareShopping);
    $('importFile').addEventListener('change',e=>handleImport(e.target.files?.[0]));$('mergeImport').addEventListener('click',()=>doImport('merge'));$('replaceImport').addEventListener('click',()=>doImport('replace'));
    $('recipeImportFile').addEventListener('change',e=>handleRecipeImport(e.target.files?.[0]));$('importNewRecipes').addEventListener('click',()=>doRecipeImport(false));$('updateImportedRecipes').addEventListener('click',()=>doRecipeImport(true));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')return;const card=e.target.closest?.('[data-open-recipe]');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openRecipeDetail(card.dataset.openRecipe);}});
  }
  async function addManualShopping() {
    const input=$('manualItem');const name=input.value.trim();if(!name)return;
    state.shopping.push({id:uid(),name,qty:null,unit:'',checked:false,group:guessGroup(name),sources:['Handmatig'],note:''});input.value='';await persist();renderShopping();renderHome();showToast('Artikel toegevoegd');
  }
  async function init() {
    initTheme();
    bindEvents();
    try {await openDB();state=await readState();if(!state){state=defaultState();await persist();}}
    catch(err){console.error(err);showToast('Lokale opslag is niet beschikbaar. Probeer Safari en controleer de website-instellingen.');state=defaultState();}
    state.recipes=Array.isArray(state.recipes)?state.recipes:[];state.week=state.week||{};state.shopping=Array.isArray(state.shopping)?state.shopping:[];
    renderAll();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      let reloadingForUpdate = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloadingForUpdate) return;
        reloadingForUpdate = true;
        window.location.reload();
      });
      navigator.serviceWorker.register('./sw.js?v=1.6.0', { updateViaCache: 'none' })
        .then(registration => registration.update())
        .catch(err => console.warn('Service worker niet geregistreerd', err));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          navigator.serviceWorker.getRegistration('./').then(registration => registration?.update()).catch(() => {});
        }
      });
    }
  }
  init();
})();
