document.addEventListener("DOMContentLoaded", () => {
    // Sayfalar
    const loginPage = document.getElementById("loginPage");
    const registerPage = document.getElementById("registerPage");
    const chatPage = document.getElementById("chatPage");

    // Butonlar, Formlar ve Alanlar
    const goToRegister = document.getElementById("goToRegister");
    const goToLogin = document.getElementById("goToLogin");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const msgForm = document.getElementById("msgForm");
    const userInput = document.getElementById("userInput");
    const chatScreen = document.getElementById("chatScreen");
    const statusText = document.getElementById("status-text");
    const currentRoomTitle = document.getElementById("currentRoomTitle");
    
    // Yeni Grup Özellikleri Bileşenleri
    const createGroupBtn = document.getElementById("createGroupBtn");
    const roomsContainer = document.getElementById("roomsContainer");

    // Sistem Belleği (Tarayıcı sıfırlanana kadar kayıtlı kişileri ve odaları tutar)
    let registeredUser = "admin";
    let registeredPass = "1234";
    let registeredEmail = "admin@gmail.com";

    // Odaların mesaj geçmişlerini birbirinden ayıran veri yapısı
    let activeRoomId = "global";
    const roomMessages = {
        "global": [
            { sender: "received", text: "NexusChat global tüneline hoş geldiniz. CORS engellemeleri temizlendi.", time: "16:15" }
        ]
    };

    // 1. Ekran Geçişleri
    goToRegister.addEventListener("click", () => {
        loginPage.classList.add("hidden");
        registerPage.classList.remove("hidden");
    });

    goToLogin.addEventListener("click", () => {
        registerPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    // 2. Yeni Kayıt Olma Fonksiyonu (Gmail Destekli)
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        registeredUser = document.getElementById("regUser").value.trim();
        registeredEmail = document.getElementById("regEmail").value.trim();
        registeredPass = document.getElementById("regPass").value;

        alert(`Kayıt Başarılı!\nKullanıcı: ${registeredUser}\nE-posta: ${registeredEmail}\n\nŞimdi giriş yapabilirsiniz.`);
        registerPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    // 3. Giriş Yapma Fonksiyonu
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userVal = document.getElementById("loginUser").value.trim();
        const passVal = document.getElementById("loginPass").value;

        if (userVal === registeredUser && passVal === registeredPass) {
            alert(`Giriş Yetkisi Onaylandı. Hoş geldin, ${userVal}!`);
            loginPage.classList.add("hidden");
            chatPage.classList.remove("hidden");
            
            // Sohbet ekranını ilk açılışta yükle
            loadRoomMessages(activeRoomId);
        } else {
            alert("Hatalı Kullanıcı Adı veya Şifre!");
        }
    });

    // 4. Dinamik Oda/Grup Seçme ve Yükleme Motoru
    function loadRoomMessages(roomId) {
        chatScreen.innerHTML = "";
        
        // Eğer odaya ait geçmiş yoksa boş bir dizi tanımla
        if (!roomMessages[roomId]) {
            roomMessages[roomId] = [];
        }

        // Odaya ait mesajları ekrana bas
        roomMessages[roomId].forEach(msg => {
            const bubbleDiv = document.createElement("div");
            bubbleDiv.className = `bubble ${msg.sender}`;
            bubbleDiv.innerHTML = `${msg.text}<span class="time-tag">${msg.time}</span>`;
            chatScreen.appendChild(bubbleDiv);
        });
        chatScreen.scrollTop = chatScreen.scrollHeight;
    }

    // Sol taraftaki odalara tıklayınca odayı değiştiren olay yakalayıcı
    roomsContainer.addEventListener("click", (e) => {
        const clickedUserCard = e.target.closest(".chat-user");
        if (!clickedUserCard) return;

        // Eski aktif odanın parlama efektini sök, yeniye tak
        document.querySelectorAll(".chat-user").forEach(el => el.classList.remove("active-room"));
        clickedUserCard.classList.add("active-room");

        // Odayı değiştir ve başlığı güncelle
        activeRoomId = clickedUserCard.getAttribute("data-room-id");
        const roomName = clickedUserCard.querySelector(".room-title-text").innerText;
        currentRoomTitle.innerText = roomName;

        // Yeni odanın mesaj geçmişini ekrana getir
        loadRoomMessages(activeRoomId);
    });

    // 5. YENİ ÖZELLİK: Herkesin Grup Oluşturmasını Sağlayan Fonksiyon
    createGroupBtn.addEventListener("click", () => {
        const groupName = prompt("Oluşturmak istediğiniz grubun adını yazın:");
        if (!groupName || groupName.trim() === "") {
            alert("Grup adı boş bırakılamaz!");
            return;
        }

        const cleanGroupName = groupName.trim();
        const uniqueId = "room_" + Date.now(); // Rastgele benzersiz oda ID'si

        // Yeni oda için boş mesaj geçmişi kaydet
        roomMessages[uniqueId] = [
            { sender: "received", text: `"${cleanGroupName}" grubu başarıyla kuruldu. Mesaj yazarak başlatın!`, time: "Şimdi" }
        ];

        // Sol menüye yeni grubu ekle
        const newGroupElement = document.createElement("div");
        newGroupElement.className = "chat-user";
        newGroupElement.setAttribute("data-room-id", uniqueId);
        newGroupElement.innerHTML = `
            <span class="user-icon">👥</span>
            <div class="user-info">
                <h4 class="room-title-text">${cleanGroupName}</h4>
                <p class="left-preview">Yeni grup oluşturuldu.</p>
            </div>
        `;
        
        roomsContainer.appendChild(newGroupElement);
        alert(`"${cleanGroupName}" grubu başarıyla oluşturuldu! Sol listeden tıklayarak yazışabilirsiniz.`);
    });

    // 6. Mesaj Gönderme Fonksiyonu (Aktif odaya yazar)
    if (msgForm) {
        msgForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = userInput.value.trim();
            if (text === "") return;

            const d = new Date();
            const time = d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0');

            // 1. Veriyi aktif odanın hafızasına kaydet
            roomMessages[activeRoomId].push({ sender: "sent", text: text, time: time + " ✓✓" });

            // 2. Ekranı güncelle (Sadece o anki odayı yeniden yükle)
            loadRoomMessages(activeRoomId);

            // Sol önizleme yazısını güncelle
            const activeCard = document.querySelector(`[data-room-id="${activeRoomId}"]`);
            if (activeCard) {
                activeCard.querySelector(".left-preview").innerText = "Siz: " + text;
            }

            userInput.value = "";

            // Bot yanıt simülasyonu
            statusText.innerText = "yazıyor...";
            setTimeout(() => {
                statusText.innerText = "çevrimiçi";
                
                const botText = `[${currentRoomTitle.innerText}] Güvenli tünel teyit mesajı: "${text}"`;
                roomMessages[activeRoomId].push({ sender: "received", text: botText, time: time });
                
                loadRoomMessages(activeRoomId);
                if (activeCard) {
                    activeCard.querySelector(".left-preview").innerText = "Sistem: Yanıtlandı.";
                }
            }, 1200);
        });
    }
});
