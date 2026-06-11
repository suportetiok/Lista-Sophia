// CONFIGURAÇÃO DO FIREBASE - COLE SEUS DADOS AQUI
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "lista-sophia.firebaseapp.com",
    databaseURL: "https://lista-sophia-default-rtdb.firebaseio.com/",
    projectId: "lista-sophia",
    storageBucket: "lista-sophia.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const providerGoogle = new firebase.auth.GoogleAuthProvider();

// SEU UID DE ADMIN
const MEU_UID = "lWScb6ixfRQRNBkPloMdKcGFHzS2";

// VARIÁVEIS GLOBAIS
let isAdmin = false;
let giftsData = [];
let siteConfig = {};
let usuarioAtualNome = "";
let itemAtualId = "";

// ELEMENTOS DA TELA
const screenLogin = document.getElementById('screen-login');
const screenAdminLogin = document.getElementById('screen-admin-login');
const screenDashboard = document.getElementById('screen-dashboard');
const giftsGrid = document.getElementById('gifts-grid');
const welcomeText = document.getElementById('welcomeText');
const footerText = document.getElementById('footer-text');
const paginaPrincipal = document.getElementById('pagina-principal');

const btnNewItem = document.getElementById('btn-new-item');
const btnSettings = document.getElementById('btn-settings');
const btnListaCompras = document.getElementById('btn-lista-compras');
const btnLogs = document.getElementById('btn-logs');
const btnAdicionarAdmin = document.getElementById('btn-adicionar-admin');

// FUNÇÕES
window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.add('hidden');
};

window.copyPixKey = function() {
    navigator.clipboard.writeText(document.getElementById('pix-copia-cola').textContent)
    .then(() => alert("✅ Código copiado!"))
    .catch(() => alert("❌ Erro ao copiar"));
};

window.showAdminLogin = function() {
    screenLogin.classList.add('hidden');
    screenAdminLogin.classList.remove('hidden');
};

window.hideAdminLogin = function() {
    screenAdminLogin.classList.add('hidden');
    screenLogin.classList.remove('hidden');
};

window.abrirRecuperarSenha = function() {
    document.getElementById('recuperar-senha-modal').classList.remove('hidden');
};

window.enviarRecuperacao = function() {
    const email = document.getElementById('email-recuperacao').value.trim();
    if(!email) return alert("Digite o e-mail!");
    auth.sendPasswordResetEmail(email)
    .then(() => {
        alert("✅ E-mail enviado! Verifique sua caixa de entrada.");
        closeModal('recuperar-senha-modal');
    })
    .catch(err => alert("❌ Erro: " + err.message));
};

window.handleLogin = function(e) {
    e.preventDefault();
    const nome = document.getElementById('username').value.trim();
    if(!nome) return alert("Digite seu nome!");
    usuarioAtualNome = nome;
    isAdmin = false;
    atualizarSaudacao();
    screenLogin.classList.add('hidden');
    screenDashboard.classList.remove('hidden');
    renderGifts();
};

window.handleAdminLogin = function(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const senha = document.getElementById('admin-password').value;

    auth.signInWithEmailAndPassword(email, senha)
    .then(result => {
        const uid = result.user.uid;
        alert(`🔍 UID LOGADO: ${uid}\nUID ADMIN: ${MEU_UID}\nIGUAIS? ${uid === MEU_UID ? 'SIM ✅' : 'NÃO ❌'}`);
        
        if(uid === MEU_UID) {
            isAdmin = true;
            usuarioAtualNome = "Administrador";
            mostrarBotoesAdmin();
            alert("✅ LOGADO COMO ADMIN!");
        } else {
            return db.ref(`admins/${uid}`).once('value').then(snap => {
                if(snap.exists()) {
                    isAdmin = true;
                    usuarioAtualNome = "Administrador";
                    mostrarBotoesAdmin();
                    alert("✅ ADMIN CADASTRADO NO BANCO!");
                } else {
                    isAdmin = false;
                    alert("❌ USUÁRIO COMUM");
                }
            });
        }

        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        atualizarSaudacao();
        renderGifts();
    })
    .catch(err => alert("❌ Erro: " + err.message));
};

window.loginComGoogle = function() {
    auth.signInWithPopup(providerGoogle)
    .then(result => {
        const uid = result.user.uid;
        alert(`🔍 UID GOOGLE: ${uid}\nUID ADMIN: ${MEU_UID}\nIGUAIS? ${uid === MEU_UID ? 'SIM ✅' : 'NÃO ❌'}`);

        if(uid === MEU_UID) {
            isAdmin = true;
            usuarioAtualNome = result.user.displayName || "Administrador";
            mostrarBotoesAdmin();
            alert("✅ LOGADO GOOGLE ADMIN!");
        } else {
            return db.ref(`admins/${uid}`).once('value').then(snap => {
                isAdmin = snap.exists();
                usuarioAtualNome = result.user.displayName || "Usuário";
                if(isAdmin) mostrarBotoesAdmin();
            });
        }

        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        atualizarSaudacao();
        renderGifts();
    })
    .catch(err => alert("❌ Erro Google: " + err.message));
};

window.handleLogout = function() {
    auth.signOut();
    isAdmin = false;
    usuarioAtualNome = "";
    screenDashboard.classList.add('hidden');
    screenLogin.classList.remove('hidden');
    document.getElementById('username').value = '';
};

window.openNewItemModal = function() {
    if(!isAdmin) return alert("❌ Acesso restrito!");
    document.getElementById('edit-modal-title').textContent = "Novo Presente";
    document.getElementById('edit-id').value = "";
    document.getElementById('edit-name').value = "";
    document.getElementById('edit-price').value = "";
    document.getElementById('edit-icon').value = "";
    document.getElementById('edit-imagem').value = "";
    document.getElementById('edit-pixkey').value = "";
    document.getElementById('btn-delete').classList.add('hidden');
    document.getElementById('edit-modal').classList.remove('hidden');
};

window.openEditModal = function(id) {
    if(!isAdmin) return alert("❌ Acesso restrito!");
    const item = giftsData.find(g => g.id === id);
    if(!item) return;
    document.getElementById('edit-modal-title').textContent = "Editar Presente";
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-price').value = item.price;
    document.getElementById('edit-icon').value = item.icon || "";
    document.getElementById('edit-imagem').value = item.imagem || "";
    document.getElementById('edit-pixkey').value = item.pixKey;
    document.getElementById('btn-delete').classList.remove('hidden');
    document.getElementById('edit-modal').classList.remove('hidden');
};

window.openPixModal = function(id) {
    const item = giftsData.find(g => g.id === id);
    if(!item) return;
    itemAtualId = id;

    document.getElementById('modal-gift-name').textContent = item.name;
    document.getElementById('modal-gift-value').textContent = item.price;
    document.getElementById('pix-copia-cola').textContent = item.pixKey;
    document.getElementById('modal-qr-code').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(item.pixKey)}`;

    if(item.reservadoPor) {
        document.getElementById('modalReservadoPor').textContent = item.reservadoPor;
        document.getElementById('modalMensagemRecado').textContent = item.mensagem || "Sem mensagem";
        document.getElementById('botoes-acao-pix').classList.remove('hidden');
    } else {
        document.getElementById('modalReservadoPor').textContent = "Ainda não reservado";
        document.getElementById('modalMensagemRecado').textContent = "";
        document.getElementById('botoes-acao-pix').classList.add('hidden');
    }

    document.getElementById('pix-modal').classList.remove('hidden');
};

window.abrirReserva = function(id, nome) {
    const item = giftsData.find(g => g.id === id);
    if(item && item.reservadoPor) return alert("⚠️ Já reservado!");
    document.getElementById('reserva-id').value = id;
    document.getElementById('reserva-nome-item').textContent = nome;
    document.getElementById('reserva-nome').value = usuarioAtualNome;
    document.getElementById('reserva-modal').classList.remove('hidden');
};

window.confirmarReserva = function(e) {
    e.preventDefault();
    const id = document.getElementById('reserva-id').value;
    const nome = document.getElementById('reserva-nome').value.trim();
    const msg = document.getElementById('reserva-mensagem').value.trim();

    db.ref(`gifts/${id}`).update({
        reservadoPor: nome,
        mensagem: msg,
        status: 'reservado'
    })
    .then(() => {
        alert("✅ Reserva confirmada!");
        closeModal('reserva-modal');
        openPixModal(id);
    })
    .catch(err => alert("❌ Erro: " + err.message));
};

window.confirmarCompra = function() {
    if(!confirm("Confirmar compra?")) return;
    db.ref(`gifts/${itemAtualId}`).update({ status: 'pago' })
    .then(() => {
        alert("✅ Compra confirmada!");
        closeModal('pix-modal');
    });
};

window.cancelarReserva = function() {
    if(!confirm("Cancelar reserva?")) return;
    db.ref(`gifts/${itemAtualId}`).update({
        reservadoPor: null,
        mensagem: null,
        status: null
    })
    .then(() => {
        alert("✅ Reserva cancelada!");
        closeModal('pix-modal');
    });
};

window.abrirListaCompras = function() {
    if(!isAdmin) return;
    const comprados = giftsData.filter(g => g.reservadoPor);
    const html = comprados.length === 0 
        ? "<p class='text-center text-gray-500'>Nenhum item comprado</p>"
        : comprados.map(i => `
            <div class="p-3 border rounded bg-white">
                <p class="font-bold">${i.name} - ${i.price}</p>
                <p class="text-sm">Comprador: ${i.reservadoPor}</p>
                <p class="text-sm italic">Recado: ${i.mensagem || '---'}</p>
            </div>`).join('');
    document.getElementById('lista-compras-conteudo').innerHTML = html;
    document.getElementById('lista-compras-modal').classList.remove('hidden');
};

window.abrirLogs = function() {
    if(!isAdmin) return;
    db.ref('logs').orderByKey().limitToLast(20).once('value').then(snap => {
        const logs = [];
        snap.forEach(c => logs.unshift({id:c.key,...c.val()}));
        const html = logs.length === 0 
            ? "<p class='text-center text-gray-500'>Nenhum registro</p>"
            : logs.map(l => `<div class="p-1 border-b text-xs"><span class="text-gray-500">[${l.data} ${l.hora}]</span> <strong>${l.tipo}</strong>: ${l.descricao}</div>`).join('');
        document.getElementById('logs-conteudo').innerHTML = html;
        document.getElementById('logs-modal').classList.remove('hidden');
    });
};

window.openSettingsModal = function() {
    if(!isAdmin) return;
    document.getElementById('cfg-login-title').value = siteConfig.loginTitle || "";
    document.getElementById('cfg-login-subtitle').value = siteConfig.loginSubtitle || "";
    document.getElementById('cfg-main-title').value = siteConfig.mainTitle || "";
    document.getElementById('cfg-welcome-text').value = siteConfig.welcomeText || "";
    document.getElementById('cfg-bg-image').value = siteConfig.backgroundImage || "";
    document.getElementById('cfg-footer-text').value = siteConfig.footerText || "";
    document.getElementById('settings-modal').classList.remove('hidden');
};

window.abrirAdicionarAdmin = function() {
    if(!isAdmin || auth.currentUser.uid !== MEU_UID) return alert("❌ Apenas você pode cadastrar!");
    document.getElementById('admin-modal').classList.remove('hidden');
};

window.cadastrarNovoAdmin = function(e) {
    e.preventDefault();
    const email = document.getElementById('novo-admin-email').value.trim();
    const senha = document.getElementById('novo-admin-senha').value;

    auth.createUserWithEmailAndPassword(email, senha)
    .then(usuario => {
        return db.ref(`admins/${usuario.user.uid}`).set(true);
    })
    .then(() => {
        alert("✅ Novo admin cadastrado!");
        closeModal('admin-modal');
        document.getElementById('novo-admin-email').value = "";
        document.getElementById('novo-admin-senha').value = "";
    })
    .catch(err => alert("❌ Erro: " + err.message));
};

window.saveItem = function(e) {
    e.preventDefault();
    if(!isAdmin) return;
    const dados = {
        name: document.getElementById('edit-name').value.trim(),
        price: document.getElementById('edit-price').value.trim(),
        icon: document.getElementById('edit-icon').value.trim(),
        imagem: document.getElementById('edit-imagem').value.trim(),
        pixKey: document.getElementById('edit-pixkey').value.trim()
    };

    const id = document.getElementById('edit-id').value;
    const ref = id ? db.ref(`gifts/${id}`) : db.ref('gifts').push();
    ref.set(dados).then(() => closeModal('edit-modal'));
};

window.deleteItem = function() {
    if(!isAdmin || !confirm("Excluir?")) return;
    db.ref(`gifts/${document.getElementById('edit-id').value}`).remove().then(() => closeModal('edit-modal'));
};

window.saveSettings = function(e) {
    e.preventDefault();
    if(!isAdmin) return;
    const dados = {
        loginTitle: document.getElementById('cfg-login-title').value,
        loginSubtitle: document.getElementById('cfg-login-subtitle').value,
        mainTitle: document.getElementById('cfg-main-title').value,
        welcomeText: document.getElementById('cfg-welcome-text').value,
        backgroundImage: document.getElementById('cfg-bg-image').value,
        footerText: document.getElementById('cfg-footer-text').value
    };
    db.ref('configuracoes').update(dados).then(() => closeModal('settings-modal'));
};

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    db.ref('configuracoes').on('value', snap => {
        siteConfig = snap.val() || {};
        document.getElementById('login-title').textContent = siteConfig.loginTitle || "Lista de Presentes";
        document.getElementById('login-subtitle').textContent = siteConfig.loginSubtitle || "Identifique-se";
        document.getElementById('main-title').textContent = siteConfig.mainTitle || "Presentes";
        footerText.textContent = siteConfig.footerText || "© 2026";
        if(siteConfig.backgroundImage) paginaPrincipal.style.backgroundImage = `url(${siteConfig.backgroundImage})`;
        if(usuarioAtualNome) atualizarSaudacao();
    });

    db.ref('gifts').on('value', snap => {
        giftsData = [];
        snap.forEach(c => giftsData.push({id:c.key, ...c.val()}));
        renderGifts();
    });
});

function atualizarSaudacao() {
    welcomeText.innerHTML = (siteConfig.welcomeText || "Olá, [NOME]! Escolha um item.")
        .replace("[NOME]", `<span class="font-bold text-pink-600">${usuarioAtualNome}</span>`);
}

function mostrarBotoesAdmin() {
    btnNewItem.classList.remove('hidden');
    btnSettings.classList.remove('hidden');
    btnListaCompras.classList.remove('hidden');
    btnLogs.classList.remove('hidden');
    btnAdicionarAdmin.classList.remove('hidden');
}

function renderGifts() {
    if(!giftsGrid) return;
    giftsGrid.innerHTML = giftsData.length === 0 
        ? "<p class='text-center col-span-full p-8 bg-white/80 rounded-xl'>Nenhum item cadastrado</p>"
        : giftsData.map(item => `
        <div class="card-item bg-white rounded-xl shadow p-6 relative ${item.reservadoPor ? 'reservado' : ''}">
            ${isAdmin ? `<button onclick="openEditModal('${item.id}')" class="absolute top-2 right-10 text-gray-600 hover:text-pink-500">✏️</button>` : ''}
            <div class="text-4xl mb-4">
                <img src="${item.icon || 'https://cdn-icons-png.flaticon.com/512/3099/3099358.png'}" class="w-12 h-12 object-contain">
            </div>
            <h3 class="font-bold text-lg">${item.name}</h3>
            <p class="text-pink-600 font-bold text-xl my-2">${item.price}</p>
            <button onclick="${item.reservadoPor ? `openPixModal('${item.id}')` : `abrirReserva('${item.id}','${item.name.replace(/'/g, "\\'")}')`}" 
                class="w-full mt-2 py-2 rounded-lg font-semibold ${item.reservadoPor ? 'bg-gray-500 text-white' : 'bg-pink-500 hover:bg-pink-600 text-white'}">
                ${item.reservadoPor ? 'Ver PIX' : 'Escolher este'}
            </button>
        </div>`).join('');
}
