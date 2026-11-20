
"use strict";

/* USTATOP — JAVASCRIPT */

const $ = (selector) => document.querySelector(selector);

const services = [
  {id:1,name:"Professional elektrik xizmati",category:"Ta'mirlash",price:150000,rating:4.9,city:"Toshkent",reviews:120,badge:"TOP MUTAXASSIS",image:"photo-1621905251189-08b45d6a269e"},
  {id:2,name:"Santexnik xizmatlari",category:"Uy xizmatlari",price:100000,rating:4.8,city:"Toshkent",reviews:95,badge:"OMMABOP",image:"photo-1607472586893-edb57bdc0e39"},
  {id:3,name:"Kompyuter ta'mirlash",category:"IT xizmatlari",price:120000,rating:5,city:"Toshkent",reviews:80,badge:"TOP MUTAXASSIS",image:"photo-1581091226825-a6a2a5aee158"},
  {id:4,name:"Professional uy tozalash",category:"Uy xizmatlari",price:200000,rating:4.7,city:"Samarqand",reviews:65,badge:"ISHONCHLI",image:"photo-1581578731548-c64695cc6952"},
  {id:5,name:"Mebel yig'ish ustasi",category:"Ta'mirlash",price:180000,rating:4.9,city:"Samarqand",reviews:74,badge:"TAJRIBALI",image:"photo-1530124566582-a618bc2615dc"},
  {id:6,name:"Matematika repetitori",category:"Ta'lim",price:80000,rating:5,city:"Toshkent",reviews:110,badge:"TOP REYTING",image:"photo-1509062522246-3755977927d7"},
  {id:7,name:"Telefon ta'mirlash",category:"IT xizmatlari",price:90000,rating:4.8,city:"Buxoro",reviews:55,badge:"OMMABOP",image:"photo-1512499617640-c74ae3a79d37"},
  {id:8,name:"Avtomobil ustasi",category:"Avtomobil",price:250000,rating:4.9,city:"Toshkent",reviews:89,badge:"ISHONCHLI",image:"photo-1486262715619-67b85e0b08d3"},
  {id:9,name:"Interyer dizayner",category:"IT xizmatlari",price:350000,rating:4.9,city:"Toshkent",reviews:47,badge:"PREMIUM",image:"photo-1600210492486-724fe5c67fb0"},
  {id:10,name:"Ingliz tili o'qituvchisi",category:"Ta'lim",price:100000,rating:5,city:"Andijon",reviews:140,badge:"TOP REYTING",image:"photo-1524178232363-1fb2b075b655"},
  {id:11,name:"Konditsioner ta'mirlash",category:"Ta'mirlash",price:130000,rating:4.7,city:"Toshkent",reviews:52,badge:"ISHONCHLI",image:"photo-1631545806609-6c7d1b9a7a2d"},
  {id:12,name:"Avtomobil yuvish",category:"Avtomobil",price:70000,rating:4.8,city:"Samarqand",reviews:73,badge:"OMMABOP",image:"photo-1607860108855-64acf2078ed9"}
];

const categories = [
  {name:"Ta'mirlash",icon:"🔧"},
  {name:"Uy xizmatlari",icon:"🏠"},
  {name:"IT xizmatlari",icon:"💻"},
  {name:"Ta'lim",icon:"📚"},
  {name:"Avtomobil",icon:"🚘"},
  {name:"Boshqa xizmatlar",icon:"💼"}
];

let currentPage = "home";
let activeCategory = "Barchasi";
let searchQuery = "";
let sortType = "popular";

function readStorage(key,fallback){
  try{
    const value=localStorage.getItem(key);
    return value?JSON.parse(value):fallback;
  }catch{return fallback;}
}

let favorites=readStorage("ustatop_favorites",[]);
let orders=readStorage("ustatop_orders",[]);
let user=readStorage("ustatop_user",null);

function saveStorage(key,value){
  localStorage.setItem(key,JSON.stringify(value));
}

function money(number){
  return new Intl.NumberFormat("uz-UZ").format(number)+" so'm";
}

function escapeHTML(value){
  return String(value??"").replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
}

function imageURL(id){
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=85`;
}

function showToast(message){
  const toast=$("#toast");
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.remove("show"),2600);
}

/* NAVIGATION */

function renderPage(page,options={}){
  const pages={home:homePage,services:servicesPage,experts:expertsPage,about:aboutPage};
  if(!pages[page])return;

  currentPage=page;

  if(!options.keepFilters){
    activeCategory="Barchasi";
    searchQuery="";
    sortType="popular";
  }

  $("#appView").innerHTML=pages[page]();

  document.querySelectorAll("[data-page]").forEach(button=>{
    button.classList.toggle("active",button.dataset.page===page);
  });

  $("#mobileNav").classList.remove("open");
  window.scrollTo(0,0);
  updateFavoriteCount();
}

document.addEventListener("click",event=>{
  const button=event.target.closest("[data-page]");
  if(!button)return;
  event.preventDefault();
  renderPage(button.dataset.page);
});

/* CATEGORIES */

function categoryCards(){
  return `<div class="category-grid">
    ${categories.map(category=>{
      const count=services.filter(s=>s.category===category.name).length;
      return `<button class="category-card" data-category="${escapeHTML(category.name)}">
        <span class="category-icon">${category.icon}</span>
        <strong>${escapeHTML(category.name)}</strong>
        <small>${count?count+" ta xizmat":"Tez orada"}</small>
      </button>`;
    }).join("")}
  </div>`;
}

/* SERVICE CARDS */

function serviceCard(service){
  const liked=favorites.includes(service.id);

  return `<article class="service-card">
    <div class="service-image">
      <img src="${imageURL(service.image)}" alt="${escapeHTML(service.name)}"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://placehold.co/800x500/efedff/6955e8?text=UstaTop'">
      <span class="service-badge">${escapeHTML(service.badge)}</span>
      <button class="heart-btn ${liked?"active":""}" data-favorite="${service.id}" aria-label="Sevimli">
        ${liked?"♥":"♡"}
      </button>
    </div>
    <div class="service-body">
      <span class="service-category">${escapeHTML(service.category)}</span>
      <h3 class="service-title">${escapeHTML(service.name)}</h3>
      <div class="service-info">
        <span>📍 ${escapeHTML(service.city)}</span>
        <span class="rating">★ ${service.rating} (${service.reviews})</span>
      </div>
      <div class="service-bottom">
        <div class="price">${money(service.price)}<small>boshlang'ich narx</small></div>
        <button class="order-btn" data-order="${service.id}">Buyurtma ↗</button>
      </div>
    </div>
  </article>`;
}

/* FILTERS */

function filteredServices(){
  let result=[...services];

  if(activeCategory!=="Barchasi"){
    result=result.filter(s=>s.category===activeCategory);
  }

  if(searchQuery){
    const query=searchQuery.toLowerCase();
    result=result.filter(s=>
      `${s.name} ${s.category} ${s.city}`.toLowerCase().includes(query)
    );
  }

  if(sortType==="rating")result.sort((a,b)=>b.rating-a.rating);
  if(sortType==="cheap")result.sort((a,b)=>a.price-b.price);
  if(sortType==="expensive")result.sort((a,b)=>b.price-a.price);

  return result;
}

function filtersHTML(){
  const names=["Barchasi",...categories.filter(c=>services.some(s=>s.category===c.name)).map(c=>c.name)];

  return `<div class="filter-list">
    ${names.map(name=>`<button class="filter-btn ${activeCategory===name?"active":""}" data-filter="${escapeHTML(name)}">${escapeHTML(name)}</button>`).join("")}
  </div>`;
}

function resultsHTML(){
  const result=filteredServices();

  if(!result.length){
    return `<div class="empty-state">
      <div style="font-size:40px">🔎</div>
      <h3>Hech narsa topilmadi</h3>
      <p>Boshqa qidiruv so'zini tanlang.</p>
      <button class="primary-btn" data-reset>Filtrlarni tozalash</button>
    </div>`;
  }

  return `<div class="service-grid">${result.map(serviceCard).join("")}</div>`;
}

function catalogControls(){
  return `${filtersHTML()}
    <div class="section-heading">
      <div><span class="section-tag">NATIJALAR</span><h2>${filteredServices().length} ta xizmat</h2></div>
      <select class="sort-select" id="sortSelect">
        <option value="popular">Ommabop</option>
        <option value="rating">Yuqori reyting</option>
        <option value="cheap">Arzon narx</option>
        <option value="expensive">Qimmat narx</option>
      </select>
    </div>
    <div id="catalogResults">${resultsHTML()}</div>`;
}

/* BENEFITS */

function benefitsHTML(){
  const items=[
    ["🛡️","Ishonchli mutaxassislar","Mutaxassislarning reytingi va mijozlar fikrlarini ko'ring."],
    ["⚡","Tez va qulay","Kerakli xizmatni toping va bir necha daqiqada buyurtma bering."],
    ["💳","Ochiq narxlar","Xizmat narxlarini oldindan ko'rib, o'zingizga mosini tanlang."]
  ];

  return `<div class="benefit-grid">${items.map(i=>`
    <article class="benefit-card">
      <div class="benefit-icon">${i[0]}</div><h3>${i[1]}</h3><p>${i[2]}</p>
    </article>`).join("")}</div>`;
}

function joinBanner(){
  return `<section class="join-section"><div class="container join-content">
    <div><span class="section-tag">USTATOP HAMJAMIYATI</span>
      <h2>O'z xizmatingizni<br>rivojlantirish vaqti keldi.</h2>
      <p>Mutaxassis sifatida ro'yxatdan o'ting va yangi mijozlarni toping.</p>
      <button class="white-btn" data-join>Mutaxassis bo'lish ↗</button>
    </div><div style="font-size:100px;opacity:.8">✦</div>
  </div></section>`;
}

/* HOME */

function homePage(){
  return `<div class="page">
    <section class="hero"><div class="container hero-grid">
      <div>
        <div class="hero-label"><span class="live-dot"></span> O'ZBEKISTONNING XIZMATLAR PLATFORMASI</div>
        <h1>Yaxshi xizmat.<br><span>To'g'ri tanlov.</span></h1>
        <p class="hero-description">Hayotingizni osonlashtiring. Ishonchli mutaxassislarni toping, xizmatlarni taqqoslang va buyurtma bering.</p>
        <form class="search-box" id="homeSearch">
          <span class="search-symbol">⌕</span>
          <input name="search" placeholder="Masalan: Elektrik, santexnik...">
          <button type="submit">Qidirish →</button>
        </form>
        <div class="popular-search"><span>Ommabop:</span>
          <button data-quick-search="Elektrik">Elektrik</button>
          <button data-quick-search="Santexnik">Santexnik</button>
          <button data-quick-search="Kompyuter">Kompyuter</button>
        </div>
        <div class="hero-stats">
          <div><strong>500<span>+</span></strong><small>Mutaxassislar</small></div>
          <div><strong>20<span>+</span></strong><small>Xizmat turlari</small></div>
          <div><strong>4.9</strong><small>O'rtacha reyting</small></div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-photo"><img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=85" alt="Mutaxassis"></div>
        <div class="floating-card floating-top"><div class="floating-icon">✓</div><div><strong>Ishonchli ustalar</strong><small>Qulay xizmat tanlovi</small></div></div>
        <div class="floating-card floating-bottom"><div class="floating-icon">★</div><div><strong>4.9 / 5 reyting</strong><small>Mijozlar bahosi</small></div></div>
      </div>
    </div></section>

    <section class="container section">
      <div class="section-heading"><div><span class="section-tag">KATEGORIYALAR</span><h2>Qanday xizmat kerak?</h2><p>O'zingizga mos xizmat yo'nalishini tanlang.</p></div>
        <button class="text-link" data-page="services">Barchasini ko'rish →</button>
      </div>${categoryCards()}
    </section>

    <section class="catalog-section"><div class="container section">
      <div class="section-heading"><div><span class="section-tag">TAVSIYA ETILGAN</span><h2>Ommabop xizmatlar</h2><p>Ko'p tanlanayotgan mutaxassislar.</p></div>
        <button class="text-link" data-page="experts">Barcha mutaxassislar →</button>
      </div>
      <div class="service-grid">${services.slice(0,6).map(serviceCard).join("")}</div>
    </div></section>

    <section class="container section"><div class="section-heading"><div><span class="section-tag">NIMA UCHUN USTATOP?</span><h2>Qulaylik — birinchi o'rinda.</h2></div></div>${benefitsHTML()}</section>
    ${joinBanner()}
  </div>`;
}

/* SERVICES PAGE */

function servicesPage(){
  return `<div class="page"><section class="container section">
    <div class="section-heading"><div><span class="section-tag">USTATOP KATALOGI</span><h2>Barcha xizmatlar</h2><p>Kerakli xizmatni qidiring va tanlang.</p></div></div>
    <form class="search-box" id="catalogSearch" style="max-width:100%;margin-bottom:40px">
      <span class="search-symbol">⌕</span><input name="search" value="${escapeHTML(searchQuery)}" placeholder="Xizmat nomi yoki shahar..."><button type="submit">Qidirish →</button>
    </form>
    <div class="section-heading"><div><span class="section-tag">YO'NALISHLAR</span><h2>Xizmat kategoriyalari</h2></div></div>
    ${categoryCards()}<div style="margin-top:65px">${catalogControls()}</div>
  </section>${joinBanner()}</div>`;
}

/* EXPERTS PAGE */

function expertsPage(){
  return `<div class="page catalog-section"><section class="container section">
    <div class="section-heading"><div><span class="section-tag">BIZNING MUTAXASSISLAR</span><h2>Professional ustalar</h2><p>Turli yo'nalishdagi mutaxassislarni toping.</p></div></div>
    <form class="search-box" id="expertSearch" style="max-width:100%;margin-bottom:35px">
      <span class="search-symbol">⌕</span><input name="search" value="${escapeHTML(searchQuery)}" placeholder="Mutaxassis yoki xizmat nomi..."><button type="submit">Qidirish →</button>
    </form>${catalogControls()}
  </section></div>`;
}

/* ABOUT PAGE */

function aboutPage(){
  return `<div class="page"><section class="container section">
    <div class="about-banner"><div><span class="section-tag">BIZ HAQIMIZDA</span>
      <h2>UstaTop — qulay hayot sari bir qadam.</h2>
      <p>Biz mijozlar va professional xizmat ko'rsatuvchilarni bitta qulay platformada birlashtiramiz.</p>
    </div><div class="about-symbol">✦</div></div>
    <div class="section-heading"><div><span class="section-tag">BIZNING MAQSADIMIZ</span><h2>Nega UstaTop?</h2></div></div>
    ${benefitsHTML()}
  </section>${joinBanner()}</div>`;
}

/* CATALOG EVENTS */

function refreshCatalog(){
  const results=$("#catalogResults");
  if(!results)return;

  results.innerHTML=resultsHTML();

  document.querySelectorAll("[data-filter]").forEach(button=>{
    button.classList.toggle("active",button.dataset.filter===activeCategory);
  });

  const heading=document.querySelector("#appView .section-heading h2");
  if(heading && heading.closest(".catalog-count")){}
}

$("#appView").addEventListener("click",event=>{
  const category=event.target.closest("[data-category]");
  const filter=event.target.closest("[data-filter]");
  const favorite=event.target.closest("[data-favorite]");
  const order=event.target.closest("[data-order]");
  const quick=event.target.closest("[data-quick-search]");

  if(category){
    if(category.dataset.category==="Boshqa xizmatlar"){showToast("Tez orada qo'shiladi.");return;}
    activeCategory=category.dataset.category;
    searchQuery="";
    renderPage("services",{keepFilters:true});
    return;
  }

  if(filter){activeCategory=filter.dataset.filter;refreshCatalog();return;}
  if(favorite){toggleFavorite(Number(favorite.dataset.favorite));return;}
  if(order){openBooking(Number(order.dataset.order));return;}

  if(quick){
    searchQuery=quick.dataset.quickSearch;
    activeCategory="Barchasi";
    renderPage("services",{keepFilters:true});
    return;
  }

  if(event.target.closest("[data-reset]")){
    activeCategory="Barchasi";searchQuery="";sortType="popular";
    renderPage(currentPage,{keepFilters:true});
    return;
  }

  if(event.target.closest("[data-join]"))openJoinForm();
});

$("#appView").addEventListener("submit",event=>{
  const form=event.target;
  if(!["homeSearch","catalogSearch","expertSearch"].includes(form.id))return;

  event.preventDefault();
  searchQuery=String(new FormData(form).get("search")||"").trim();
  activeCategory="Barchasi";

  if(currentPage==="home")renderPage("services",{keepFilters:true});
  else refreshCatalog();
});

$("#appView").addEventListener("change",event=>{
  if(event.target.id==="sortSelect"){
    sortType=event.target.value;
    refreshCatalog();
  }
});

/* FAVORITES — TO'LIQ ISHLAYDI */

function updateFavoriteCount(){
  $("#favoriteCount").textContent=favorites.length;
}

function toggleFavorite(id){
  if(favorites.includes(id)){
    favorites=favorites.filter(item=>item!==id);
    showToast("Sevimlilardan olib tashlandi.");
  }else{
    favorites.push(id);
    showToast("Sevimlilarga qo'shildi.");
  }

  saveStorage("ustatop_favorites",favorites);
  updateFavoriteCount();

  if(!$("#modal").classList.contains("hidden")){
    showFavorites();
  }else{
    renderPage(currentPage,{keepFilters:true});
  }
}

function showFavorites(){
  const list=services.filter(item=>favorites.includes(item.id));

  openModal(`<h2>❤️ Sevimli xizmatlar</h2>
    <p class="modal-subtitle">Saqlangan xizmatlaringiz.</p>
    ${list.length?list.map(item=>`
      <div class="favorite-row">
        <img src="${imageURL(item.image)}" alt="">
        <div><strong>${escapeHTML(item.name)}</strong><span>${money(item.price)}</span></div>
        <button class="heart-btn active" data-favorite="${item.id}" title="Sevimlilardan o'chirish">♥</button>
      </div>
    `).join(""):`<div class="empty-state"><div style="font-size:40px">♡</div><h3>Sevimlilar bo'sh</h3><p>Yoqtirgan xizmatlaringizni yurakcha orqali saqlang.</p></div>`}
  `);
}

/* MODAL */

function openModal(content){
  $("#modalContent").innerHTML=content;
  $("#modal").classList.remove("hidden");
  document.body.style.overflow="hidden";
}

function closeModal(){
  $("#modal").classList.add("hidden");
  document.body.style.overflow="";
}

$("#modalClose").addEventListener("click",closeModal);
$("#modalBackdrop").addEventListener("click",closeModal);

document.addEventListener("keydown",event=>{
  if(event.key==="Escape")closeModal();
});

function openBooking(id){
  const service=services.find(item=>item.id===id);
  if(!service)return;

  openModal(`<h2>Buyurtma berish</h2>
    <p class="modal-subtitle">${escapeHTML(service.name)} — ${money(service.price)} dan boshlab.</p>
    <form id="bookingForm" data-service="${service.id}">
      <label>Ismingiz</label><input name="name" required minlength="2" placeholder="Ismingiz" value="${user?escapeHTML(user.name):""}">
      <label>Telefon raqamingiz</label><input name="phone" type="tel" required placeholder="+998 90 123 45 67">
      <label>Manzilingiz</label><input name="address" required placeholder="Shahar, tuman, ko'cha">
      <label>Qo'shimcha izoh</label><textarea name="note" rows="3"></textarea>
      <button class="primary-btn" type="submit">Buyurtmani yuborish</button>
    </form>`);
}

function openLogin(){
  openModal(`<h2>Profilga kirish</h2><p class="modal-subtitle">Demo profil yaratish.</p>
    <form id="loginForm">
      <label>Ismingiz</label><input name="name" required minlength="2" placeholder="Ismingiz">
      <label>Telefon raqamingiz</label><input name="phone" type="tel" required placeholder="+998 90 123 45 67">
      <button class="primary-btn" type="submit">Davom etish</button>
    </form>`);
}

function openJoinForm(){
  openModal(`<h2>Mutaxassis bo'lish</h2><p class="modal-subtitle">Ariza qoldiring.</p>
    <form id="joinForm">
      <label>Ism va familiya</label><input name="name" required>
      <label>Telefon raqami</label><input name="phone" type="tel" required>
      <label>Xizmat yo'nalishi</label>
      <select name="category" required><option value="">Tanlang</option>
        ${categories.filter(c=>c.name!=="Boshqa xizmatlar").map(c=>`<option>${escapeHTML(c.name)}</option>`).join("")}
      </select>
      <label>Tajriba haqida</label><textarea name="about" required rows="3"></textarea>
      <button class="primary-btn" type="submit">Arizani yuborish</button>
    </form>`);
}

/* FORM SUBMISSIONS */

$("#modalContent").addEventListener("submit",event=>{
  event.preventDefault();
  const form=event.target;
  const data=Object.fromEntries(new FormData(form).entries());

  if(form.id==="bookingForm"){
    const service=services.find(item=>item.id===Number(form.dataset.service));
    orders.push({id:Date.now(),service:service.name,...data,status:"Yangi",createdAt:new Date().toISOString()});
    saveStorage("ustatop_orders",orders);

    if(!user){
      user={name:data.name,phone:data.phone};
      saveStorage("ustatop_user",user);
      updateLoginButton();
    }

    closeModal();
    showToast("Buyurtmangiz saqlandi!");
  }

  if(form.id==="loginForm"){
    user=data;
    saveStorage("ustatop_user",user);
    updateLoginButton();
    closeModal();
    showToast("Profil yaratildi!");
  }

  if(form.id==="joinForm"){
    const applications=readStorage("ustatop_applications",[]);
    applications.push({...data,createdAt:new Date().toISOString()});
    saveStorage("ustatop_applications",applications);
    closeModal();
    showToast("Arizangiz saqlandi!");
  }
});

/* PROFILE */

function updateLoginButton(){
  $("#loginBtn").textContent=user?user.name.split(" ")[0]:"Kirish";
}

$("#loginBtn").addEventListener("click",()=>{
  if(!user){openLogin();return;}

  openModal(`<h2>Salom, ${escapeHTML(user.name)}!</h2>
    <p class="modal-subtitle">Telefon: ${escapeHTML(user.phone)}</p>
    <p class="modal-subtitle">Buyurtmalar: ${orders.length} ta</p>
    <button class="primary-btn" id="logoutBtn">Profildan chiqish</button>`);
});

$("#modalContent").addEventListener("click",event=>{
  const favorite=event.target.closest("[data-favorite]");

  if(favorite){
    toggleFavorite(Number(favorite.dataset.favorite));
    return;
  }

  if(event.target.closest("#logoutBtn")){
    user=null;
    localStorage.removeItem("ustatop_user");
    updateLoginButton();
    closeModal();
    showToast("Profildan chiqdingiz.");
  }
});

/* THEME */

function applyTheme(theme){
  document.body.classList.toggle("dark",theme==="dark");
  $("#themeBtn").textContent=theme==="dark"?"☀":"☾";
  localStorage.setItem("ustatop_theme",theme);
}

$("#themeBtn").addEventListener("click",()=>{
  applyTheme(document.body.classList.contains("dark")?"light":"dark");
});

/* MOBILE MENU */

$("#menuBtn").addEventListener("click",()=>{
  $("#mobileNav").classList.toggle("open");
});

$("#favoritesBtn").addEventListener("click",showFavorites);

/* START */

applyTheme(localStorage.getItem("ustatop_theme")||"light");
updateFavoriteCount();
updateLoginButton();
renderPage("home");
