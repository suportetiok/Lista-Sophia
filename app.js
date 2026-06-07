import { db, auth, providerGoogle, ref, onValue, set, update, push, remove, get, signInWithEmailAndPassword, signInWithPopup, signOut } from './firebase.js';

let isAdmin = false;
let giftsData = [];
let siteConfig = {};
let usuarioAtualNome = "";
let itemAtualId = "";

// Elementos
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

// Modais
const editModal = document.getElementById('edit-modal');
const editId = document.getElementById('edit-id');
const editName = document.getElementById('edit-name');
const editPrice = document.getElementById('edit-price');
const editIcon = document.getElementById('edit-icon');
const editImagem = document.getElementById('edit-imagem');
const editPixKey = document.getElementById('edit-pixkey');
const editPixAlternativa = document.getElementById('edit-pix-alternativa');
const btnDelete = document.getElementById('btn-delete');

const pixModal = document.getElementById('pix-modal');
const modalGiftName = document.getElementById('modal-gift-name');
const modalGiftValue = document.getElementById('modal-gift-value');
const modalQrCode = document.getElementById('modal-qr-code');
const pixCopiaCola = document.getElementById('pix-copia-cola');
const pixAlternativa = document.getElementById('pix-alternativa');
const modalReservadoPor = document.getElementById('modalReservadoPor');
const modalMensagemRecado = document.getElementById('modalMensagemRecado');
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


// Fechar Modal
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('hidden');

    if(modalId === 'reserva-modal' && reservaId.value) cancelarReservaAoFechar(reservaId.value);
    if(modalId === 'pix-modal' && itemAtualId) cancelarReservaAoFechar(itemAtualId);
};

async function cancelarReservaAoFechar(idItem) {
    try {
        const itemRef = ref(db, `gifts/${idItem}`);
        await update(itemRef, { reservadoPor: null, mensagem: null, status: null });
        registrarLog("CANCELAMENTO_AO_FECHAR", `Janela fechada → reserva cancelada`, idItem);
    } catch (erro) { console.log("Aviso:", erro.message); }
}

window.copyPixKey = function() {
    navigator.clipboard.writeText(pixCopiaCola.textContent)
        .then(() => alert("✅ Chave copiada!"))
        .catch(() => alert("❌ Erro ao copiar"));
};

window.showAdminLogin = () => { screenLogin.classList.add('hidden'); screenAdminLogin.classList.remove('hidden'); };
window.hideAdminLogin = () => { screenAdminLogin.classList.add('hidden'); screenLogin.classList.remove('hidden'); };

window.handleAdminLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const senha = document.getElementById('admin-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, senha);
        isAdmin = true; usuarioAtualNome = "Administrador";
        screenAdminLogin.classList.add('hidden'); screenDashboard.classList.remove('hidden');
        mostrarBotoesAdmin(); atualizarSaudacao(); renderGifts();
    } catch (erro) { alert("❌ Erro: " + erro.message); }
};

window.loginComGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, providerGoogle);
        isAdmin = true; usuarioAtualNome = res.user.displayName || "Admin";
        screenAdminLogin.classList.add('hidden'); screenDashboard.classList.remove('hidden');
        mostrarBotoesAdmin(); atualizarSaudacao(); renderGifts();
    } catch (erro) { alert("❌ Erro Google: " + erro.message); }
};

window.handleLogin = (e) => {
    e.preventDefault();
    const nome = document.getElementById('username').value.trim();
    if(nome) {
        isAdmin = false; usuarioAtualNome = nome;
        atualizarSaudacao(); screenLogin.classList.add('hidden'); screenDashboard.classList.remove('hidden');
        btnNewItem.classList.add('hidden'); btnSettings.classList.add('hidden'); btnListaCompras.classList.add('hidden'); btnLogs.classList.add('hidden');
        renderGifts();
    }
};

window.handleLogout = async () => {
    await signOut().catch(()=>{});
    screenDashboard.classList.add('hidden'); screenLogin.classList.remove('hidden');
    isAdmin = false; usuarioAtualNome = "";
};

window.openNewItemModal = () => {
    if(!isAdmin) return alert("❌ Acesso restrito");
    editModal.classList.remove('hidden');
    document.getElementById('edit-modal-title').textContent = "Adicionar Item";
    editId.value = ""; editName.value = ""; editPrice.value = ""; editIcon.value = ""; editImagem.value = ""; editPixKey.value = ""; editPixAlternativa.value = "";
    btnDelete.classList.add('hidden');
};

window.openEditModal = (id) => {
    if(!isAdmin) return alert("❌ Acesso restrito");
    const item = giftsData.find(g=>g.id===id);
    if(item) {
        editModal.classList.remove('hidden');
        document.getElementById('edit-modal-title').textContent = "Editar Item";
        editId.value = id; editName.value = item.name; editPrice.value = item.price; editIcon.value = item.icon; editImagem.value = item.imagem || "";
        editPixKey.value = item.pixKey; editPixAlternativa.value = item.pixAlternativa || "";
        btnDelete.classList.remove('hidden');
    }
};

window.openPixModal = (id) => {
    const item = giftsData.find(g=>g.id===id);
    if(!item) return;
    itemAtualId = id;

    if(item.reservadoPor) {
        modalReservadoPor.textContent = item.reservadoPor;
        modalMensagemRecado.textContent = item.mensagem || "Sem mensagem";
        botoesAcaoPix.classList.remove('hidden');
    } else {
        modalReservadoPor.textContent = "Ainda não reservado";
        modalMensagemRecado.textContent = "";
        botoesAcaoPix.classList.add('hidden');
    }

    modalGiftName.textContent = item.name;
    modalGiftValue.textContent = item.price;
    pixCopiaCola.textContent = item.pixKey;
    pixAlternativa.textContent = item.pixAlternativa || "";
    modalQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(item.pixKey)}`;
    pixModal.classList.remove('hidden');
};

window.abrirReserva = (id, nome) => {
    const item = giftsData.find(g=>g.id===id);
    if(item?.reservadoPor) return alert("⚠️ Já reservado");
    reservaId.value = id; reservaNomeItem.textContent = nome; reservaNome.value = usuarioAtualNome; reservaMensagem.value = "";
    reservaModal.classList.remove('hidden');
};

window.confirmarReserva = async (e) => {
    e.preventDefault();
    const id = reservaId.value;
    const nome = reservaNome.value.trim();
    const msg = reservaMensagem.value.trim();
    if(!nome) return alert("❌ Nome obrigatório");
    try {
        await update(ref(db, `gifts/${id}`), { reservadoPor: nome, mensagem: msg, status: 'reservado' });
        registrarLog("RESERVA", `Reservado por ${nome}`, id);
        closeModal('reserva-modal'); openPixModal(id);
    } catch (erro) { alert("❌ Erro: " + erro.message); }
};

window.confirmarCompra = async () => {
    if(!confirm("Confirmar compra?")) return;
    try {
        await update(ref(db, `gifts/${itemAtualId}`), { status: 'pago' });
        registrarLog("VENDA", "Compra confirmada", itemAtualId);
        closeModal('pix-modal');
    } catch (erro) { alert("❌ Erro: " + erro.message); }
};

window.cancelarReserva = async () => {
    if(!confirm("Cancelar reserva?")) return;
    try {
        await update(ref(db, `gifts/${itemAtualId}`), { reservadoPor: null, mensagem: null, status: null });
        registrarLog("CANCELAMENTO", "Reserva cancelada", itemAtualId);
        closeModal('pix-modal');
    } catch (erro) { alert("❌ Erro: " + erro.message); }
};

window.reativarItem = async (id) => {
    if(!isAdmin) return;
    if(!confirm("Reativar? Mantém dados na lista de comprados")) return;
    try {
        await update(ref(db, `gifts/${id}`), { status: null });
        registrarLog("REATIVACAO", "Item reativado", id);
        renderGifts();
    } catch (erro) { alert("❌ Erro: " + erro.message); }
};

window.abrirListaCompras = async () => {
    if(!isAdmin) return;
    const conteudo = document.getElementById('lista-compras-conteudo');
    const comprados = giftsData.filter(g=>g.reservadoPor);
    conteudo.innerHTML = comprados.length === 0 ? "<p class='text-center text-gray-500'>Nenhum item comprado</p>" :
        comprados.map(i => `
        <div class="p-3 border rounded bg-white">
            <p class="font-bold">${i.name} - ${i.price}</p>
            <p class="text-sm">Comprador: ${i.reservadoPor}</p>
            <p class="text-sm italic">Recado: ${i.mensagem || '---'}</p>
            <p class="text-xs ${i.status==='pago'?'text-green-600':i.status==='reservado'?'text-orange-500':'text-blue-600'}">Status: ${i.status||'Reativado'}</p>
        </div>`).join('');
    document.getElementById('lista-compras-modal').class.remove('hidden');
};

window.abrirLogs = async () => {
    if(!isAdmin) return;
    const conteudo = document.getElementById('logs-conteudo');
    try {
        const snap = await get(ref(db, 'logs'));
        const logs = []; snap.forEach(c=>logs.unshift({id:c.key,...c.val()}));
        conteudo.innerHTML = logs.length === 0 ? "<p class='text-center text-gray-500'>Nenhum registro</p>" :
            logs.map(l=>`<div class="p-2 border-b"><span class="text-xs text-gray-500">[${l.data} ${l.hora}]</span> <span class="font-semibold">${l.tipo}</span> ${l.descricao} <span class="text-xs">por ${l.usuario}</span></div>`).join('');
        document.getElementById('logs-modal').classList.remove('hidden');
    } catch (erro) { conteudo.innerHTML = "<p class='text-red-500'>Erro ao carregar</p>"; }
};

window.openSettingsModal = () => {
    if(!isAdmin) return;
    cfgLoginTitle.value = siteConfig.loginTitle || "";
    cfgLoginSubtitle.value = siteConfig.loginSubtitle || "";
    cfgMainTitle.value = siteConfig.mainTitle || "";
    cfgWelcomeText.value = siteConfig.welcomeText || "";
    cfgBgImage.value = siteConfig.backgroundImage || "";
    cfgFooterText.value = siteConfig.footerText || "";
    settingsModal.classList.remove('hidden');
};

window.saveItem = async (e) => {
    e.preventDefault();
    if(!isAdmin) return;
    const item = {
        name: editName.value.trim(),
        price: editPrice.value.trim(),
        icon: editIcon.value.trim(),
        imagem: editImagem.value.trim(),
        pixKey: editPixKey.value.trim(),
        pixAlternativa: editPixAlternativa.value.trim()
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
    } catch (erro) { alert("❌ Erro: " + erro.message); }
};

window.deleteItem = async () => {
    if(!isAdmin || !confirm("Excluir item?")) return;
    try {
        const nome = giftsData.find(g=>g.id===editId.value)?.name;
        await remove(ref(db, `gifts/${editId.value}`));
        registrarLog("EXCLUSÃO", `Item excluído: ${nome}`, editId.value);
        closeModal('edit-modal');
    } catch (erro) { alert("❌ Erro: " + erro.message); }
};

window.saveSettings = async (e) => {
    e.preventDefault();
    if(!isAdmin) return;
    const dados = {
        loginTitle: cfgLoginTitle.value, loginSubtitle: cfgLoginSubtitle.value,
        mainTitle: cfgMainTitle.value, welcomeText: cfgWelcomeText.value,
        backgroundImage: cfgBgImage.value, footerText: cfgFooterText.value
    };
    try {
        await update(ref(db, 'configuracoes'), dados);
        registrarLog("CONFIG", "Configurações alteradas");
        closeModal('settings-modal');
    } catch (erro) { alert("❌ Erro: " + erro.message); }
};


document.addEventListener("DOMContentLoaded", () => {
    onValue(ref(db, 'configuracoes'), snap => {
        siteConfig = snap.val() || {};
        document.getElementById('login-title').textContent = siteConfig.loginTitle || "Lista de Presentes";
        document.getElementById('login-subtitle').textContent = siteConfig.loginSubtitle || "Identifique-se";
        document.getElementById('main-title').textContent = siteConfig.mainTitle || "Presentes";
        footerText.textContent = siteConfig.footerText || "© 2026";
        if(siteConfig.backgroundImage) paginaPrincipal.style.backgroundImage = `url(${siteConfig.backgroundImage})`;
        if(usuarioAtualNome) atualizarSaudacao();
    });

    onValue(ref(db, 'gifts'), snap => {
        giftsData = [];
        snap.forEach(c => giftsData.push({id:c.key, ...c.val()}));
        renderGifts();
    });
});


function atualizarSaudacao() {
    welcomeText.innerHTML = (siteConfig.welcomeText || "Olá, [NOME]! Escolha um item.")
        .replace("[NOME]", `<span class="font-semibold text-pink-600">${usuarioAtualNome}</span>`);
}

function mostrarBotoesAdmin() {
    btnNewItem.classList.remove('hidden'); btnSettings.classList.remove('hidden');
    btnListaCompras.classList.remove('hidden'); btnLogs.classList.remove('hidden');
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
