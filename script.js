import { db } from "./firebase-config.js";
import {
  collection, onSnapshot,
  doc as fsDoc, getDoc, updateDoc, addDoc, getDocs, orderBy, query
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { checkAuth } from "./auth.js";

// ===== VARIABLES =====
const shop           = document.getElementById("shop");
const startBtn       = document.getElementById("startBtn");
const music          = document.getElementById("bgMusic");
const musicPlayer    = document.getElementById("musicPlayer");
const playPauseBtn   = document.getElementById("playPause");
const volumeSlider   = document.getElementById("volume");
const closePlayerBtn = document.getElementById("closePlayer");
const pdfBtn         = document.getElementById("pdfBtn");
const pdfForm        = document.getElementById("pdfForm");
const confirmPDF     = document.getElementById("confirmPDF");
const cancelPDF      = document.getElementById("cancelPDF");

let invoice         = [];
let total           = 0;
let items           = [];
let currentCategory = 'all';
let currentUser     = null;
let userPoints      = 0;

music.volume = 0.3;

// ===== INIT =====
async function initShop() {
  currentUser = await checkAuth();

  const userSnap = await getDoc(fsDoc(db, "users", currentUser.uid));
  if (userSnap.exists()) {
    userPoints = userSnap.data().points || 0;
    document.getElementById("userPoints").textContent = userPoints;

   
    if (userSnap.data().role === "admin") {
      const adminBtn = document.createElement("button");
      adminBtn.textContent = "⚙️ Admin";
      adminBtn.onclick = () => window.location.href = "admin.html";
      adminBtn.style.cssText = `
        background: #af2121;
        color: #fff;
        padding: 8px 16px;
        border-radius: 50px;
        border: none;
        cursor: pointer;
        font-weight: 700;
        font-size: 13px;
        font-family: 'Outfit', sans-serif;
        transition: all 0.3s;
      `;
      adminBtn.onmouseover = () => adminBtn.style.boxShadow = "0 6px 20px rgba(175,33,33,0.5)";
      adminBtn.onmouseout  = () => adminBtn.style.boxShadow = "none";
      document.querySelector(".header-right").prepend(adminBtn);
    }
  }

  onSnapshot(collection(db, "items"), (snap) => {
    items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => a.cat.localeCompare(b.cat));
    const intro = document.getElementById("intro");
    if (intro && intro.style.display === "none") {
      renderShop(currentCategory);
    }
  });
}

initShop();

startBtn.addEventListener("click", () => {
  music.volume = 0.4;
  music.play().catch(e => console.log("خطأ:", e));

  const intro = document.getElementById("intro");
  intro.style.transition = "opacity 0.8s";
  intro.style.opacity = 0;

  setTimeout(() => {
    intro.style.display = "none";
    if (items.length > 0) {
      renderShop('all');
    } else {
      shop.innerHTML = `<p style="color:#c9a24d;text-align:center;grid-column:1/-1;">⏳ Loading...</p>`;
    }
    musicPlayer.classList.add("show");
  }, 800);
});

playPauseBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play().catch(e => console.log(e));
    playPauseBtn.textContent = "⏸";
  } else {
    music.pause();
    playPauseBtn.textContent = "▶";
  }
});
volumeSlider.addEventListener("input", () => { music.volume = volumeSlider.value; });
closePlayerBtn.addEventListener("click", () => { musicPlayer.classList.remove("show"); });

function renderShop(category) {
  currentCategory = category;
  shop.innerHTML  = "";
  let delay = 0;

  items.forEach(i => {
    if (category !== 'all' && i.cat !== category) return;
    if (i.status === "red") return;

    const card = document.createElement("div");
    card.className = "card";

    let qtyHTML = '';
    if (i.status !== "red") {
      qtyHTML = `
        <div class="qty-box" style="display:none">
          <input type="number" min="1" value="1" class="qtyInput">
          <button onclick="addItemFromInput(this,'${i.name.replace(/'/g,"\\'")}',${i.price},'${i.img}')">confirm</button>
        </div>`;
    }

    card.innerHTML = `
      <img src="${i.img}" width="100">
      <h3>${i.name}</h3>
      <p class="price-text">${i.price.toLocaleString()}$</p>
      ${i.cat === "drugs" ? `
        <p class="bulk-hint">
          ${i.name === "BOX Lyrika" ? `💡 1 = 590,000$💡<br>💡 2 = 585,000$💡<br>💡 3+ = 575,000$💡` :
            i.name === "BOX Heroin" ? `💡 1 = 570,000$💡<br>💡 2 = 565,000$💡<br>💡 3+ = 555,000$💡` : ""}
        </p>` : ""}
      <div class="status ${i.status}">
        ${i.status==="green"?"🟢 Available":i.status==="orange"?"🟠 Almost Sold Out":"🔴 Not Available"}
      </div>
      ${i.status!=="red"?`<button onclick="showQty(this)">Add</button>`:""}
      ${qtyHTML}
    `;
    shop.appendChild(card);
    setTimeout(() => card.classList.add("show"), delay);
    delay += 100;
  });
}


window.showQty = function(btn) {
  const box = btn.nextElementSibling;
  box.style.display = box.style.display === "flex" ? "none" : "flex";
};

window.addItemFromInput = function(btn, name, price, img) {
  const qty = parseInt(btn.previousElementSibling.value);
  if (!qty || qty <= 0) return;

  let finalPrice = price;
  if (name === "BOX Lyrika") {
    finalPrice = qty >= 3 ? 575000 : qty >= 2 ? 585000 : 590000;
  }
  if (name === "BOX Heroin") {
    finalPrice = qty >= 3 ? 555000 : qty >= 2 ? 565000 : 570000;
  }

  invoice.push({ name, qty, price: finalPrice * qty });
  total += finalPrice * qty;
  renderInvoice();
  btn.parentElement.style.display = "none";
  showCartNotif(name, img);
};


function showCartNotif(name, img) {
  const notif = document.getElementById("cartNotif");
  document.getElementById("cartNotifName").textContent = name;
  document.getElementById("cartNotifImg").src = img;
  notif.classList.add("show");
  setTimeout(() => notif.classList.remove("show"), 2500);
}


function renderInvoice() {
  const tbody = document.querySelector("#invoice tbody");
  tbody.innerHTML = "";
  total = 0;

  invoice.forEach((item, index) => {
    total += item.price;
    const tr = document.createElement("tr");
    tr.classList.add("invoice-add");
    tr.innerHTML = `
      <td>${item.name}${item.isPoints ? '<span class="points-invoice-badge">⭐ Points</span>' : ""}</td>
      <td>${item.qty}</td>
      <td>${item.price === 0 ? "FREE" : item.price < 0 ? "-" + Math.abs(item.price).toLocaleString() + "$" : item.price.toLocaleString() + "$"}</td>
      <td><button class="remove-btn" onclick="removeItem(${index})">✖</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("total").innerText = total.toLocaleString() + " $";
}


window.removeItem = async function(index) {
  const rows = document.querySelectorAll("#invoice tbody tr");
  rows[index].classList.add("invoice-remove");

  setTimeout(async () => {
    const item = invoice[index];
    if (item.isPoints && item.pointsCost) {
      userPoints += item.pointsCost;
      document.getElementById("userPoints").textContent = userPoints;
      document.getElementById("pointsStoreCount").textContent = userPoints;
      await updateDoc(fsDoc(db, "users", currentUser.uid), { points: userPoints });
      renderPointsStore();
    }
    invoice.splice(index, 1);
    renderInvoice();
  }, 420);
};

window.filterItems = function(category) {
  const pointsStore = document.getElementById("pointsStore");
  const shopGrid    = document.getElementById("shop");

  if (category === 'points') {
    pointsStore.style.display = "block";
    shopGrid.style.display    = "none";
    renderPointsStore();
  } else {
    pointsStore.style.display = "none";
    shopGrid.style.display    = "grid";
    renderShop(category);
  }
};


pdfBtn.addEventListener("click", () => {
  if (invoice.length === 0) {
    alert("❌ NO ITEMS IN INVOICE ❌");
    return;
  }
  pdfForm.style.display = "flex";
});

cancelPDF.addEventListener("click", () => {
  pdfForm.style.display = "none";
});


confirmPDF.addEventListener("click", async () => {
  const buyer = document.getElementById("buyerName").value.trim();
  const gang  = document.getElementById("gangName").value.trim();
  const radio = document.getElementById("radioName").value.trim();

  if (!buyer || !gang || !radio) {
    alert("❌ FILL ALL FIELDS ❌");
    return;
  }

  pdfForm.style.display = "none";

 
  try {
    await addDoc(collection(db, "users", currentUser.uid, "invoices"), {
      invoiceNumber: "CDF-" + Math.floor(100000 + Math.random() * 900000),
      buyer, gang, radio,
      items: invoice.map(i => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
        isPoints: i.isPoints || false
      })),
      total,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      createdAt: new Date()
    });
    const freshSnap = await getDoc(fsDoc(db, "users", currentUser.uid));
    await updateDoc(fsDoc(db, "users", currentUser.uid), {
      invoiceCount: (freshSnap.data().invoiceCount || 0) + 1
    });
  } catch(e) {
    console.log("Firestore error:", e);
  }


  const invoiceNumber = "CDF-" + Math.floor(100000 + Math.random() * 900000);
  const now  = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const W = 210; 
  const gold  = [201, 162, 77];
  const gold2 = [240, 208, 128];
  const dark  = [13,  13,  13];
  const dark2 = [17,  17,  17];
  const dark3 = [22,  22,  22];
  const gray  = [85,  85,  85];
  const white = [238, 238, 238];


  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 8, "F");


  doc.setFillColor(...gold);
  doc.rect(0, 8, W, 1.5, "F");


  doc.setFillColor(...dark);
  doc.rect(0, 9.5, W, 38, "F");


  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.circle(22, 25, 8);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  doc.text("C", 22, 28, { align: "center" });

  // CASA DI FERRO
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  doc.text("CASA DI FERRO", 34, 24);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text("GALAXY ROLEPLAY  .  GX", 34, 29);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold2);
  doc.text("INVOICE", W - 14, 23, { align: "right" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text(`No: ${invoiceNumber}`, W - 14, 29, { align: "right" });
  doc.text(`${date}  .  ${time}`, W - 14, 33, { align: "right" });

  doc.setFillColor(...gold);
  doc.rect(0, 47.5, W, 0.8, "F");

  // ===== BUYER INFO =====
  doc.setFillColor(...dark3);
  doc.rect(0, 48.3, W, 16, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text("BUYER", 14, 53);
  doc.text("GANG", 80, 53);
  doc.text("RADIO", 150, 53);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text(buyer, 14, 60);
  doc.text(gang,  80, 60);
  doc.text(radio, 150, 60);

  doc.setDrawColor(34, 34, 34);
  doc.setLineWidth(0.3);
  doc.line(0, 64.3, W, 64.3);

  // ===== TABLE HEADER =====
  doc.setFillColor(...dark);
  doc.rect(0, 64.3, W, 9, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  doc.text("ITEM",  14,  70);
  doc.text("QTY",   120, 70, { align: "center" });
  doc.text("PRICE", W - 14, 70, { align: "right" });

  // ===== TABLE ROWS =====
  let y = 73.3;
  invoice.forEach((item, i) => {
    const isDiscount = item.price < 0;
    const isPoints   = item.isPoints;
    const rowColor   = i % 2 === 0 ? dark2 : [20, 20, 20];

    doc.setFillColor(...rowColor);
    doc.rect(0, y, W, 10, "F");

    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.2);
    doc.line(0, y + 10, W, y + 10);

    const nameColor = isPoints ? gold : white;
    const priceColor = isDiscount || isPoints ? gold : white;

    doc.setFontSize(9);
    doc.setFont("helvetica", isPoints ? "bold" : "normal");
    doc.setTextColor(...nameColor);
    const itemName = item.name.length > 40 ? item.name.substring(0, 40) + "..." : item.name;
    doc.text(itemName + (isPoints ? " *" : ""), 14, y + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(String(item.qty), 120, y + 6.5, { align: "center" });

    const priceText = item.price === 0
      ? "FREE"
      : item.price < 0
        ? "-" + Math.abs(item.price).toLocaleString() + "$"
        : item.price.toLocaleString() + "$";

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...priceColor);
    doc.text(priceText, W - 14, y + 6.5, { align: "right" });

    y += 10;
  });

  // ===== TOTAL =====
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.line(0, y, W, y);

  doc.setFillColor(...dark);
  doc.rect(0, y, W, 14, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text("TOTAL", W - 50, y + 9);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold2);
  doc.text(total.toLocaleString() + "$", W - 14, y + 10, { align: "right" });

  y += 14;

  doc.setFillColor(...dark2);
  doc.rect(0, y, W, 38, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text("AUTHORIZED BY", 14, y + 8);

  const sigPoints = [
    [14,y+18],[20,y+13],[26,y+12],[32,y+17],[36,y+20],
    [40,y+17],[46,y+12],[52,y+15],[58,y+18],[64,y+15],
    [70,y+12],[76,y+16],[82,y+19],[88,y+16],[94,y+13],[100,y+15]
  ];
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.7);
  for (let i = 0; i < sigPoints.length - 1; i++) {
    doc.line(sigPoints[i][0], sigPoints[i][1], sigPoints[i+1][0], sigPoints[i+1][1]);
  }
  doc.setDrawColor(90, 62, 8);
  doc.setLineWidth(0.4);
  doc.line(14, y + 22, 100, y + 22);


  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  doc.text("RO CASSA DI FERRO", 14, y + 28);

  const cx = W - 30;
  const cy = y + 19;
  const r  = 16;

  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.circle(cx, cy, r);
  doc.setLineWidth(0.3);
  doc.circle(cx, cy, r - 4);

  [[0,-r],[0,r],[-r,0],[r,0]].forEach(([dx,dy]) => {
    doc.setFillColor(...gold);
    doc.circle(cx+dx, cy+dy, 0.6, "F");
  });

  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  doc.text("CASA DI FERRO", cx, cy - 5, { align: "center" });
  doc.setFontSize(4.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 128, 32);
  doc.text("OFFICIAL", cx, cy, { align: "center" });
  doc.setFontSize(4);
  doc.setTextColor(...gold);
  doc.text("GX · 2026", cx, cy + 5, { align: "center" });

  doc.setDrawColor(...gold);
  doc.setLineWidth(0.3);
  doc.line(cx - 8, cy + 2, cx + 8, cy + 2);

  y += 38;

  doc.setDrawColor(42, 42, 42);
  doc.setLineWidth(0.3);
  doc.line(14, y, W - 14, y);

  doc.setFillColor(13, 13, 13);
  doc.rect(0, y, W, 28, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text("— GX . 2026 —", W / 2, y + 8, { align: "center" });

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  doc.text("CASA DI FERRO", W / 2, y + 18, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text("LOS GALAXY", W / 2, y + 24, { align: "center" });

  y += 28;

  doc.setFillColor(...gold);
  doc.rect(0, y, W, 1.5, "F");
  doc.setFillColor(...dark);
  doc.rect(0, y + 1.5, W, 5, "F");


  doc.save(`CDF_Invoice_${invoiceNumber}.pdf`);
});


let visits = localStorage.getItem("visits");
visits = visits ? parseInt(visits) + 1 : 1;
localStorage.setItem("visits", visits);
const visitorCount = document.getElementById("visitorCount");
let currentCount = 0;
const counterInterval = setInterval(() => {
  if (currentCount < visits) { currentCount++; visitorCount.innerText = currentCount; }
  else clearInterval(counterInterval);
}, 50);


const searchBar     = document.getElementById("searchBar");
const searchResults = document.getElementById("searchResults");
const searchClear   = document.getElementById("searchClear");

function renderSearch(value) {
  searchResults.innerHTML = "";
  if (!value) {
    searchResults.style.display = "none";
    searchClear.style.display   = "none";
    return;
  }
  searchClear.style.display = "block";
  const filtered = items.filter(item => item.name.toLowerCase().startsWith(value));

  if (filtered.length === 0) {
    searchResults.innerHTML = `<div class="search-empty">🔍 No results for "${value}"</div>`;
    searchResults.style.display = "block";
    return;
  }

  filtered.forEach(item => {
    const div = document.createElement("div");
    div.className = "search-item";
    const isRed = item.status === "red";
    const statusText = item.status === "green"
      ? '<span class="search-item-status green">🟢 Available</span>'
      : item.status === "orange"
      ? '<span class="search-item-status orange">🟠 Almost Sold Out</span>'
      : '<span class="search-item-status red">🔴 Not Available</span>';

    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="search-item-info">
        <div class="search-item-name">${item.name}</div>
        <div class="search-item-price">${item.price.toLocaleString()}$</div>
        ${statusText}
      </div>
      <button class="search-add-btn"
        ${isRed ? 'disabled title="Not Available"' : ''}
        onclick="addFromSearch('${item.name.replace(/'/g,"\\'")}', ${item.price}, '${item.img}', this)">
        ${isRed ? '✖' : '+ Add'}
      </button>
    `;
    searchResults.appendChild(div);
  });
  searchResults.style.display = "block";
}

window.addFromSearch = function(name, price, img, btn) {
  invoice.push({ name, qty: 1, price });
  total += price;
  renderInvoice();
  showCartNotif(name, img);

  btn.textContent = "✔ Added";
  btn.style.background = "#2ecc71";
  btn.style.color = "#111";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "+ Add";
    btn.style.background = "#c9a24d";
    btn.style.color = "#111";
    btn.disabled = false;
  }, 1500);
};

window.clearSearch = function() {
  searchBar.value = "";
  searchResults.style.display = "none";
  searchClear.style.display   = "none";
  searchResults.innerHTML     = "";
};

searchBar.addEventListener("input", (e) => { renderSearch(e.target.value.toLowerCase().trim()); });
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-container")) searchResults.style.display = "none";
});
 
const pointsItems = [
  { id:"p1", name:"Discount 25%",      cost:10000, desc:"تخفيض 25% على فاتورتك",           type:"discount",      value:25 },
  { id:"p2", name:"Discount 50%",      cost:25000, desc:"تخفيض 50% على فاتورتك",           type:"discount",      value:50 },
  { id:"p3", name:"-50,000$ Off",      cost:50,  desc:"تخفيض ثابت 50,000$ من الفاتورة",  type:"fixed_discount", value:50000 },
  { id:"p4", name:"-100,000$ Off",     cost:100, desc:"تخفيض ثابت 100,000$ من الفاتورة", type:"fixed_discount", value:100000 },
  { id:"p7", name:"50x SMG Ammo",      cost:75,  desc:"FREE 50 SMG AMMO",             type:"ammo",          value:"SMG Ammo x50" },
  { id:"p8", name:"50x PISTOL Ammo",       cost:75,  desc:"FREE 50 PISTOL AMMO",              type:"ammo",          value:"PISTOL Ammo x50" },
];

function renderPointsStore() {
  const grid = document.getElementById("pointsStoreGrid");
  document.getElementById("pointsStoreCount").textContent = userPoints;
  grid.innerHTML = "";

  pointsItems.forEach((item, i) => {
    const canAfford = userPoints >= item.cost;
    const card = document.createElement("div");
    card.className = "points-card";
    card.innerHTML = `
      <h3>${item.name}</h3>
      <div class="points-cost">⭐ ${item.cost} pts</div>
      <p class="points-desc">${item.desc}</p>
      <button class="redeem-btn" ${!canAfford ? "disabled" : ""} onclick="redeemItem('${item.id}')">
        ${canAfford ? "🛒 Redeem" : "❌ Not enough pts"}
      </button>
    `;
    grid.appendChild(card);
    setTimeout(() => card.classList.add("show"), i * 100);
  });
}

window.redeemItem = async function(itemId) {
  const item = pointsItems.find(p => p.id === itemId);
  if (!item || userPoints < item.cost) return;

  if ((item.type === "discount" || item.type === "fixed_discount") && invoice.length === 0) {
    alert("❌ ADD ITEMS TO INVOICE FIRST ❌");
    return;
  }

  userPoints -= item.cost;
  await updateDoc(fsDoc(db, "users", currentUser.uid), { points: userPoints });
  document.getElementById("userPoints").textContent = userPoints;

  if (item.type === "discount") {
    const baseTotal = invoice.filter(i => !i.isPoints).reduce((sum, i) => sum + i.price, 0);
    const discountAmt = Math.floor(baseTotal * item.value / 100);
    invoice.push({ name:`Discount ${item.value}% (Points)`, qty:1, price:-discountAmt, isPoints:true, pointsCost:item.cost });
    renderInvoice();
    showCartNotif(`Discount ${item.value}%`, "images/logo.png");

  } else if (item.type === "fixed_discount") {
    invoice.push({ name:`-${item.value.toLocaleString()}$ Off (Points)`, qty:1, price:-item.value, isPoints:true, pointsCost:item.cost });
    renderInvoice();
    showCartNotif(`-${item.value.toLocaleString()}$ Off`, "images/logo.png");

  } else if (item.type === "item") {
    invoice.push({ name:`${item.value} (Points)`, qty:1, price:0, isPoints:true, pointsCost:item.cost });
    renderInvoice();
    showCartNotif(item.value, "images/logo.png");

  } else if (item.type === "ammo") {
    invoice.push({ name:`${item.value} (Points)`, qty:1, price:0, isPoints:true, pointsCost:item.cost });
    renderInvoice();
    showCartNotif(item.value, "images/logo.png");
  }

  renderPointsStore();
};


document.getElementById("historyBtn").addEventListener("click", openHistory);

async function openHistory() {
  const modal = document.getElementById("historyModal");
  const list  = document.getElementById("historyList");
  modal.classList.add("show");
  list.innerHTML = `<p style="color:#aaa;text-align:center;">⏳ Loading...</p>`;

  try {
    const snap = await getDocs(collection(db, "users", currentUser.uid, "invoices"));

    if (snap.empty) {
      list.innerHTML = `<p style="color:#aaa;text-align:center;">No orders yet 📭</p>`;
      return;
    }

    let invoicesList = [];
    snap.forEach(d => invoicesList.push(d.data()));
    invoicesList.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());

    list.innerHTML = "";
    invoicesList.forEach(inv => {
      const div = document.createElement("div");
      div.className = "history-invoice";
      const itemsHTML = (inv.items || []).map(it => `
        <div class="history-item-row">
          <span>${it.name} ${it.isPoints ? '<span class="points-invoice-badge">⭐ Points</span>' : ""} x${it.qty}</span>
          <span>${it.price === 0 ? "FREE" : it.price < 0 ? "-"+Math.abs(it.price).toLocaleString()+"$" : it.price.toLocaleString()+"$"}</span>
        </div>
      `).join("");

      div.innerHTML = `
        <div class="history-invoice-header">
          <span class="history-invoice-num">🧾 ${inv.invoiceNumber || "—"}</span>
          <span class="history-invoice-date">${inv.date || ""} ${inv.time || ""}</span>
        </div>
        <div style="font-size:12px;color:#888;margin-bottom:8px;">
          👤 ${inv.buyer || "—"} | 🏴 ${inv.gang || "—"} | 📻 ${inv.radio || "—"}
        </div>
        ${itemsHTML}
        <div class="history-invoice-total">Total: ${(inv.total || 0).toLocaleString()}$</div>
      `;
      list.appendChild(div);
    });
  } catch(e) {
    list.innerHTML = `<p style="color:#e74c3c;text-align:center;">❌ Error: ${e.message}</p>`;
    console.log(e);
  }
}

window.closeHistory = function() {
  document.getElementById("historyModal").classList.remove("show");
};
