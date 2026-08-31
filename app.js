document.addEventListener("DOMContentLoaded", () => {
    // Sayfa DOM Seçicileri
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
    
    // İşlevsel Sistem Kontrolleri
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

    // LOCALSTORAGE KALICI VERİTABANI MOTORU (YENİ)
    if (!localStorage.getItem("nexus_users")) {
        const defaultDB = { "admin": { pass: "1234", email: "admin@gmail.com", role: "user" } };
        localStorage.setItem("nexus_users", JSON.stringify(defaultDB));
    }
    if (!localStorage.getItem("nexus_messages")) {
        const defaultMsgs = {
            "global": [
                { id: 1, sender: "received", senderName: "Sistem", text: "🔒 Uçtan uca kriptolu kalıcı odaya hoş geldiniz. Mesajlar sonsuza kadar saklanır.", time: "Sistem" }
            ]
        };
        localStorage.setItem("nexus_messages", JSON.stringify(defaultMsgs));
    }
    if (!localStorage.getItem("nexus_passwords")) {
        localStorage.setItem("nexus_passwords", JSON.stringify({}));
    }

    let currentUser = null;
    let activeRoomId = "global";

    // Navigasyon
    goToRegister.addEventListener("click", () => { loginPage.classList.add("hidden"); registerPage.classList.remove("hidden"); });
    goToLogin.addEventListener("click", () => { registerPage.classList.add("hidden"); loginPage.classList.remove("hidden"); });

    // Tekil E-posta Filtreli ve Özel Admin Tanımlı Kayıt Motoru
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const u = document.getElementById("regUser").value.trim();
        const em = document.getElementById("regEmail").value.trim().toLowerCase();
        const p = document.getElementById("regPass").value;

        if (!em.endsWith("@gmail.com")) {
            alert("⚠️ Güvenlik Reddi: Yalnızca geçerli bir '@gmail.com' adresi kullanabilirsiniz!");
            return;
        }

        const usersDB = JSON.parse(localStorage.getItem("nexus_users"));

        // Özellik: Her Gmail ile yalnızca bir kez kayıt olunabilir
        for (let username in usersDB) {
            if (usersDB[username].email === em) {
                alert("⚠️ Hata: Bu Gmail adresi sistemde zaten kayıtlı! Başka bir adres deneyin.");
                return;
            }
        }
        if (usersDB[u]) {
            alert("⚠️ Hata: Bu kullanıcı adı zaten alınmış!");
            return;
        }

        // ÖZEL ÖZELLİK: Belirlenen Gmail girildiğinde otomatik Admin (Kurucu) rolü atanır
        let role = "user";
        if (em === "fortniteminecraft0234@gmail.com") {
            role = "admin";
        }

        usersDB[u] = { pass: p, email: em, role: role };
        localStorage.setItem("nexus_users", JSON.stringify(usersDB));

        alert(`Hesap başarıyla oluşturuldu!\nRolünüz: ${role === "admin" ? "👑 Kurucu Admin" : "👤 Standart Üye"}`);
        registerPage.classList.add("hidden"); loginPage.classList.remove("hidden");
    });

    // Giriş Kontrol Mekanizması
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const uVal = document.getElementById("loginUser").value.trim();
        const pVal = document.getElementById("loginPass").value;
        const usersDB = JSON.parse(localStorage.getItem("nexus_users"));

        if (usersDB[uVal] && usersDB[uVal].pass === pVal) {
            currentUser = uVal;
            document.getElementById("myUsernameText").innerText = currentUser;
            if (usersDB[currentUser].role === "admin") {
                document.getElementById("myAvatar").innerText = "👑";
                document.getElementById("myUsernameText").innerHTML += ` <span class="admin-badge">KURUCU</span>`;
            } else {
                document.getElementById("myAvatar").innerText = "👤";
            }
            loginPage.classList.add("hidden"); chatPage.classList.remove("hidden");
            loadRoomMessages(activeRoomId);
        } else {
            alert("Kullanıcı adı veya şifre hatalı!");
        }
    });

    // Mesaj Geçmişini Kalıcı Hafızadan Çekip Ekrana Basma Fonksiyonu
    function loadRoomMessages(roomId) {
        chatScreen.innerHTML = "";
        const allMsgs = JSON.parse(localStorage.getItem("nexus_messages"));
        if (!allMsgs[roomId]) allMsgs[roomId] = [];

        allMsgs[roomId].forEach(msg => {
            const bubble = document.createElement("div");
            bubble.className = `bubble ${msg.sender}`;
            bubble.setAttribute("data-msg-id", msg.id);
            
            // Eğer mesajı atan kişi adminse isminin yanına taç koy
            let nameTag = msg.senderName;
            if (msg.role === "admin") {
                nameTag = `👑 ${msg.senderName} [Yönetici]`;
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
            const newText = prompt("Mesajı düzenleyin:", msgObj.text);
            if (newText && newText.trim() !== "") {
                msgObj.text = newText.trim() + " (Düzenlendi)";
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

    // Odalar Arası Geçiş ve Şifre Güvenlik Duvarı
    roomsContainer.addEventListener("click", (e) => {
        const card = e.target.closest(".chat-user");
        if (!card) return;

        const targetId = card.getAttribute("data-room-id");
        const roomPasswords = JSON.parse(localStorage.getItem("nexus_passwords"));

        if (roomPasswords[targetId]) {
            const pass = prompt("Bu oda şifrelidir. Giriş anahtarını girin:");
            if (pass !== roomPasswords[targetId]) { alert("Hatalı şifre! Giriş engellendi."); return; }
        }

        document.querySelectorAll(".chat-user").forEach(el => el.classList.remove("active-room"));
        card.classList.add("active-room");
        activeRoomId = targetId;
        currentRoomTitle.innerText = card.querySelector(".room-title-text").innerText;
        loadRoomMessages(activeRoomId);
    });

    // Arkadaşla Birebir Özel Sohbet Odası Açma
    createDMBtn.addEventListener("click", () => {
        const target = prompt("Sohbet başlatmak istediğiniz arkadaşınızın adını yazın:");
        if (!target || target.trim() === "") return;
        
        const id = "dm_" + Date.now();
        const allMsgs = JSON.parse(localStorage.getItem("nexus_messages"));
        allMsgs[id] = [{ id: 1, sender: "received", senderName: "Sistem", text: `${target} ile özel sohbet hattı kalıcı olarak açıldı.`, time: "Özel" }];
        localStorage.setItem("nexus_messages", JSON.stringify(allMsgs));
        
        addNewRoomCard(id, target, "👤");
    });

    // Şifreli / Şifresiz Grup Kurma Sistemi
    createGroupBtn.addEventListener("click", () => {
        const name = prompt("Kurulacak grubun adını yazın:");
        if (!name || name.trim() === "") return;
        const id = "group_" + Date.now();
        
        const hasPass = confirm("Bu gruba giriş şifresi koymak istiyor musunuz?");
        if (hasPass) {
            const p = prompt("Grup için bir şifre belirleyin:");
            if (p && p.trim() !== "") {
                const roomPasswords = JSON.parse(localStorage.getItem("nexus_passwords"));
                roomPasswords[id] = p.trim();
                localStorage.setItem("nexus_passwords", JSON.stringify(roomPasswords));
            }
        }

        const roomPasswords = JSON.parse(localStorage.getItem("nexus_passwords"));
        const lockIcon = roomPasswords[id] ? " 🔒" : "";
        
        const allMsgs = JSON.parse(localStorage.getItem("nexus_messages"));
        allMsgs[id] = [{ id: 1, sender: "received", senderName: "Sistem", text: `"${name}" grubu başarıyla yapılandırıldı.`, time: "Sistem" }];
        localStorage.setItem("nexus_messages", JSON.stringify(allMsgs));

        addNewRoomCard(id, name + lockIcon, "👥");
    });

    function addNewRoomCard(id, name, icon) {
        const card = document.createElement("div");
        card.className = "chat-user";
        card.setAttribute("data-room-id", id);
        card.innerHTML = `<span class="user-icon">${icon}</span><div class="user-info"><h4 class="room-title-text">${name}</h4><p class="left-preview">Yeni oda aktif.</p></div>`;
        roomsContainer.appendChild(card);
    }

    // Gerçek Zamanlı ve Kalıcı Mesaj Gönderme Motoru (GÜVENLİK PROTOKOLÜ BOTU KALDIRILDI)
    msgForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (text === "") return;

        const usersDB = JSON.parse(localStorage.getItem("nexus_users"));
        const myRole = usersDB[currentUser] ? usersDB[currentUser].role : "user";
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newId = Date.now();

        const allMsgs = JSON.parse(localStorage.getItem("nexus_messages"));
        if (!allMsgs[activeRoomId]) allMsgs[activeRoomId] = [];

        // Mesajı kalıcı hafıza dizisine ekle
        allMsgs[activeRoomId].push({ id: newId, sender: "sent", senderName: currentUser, role: myRole, text: text, time: time + " ✓✓" });
        localStorage.setItem("nexus_messages", JSON.stringify(allMsgs));
        
        loadRoomMessages(activeRoomId);
        
        const activeCard = document.querySelector(`[data-room-id="${activeRoomId}"]`);
        if (activeCard) activeCard.querySelector(".left-preview").innerText = "Siz: " + text;
        userInput.value = "";
    });

    // Tema, Duvar Kağıdı ve Temizleme Kontrolleri
    themeToggleBtn.addEventListener("click", () => document.body.classList.toggle("light-mode"));

    wallpaperBtn.addEventListener("click", () => {
        const colors = ["#0b111e", "#1a1a2e", "#16222f", "#2c3e50", "#111111"];
        const randColor = colors[Math.floor(Math.random() * colors.length)];
        document.documentElement.style.setProperty('--chat-bg', randColor);
    });

    clearChatBtn.addEventListener("click", () => {
        if (confirm("Kendi ekranınızdaki mesajları temizlemek istiyor musunuz? (Veritabanından silinmez)")) {
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
        const imgEmoji = prompt("Hikayenizde paylaşmak için bir emoji girin (Örn: 🎮, 🔥, 🚀):");
        if (imgEmoji) {
            const newStory = document.createElement("div");
            newStory.className = "story-dot";
            newStory.style.borderColor = "#00b3ff";
            newStory.innerText = imgEmoji;
            newStory.onclick = () => alert(`${currentUser} adlı kullanıcının hikayesi: ${imgEmoji}`);
            storiesArea.appendChild(newStory);
        }
    });

    // Emoji Paneli Olayları
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
        const fileName = prompt("Yüklemek istediğiniz görselin veya dosyanın adını yazın:");
        if (fileName) {
            userInput.value = `🖼️ Medya Ekli: [${fileName}]`;
            msgForm.dispatchEvent(new Event('submit'));
        }
    });

    voiceBtn.addEventListener("click", () => {
        userInput.value = "🎤 [Sesli Not - 0:08]";
        msgForm.dispatchEvent(new Event('submit'));
    });

    logoutBtn.addEventListener("click", () => {
        if (confirm("Oturumu kapatmak istiyor musunuz?")) {
            chatPage.classList.add("hidden"); loginPage.classList.remove("hidden");
        }
    });
});
