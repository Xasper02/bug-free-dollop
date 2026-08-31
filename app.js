document.addEventListener("DOMContentLoaded", () => {
    // FIREBASE PROJE AYARLARINIZ
    const firebaseConfig = {
        apiKey: "AIzaSyBHM4BtiuEcGSEmhANG-oSJcuk1KKaVzdg",
        authDomain: "://firebaseapp.com",
        databaseURL: "https://nexuschat-8f0f7-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "nexuschat-8f0f7",
        storageBucket: "nexuschat-8f0f7.firebasestorage.app",
        messagingSenderId: "457648292524",
        appId: "1:457648292524:web:68db7c988d591fe9f81509",
        measurementId: "G-96QKRY77JW"
    };

    // Firebase Altyapısını Başlatma
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

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

    let currentUser = null;
    let currentUserRole = "user";
    let activeRoomId = "global";
    let globalFreeze = false;

    // Gelişmiş XSS Filtresi
    function sanitizeInput(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\//g, "&#x2F;");
    }

    // Navigasyon Kontrolleri
    goToRegister.addEventListener("click", () => { loginPage.classList.add("hidden"); registerPage.classList.remove("hidden"); });
    goToLogin.addEventListener("click", () => { registerPage.classList.add("hidden"); loginPage.classList.remove("hidden"); });
    // KÜRESEL SOHBET DONDURMA DİNLEYİCİSİ
    db.ref("nexus_global_freeze").on("value", (snapshot) => {
        globalFreeze = snapshot.val() === true;
        if (globalFreeze) {
            statusText.innerText = "DONDURULDU";
            statusText.style.color = "#d97706";
        } else {
            statusText.innerText = "çevrimiçi";
            statusText.style.color = "var(--neon-green)";
        }
    });

    // CANLI ODALARI DİNLEME VE LİSTELEME
    db.ref("nexus_rooms").on("value", (snapshot) => {
        const existingCards = roomsContainer.querySelectorAll(".chat-user");
        existingCards.forEach(card => {
            if(card.getAttribute("data-room-id") !== "global") card.remove();
        });

        snapshot.forEach((childSnapshot) => {
            const roomId = childSnapshot.key;
            const roomData = childSnapshot.val();
            addNewRoomCard(roomId, roomData.name, roomData.icon);
        });
    });

    function addNewRoomCard(id, name, icon) {
        const card = document.createElement("div");
        card.className = "chat-user" + (activeRoomId === id ? " active-room" : "");
        card.setAttribute("data-room-id", id);
        card.innerHTML = `<span class="user-icon">${icon}</span><div class="user-info"><h4 class="room-title-text">${name}</h4><p class="left-preview">Güvenli hat aktif.</p></div>`;
        roomsContainer.appendChild(card);
    }

    // Gmail Filtreli Kayıt Motoru
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const u = sanitizeInput(document.getElementById("regUser").value.trim());
        const em = sanitizeInput(document.getElementById("regEmail").value.trim().toLowerCase());
        const p = document.getElementById("regPass").value;

        if (!em.endsWith("@gmail.com")) {
            alert("⚠️ Güvenlik Reddi: Yalnızca geçerli bir '@gmail.com' adresi kullanabilirsiniz!");
            return;
        }

        db.ref("nexus_users").once("value", (snapshot) => {
            const users = snapshot.val() || {};
            if (users[u]) { alert("⚠️ Siber Engel: Bu kullanıcı adı rezerve edilmiş!"); return; }
            for (let username in users) {
                if (users[username].email === em) { alert("⚠️ Siber Engel: Bu Gmail zaten kullanımda!"); return; }
            }
            let role = "user";
            if (em === "fortniteminecraft0234@gmail.com") { role = "admin"; }

            db.ref("nexus_users/" + u).set({ pass: p, email: em, role: role }, (err) => {
                if (!err) {
                    alert(`Kayıt Başarılı!\nRolünüz: ${role === "admin" ? "👑 Kurucu" : "👤 Standart"}`);
                    registerPage.classList.add("hidden"); loginPage.classList.remove("hidden");
                }
            });
        });
    });

    // Oturum Açma Motoru
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const uVal = sanitizeInput(document.getElementById("loginUser").value.trim());
        const pVal = document.getElementById("loginPass").value;

        db.ref("nexus_users/" + uVal).once("value", (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.pass === pVal) {
                currentUser = uVal;
                currentUserRole = userData.role;
                document.getElementById("myUsernameText").innerText = currentUser;
                
                if (currentUserRole === "admin") {
                    document.getElementById("myAvatar").innerText = "👑";
                    document.getElementById("myUsernameText").innerHTML += ` <span class="admin-badge">KURUCU</span>`;
                    adminControlPanel.classList.remove("hidden");
                } else {
                    document.getElementById("myAvatar").innerText = "👤";
                    adminControlPanel.classList.add("hidden");
                }
                loginPage.classList.add("hidden"); chatPage.classList.remove("hidden");
                listenRoomMessages(activeRoomId);
            } else {
                alert("Oturum Reddedildi: Kimlik bilgileri uyuşmuyor!");
            }
        });
    });
    // Mesaj Geçmişini Buluttan Dinleyen Canlı Motor
    let currentMessagesRef = null;
    function listenRoomMessages(roomId) {
        chatScreen.innerHTML = "";
        if (currentMessagesRef) currentMessagesRef.off();

        currentMessagesRef = db.ref("nexus_messages/" + roomId);
        
        currentMessagesRef.on("child_added", (snapshot) => {
            const msg = snapshot.val();
            msg.id = snapshot.key;
            displayMessageBubble(msg);
        });

        currentMessagesRef.on("child_removed", (snapshot) => {
            const deletedId = snapshot.key;
            const bubble = chatScreen.querySelector(`[data-msg-id="${deletedId}"]`);
            if(bubble) bubble.remove();
        });

        currentMessagesRef.on("child_changed", (snapshot) => {
            const updatedMsg = snapshot.val();
            const bubble = chatScreen.querySelector(`[data-msg-id="${snapshot.key}"]`);
            if(bubble) { bubble.querySelector(".msg-content-text").innerText = updatedMsg.text; }
        });
    }

    function displayMessageBubble(msg) {
        const bubble = document.createElement("div");
        bubble.className = `bubble ${msg.senderName === currentUser ? 'sent' : 'received'}`;
        bubble.setAttribute("data-msg-id", msg.id);
        
        let nameTag = msg.senderName;
        if (msg.role === "admin") { nameTag = `👑 ${msg.senderName} [Kurucu Admin]`; }

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
        chatScreen.scrollTop = chatScreen.scrollHeight;
    }

    // Mesaj Düzenleme ve Silme Tetikleyicileri
    chatScreen.addEventListener("click", (e) => {
        const isUserAdmin = currentUserRole === "admin";
        const msgId = e.target.getAttribute("data-id");
        
        if (e.target.classList.contains("delete-action")) {
            db.ref(`nexus_messages/${activeRoomId}/${msgId}`).once("value", (snapshot) => {
                const msgObj = snapshot.val();
                if (msgObj && (msgObj.senderName === currentUser || isUserAdmin)) {
                    db.ref(`nexus_messages/${activeRoomId}/${msgId}`).remove();
                } else { alert("⚠️ Yetki Reddi!"); }
            });
        }
        
        if (e.target.classList.contains("edit-action")) {
            db.ref(`nexus_messages/${activeRoomId}/${msgId}`).once("value", (snapshot) => {
                const msgObj = snapshot.val();
                if (!msgObj || (msgObj.senderName !== currentUser && !isUserAdmin)) return;
                const newText = prompt("Mesajı düzenleyin:", msgObj.text);
                if (newText && newText.trim() !== "") {
                    db.ref(`nexus_messages/${activeRoomId}/${msgId}`).update({ text: sanitizeInput(newText.trim()) + " (Düzenlendi)" });
                }
            });
        }

        if (e.target.classList.contains("pin-action")) {
            db.ref(`nexus_messages/${activeRoomId}/${msgId}`).once("value", (snapshot) => {
                const msgObj = snapshot.val();
                if (msgObj) { pinnedText.innerText = `${msgObj.senderName}: ${msgObj.text}`; pinnedMessageBar.classList.remove("hidden"); }
            });
        }
    });

    unpinBtn.addEventListener("click", () => pinnedMessageBar.classList.add("hidden"));

    // Oda Değiştirme ve Şifreli Odalar
    roomsContainer.addEventListener("click", (e) => {
        const card = e.target.closest(".chat-user");
        if (!card) return;
        const targetId = card.getAttribute("data-room-id");
        const isUserAdmin = currentUserRole === "admin";

        if (targetId === "global") { switchRoom(card, targetId); return; }

        db.ref("nexus_rooms/" + targetId).once("value", (snapshot) => {
            const roomData = snapshot.val();
            if (roomData && roomData.password && !isUserAdmin) {
                const pass = prompt("🔒 Şifreyi girin:");
                if (pass !== roomData.password) { alert("Yanlış!"); return; }
            }
            switchRoom(card, targetId);
        });
    });

    function switchRoom(card, targetId) {
        document.querySelectorAll(".chat-user").forEach(el => el.classList.remove("active-room"));
        card.classList.add("active-room");
        activeRoomId = targetId;
        currentRoomTitle.innerText = card.querySelector(".room-title-text").innerText;
        listenRoomMessages(activeRoomId);
    }

    createDMBtn.addEventListener("click", () => {
        const target = prompt("Özel sohbet adı:");
        if (target && target.trim() !== "") { db.ref("nexus_rooms/dm_" + Date.now()).set({ name: sanitizeInput(target), icon: "👤" }); }
    });

    createGroupBtn.addEventListener("click", () => {
        const name = prompt("Grup adı:");
        if (!name || name.trim() === "") return;
        const id = "group_" + Date.now();
        let p = confirm("Şifre olsun mu?") ? prompt("Şifre yazın:") : null;
        db.ref("nexus_rooms/" + id).set({ name: sanitizeInput(name) + (p ? " 🔒" : ""), icon: "👥", password: p ? p.trim() : null });
    });

    freezeChatBtn.addEventListener("click", () => db.ref("nexus_global_freeze").set(!globalFreeze));

    massKickBtn.addEventListener("click", () => {
        if (activeRoomId !== "global" && confirm("Odayı kapatmak istiyor musunuz?")) {
            db.ref("nexus_messages/" + activeRoomId).remove();
            db.ref("nexus_rooms/" + activeRoomId).remove();
            window.location.reload();
        }
    });

    // Mesaj Gönderme Tetikleyicisi
    msgForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (globalFreeze && currentUserRole !== "admin") { alert("Sohbet kilitli!"); userInput.value = ""; return; }
        const text = sanitizeInput(userInput.value.trim());
        if (text === "") return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        db.ref("nexus_messages/" + activeRoomId).push({ senderName: currentUser, role: currentUserRole, text: text, time: time + " ✓✓" }, (err) => {
            if(!err) userInput.value = "";
        });
    });

    // Tema, Özelleştirme ve Diğer Butonlar
    themeToggleBtn.addEventListener("click", () => document.body.classList.toggle("light-mode"));
    wallpaperBtn.addEventListener("click", () => {
        const colors = ["#0b111e", "#1a1a2e", "#16222f", "#2c3e50"];
        document.documentElement.style.setProperty('--chat-bg', colors[Math.floor(Math.random() * colors.length)]);
    });
    clearChatBtn.addEventListener("click", () => { chatScreen.innerHTML = `<div style="text-align:center;color:#8fa0dd;font-size:12px;">-- Ekran Temizlendi --</div>`; });
    searchBar.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll(".chat-user").forEach(card => {
            card.style.display = card.querySelector(".room-title-text").innerText.toLowerCase().includes(query) ? "flex" : "none";
        });
    });
    addStoryBtn.addEventListener("click", () => {
        const imgEmoji = sanitizeInput(prompt("Hikaye emojisi:"));
        if (imgEmoji) {
            const s = document.createElement("div"); s.className = "story-dot"; s.innerText = imgEmoji;
            s.onclick = () => alert(`${currentUser}: ${imgEmoji}`); storiesArea.appendChild(s);
        }
    });
    emojiTrigger.addEventListener("click", (e) => { e.stopPropagation(); emojiBox.style.display = emojiBox.style.display === "flex" ? "none" : "flex"; });
    emojiBox.addEventListener("click", (e) => { if (e.target.classList.contains("emoji-item")) { userInput.value += e.target.innerText; emojiBox.style.display = "none"; userInput.focus(); } });
    document.addEventListener("click", () => emojiBox.style.display = "none");
    fileBtn.addEventListener("click", () => { const f = sanitizeInput(prompt("Dosya adı:")); if (f) { userInput.value = `📁 Dosya: [${f}]`; msgForm.dispatchEvent(new Event('submit')); } });
    voiceBtn.addEventListener("click", () => { userInput.value = "🎤 [Ses Kaydı]"; msgForm.dispatchEvent(new Event('submit')); });
    logoutBtn.addEventListener("click", () => { if (confirm("Çıkış?")) { chatPage.classList.add("hidden"); loginPage.classList.remove("hidden"); if (currentMessagesRef) currentMessagesRef.off(); currentUser = null; } });
});
