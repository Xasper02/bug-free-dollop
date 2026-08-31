document.addEventListener("DOMContentLoaded", () => {
    // Sayfa DOM Arayüz Seçicileri
    const loginPage = document.getElementById("loginPage");
    const registerPage = document.getElementById("registerPage");
    const chatPage = document.getElementById("chatPage");
    const goToRegister = document.getElementById("goToRegister");
    const goToLogin = document.getElementById("goToLogin");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const msgForm = document.getElementById("msgForm");
    const userInput = document.getElementById("userInput");
    const chatScreen = document.getElementById("chatScreen");
    const statusText = document.getElementById("status-text");
    const currentRoomTitle = document.getElementById("currentRoomTitle");
    const roomsContainer = document.getElementById("roomsContainer");
    
    // Kurucu Kontrolleri ve Özel Butonlar
    const createDMBtn = document.getElementById("createDMBtn");
    const createGroupBtn = document.getElementById("createGroupBtn");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const wallpaperBtn = document.getElementById("wallpaperBtn");
    const clearChatBtn = document.getElementById("clearChatBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const searchBar = document.getElementById("searchBar");
    const addStoryBtn = document.getElementById("addStoryBtn");
    const storiesArea = document.getElementById("storiesArea");
    const emojiTrigger = document.getElementById("emojiTrigger");
    const emojiBox = document.getElementById("emojiBox");
    const fileBtn = document.getElementById("fileBtn");
    const voiceBtn = document.getElementById("voiceBtn");
    const pinnedMessageBar = document.getElementById("pinnedMessageBar");
    const pinnedText = document.getElementById("pinnedText");
    const unpinBtn = document.getElementById("unpinBtn");
    
    // Kurucu Admin Ekstra Bölümleri
    const adminControlPanel = document.getElementById("adminControlPanel");
    const freezeChatBtn = document.getElementById("freezeChatBtn");
    const massKickBtn = document.getElementById("massKickBtn");

    // SİBER KORUMALI KALICI VERİTABANI ALTYAPISI
    if (!localStorage.getItem("nexus_users")) {
        const defaultDB = { "admin": { pass: "1234", email: "admin@gmail.com", role: "user" } };
        localStorage.setItem("nexus_users", JSON.stringify(defaultDB));
    }
    if (!localStorage.getItem("nexus_messages")) {
        const defaultMsgs = {
            "global": [
                { id: 1, sender: "received", senderName: "Sistem", text: "🔒 Uçtan uca siber korumalı kalıcı tünele hoş geldiniz. Zararlı kod filtresi (Anti-XSS) devrededir.", time: "Sistem" }
            ]
        };
        localStorage.setItem("nexus_messages", JSON.stringify(defaultMsgs));
    }
    if (!localStorage.getItem("nexus_passwords")) {
        localStorage.setItem("nexus_passwords", JSON.stringify({}));
    }
    if (!localStorage.getItem("nexus_global_freeze")) {
        localStorage.setItem("nexus_global_freeze", "false");
    }

    let currentUser = null;
    let activeRoomId = "global";

    // Güvenlik Özelliği 1 & 8: Gelişmiş XSS ve Kod Enjeksiyon Engelleyici Filtre (Sanitization)
    function sanitizeInput(text) {
        return text.replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/"/g, "&quot;")
                   .replace(/'/g, "&#039;")
                   .replace(/\//g, "&#x2F;");
    }

    // Navigasyon Kontrolleri
    goToRegister.addEventListener("click", () => { loginPage.classList.add("hidden"); registerPage.classList.remove("hidden"); });
    goToLogin.addEventListener("click", () => { registerPage.classList.add("hidden"); loginPage.classList.remove("hidden"); });

    // Gmail Filtreli ve Benzersiz E-posta Kuralına Sahip Kayıt Motoru
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const u = sanitizeInput(document.getElementById("regUser").value.trim());
        const em = sanitizeInput(document.getElementById("regEmail").value.trim().toLowerCase());
        const p = document.getElementById("regPass").value;

        if (!em.endsWith("@gmail.com")) {
            alert("⚠️ Güvenlik Reddi: Yalnızca geçerli bir '@gmail.com' adresi kullanabilirsiniz!");
            return;
        }

        const usersDB = JSON.parse(localStorage.getItem("nexus_users"));

        // Güvenlik Özelliği 22: Her Gmail ile yalnızca bir kez hesap açılabilir
        for (let username in usersDB) {
            if (usersDB[username].email === em) {
                alert("⚠️ Siber Engel: Bu Gmail adresi sistemde zaten kullanımda!");
                return;
            }
        }
        if (usersDB[u]) {
            alert("⚠️ Siber Engel: Bu kullanıcı adı başka bir üye tarafından rezerve edilmiş!");
            return;
        }

        // MUTLAK YETKİ TANIMLAMASI
        let role = "user";
        if (em === "fortniteminecraft0234@gmail.com") {
            role = "admin";
        }

        usersDB[u] = { pass: p, email: em, role: role };
        localStorage.setItem("nexus_users", JSON.stringify(usersDB));

        alert(`Kayıt Başarılı!\nRolünüz: ${role === "admin" ? "👑 Kurucu Yönetici (Sınırsız Güç)" : "👤 Standart Üye"}`);
        registerPage.classList.add("hidden"); loginPage.classList.remove("hidden");
    });

    // Oturum Açma ve Admin Yetki Paneli Tetikleyicisi
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const uVal = sanitizeInput(document.getElementById("loginUser").value.trim());
        const pVal = document.getElementById("loginPass").value;
        const usersDB = JSON.parse(localStorage.getItem("nexus_users"));

        if (usersDB[uVal] && usersDB[uVal].pass === pVal) {
            currentUser = uVal;
            document.getElementById("myUsernameText").innerText = currentUser;
            
            // Eğer giriş yapan kişi kurucu admin ise sınırsız paneli aç
            if (usersDB[currentUser].role === "admin") {
                document.getElementById("myAvatar").innerText = "👑";
                document.getElementById("myUsernameText").innerHTML += ` <span class="admin-badge">KURUCU</span>`;
                adminControlPanel.classList.remove("hidden"); // Admin Özel Panelini Göster
            } else {
                document.getElementById("myAvatar").innerText = "👤";
                adminControlPanel.classList.add("hidden");
            }
            loginPage.classList.add("hidden"); chatPage.classList.remove("hidden");
            loadRoomMessages(activeRoomId);
        } else {
            alert("Oturum Reddedildi: Kimlik bilgileri uyuşmuyor!");
        }
    });

    // Mesaj Geçmişini Hafızadan Çeken Güvenli Motor
    function loadRoomMessages(roomId) {
        chatScreen.innerHTML = "";
        const allMsgs = JSON.parse(localStorage.getItem("nexus_messages"));
        if (!allMsgs[roomId]) allMsgs[roomId] = [];

        allMsgs[roomId].forEach(msg => {
            const bubble = document.createElement("div");
            bubble.className = `bubble ${msg.sender}`;
            bubble.setAttribute("data-msg-id", msg.id);
            
            let nameTag = msg.senderName;
            if (msg.role === "admin") {
                nameTag = `👑 ${msg.senderName} [Kurucu Admin]`;
            }

            bubble.innerHTML = `
                <div class="msg-actions">
                    <span class="pin-action" data-id="${msg.id}">📌 Sabitle</span>
                    <span class="edit-action" data-id="${msg.id}">✏️ Düzenle</span>
                    <span class="delete-action" data-id="${msg.id}">❌ Sil</span>
                </div>
                <strong style="font-size:11px; display:block; color:var(--neon-green); margin-bottom:3px;">${nameTag}</strong>
                <p class="msg-content-text">${msg.text}</p>
                <span class="time-tag">${msg.time}</span>
            `;
            chatScreen.appendChild(bubble);
        });
        chatScreen.scrollTop = chatScreen.scrollHeight;
    }
    // Mesaj İşlem Tetikleyicileri (Kalıcı Düzenleme, Silme ve Sabitleme)
    chatScreen.addEventListener("click", (e) => {
        const allMsgs = JSON.parse(localStorage.getItem("nexus_messages"));
        const usersDB = JSON.parse(localStorage.getItem("nexus_users"));
        const isUserAdmin = usersDB[currentUser] && usersDB[currentUser].role === "admin";
        
        if (e.target.classList.contains("delete-action")) {
            const id = parseInt(e.target.getAttribute("data-id"));
            allMsgs[activeRoomId] = allMsgs[activeRoomId].filter(m => m.id !== id);
            localStorage.setItem("nexus_messages", JSON.stringify(allMsgs));
            loadRoomMessages(activeRoomId);
        }
        
        if (e.target.classList.contains("edit-action")) {
            const id = parseInt(e.target.getAttribute("data-id"));
            const msgObj = allMsgs[activeRoomId].find(m => m.id === id);
            if (!msgObj) return;

            // Güvenlik Özelliği 67: Admin herkesin mesajını düzenleyebilir, normal üye sadece kendininkini
            if (msgObj.senderName !== currentUser && !isUserAdmin) {
                alert("⚠️ Yetki Reddi: Başka bir üyenin şifreli mesajına müdahale edemezsiniz!");
                return;
            }

            const newText = prompt("Mesajı yeniden düzenleyin:", msgObj.text);
            if (newText && newText.trim() !== "") {
                msgObj.text = sanitizeInput(newText.trim()) + " (Düzenlendi)";
                localStorage.setItem("nexus_messages", JSON.stringify(allMsgs));
                loadRoomMessages(activeRoomId);
            }
        }

        if (e.target.classList.contains("pin-action")) {
            const id = parseInt(e.target.getAttribute("data-id"));
            const msgObj = allMsgs[activeRoomId].find(m => m.id === id);
            if (msgObj) {
                pinnedText.innerText = `${msgObj.senderName}: ${msgObj.text}`;
                pinnedMessageBar.classList.remove("hidden");
            }
        }
    });

    unpinBtn.addEventListener("click", () => pinnedMessageBar.classList.add("hidden"));

    // Odalar Arası Geçiş ve SINIRSIZ ADMİN ŞİFRESİZ GEÇİŞ ÖZELLİĞİ (BYPASS)
    roomsContainer.addEventListener("click", (e) => {
        const card = e.target.closest(".chat-user");
        if (!card) return;

        const targetId = card.getAttribute("data-room-id");
        const roomPasswords = JSON.parse(localStorage.getItem("nexus_passwords"));
        const usersDB = JSON.parse(localStorage.getItem("nexus_users"));
        
        // KURUCU ADMİN ÖZELLİĞİ 64: Eğer admin sizseniz şifreli odaların şifre süzgecini saniyede atla (Bypass)
        const isUserAdmin = usersDB[currentUser] && usersDB[currentUser].role === "admin";

        if (roomPasswords[targetId] && !isUserAdmin) {
            const pass = prompt("🔒 Bu grup kriptolu şifre korumasına sahiptir. Giriş anahtarını yazın:");
            if (pass !== roomPasswords[targetId]) { alert("Siber Engel: Yanlış anahtar!"); return; }
        } else if (roomPasswords[targetId] && isUserAdmin) {
            console.log("👑 Kurucu Admin Kimliği Doğrulandı: Şifre korumalı odaya şifresiz giriş sağlandı.");
        }

        document.querySelectorAll(".chat-user").forEach(el => el.classList.remove("active-room"));
        card.classList.add("active-room");
        activeRoomId = targetId;
        currentRoomTitle.innerText = card.querySelector(".room-title-text").innerText;
        loadRoomMessages(activeRoomId);
    });

    // Arkadaş Listesine Özel Kanal Ekleme
    createDMBtn.addEventListener("click", () => {
        const target = prompt("Uçtan uca özel sohbet hattı başlatılacak kişinin adını girin:");
        if (!target || target.trim() === "") return;
        
        const id = "dm_" + Date.now();
        const allMsgs = JSON.parse(localStorage.getItem("nexus_messages"));
        allMsgs[id] = [{ id: 1, sender: "received", senderName: "Sistem", text: `${sanitizeInput(target)} ile gizli hat kuruldu.`, time: "Sistem" }];
        localStorage.setItem("nexus_messages", JSON.stringify(allMsgs));
        
        addNewRoomCard(id, sanitizeInput(target), "👤");
    });

    // Şifreli / Şifresiz Grup Odası İnşa Etme Paneli
    createGroupBtn.addEventListener("click", () => {
        const name = prompt("Kurulacak siber grubun adını belirleyin:");
        if (!name || name.trim() === "") return;
        const id = "group_" + Date.now();
        
        const hasPass = confirm("Bu gruba giriş şifresi ve kilit entegre etmek istiyor musunuz?");
        if (hasPass) {
            const p = prompt("Grup için siber koruma şifresi yazın:");
            if (p && p.trim() !== "") {
                const roomPasswords = JSON.parse(localStorage.getItem("nexus_passwords"));
                roomPasswords[id] = p.trim();
                localStorage.setItem("nexus_passwords", JSON.stringify(roomPasswords));
            }
        }

        const roomPasswords = JSON.parse(localStorage.getItem("nexus_passwords"));
        const lockIcon = roomPasswords[id] ? " 🔒" : "";
        
        const allMsgs = JSON.parse(localStorage.getItem("nexus_messages"));
        allMsgs[id] = [{ id: 1, sender: "received", senderName: "Sistem", text: `"${sanitizeInput(name)}" grubu ağa bağlandı.`, time: "Sistem" }];
        localStorage.setItem("nexus_messages", JSON.stringify(allMsgs));

        addNewRoomCard(id, sanitizeInput(name) + lockIcon, "👥");
    });

    function addNewRoomCard(id, name, icon) {
        const card = document.createElement("div");
        card.className = "chat-user";
        card.setAttribute("data-room-id", id);
        card.innerHTML = `<span class="user-icon">${icon}</span><div class="user-info"><h4 class="room-title-text">${name}</h4><p class="left-preview">Yeni güvenli hat.</p></div>`;
        roomsContainer.appendChild(card);
    }
    // KURUCU ADMİN ÖZELLİĞİ 62: Tüm mesajlaşmayı dondurma fonksiyonu (Global Freeze)
    freezeChatBtn.addEventListener("click", () => {
        const currentFreeze = localStorage.getItem("nexus_global_freeze") === "true";
        localStorage.setItem("nexus_global_freeze", (!currentFreeze).toString());
        alert(`Siber Durum Güncellemesi:\nSitedeki tüm mesajlaşma akışı şu an: ${!currentFreeze ? "🚫 DONDURULDU" : "🟢 AKTİFLEŞTİRİLDİ"}`);
    });

    // KURUCU ADMİN ÖZELLİĞİ 63: Herkesi gruptan atma ve kanalı tasfiye etme fonksiyonu (Mass Kick)
    massKickBtn.addEventListener("click", () => {
        if (activeRoomId === "global") {
            alert("⚠️ Koruma Uyarısı: Ana Güvenlik Kanalı tasfiye edilemez!");
            return;
        }
        if (confirm(`🚨 DİKKAT: "${currentRoomTitle.innerText}" odasındaki tüm üyeleri gruptan çıkarmak ve odayı kapatmak istediğinize emin misiniz?`)) {
            const allMsgs = JSON.parse(localStorage.getItem("nexus_messages"));
            delete allMsgs[activeRoomId]; // Odanın tüm hafızasını patlat
            localStorage.setItem("nexus_messages", JSON.stringify(allMsgs));
            
            alert("Grup başarıyla tasfiye edildi! Üyeler uzaklaştırıldı.");
            window.location.reload(); // Sistemi yenileyerek sol paneli temizle
        }
    });

    // Siber Korumalı Mesaj Gönderme Tetikleyicisi
    msgForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Güvenlik Özelliği 62 Kontrolü: Eğer sohbet dondurulmuşsa normal üyelere engelle
        const isFrozen = localStorage.getItem("nexus_global_freeze") === "true";
        const usersDB = JSON.parse(localStorage.getItem("nexus_users"));
        const isUserAdmin = usersDB[currentUser] && usersDB[currentUser].role === "admin";

        if (isFrozen && !isUserAdmin) {
            alert("🚨 Erişim Engeli: Kurucu Admin tarafından tüm sistem geçici olarak mesajlaşmaya kapatılmıştır!");
            userInput.value = "";
            return;
        }

        const text = sanitizeInput(userInput.value.trim()); // Anti-XSS temizliği
        if (text === "") return;

        const myRole = usersDB[currentUser] ? usersDB[currentUser].role : "user";
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newId = Date.now();

        const allMsgs = JSON.parse(localStorage.getItem("nexus_messages"));
        if (!allMsgs[activeRoomId]) allMsgs[activeRoomId] = [];

        allMsgs[activeRoomId].push({ id: newId, sender: "sent", senderName: currentUser, role: myRole, text: text, time: time + " ✓✓" });
        localStorage.setItem("nexus_messages", JSON.stringify(allMsgs));
        
        loadRoomMessages(activeRoomId);
        
        const activeCard = document.querySelector(`[data-room-id="${activeRoomId}"]`);
        if (activeCard) activeCard.querySelector(".left-preview").innerText = "Siz: " + text;
        userInput.value = "";
    });

    // Ekstra Özelleştirme ve Gizlilik Komutları
    themeToggleBtn.addEventListener("click", () => document.body.classList.toggle("light-mode"));

    wallpaperBtn.addEventListener("click", () => {
        const colors = ["#0b111e", "#1a1a2e", "#16222f", "#2c3e50", "#111111"];
        const randColor = colors[Math.floor(Math.random() * colors.length)];
        document.documentElement.style.setProperty('--chat-bg', randColor);
    });

    clearChatBtn.addEventListener("click", () => {
        if (confirm("Kendi ekranınızdaki dökümleri temizlemek istiyor musunuz? (Sistem veritabanından silinmez)")) {
            chatScreen.innerHTML = `<div class="system-msg" style="text-align:center; color:#8fa0dd; font-size:12px;">-- Ekran Temizlendi --</div>`;
        }
    });

    searchBar.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll(".chat-user").forEach(card => {
            const roomName = card.querySelector(".room-title-text").innerText.toLowerCase();
            card.style.display = roomName.includes(query) ? "flex" : "none";
        });
    });

    addStoryBtn.addEventListener("click", () => {
        const imgEmoji = sanitizeInput(prompt("Hikaye emojisi girin:"));
        if (imgEmoji) {
            const newStory = document.createElement("div");
            newStory.className = "story-dot";
            newStory.style.borderColor = "#00b3ff";
            newStory.innerText = imgEmoji;
            newStory.onclick = () => alert(`${currentUser} hikayesi: ${imgEmoji}`);
            storiesArea.appendChild(newStory);
        }
    });

    emojiTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        emojiBox.style.display = emojiBox.style.display === "flex" ? "none" : "flex";
    });

    emojiBox.addEventListener("click", (e) => {
        if (e.target.classList.contains("emoji-item")) {
            userInput.value += e.target.innerText;
            emojiBox.style.display = "none";
            userInput.focus();
        }
    });

    document.addEventListener("click", () => emojiBox.style.display = "none");

    fileBtn.addEventListener("click", () => {
        const fileName = sanitizeInput(prompt("Yüklemek istediğiniz dosya veya fotoğraf adını yazın:"));
        if (fileName) {
            userInput.value = `📁 Ekli Güvenli Dosya: [${fileName}]`;
            msgForm.dispatchEvent(new Event('submit'));
        }
    });

    voiceBtn.addEventListener("click", () => {
        userInput.value = "🎤 [Kriptolu Ses Kaydı - 0:05]";
        msgForm.dispatchEvent(new Event('submit'));
    });

    logoutBtn.addEventListener("click", () => {
        if (confirm("Güvenli oturumu kapatmak istiyor musunuz?")) {
            chatPage.classList.add("hidden"); loginPage.classList.remove("hidden");
        }
    });
});
