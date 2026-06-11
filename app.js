import { db, auth, providerGoogle, ref, onValue, set, update, push, remove, get, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, signOut, onAuthStateChanged } from './firebase.js';

// ✅ SEU UID EXATO - NÃO MUDE
const MEU_UID = "lWScb6ixfRQRNBkPloMdKcGFHzS2";

// Variáveis Globais
let isAdmin = false;
let giftsData = [];
let siteConfig = {};
let usuarioAtualNome = "";
let itemAtualId = "";

// Elementos da página
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

// Modais
const editModal = document.getElementById('edit-modal');
const editId = document.getElementById('edit-id');
const editName = document.getElementById('edit-name');
const editPrice = document.getElementById('edit-price');
const editIcon = document.getElementById('edit-icon');
const editImagem = document.getElementById('edit-imagem');
const editPixKey = document.getElementById('edit-pixkey');
const btnDelete = document.getElementById('btn-delete');

const pixModal = document.getElementById('pix-modal');
const modalGiftName = document.getElementById('modal-gift-name');
const modalGiftValue = document.getElementById('modal-gift-value');
const modalQrCode = document.getElementById('modal-qr-code');
const pixCopiaCola = document.getElementById('pix-copia-cola');
const modalReservadoPor = document.getElementById('modal-reservado-por');
const modalMensagemRecado = document.getElementById('modal-mensagem-recado');
const botoesAcaoPix = document.getElementById('botoes-acao-pix');

const reservaModal = document.getElementById('reserva-modal');
const reservaId = document.getElementById('reserva-id');
const reservaNomeItem = document.getElementById('reserva-nome-item');
const reservaNome = document.getElementById('reserva-nome');
const reservaMensagem = document.getElementById('reserva-mensagem');

const settingsModal = document.getElementById('settings-modal');
const cfgLoginTitle = document.getElementById('cfg-login-title');
const cfgLoginSubtitle = document.getElementById('cfg-login-subtitle');
const cfgMainTitle = document.getElementById('cfg-main-title');
const cfgWelcomeText = document.getElementById('cfg-welcome-text');
const cfgBgImage = document.getElementById('cfg-bg-image');
const cfgFooterText = document.getElementById('cfg-footer-text');

const adminModal = document.getElementById('admin-modal');
const novoAdminEmail = document.getElementById('novo-admin-email');
const novoAdminSenha = document.getElementById('novo-admin-senha');

const recuperarSenhaModal = document.getElementById('recuperar-senha-modal');
const emailRecuperacao = document.getElementById('email-recuperacao');

// FUNÇÕES
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('hidden');
};

window.copyPixKey = function() {
    if (!pixCopiaCola) return;
    navigator.clipboard.writeText(pixCopiaCola.textContent)
    .then(() => alert("✅ Código PIX copiado!"))
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

// ✅ RECUPERAR SENHA - AGORA FUNCIONANDO
window.abrirRecuperarSenha = function() {
    recuperarSenhaModal.classList.remove('hidden');
};

window.enviarRecuperacao = async function() {
    const email = emailRecuperacao.value.trim();
    if(!email) return alert("Digite o e-mail!");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("✅ E-mail enviado! Verifique sua caixa de entrada (e spam).");
        closeModal('recuperar-senha-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.handleAdminLogin = async function(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const senha = document.getElementById('admin-password').value;

    try {
        const resultado = await signInWithEmailAndPassword(auth, email, senha);
        
        // 🔍 DIAGNÓSTICO COMPLETO
        const uidLogado = resultado.user.uid;
        alert(`🔍 DIAGNÓSTICO:\nSeu UID logado: ${uidLogado}\nUID cadastrado como admin: ${MEU_UID}\nSÃO IGUAIS? ${uidLogado === MEU_UID ? 'SIM ✅' : 'NÃO ❌'}`);

        // ✅ FORÇA ADMIN SE FOR SEU UID
        if (uidLogado === MEU_UID) {
            isAdmin = true;
            usuarioAtualNome = "Administrador";
            mostrarBotoesAdmin();
            alert("✅ LOGADO COMO ADMIN!");
        } else {
            // Verifica no banco
            const snapAdmin = await get(ref(db, `admins/${uidLogado}`));
            if (snapAdmin.exists()) {
                isAdmin = true;
                usuarioAtualNome = "Administrador";
                mostrarBotoesAdmin();
                alert("✅ LOGADO COMO ADMIN (cadastrado no banco)!");
            } else {
                isAdmin = false;
                alert("❌ Usuário comum");
            }
        }

        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        atualizarSaudacao();
        renderGifts();
        
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.loginComGoogle = async function() {
    try {
        const resultado = await signInWithPopup(auth, providerGoogle);
        
        // 🔍 DIAGNÓSTICO
        const uidLogado = resultado.user.uid;
        alert(`🔍 DIAGNÓSTICO GOOGLE:\nSeu UID logado: ${uidLogado}\nUID cadastrado: ${MEU_UID}\nSÃO IGUAIS? ${uidLogado === MEU_UID ? 'SIM ✅' : 'NÃO ❌'}`);

        // ✅ FORÇA ADMIN
        if (uidLogado === MEU_UID) {
            isAdmin = true;
            usuarioAtualNome = resultado.user.displayName || "Administrador";
            mostrarBotoesAdmin();
            alert("✅ LOGADO GOOGLE COMO ADMIN!");
        } else {
            const snapAdmin = await get(ref(db, `admins/${uidLogado}`));
            isAdmin = snapAdmin.exists();
            usuarioAtualNome = resultado.user.displayName || "Usuário";
            alert(isAdmin ? "✅ Admin do banco" : "❌ Usuário comum");
            if(isAdmin) mostrarBotoesAdmin();
        }

        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        atualizarSaudacao();
        renderGifts();

    } catch (erro) {
        alert("❌ Erro Google: " + erro.message);
    }
};

window.handleLogin = function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    isAdmin = false;
    if (username) {
        usuarioAtualNome = username;
        atualizarSaudacao();
        screenLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        btnNewItem.classList.add('hidden');
        btnSettings.classList.add('hidden');
        btnListaCompras.classList.add('hidden');
        btnLogs.classList.add('hidden');
        btnAdicionarAdmin.classList.add('hidden');
        renderGifts();
    }
};

window.handleLogout = async function() {
    try { await signOut(auth); } catch (e) {}
    screenDashboard.classList.add('hidden');
    screenLogin.classList.remove('hidden');
    isAdmin = false;
    usuarioAtualNome = "";
    document.getElementById('username').value = '';
};

window.openNewItemModal = function() {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    document.getElementById('edit-modal-title').textContent = "Adicionar Novo Presente";
    editId.value = "";
    editName.value = "";
    editPrice.value = "";
    editIcon.value = "";
    editImagem.value = "";
    editPixKey.value = "";
    btnDelete.classList.add('hidden');
    editModal.classList.remove('hidden');
};

window.openEditModal = function(giftId) {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    const gift = giftsData.find(g => g.id === giftId);
    if(gift) {
        document.getElementById('edit-modal-title').textContent = "Editar Presente";
        editId.value = gift.id;
        editName.value = gift.name;
        editPrice.value = gift.price;
        editIcon.value = gift.icon;
        editImagem.value = gift.imagem || "";
        editPixKey.value = gift.pixKey;
        btnDelete.classList.remove('hidden');
        editModal.classList.remove('hidden');
    }
};

window.openPixModal = function(giftId) {
    const gift = giftsData.find(g => g.id === giftId);
    if (!gift) return;
    itemAtualId = giftId;
    if(gift.reservadoPor) {
        modalReservadoPor.textContent = gift.reservadoPor;
        modalMensagemRecado.textContent = gift.mensagem || "Sem mensagem.";
        botoesAcaoPix.classList.remove('hidden');
    } else {
        modalReservadoPor.textContent = "Ainda não reservado";
        modalMensagemRecado.textContent = "";
        botoesAcaoPix.classList.add('hidden');
    }
    modalGiftName.textContent = gift.name;
    modalGiftValue.textContent = gift.price;
    pixCopiaCola.textContent = gift.pixKey;
    modalQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gift.pixKey)}`;
    pixModal.classList.remove('hidden');
};

window.abrirReserva = function(giftId, nomeItem) {
    const gift = giftsData.find(g => g.id === giftId);
    if(gift && gift.reservadoPor) {
        alert("⚠️ Já reservado!");
        return;
    }
    reservaId.value = giftId;
    reservaNomeItem.textContent = nomeItem;
    reservaNome.value = usuarioAtualNome;
    reservaModal.classList.remove('hidden');
};

window.confirmarReserva = async function(event) {
    event.preventDefault();
    const id = reservaId.value;
    const nomePessoa = reservaNome.value.trim();
    const mensagemPessoa = reservaMensagem.value.trim();
    try {
        await update(ref(db, `gifts/${id}`), { reservadoPor: nomePessoa, mensagem: mensagemPessoa, status: 'reservado' });
        alert("✅ Reserva confirmada!");
        closeModal('reserva-modal');
        openPixModal(id);
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.confirmarCompra = async function() {
    if(!itemAtualId) return;
    if(!confirm("Confirmar compra?")) return;
    try {
        await update(ref(db, `gifts/${itemAtualId}`), { status: 'pago' });
        alert("✅ Compra confirmada!");
        closeModal('pix-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.cancelarReserva = async function() {
    if(!itemAtualId) return;
    if(!confirm("Cancelar reserva?")) return;
    try {
        await update(ref(db, `gifts/${itemAtualId}`), { reservadoPor: null, mensagem: null, status: null });
        alert("✅ Reserva cancelada!");
        closeModal('pix-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.reativarItem = async function(giftId) {
    if(!isAdmin) return;
    if(!confirm("Reativar item?")) return;
    try {
        await update(ref(db, `gifts/${giftId}`), { reservadoPor: null, mensagem: null, status: null });
        alert("✅ Item reativado!");
        renderGifts();
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.abrirListaCompras = async function() {
    if(!isAdmin) return;
    const conteudo = document.getElementById('lista-compras-conteudo');
    const comprados = giftsData.filter(g => g.reservadoPor);
    conteudo.innerHTML = comprados.length === 0 ? "<p>Nenhum item</p>" : comprados.map(i => `<div class="p-2 border"><p class="font-bold">${i.name}</p><p>Comprador: ${i.reservadoPor}</p></div>`).join('');
    document.getElementById('lista-compras-modal').classList.remove('hidden');
};

window.abrirLogs = async function() {
    if(!isAdmin) return;
    const conteudo = document.getElementById('logs-conteudo');
    try {
        const snap = await get(ref(db, 'logs'));
        const logs = [];
        snap.forEach(c => logs.unshift({id:c.key,...c.val()}));
        conteudo.innerHTML = logs.length === 0 ? "<p>Nenhum log</p>" : logs.map(l=>`<div class="p-1 text-xs">[${l.data}] ${l.tipo}: ${l.descricao}</div>`).join('');
        document.getElementById('logs-modal').classList.remove('hidden');
    } catch (erro) {
        conteudo.innerHTML = "<p>Erro</p>";
    }
};

window.openSettingsModal = function() {
    if(!isAdmin) return;
    cfgLoginTitle.value = siteConfig.loginTitle || "";
    cfgLoginSubtitle.value = siteConfig.loginSubtitle || "";
    cfgMainTitle.value = siteConfig.mainTitle || "";
    cfgWelcomeText.value = siteConfig.welcomeText || "";
    cfgBgImage.value = siteConfig.backgroundImage || "";
    cfgFooterText.value = siteConfig.footerText || "";
    settingsModal.classList.remove('hidden');
};

window.abrirAdicionarAdmin = function() {
    if(!isAdmin || auth.currentUser.uid !== MEU_UID) { alert("Apenas o mestre pode cadastrar!"); return; }
    adminModal.classList.remove('hidden');
};

window.cadastrarNovoAdmin = async function(e) {
    e.preventDefault();
    const email = novoAdminEmail.value.trim();
    const senha = novoAdminSenha.value;
    try {
        const usuarioCriado = await createUserWithEmailAndPassword(auth, email, senha);
        await set(ref(db, `admins/${usuarioCriado.user.uid}`), true);
        alert("✅ Admin cadastrado!");
        closeModal('admin-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.saveItem = async function(e) {
    e.preventDefault();
    if(!isAdmin) return;
    const item = { name: editName.value.trim(), price: editPrice.value.trim(), icon: editIcon.value.trim(), imagem: editImagem.value.trim(), pixKey: editPixKey.value.trim() };
    try {
        if(editId.value) await update(ref(db, `gifts/${editId.value}`), item);
        else await set(push(ref(db, 'gifts')), item);
        closeModal('edit-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.deleteItem = async function() {
    if(!isAdmin || !confirm("Excluir?")) return;
    try { await remove(ref(db, `gifts/${editId.value}`)); closeModal('edit-modal'); } 
    catch (erro) { alert("❌ Erro: " + erro.message); }
};

window.saveSettings = async function(e) {
    e.preventDefault();
    if(!isAdmin) return;
    const dados = { loginTitle: cfgLoginTitle.value, loginSubtitle: cfgLoginSubtitle.value, mainTitle: cfgMainTitle.value, welcomeText: cfgWelcomeText.value, backgroundImage: cfgBgImage.value, footerText: cfgFooterText.value };
    try { await update(ref(db, 'configuracoes'), dados); closeModal('settings-modal'); } 
    catch (erro) { alert("❌ Erro: " + erro.message); }
};

document.addEventListener("DOMContentLoaded", () => {
    onValue(ref(db, 'configuracoes'), snap => {
        siteConfig = snap.val() || {};
        document.getElementById('login-title').textContent = siteConfig.loginTitle || "Lista de Presentes";
        document.getElementById('login-subtitle').textContent = siteConfig.loginSubtitle || "Identifique-se";
        document.getElementById('main-title').textContent = siteConfig.mainTitle || "Presentes";
        footerText.textContent = siteConfig.footerText || "© 2026";
        if(siteConfig.backgroundImage) paginaPrincipal.style.backgroundImage = `url(${siteConfig.backgroundImage})`;
    });

    onValue(ref(db, 'gifts'), snap => {
        giftsData = [];
        snap.forEach(c => giftsData.push({id:c.key,...c.val()}));
        renderGifts();
    });
});

function atualizarSaudacao() {
    welcomeText.innerHTML = `Olá, <span class="font-bold text-pink-600">${usuarioAtualNome}</span>! Escolha um item.`;
}

function mostrarBotoesAdmin() {
    btnNewItem.classList.remove('hidden');
    btnSettings.classList.remove('hidden');
    btnListaCompras.classList.remove('hidden');
    btnLogs.classList.remove('hidden');
    btnAdicionarAdmin.classList.remove('hidden');
}

function registrarLog(tipo, descricao, itemId=null) {
    push(ref(db, 'logs'), { tipo, descricao, itemId, data: new Date().toLocaleDateString('pt-BR'), hora: new Date().toLocaleTimeString('pt-BR'), usuario: usuarioAtualNome });
}

function renderGifts() {
    if(!giftsGrid) return;
    giftsGrid.innerHTML = giftsData.length === 0 ? "<p class='text-center p-4'>Nenhum item</p>" :
        giftsData.map(item => `
        <div class="bg-white rounded-xl shadow p-6 relative ${item.reservadoPor?'opacity-70':''}">
            ${isAdmin?`<button onclick="openEditModal('${item.id}')" class="absolute top-2 right-10">✏️</button>`:''}
            <div class="text-4xl mb-4"><img src="${item.icon}" class="w-12 h-12"></div>
            <h3 class="font-bold text-lg">${item.name}</h3>
            <p class="text-pink-600 font-bold text-xl">${item.price}</p>
            <button onclick="${item.reservadoPor?`openPixModal('${item.id}')`:`abrirReserva('${item.id}','${item.name}')`}" 
                class="w-full mt-3 py-2 rounded-lg ${item.reservadoPor?'bg-gray-500':'bg-pink-500 hover:bg-pink-600'} text-white">
                ${item.reservadoPor?'Ver PIX':'Escolher'}
            </button>
        </div>`).join('');
}
