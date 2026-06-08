import { db, auth, providerGoogle, ref, onValue, set, update, push, remove, get, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';

// ✅ SEU UID QUE VOCÊ ME PASSOU - NÃO MUDE AQUI
const UID_ADMIN_CORRETO = "lWScb6ixfRQRNBkPloMdKcGFHzS2";

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

// Elementos Modais
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

// FUNÇÕES GLOBAIS
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('hidden');
};

window.copyPixKey = function() {
    if (!pixCopiaCola) return;
    navigator.clipboard.writeText(pixCopiaCola.textContent)
    .then(() => alert("✅ Código PIX copiado!"))
    .catch(() => alert("❌ Erro ao copiar, copie manualmente."));
};

window.showAdminLogin = function() {
    screenLogin.classList.add('hidden');
    screenAdminLogin.classList.remove('hidden');
};

window.hideAdminLogin = function() {
    screenAdminLogin.classList.add('hidden');
    screenLogin.classList.remove('hidden');
};

window.handleAdminLogin = async function(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const senha = document.getElementById('admin-password').value;

    try {
        const resultado = await signInWithEmailAndPassword(auth, email, senha);
        
        // 🔍 MOSTRA O UID REAL LOGADO - PARA CONFIRMAR
        alert("🔍 SEU UID LOGADO: " + resultado.user.uid + "\n✅ UID ADMIN CADASTRADO: " + UID_ADMIN_CORRETO);

        // ✅ VERIFICAÇÃO EXATA
        if (resultado.user.uid === UID_ADMIN_CORRETO) {
            isAdmin = true;
            usuarioAtualNome = "Administrador";
            mostrarBotoesAdmin();
            alert("✅ LOGADO COMO ADMINISTRADOR!");
        } else {
            isAdmin = false;
            alert("❌ NÃO É ADMIN - UID DIFERENTE");
        }

        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        atualizarSaudacao();
        renderGifts();
        
    } catch (erro) {
        console.error("ERRO LOGIN:", erro);
        alert("❌ Erro: " + erro.message);
    }
};

window.loginComGoogle = async function() {
    try {
        const resultado = await signInWithPopup(auth, providerGoogle);

        // 🔍 MOSTRA O UID REAL LOGADO - PARA CONFIRMAR
        alert("🔍 SEU UID LOGADO: " + resultado.user.uid + "\n✅ UID ADMIN CADASTRADO: " + UID_ADMIN_CORRETO);

        // ✅ VERIFICAÇÃO EXATA
        if (resultado.user.uid === UID_ADMIN_CORRETO) {
            isAdmin = true;
            usuarioAtualNome = resultado.user.displayName || "Administrador";
            mostrarBotoesAdmin();
            alert("✅ LOGADO COM GOOGLE COMO ADMIN!");
        } else {
            isAdmin = false;
            usuarioAtualNome = resultado.user.displayName || "Usuário";
            alert("✅ Acesso liberado como usuário comum");
        }

        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        atualizarSaudacao();
        renderGifts();

    } catch (erro) {
        console.error("ERRO GOOGLE:", erro);
        alert("❌ Erro: " + erro.message);
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
    if(!editModal || !isAdmin) { alert("❌ Acesso restrito ao administrador!"); return; }
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
    if(!isAdmin) { alert("❌ Acesso restrito ao administrador!"); return; }
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
        alert("⚠️ Este presente já foi escolhido por outra pessoa!");
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
        const itemRef = ref(db, `gifts/${id}`);
        await update(itemRef, {
            reservadoPor: nomePessoa,
            mensagem: mensagemPessoa,
            status: 'reservado'
        });
        registrarLog("RESERVA", `Item reservado por ${nomePessoa}`);
        alert("✅ Reserva confirmada!");
        closeModal('reserva-modal');
        openPixModal(id);
    } catch (erro) {
        alert("❌ Erro ao reservar: " + erro.message);
    }
};

window.confirmarCompra = async function() {
    if(!itemAtualId) return;
    if(!confirm("Tem certeza que deseja CONFIRMAR a compra?")) return;
    try {
        const itemRef = ref(db, `gifts/${itemAtualId}`);
        await update(itemRef, { status: 'pago' });
        registrarLog("VENDA", `Compra confirmada ID: ${itemAtualId}`);
        alert("✅ Compra confirmada!");
        closeModal('pix-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.cancelarReserva = async function() {
    if(!itemAtualId) return;
    if(!confirm("Tem certeza que deseja CANCELAR esta reserva?")) return;
    try {
        const itemRef = ref(db, `gifts/${itemAtualId}`);
        await update(itemRef, {
            reservadoPor: null,
            mensagem: null,
            status: null
        });
        registrarLog("CANCELAMENTO", `Reserva cancelada`);
        alert("✅ Reserva cancelada!");
        closeModal('pix-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.reativarItem = async function(giftId) {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    if(!confirm("Deseja reativar este item?")) return;
    try {
        const itemRef = ref(db, `gifts/${giftId}`);
        await update(itemRef, {
            reservadoPor: null,
            mensagem: null,
            status: null
        });
        registrarLog("REATIVACAO", `Item reativado`);
        alert("✅ Item reativado!");
        renderGifts();
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.abrirListaCompras = async function() {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    const conteudo = document.getElementById('lista-compras-conteudo');
    const comprados = giftsData.filter(g => g.reservadoPor);
    conteudo.innerHTML = comprados.length === 0 ? "<p class='text-center text-gray-500'>Nenhum item comprado</p>" :
        comprados.map(i => `
        <div class="p-3 border rounded bg-white">
            <p class="font-bold">${i.name} - ${i.price}</p>
            <p class="text-sm">Comprador: ${i.reservadoPor}</p>
            <p class="text-sm italic">Recado: ${i.mensagem || '---'}</p>
            <p class="text-xs ${i.status==='pago'?'text-green-600':i.status==='reservado'?'text-orange-500':'text-blue-600'}">Status: ${i.status||'Reativado'}</p>
        </div>`).join('');
    document.getElementById('lista-compras-modal').classList.remove('hidden');
};

window.abrirLogs = async function() {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    const conteudo = document.getElementById('logs-conteudo');
    try {
        const snap = await get(ref(db, 'logs'));
        const logs = [];
        snap.forEach(c => logs.unshift({id:c.key,...c.val()}));
        conteudo.innerHTML = logs.length === 0 ? "<p class='text-center text-gray-500'>Nenhum registro</p>" :
            logs.map(l=>`<div class="p-2 border-b"><span class="text-xs text-gray-500">[${l.data} ${l.hora}]</span> <span class="font-semibold">${l.tipo}</span> ${l.descricao} <span class="text-xs">por ${l.usuario}</span></div>`).join('');
        document.getElementById('logs-modal').classList.remove('hidden');
    } catch (erro) {
        conteudo.innerHTML = "<p class='text-red-500'>Erro ao carregar</p>";
    }
};

window.openSettingsModal = function() {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    cfgLoginTitle.value = siteConfig.loginTitle || "";
    cfgLoginSubtitle.value = siteConfig.loginSubtitle || "";
    cfgMainTitle.value = siteConfig.mainTitle || "";
    cfgWelcomeText.value = siteConfig.welcomeText || "";
    cfgBgImage.value = siteConfig.backgroundImage || "";
    cfgFooterText.value = siteConfig.footerText || "";
    settingsModal.classList.remove('hidden');
};

window.saveItem = async function(e) {
    e.preventDefault();
    if(!isAdmin) return;
    const item = {
        name: editName.value.trim(),
        price: editPrice.value.trim(),
        icon: editIcon.value.trim(),
        imagem: editImagem.value.trim(),
        pixKey: editPixKey.value.trim()
    };
    try {
        if(editId.value) {
            await update(ref(db, `gifts/${editId.value}`), item);
            registrarLog("EDIÇÃO", `Item alterado: ${item.name}`, editId.value);
        } else {
            const novaRef = push(ref(db, 'gifts'));
            await set(novaRef, item);
            registrarLog("CRIAÇÃO", `Novo item: ${item.name}`, novaRef.key);
        }
        closeModal('edit-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.deleteItem = async function() {
    if(!isAdmin || !confirm("Excluir item permanentemente?")) return;
    try {
        const nome = giftsData.find(g=>g.id===editId.value)?.name;
        await remove(ref(db, `gifts/${editId.value}`));
        registrarLog("EXCLUSÃO", `Item excluído: ${nome}`, editId.value);
        closeModal('edit-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.saveSettings = async function(e) {
    e.preventDefault();
    if(!isAdmin) return;
    const dados = {
        loginTitle: cfgLoginTitle.value,
        loginSubtitle: cfgLoginSubtitle.value,
        mainTitle: cfgMainTitle.value,
        welcomeText: cfgWelcomeText.value,
        backgroundImage: cfgBgImage.value,
        footerText: cfgFooterText.value
    };
    try {
        await update(ref(db, 'configuracoes'), dados);
        registrarLog("CONFIG", "Configurações alteradas");
        closeModal('settings-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Carrega configurações
    onValue(ref(db, 'configuracoes'), snap => {
        siteConfig = snap.val() || {};
        document.getElementById('login-title').textContent = siteConfig.loginTitle || "Lista de Presentes";
        document.getElementById('login-subtitle').textContent = siteConfig.loginSubtitle || "Identifique-se para acessar";
        document.getElementById('main-title').textContent = siteConfig.mainTitle || "Presentes";
        footerText.textContent = siteConfig.footerText || "© 2026";
        if(siteConfig.backgroundImage) paginaPrincipal.style.backgroundImage = `url(${siteConfig.backgroundImage})`;
        if(usuarioAtualNome) atualizarSaudacao();
    });

    // ✅ CARREGA TODOS OS ITENS - CORRIGIDO
    onValue(ref(db, 'gifts'), snap => {
        giftsData = [];
        snap.forEach(childSnapshot => {
            giftsData.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        renderGifts();
    });
});

function atualizarSaudacao() {
    welcomeText.innerHTML = (siteConfig.welcomeText || "Olá, [NOME]! Escolha um item para presentear.")
        .replace("[NOME]", `<span class="font-semibold text-pink-600">${usuarioAtualNome}</span>`);
}

function mostrarBotoesAdmin() {
    btnNewItem.classList.remove('hidden');
    btnSettings.classList.remove('hidden');
    btnListaCompras.classList.remove('hidden');
    btnLogs.classList.remove('hidden');
}

function registrarLog(tipo, descricao, itemId=null) {
    const agora = new Date();
    push(ref(db, 'logs'), {
        tipo, descricao, itemId,
        data: agora.toLocaleDateString('pt-BR'),
        hora: agora.toLocaleTimeString('pt-BR'),
        usuario: usuarioAtualNome
    });
}

function renderGifts() {
    if(!giftsGrid) return;
    giftsGrid.innerHTML = giftsData.length === 0 ? "<p class='text-center col-span-full bg-white/80 p-4 rounded'>Nenhum item cadastrado</p>" :
        giftsData.map(item => `
        <div class="card-item bg-white rounded-xl shadow p-6 relative ${item.reservadoPor?'reservado':''}">
            <div class="card-overlay"></div>
            ${isAdmin?`<button onclick="openEditModal('${item.id}')" class="absolute top-2 right-10 text-gray-700 hover:text-pink-600">✏️</button>`:''}
            ${isAdmin && item.reservadoPor?`<button onclick="reativarItem('${item.id}')" class="absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">🔄 Reativar</button>`:''}
            <div class="text-4xl mb-4 bg-pink-50/80 p-3 rounded-xl inline-block">
                <img src="${item.icon}" class="icon-img" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3099/3099358.png'">
            </div>
            <h3 class="font-bold text-lg">${item.name}</h3>
            <p class="text-pink-600 font-bold text-xl my-2">${item.price}</p>
            <button onclick="${item.reservadoPor?`openPixModal('${item.id}')`:`abrirReserva('${item.id}','${item.name.replace(/'/g, "\\'")}')`}" 
                class="w-full mt-2 py-2 rounded-lg font-semibold ${item.reservadoPor?'bg-gray-500/90 text-white':'bg-pink-500/90 hover:bg-pink-600 text-white'}">
                ${item.reservadoPor?'Ver PIX/Recado':'Escolher este'}
            </button>
        </div>`).join('');
}
