document.addEventListener("DOMContentLoaded", () => {
    // Sayfa ve Form Değişkenleri
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
    
    // İşlevsel Butonlar
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

    // Bellek Sistemi
    let regUser = "admin";
    let regPass = "1234";
    let regEmail = "admin@gmail.com";
    let activeRoomId = "global";
    const roomPasswords = {};
    
    const roomMessages = {
        "global": [
            { id: 1, sender: "received", text: "🔒 Uçtan uca şifreli NexusChat hattına hoş geldiniz. Mesajların üzerine gelerek Silebilir veya Düzenleyebilirsiniz!", time: "Sistem" }
        ]
    };

    // Navigasyon
    goToRegister.addEventListener("click", () => { loginPage.classList.add("hidden"); registerPage.classList.remove("hidden"); });
    goToLogin.addEventListener("click", () => { registerPage.classList.add("hidden"); loginPage.classList.remove("hidden"); });

    // Gmail Filtreli Kayıt Kontrolü
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const u = document.getElementById("regUser").value.trim();
        const em = document.getElementById("regEmail").value.trim();
        const p = document.getElementById("regPass").value;

        if (!em.toLowerCase().endsWith("@gmail.com")) {
            alert("⚠️ Güvenlik Reddi: Yalnızca '@gmail.com' uzantılı e-postalar kabul edilir!");
            return;
        }

        regUser = u; regEmail = em; regPass = p;
        alert("Kayıt Başarılı! Belirlediğiniz Gmail ve şifreyle giriş yapın.");
        registerPage.classList.add("hidden"); loginPage.classList.remove("hidden");
    });

    // Giriş Kontrolü
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const uVal = document.getElementById("loginUser").value.trim();
        const pVal = document.getElementById("loginPass").value;

        if (uVal === regUser && pVal === regPass) {
            loginPage.classList.add("hidden"); chatPage.classList.remove("hidden");
            loadRoomMessages(activeRoomId);
        } else {
            alert("Kullanıcı adı veya şifre hatalı!");
        }
    });

    // Mesajları Yükleme Motoru
    function loadRoomMessages(roomId) {
        chatScreen.innerHTML = "";
        if (!roomMessages[roomId]) roomMessages[roomId] = [];

        roomMessages[roomId].forEach(msg => {
            const bubble = document.createElement("div");
            bubble.className = `bubble ${msg.sender}`;
            bubble.setAttribute("data-msg-id", msg.id);
            
            bubble.innerHTML = `
                <div class="msg-actions">
                    <span class="edit-action" data-id="${msg.id}">✏️</span>
                    <span class="delete-action" data-id="${msg.id}">❌</span>
                </div>
                <p class="msg-content-text">${msg.text}</p>
                <span class="time-tag">${msg.time}</span>
            `;
            chatScreen.appendChild(bubble);
        });
        chatScreen.scrollTop = chatScreen.scrollHeight;
    }
    // Mesaj Aksiyonlarını Yakalama (Silme / Düzenleme)
    chatScreen.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-action")) {
            const id = parseInt(e.target.getAttribute("data-id"));
            roomMessages[activeRoomId] = roomMessages[activeRoomId].filter(m => m.id !== id);
            loadRoomMessages(activeRoomId);
        }
        if (e.target.classList.contains("edit-action")) {
            const id = parseInt(e.target.getAttribute("data-id"));
            const msgObj = roomMessages[activeRoomId].find(m => m.id === id);
            if (!msgObj) return;
            const newText = prompt("Mesajı düzenleyin:", msgObj.text);
            if (newText && newText.trim() !== "") {
                msgObj.text = newText.trim() + " (Düzenlendi)";
                loadRoomMessages(activeRoomId);
            }
        }
    });

    // Odalar Arası Geçiş
    roomsContainer.addEventListener("click", (e) => {
        const card = e.target.closest(".chat-user");
        if (!card) return;

        const targetId = card.getAttribute("data-room-id");
        if (roomPasswords[targetId]) {
            const pass = prompt("Bu oda şifrelidir. Giriş anahtarını girin:");
            if (pass !== roomPasswords[targetId]) { alert("Hatalı şifre!"); return; }
        }

        document.querySelectorAll(".chat-user").forEach(el => el.classList.remove("active-room"));
        card.classList.add("active-room");
        activeRoomId = targetId;
        currentRoomTitle.innerText = card.querySelector(".room-title-text").innerText;
        loadRoomMessages(activeRoomId);
    });

    // Özel Sohbet Kurma
    createDMBtn.addEventListener("click", () => {
        const target = prompt("Sohbet etmek istediğiniz kullanıcının adını girin:");
        if (!target || target.trim() === "") return;
        const id = "dm_" + Date.now();
        roomMessages[id] = [{ id: 1, sender: "received", text: `${target} ile özel sohbet başlatıldı.`, time: "Sistem" }];
        addNewRoomCard(id, target, "👤");
    });

    // Şifreli Grup Kurma
    createGroupBtn.addEventListener("click", () => {
        const name = prompt("Grup adını girin:");
        if (!name || name.trim() === "") return;
        const id = "group_" + Date.now();
        
        const hasPass = confirm("Bu gruba şifre koymak istiyor musunuz?");
        if (hasPass) {
            const p = prompt("Grup için bir şifre belirleyin:");
            if (p) roomPasswords[id] = p.trim();
        }

        const lockIcon = roomPasswords[id] ? " 🔒" : "";
        roomMessages[id] = [{ id: 1, sender: "received", text: `"${name}" grubu kuruldu.`, time: "Sistem" }];
        addNewRoomCard(id, name + lockIcon, "👥");
    });

    function addNewRoomCard(id, name, icon) {
        const card = document.createElement("div");
        card.className = "chat-user";
        card.setAttribute("data-room-id", id);
        card.innerHTML = `<span class="user-icon">${icon}</span><div class="user-info"><h4 class="room-title-text">${name}</h4><p class="left-preview">Yeni oda aktif.</p></div>`;
        roomsContainer.appendChild(card);
    }

    // Mesaj Gönderme
    msgForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (text === "") return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newId = Date.now();

        roomMessages[activeRoomId].push({ id: newId, sender: "sent", text: text, time: time + " ✓✓" });
        loadRoomMessages(activeRoomId);
        
        const activeCard = document.querySelector(`[data-room-id="${activeRoomId}"]`);
        if (activeCard) activeCard.querySelector(".left-preview").innerText = "Siz: " + text;
        userInput.value = "";

        statusText.innerText = "yazıyor...";
        setTimeout(() => {
            statusText.innerText = "çevrimiçi";
            const replyId = Date.now() + 1;
            roomMessages[activeRoomId].push({ id: replyId, sender: "received", text: `[Güvenli Protokol]: "${text}" alındı.`, time: time });
            loadRoomMessages(activeRoomId);
            if (activeCard) activeCard.querySelector(".left-preview").innerText = "Sistem: Yanıtlandı.";
        }, 1200);
    });

    // Ekstra Özelleştirme Düğmeleri
    themeToggleBtn.addEventListener("click", () => document.body.classList.toggle("light-mode"));

    wallpaperBtn.addEventListener("click", () => {
        const colors = ["#0b111e", "#1a1a2e", "#16222f", "#2c3e50", "#111111"];
        const randColor = colors[Math.floor(Math.random() * colors.length)];
        document.documentElement.style.setProperty('--chat-bg', randColor);
        alert("Arka plan özelleştirildi!");
    });

    clearChatBtn.addEventListener("click", () => {
        if (confirm("Geçmiş silinsin mi?")) { roomMessages[activeRoomId] = []; loadRoomMessages(activeRoomId); }
    });

    searchBar.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll(".chat-user").forEach(card => {
            const roomName = card.querySelector(".room-title-text").innerText.toLowerCase();
            card.style.display = roomName.includes(query) ? "flex" : "none";
        });
    });

    addStoryBtn.addEventListener("click", () => {
        const imgEmoji = prompt("Hikaye emojisi girin:");
        if (imgEmoji) {
            const newStory = document.createElement("div");
            newStory.className = "story-dot";
            newStory.style.borderColor = "#00b3ff";
            newStory.innerText = imgEmoji;
            newStory.onclick = () => alert("Hikaye: " + imgEmoji);
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
        const fileName = prompt("Dosya adı yazın:");
        if (fileName) {
            userInput.value = `📁 Ekli Dosya: [${fileName}]`;
            msgForm.dispatchEvent(new Event('submit'));
        }
    });

    logoutBtn.addEventListener("click", () => {
        if (confirm("Çıkış yapılsın mı?")) { chatPage.classList.add("hidden"); loginPage.classList.remove("hidden"); }
    });
});
