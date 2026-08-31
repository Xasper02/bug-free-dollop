document.addEventListener("DOMContentLoaded", () => {
    // Sayfalar
    const loginPage = document.getElementById("loginPage");
    const registerPage = document.getElementById("registerPage");
    const chatPage = document.getElementById("chatPage");

    // Formlar, Inputlar ve Alanlar
    const goToRegister = document.getElementById("goToRegister");
    const goToLogin = document.getElementById("goToLogin");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const msgForm = document.getElementById("msgForm");
    const userInput = document.getElementById("userInput");
    const chatScreen = document.getElementById("chatScreen");
    const statusText = document.getElementById("status-text");
    const currentRoomTitle = document.getElementById("currentRoomTitle");
    
    // Gelişmiş Sohbet Kontrolleri
    const createDMBtn = document.getElementById("createDMBtn");
    const createGroupBtn = document.getElementById("createGroupBtn");
    const roomsContainer = document.getElementById("roomsContainer");

    // Sistem Veritabanı Belleği
    let registeredUser = "admin";
    let registeredPass = "1234";
    let registeredEmail = "admin@gmail.com";

    // Dinamik Oda Yönetimi Sistemi
    let activeRoomId = "global";
    const roomPasswords = {}; // Şifreli odaların şifrelerini tutar
    const roomMessages = {
        "global": [
            { sender: "received", text: "NexusChat Ultimate global ağına hoş geldiniz. Şifreli tüneller hazır.", time: "Sistem" }
        ]
    };

    // 1. Sayfa Arası Navigasyon Kontrolleri
    goToRegister.addEventListener("click", () => {
        loginPage.classList.add("hidden");
        registerPage.classList.remove("hidden");
    });

    goToLogin.addEventListener("click", () => {
        registerPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    // 2. Gelişmiş Kayıt Olma Fonksiyonu (Gmail Uzantı Filtreli)
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("regUser").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const pass = document.getElementById("regPass").value;

        // YENİ ÖZELLİK: Gmail Filtre Kontrolü
        if (!email.toLowerCase().endsWith("@gmail.com")) {
            alert("Güvenlik Protokolü Hatası:\nKayıt için yalnızca geçerli bir '@gmail.com' adresi kullanabilirsiniz!");
            return;
        }

        registeredUser = user;
        registeredEmail = email;
        registeredPass = pass;

        alert(`Kayıt Başarıyla Tamamlandı!\nKullanıcı Adı: ${registeredUser}\nE-posta doğrulaması sağlandı.`);
        registerPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    // 3. Giriş Yapma Kontrol Mekanizması
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userVal = document.getElementById("loginUser").value.trim();
        const passVal = document.getElementById("loginPass").value;

        if (userVal === registeredUser && passVal === registeredPass) {
            alert(`Erişim İzni Verildi. Güvenli oturum açıldı.`);
            loginPage.classList.add("hidden");
            chatPage.classList.remove("hidden");
            loadRoomMessages(activeRoomId);
        } else {
            alert("Kimlik Doğrulama Başarısız: Hatalı kullanıcı adı veya şifre!");
        }
    });

    // 4. Oda İçerik Yükleme Fonksiyonu
    function loadRoomMessages(roomId) {
        chatScreen.innerHTML = "";
        if (!roomMessages[roomId]) roomMessages[roomId] = [];

        roomMessages[roomId].forEach(msg => {
            const bubble = document.createElement("div");
            bubble.className = `bubble ${msg.sender}`;
            bubble.innerHTML = `${msg.text}<span class="time-tag">${msg.time}</span>`;
            chatScreen.appendChild(bubble);
        });
        chatScreen.scrollTop = chatScreen.scrollHeight;
    }

    // 5. Odalar Arası Geçiş ve Şifre Koruma Filtresi
    roomsContainer.addEventListener("click", (e) => {
        const clickedCard = e.target.closest(".chat-user");
        if (!clickedCard) return;

        const targetRoomId = clickedCard.getAttribute("data-room-id");

        // YENİ ÖZELLİK: Eğer oda şifreliyse kullanıcıya sor
        if (roomPasswords[targetRoomId]) {
            const userKey = prompt("Bu oda şifrelenmiştir. Lütfen erişim anahtarını (şifreyi) girin:");
            if (userKey !== roomPasswords[targetRoomId]) {
                alert("Hatalı erişim anahtarı! Odaya girişiniz engellendi.");
                return;
            }
        }

        // Aktif kartı görsel olarak işaretle
        document.querySelectorAll(".chat-user").forEach(el => el.classList.remove("active-room"));
        clickedCard.classList.add("active-room");

        activeRoomId = targetRoomId;
        currentRoomTitle.innerText = clickedCard.querySelector(".room-title-text").innerText;
        loadRoomMessages(activeRoomId);
    });

    // 6. YENİ ÖZELLİK: Birebir (Özel) Sohbet Odası Kurma Fonksiyonu
    createDMBtn.addEventListener("click", () => {
        const targetUser = prompt("Sohbet başlatmak istediğiniz kişinin Kullanıcı Adını yazın:");
        if (!targetUser || targetUser.trim() === "") return;

        const cleanUser = targetUser.trim();
        const dmId = "dm_" + Date.now();

        // Hafızada odayı ve başlangıç mesajını oluştur
        roomMessages[dmId] = [
            { sender: "received", text: `${cleanUser} ile uçtan uca gizli birebir sohbet tüneli açıldı.`, time: "Özel" }
        ];

        // Sol menü listesine yerleştir
        const dmElement = document.createElement("div");
        dmElement.className = "chat-user";
        dmElement.setAttribute("data-room-id", dmId);
        dmElement.innerHTML = `
            <span class="user-icon" style="border-color: #00b3ff;">👤</span>
            <div class="user-info">
                <h4 class="room-title-text">${cleanUser}</h4>
                <p class="left-preview">Birebir sohbet kanalı.</p>
            </div>
        `;
        roomsContainer.appendChild(dmElement);
        alert(`${cleanUser} ile özel sohbet odası sol listeye eklendi!`);
    });

    // 7. YENİ ÖZELLİK: Şifreli / Şifresiz Grup Kurma Fonksiyonu
    createGroupBtn.addEventListener("click", () => {
        const groupName = prompt("Kurmak istediğiniz grubun adını yazın:");
        if (!groupName || groupName.trim() === "") return;

        const cleanGroupName = groupName.trim();
        const groupId = "group_" + Date.now();

        // Kullanıcıya şifre isteyip istemediğini soralım
        const setPassword = confirm(`"${cleanGroupName}" grubuna giriş şifresi koymak istiyor musunuz?`);
        if (setPassword) {
            const groupPass = prompt("Bu grup için bir giriş şifresi belirleyin:");
            if (groupPass && groupPass.trim() !== "") {
                roomPasswords[groupId] = groupPass.trim();
            }
        }

        // Grup hafıza yapılandırması
        const isLocked = roomPasswords[groupId] ? " [🔒 Şifreli]" : "";
        roomMessages[groupId] = [
            { sender: "received", text: `"${cleanGroupName}" grubu başarıyla yapılandırıldı.${isLocked}`, time: "Sistem" }
        ];

        // Sol tarafa grubu ekle
        const groupElement = document.createElement("div");
        groupElement.className = "chat-user";
        groupElement.setAttribute("data-room-id", groupId);
        groupElement.innerHTML = `
            <span class="user-icon">👥</span>
            <div class="user-info">
                <h4 class="room-title-text">${cleanGroupName}${roomPasswords[groupId] ? " 🔒" : ""}</h4>
                <p class="left-preview">Yeni grup odası.</p>
            </div>
        `;
        roomsContainer.appendChild(groupElement);
        alert(`"${cleanGroupName}" grubu başarıyla kuruldu!`);
    });

    // 8. Mesaj Gönderme ve Yapay Robot Yanıt Tetikleyicisi
    if (msgForm) {
        msgForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = userInput.value.trim();
            if (text === "") return;

            const d = new Date();
            const time = d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0');

            // Mesajı hafızaya yaz ve ekrana yansıt
            roomMessages[activeRoomId].push({ sender: "sent", text: text, time: time + " ✓✓" });
            loadRoomMessages(activeRoomId);

            const activeCard = document.querySelector(`[data-room-id="${activeRoomId}"]`);
            if (activeCard) activeCard.querySelector(".left-preview").innerText = "Siz: " + text;

            userInput.value = "";

            // Akıllı asistan simülasyon yanıtı
            statusText.innerText = "yazıyor...";
            setTimeout(() => {
                statusText.innerText = "çevrimiçi";
                const botText = `[${currentRoomTitle.innerText}] Güvenli yanıt hattı: Mesajınız alındı.`;
                roomMessages[activeRoomId].push({ sender: "received", text: botText, time: time });
                loadRoomMessages(activeRoomId);
                if (activeCard) activeCard.querySelector(".left-preview").innerText = "Sistem: Yanıtlandı.";
            }, 1300);
        });
    }
});
