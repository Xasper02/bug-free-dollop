document.addEventListener("DOMContentLoaded", () => {
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
    const leftPreview = document.getElementById("left-preview");
    const statusText = document.getElementById("status-text");

    // Varsayılan hesap bilgisi (Kayıt olunca güncellenir)
    let registeredUser = "admin";
    let registeredPass = "1234";

    // Sayfa Değiştirme Fonksiyonları
    goToRegister.addEventListener("click", () => {
        loginPage.classList.add("hidden");
        registerPage.classList.remove("hidden");
    });

    goToLogin.addEventListener("click", () => {
        registerPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    // Kayıt Formu
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        registeredUser = document.getElementById("regUser").value.trim();
        registeredPass = document.getElementById("regPass").value;
        alert("Hesap açıldı! Giriş yapabilirsiniz.");
        registerPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    // Giriş Formu
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userVal = document.getElementById("loginUser").value.trim();
        const passVal = document.getElementById("loginPass").value;

        if (userVal === registeredUser && passVal === registeredPass) {
            alert(`Hoş geldin, ${userVal}`);
            loginPage.classList.add("hidden");
            chatPage.classList.remove("hidden");
            leftPreview.innerText = "Tünel aktif.";
        } else {
            alert("Hatalı kullanıcı adı veya şifre!");
        }
    });

    // Mesaj Gönderme
    if (msgForm) {
        msgForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = userInput.value.trim();
            if (text === "") return;

            const d = new Date();
            const time = d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0');

            const msg = document.createElement("div");
            msg.className = "bubble sent";
            msg.innerHTML = `${text}<span class="time-tag">${time} ✓✓</span>`;

            chatScreen.appendChild(msg);
            userInput.value = "";
            leftPreview.innerText = "Siz: " + text;
            chatScreen.scrollTop = chatScreen.scrollHeight;

            // Yapay Cevap Sistemi
            statusText.innerText = "yazıyor...";
            setTimeout(() => {
                statusText.innerText = "çevrimiçi";
                const reply = document.createElement("div");
                reply.className = "bubble received";
                reply.innerHTML = `Mesaj alındı: "${text}"<span class="time-tag">${time}</span>`;
                chatScreen.appendChild(reply);
                chatScreen.scrollTop = chatScreen.scrollHeight;
                leftPreview.innerText = "Destek: Cevap iletildi.";
            }, 1500);
        });
    }
});
