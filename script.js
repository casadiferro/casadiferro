// ===== عناصر أساسية =====
const shop = document.getElementById("shop");
const startBtn = document.getElementById("startBtn");
const music = document.getElementById("bgMusic");
const musicPlayer = document.getElementById("musicPlayer");
const playPauseBtn = document.getElementById("playPause");
const volumeSlider = document.getElementById("volume");
const closePlayerBtn = document.getElementById("closePlayer");
const pdfBtn = document.getElementById("pdfBtn");
const pdfForm = document.getElementById("pdfForm");
const confirmPDF = document.getElementById("confirmPDF");
const cancelPDF = document.getElementById("cancelPDF");

let invoice = [];
let total = 0;

// ===== مستوى الصوت الافتراضي =====
music.volume = 0.3;

// ===== زر البداية =====
startBtn.addEventListener("click", () => {
    music.volume = 0.4;
    music.play().catch(e => console.log("لا يمكن تشغيل الصوت تلقائياً:", e));

    const intro = document.getElementById("intro");
    intro.style.transition = "opacity 0.8s";
    intro.style.opacity = 0;

    setTimeout(() => {
        intro.style.display = "none";
        renderShop('all');
        musicPlayer.classList.add("show");
    }, 800);
});

// ===== مشغل الموسيقى =====
playPauseBtn.addEventListener("click", () => {
    if (music.paused) {
        music.play().catch(e => console.log("لا يمكن التشغيل:", e));
        playPauseBtn.textContent = "⏸";
    } else {
        music.pause();
        playPauseBtn.textContent = "▶";
    }
});

volumeSlider.addEventListener("input", () => {
    music.volume = volumeSlider.value;
});

closePlayerBtn.addEventListener("click", () => {
    musicPlayer.classList.remove("show");
});

// ===== ITEMS =====
const items = [ 
// heist items
   {name:"Bag",price:5750,img:"images/bag.png",cat:"heist",status:"green"},
   {name:"Electric Cutter",price:3450,img:"images/electric_cutter.png",cat:"heist",status:"green"},
   {name:"X Circuit Tester",price:3450,img:"images/circuit.png",cat:"heist",status:"green"},
   {name:"Device",price:3450,img:"images/device.png",cat:"heist",status:"green"},
   {name:"MXC Key",price:3450,img:"images/mxc_key.png",cat:"heist",status:"green"},
   {name:"Fingerprint Bag",price:5175,img:"images/fingerprint Bag.png",cat:"heist",status:"green"},
   {name:"Fingerprint Tape",price:5175,img:"images/fingerprint Tape.png",cat:"heist",status:"green"},
   {name:"Thermite",price:5750,img:"images/thermite.png",cat:"heist",status:"green"},
   {name:"Pliers",price:4025,img:"images/pliers.png",cat:"heist",status:"green"},
   {name:"Pictures",price:7475,img:"images/pictures.png",cat:"heist",status:"green"},
   {name:"Fleeca card",price:6900,img:"images/fleeca_card.png",cat:"heist",status:"green"},
   {name:"Laptop",price:4600,img:"images/laptop.png",cat:"heist",status:"green"},
   {name:"Paleto key",price:3450,img:"images/paleto_key.png",cat:"heist",status:"green"},
   {name:"PaletoCardOne",price:2875,img:"images/paletocardone.png",cat:"heist",status:"green"},
   {name:"PaletoCardTwo",price:2875,img:"images/paletocardtwo.png",cat:"heist",status:"green"},
   {name:"SmokeGrenade",price:3450,img:"images/smoke_grenade.png",cat:"heist",status:"green"},
   {name:"Decryptor",price:4025,img:"images/decryptor.png",cat:"heist",status:"green"},
   {name:"HackCard",price:4025,img:"images/hackcard.png",cat:"heist",status:"green"},
   {name:"Phone",price:4025,img:"images/phone.png",cat:"heist",status:"green"},
   {name:"Pacific key",price:6900,img:"images/pacific_key.png",cat:"heist",status:"green"},
   {name:"C4",price:6900,img:"images/c4.png",cat:"heist",status:"green"},
   {name:"Drill",price:6900,img:"images/drill.png",cat:"heist",status:"green"},

 //guns
   {name:"Pistol MK2",price:100000,img:"images/pistol_mk2.png",cat:"weapon",status:"orange"},
   {name:"Combat Pistol",price:105000,img:"images/combat_pistol.png",cat:"weapon",status:"green"},
   {name:"DP9 Pistol",price:100000,img:"images/dp9.png",cat:"weapon",status:"green"},
   {name:"Browning",price:100000,img:"images/browning.png",cat:"weapon",status:"green"},
   {name:"Glock-18C",price:100000,img:"images/glock_18c.png",cat:"weapon",status:"green"},
  
   {name:"Micro SMG",price:115000,img:"images/Micro_SMG.png",cat:"weapon",status:"green"},
   {name:"Mini SMG",price:95000,img:"images/Mini_SMG.png",cat:"weapon",status:"green"},
   {name:"Combat PDW",price:130000,img:"images/Combat PDW.png",cat:"weapon",status:"green"},

   {name:"Groza",price:195000,img:"images/groza.png",cat:"weapon",status:"green"},
   {name:"M70 (AK-47)",price:180000,img:"images/m70.png",cat:"weapon",status:"green"},

   {name:"Sawed-Off Shotgun ",price:105000,img:"images/sawed_off_shotgun.png",cat:"weapon",status:"green"},

   {name:"SMG Ammo",price:4500,img:"images/smg_ammo.png",cat:"weapon",status:"green"},
   {name:"Pistol Ammo",price:7000,img:"images/pistol_ammo.png",cat:"weapon",status:"green"},
   {name:"Shotgun Ammo",price:4000,img:"images/shotgun_ammo.png",cat:"weapon",status:"green"},
   {name:"Rifle Ammo",price:6000,img:"images/rifle_ammo.png",cat:"weapon",status:"green"},

   {name:"Handcuffs",price:5000,img:"images/handcuffs.png",cat:"weapon",status:"green"},
   {name:"Kevlar Vest",price:7000,img:"images/kevlar_vest.png",cat:"weapon",status:"green"},
   {name:"Molotov",price:12000,img:"images/molotov.png",cat:"weapon",status:"green"},

   {name:"Suppressor (SMG)",price:4500,img:"images/suppressor_sm.png",cat:"weapon",status:"green"},
   {name:"Scope (SMG)",price:4500,img:"images/scope_sm.png",cat:"weapon",status:"green"},
   {name:"Extended Clip (SMG)",price:5000,img:"images/extended_clip_sm.png",cat:"weapon",status:"green"},
   {name:"Suppressor (Pistol)",price:4000,img:"images/suppressor_pistol.png",cat:"weapon",status:"green"},


  // gold 
   {name:"Marked Gold Bar",price:4500,img:"images/Marked_Gold_BAR.png",cat:"gold",status:"green"},
   {name:"Marked Silver Bar",price:4000,img:"images/marked_silver_bar.png",cat:"gold",status:"green"},
   {name:"Gold Bar",price:10500,img:"images/gold_bar.png",cat:"gold",status:"green"},
   {name:"Silver Bar",price:5000,img:"images/silver_bar.png",cat:"gold",status:"green"},
   {name:"Diamond",price:600,img:"images/diamond.png",cat:"gold",status:"green"},
   {name:"X Panther Gem",price:15000,img:"images/x_panther_gem.png",cat:"gold",status:"green"},
  {name:"Giant Gem",price:15000,img:"images/giant_gem.png",cat:"gold",status:"green"},
   {name:"Gem Necklace",price:15000,img:"images/Gem_Necklace.png",cat:"gold",status:"green"},
   {name:"Giant Gem Green",price:15000,img:"images/Giant_Gem_Green.png",cat:"gold",status:"green"},
  
   {name:"Box Of Jewlery",price:3000,img:"images/Box_of_Jewlery.png",cat:"gold",status:"green"},


   {name:"Diamond Ring",price:600,img:"images/Diamond_Ring.png",cat:"gold",status:"green"},
   {name:"Ruby Ring",price:600,img:"images/Ruby_Ring.png",cat:"gold",status:"green"},
   {name:"Sapphire Ring",price:600,img:"images/Sapphire_Ring.png",cat:"gold",status:"green"},
   {name:"Emerald Ring",price:600,img:"images/Emerald_Ring.png",cat:"gold",status:"green"},


   {name:"Diamond Earring",price:600,img:"images/Diamond_Earring.png",cat:"gold",status:"green"},
   {name:"Ruby Earring",price:600,img:"images/Ruby_Earring.png",cat:"gold",status:"green"},
   {name:"Sapphire Earring",price:600,img:"images/Sapphire_Earring.png",cat:"gold",status:"green"},
   {name:"Emerald Earring",price:600,img:"images/Emerald_Earring.png",cat:"gold",status:"green"},


   {name:"Diamond Necklace",price:600,img:"images/Diamond_Necklace.png",cat:"gold",status:"green"},
   {name:"Ruby Necklace",price:600,img:"images/Ruby_Necklace.png",cat:"gold",status:"green"},
   {name:"Sapphire Necklace",price:600,img:"images/Sapphire_Necklace.png",cat:"gold",status:"green"},
   {name:"Emerald Necklace",price:600,img:"images/Emerald_Necklace.png",cat:"gold",status:"green"},
   


   //drugs 
    {name:"lyrika",price:710 ,img:"images/lyrika.png",cat:"drugs",status:"green"},    
    {name:"heroin",price:710,img:"images/heroin.png",cat:"drugs",status:"green"},
    {name:"marijuana ",price:310,img:"images/marijuana.png",cat:"drugs",status:"green"},
    {name:"weed ak47",price:500,img:"images/weed_ak47.png",cat:"drugs",status:"green"},
        

];

// ===== sliddeerr=====
function renderShop(category) {
    shop.innerHTML = "";
    let delay = 0;
    items.forEach(i => {
        if (category !== 'all' && i.cat !== category) return;
        const card = document.createElement("div");
        card.className = "card";

        let qtyHTML = '';
        if (i.status !== "red") {
            qtyHTML = `
            <div class="qty-box" style="display:none">
                <input type="number" min="1" value="1" class="qtyInput">
                <button onclick="addItemFromInput(this,'${i.name}',${i.price})">confirm</button>
            </div>`;
        }

card.innerHTML = `
    <img src="${i.img}" width="100">
    <h3>${i.name}</h3>
    <p class="price-text">${i.price}$</p>
    ${i.cat === "drugs" ? `
        <p class="bulk-hint">
            ${i.name === "lyrika" || i.name === "heroin" ? `
                💡 +1000 = 700 $ <br> 💡 +2500 = 695 $
            ` : ""}
        </p>
    ` : ""}
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

// ===== qntty=====
function showQty(btn) {
    const box = btn.nextElementSibling;
    if (box.style.display === "flex") box.style.display = "none";
    else box.style.display = "flex";
}

function addItemFromInput(btn, name, price) {
    const qty = parseInt(btn.previousElementSibling.value);
    if (!qty || qty <= 0) return;

    // ===== تعديل السعر حسب الكمية للـ drugs =====
    let finalPrice = price; // السعر الافتراضي
    if (name === "lyrika" || name === "heroin") {
        if (qty >= 2500) finalPrice = 695;
        else if (qty >= 1000) finalPrice = 700;
        else finalPrice = 710;
    }

    invoice.push({name, qty, price: finalPrice * qty});
    total += finalPrice * qty;

    renderInvoice();
    btn.parentElement.style.display = "none";
}


function renderInvoice() {
    const tbody = document.querySelector("#invoice tbody");
    tbody.innerHTML = "";
    invoice.forEach(i => {
        tbody.innerHTML += `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.price}$</td></tr>`;
    });
    document.getElementById("total").innerText = total + " $";
}

// ===== فتح الفورم لجمع بيانات PDF =====
pdfBtn.addEventListener("click", () => {
  if(invoice.length === 0){
    alert("لا يوجد منتجات في الفاتورة");
    return;
  }
  pdfForm.style.display = "flex";
});

// ===== إغلاق الفورم =====
cancelPDF.addEventListener("click", () => {
  pdfForm.style.display = "none";
});

// ===== تأكيد الفورم وإنشاء PDF =====
confirmPDF.addEventListener("click", () => {
  const buyer = document.getElementById("buyerName").value.trim();
  const gang = document.getElementById("gangName").value.trim();
  const radio = document.getElementById("radioName").value.trim();

  if(!buyer || !gang || !radio){
    alert("❌ الرجاء تعمير جميع الخانات");
    return;
  }

  pdfForm.style.display = "none";

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const invoiceNumber = "CDF-" + Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  const logo = new Image();
  logo.src = "images/logo.png"; // تأكد أن الرابط صحيح
  logo.onload = () => {
    doc.addImage(logo, "PNG", 10, 10, 30, 30);
    renderPDFContent();
  };
  logo.onerror = () => renderPDFContent();

  function renderPDFContent() {
    // ===== Header =====
    doc.setFontSize(12);
    doc.text("WELCOME TO", 10, 45);
    doc.setFont("helvetica","bold");
    doc.text("Casa Di Fero",10,52);
    doc.setFont("helvetica","normal");
    doc.text(`Buyer: ${buyer}`,10,60);
    doc.text(`Gang: ${gang}`,10,66);
    doc.text(`Radio: ${radio}`,10,72);

    // ===== Invoice Info =====
    doc.setFontSize(26);
    doc.setFont("helvetica","bold");
    doc.text("INVOICE",200,22,{align:"right"});
    doc.setFontSize(10);
    doc.setFont("helvetica","normal");
    doc.text(`Invoice No: ${invoiceNumber}`,200,30,{align:"right"});
    doc.text(`Date: ${date}`,200,36,{align:"right"});
    doc.text(`Time: ${time}`,200,42,{align:"right"});

    doc.setDrawColor(140);
    doc.line(10,68,200,68);

    // ===== COMMAND Title =====
    doc.setFontSize(18);
    doc.setTextColor(120,100,40);
    doc.setFont("helvetica","bold");
    doc.text("COMMAND",105,85,{align:"center"});
    doc.setDrawColor(160);
    doc.line(60,90,150,90);
    doc.setTextColor(0,0,0);

    // ===== Table Header =====
    let y=100;
    doc.setFontSize(12);
    doc.setFont("helvetica","bold");
    doc.text("Item",15,y);
    doc.text("AMOUNT",90,y);
    doc.text("Unit Price",120,y);
    doc.text("Total",185,y,{align:"right"});
    doc.line(10,y+2,200,y+2);
    y+=10;

    // ===== Table Body =====
    doc.setFont("helvetica","normal");
    invoice.forEach(item=>{
      doc.text(item.name,15,y);
      doc.text(String(item.qty),95,y);
      doc.text((item.price/item.qty)+"$",120,y);
      doc.text(item.price+"$",185,y,{align:"right"});
      y+=8;
    });

    // ===== Total =====
    doc.line(10,y+2,200,y+2);
    y+=12;
    doc.setFontSize(14);
    doc.setFont("helvetica","bold");
    doc.text("TOTAL :",140,y);
    doc.text(total+"$",185,y,{align:"right"});

    // ===== Mafia Stamp =====
    doc.setDrawColor(120,100,40);
    doc.setLineWidth(2);
    doc.circle(160,y+32,20);
    doc.setLineWidth(1);
    doc.circle(160,y+32,16);
    doc.setFontSize(9);
    doc.setTextColor(120,100,40);
    doc.setFont("helvetica","bold");
    doc.text("CASA DI FERO",160,y+29,{align:"center"});
    doc.text("FAMILY",160,y+34,{align:"center"});
    doc.setFontSize(7);
    doc.setFont("helvetica","normal");
    doc.text("GX. 2025",160,y+39,{align:"center"});
    doc.setTextColor(0,0,0);

    // ===== Signature =====
    doc.setFontSize(12);
    doc.setFont("helvetica","italic");
    doc.text("Casa-Di Fero",105,285,{align:"center"});

    doc.save(`invoice_${invoiceNumber}.pdf`);
  }
});

// ===== تصفية المنتجات =====
function filterItems(category) {
    renderShop(category);
}

// ===== عداد الزوار =====
let visits = localStorage.getItem("visits");
if (!visits) visits = 1;
else visits = parseInt(visits)+1;
localStorage.setItem("visits", visits);

const visitorCount = document.getElementById("visitorCount");
let currentCount = 0;
const interval = setInterval(() => {
    if (currentCount < visits) {
        currentCount++;
        visitorCount.innerText = currentCount;
    } else clearInterval(interval);
}, 50);
function renderInvoice() {
    const tbody = document.querySelector("#invoice tbody");
    tbody.innerHTML = "";
    total = 0;

    invoice.forEach((item, index) => {
        total += item.price;

        const tr = document.createElement("tr");
        tr.classList.add("invoice-add");

        tr.innerHTML = `
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td>${item.price}$</td>
          <td>
            <button class="remove-btn" onclick="removeItem(${index})">✖</button>
          </td>
        `;

        tbody.appendChild(tr);
    });

    document.getElementById("total").innerText = total + " $";
}
function removeItem(index) {
    const rows = document.querySelectorAll("#invoice tbody tr");
    const row = rows[index];

    row.classList.add("invoice-remove");

    setTimeout(() => {
        invoice.splice(index, 1);
        renderInvoice();
    }, 420);
}
