// ==============================================
// CONFIGURAÇÃO DO FIREBASE - COLE SEUS DADOS AQUI
// ==============================================
const firebaseConfig = {
    apiKey: "AIzaSyC..._COLE_SUA_API_KEY_AQUI",
    authDomain: "lista-sophia.firebaseapp.com",
    databaseURL: "https://lista-sophia-default-rtdb.firebaseio.com/",
    projectId: "lista-sophia",
    storageBucket: "lista-sophia.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const providerGoogle = new firebase.auth.GoogleAuthProvider();

// ==============================================
// SEU UID DE ADMINISTRADOR (NÃO ALTERE SE FOR ESSE)
// ==============================================
const MEU_UID = "lWScb6ixfRQRNBkPloMdKcGFHzS2";

// ==============================================
// VARIÁVEIS GLOBAIS
// ==============================================
let isAdmin = false;
let giftsData = [];
let siteConfig = {};
let usuarioAtualNome = "";
let itemAtualId = "";

// ==============================================
// REFERÊNCIAS AOS ELEMENTOS DA TELA
// ==============================================
const screenLogin = document.getElementById('screen-login');
const screenAdminLogin = document.getElementById('screen-admin-login');
const screenDashboard = document.getElementById('screen-dashboard');
const giftsGrid = document.getElementById('gifts-grid');
const welcomeText = document.getElementById('welcomeText');
const footerText = document.getElementById('footer-text');
const paginaPrincipal = document.getElementById('pagina-principal');

// Botões de Admin
const btnNewItem = document.getElementById('btn-new-item');
const btnSettings = document.getElementById('btn-settings');
const btnListaCompras = document.getElementById('btn-lista-compras');
const btnLogs = document.getElementById('btn-logs');
const btnAdicionarAdmin = document.getElementById('btn-adicionar-admin');

// ==============================================
// FUNÇÕES GLOBAIS
// ==============================================

// Fechar qualquer modal
window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.add('hidden');
};

// Copiar chave PIX
window.copyPixKey = function() {
    const texto = document.getElementById('pix-copia-cola').textContent;
    navigator.clipboard.writeText(texto)
    .then(() => alert("✅ Código PIX copiado com sucesso!"))
    .catch(() => alert("❌ Erro ao copiar. Copie manualmente."));
};

// Mostrar tela de login de Admin
window.showAdminLogin = function() {
    screenLogin.classList.add('hidden');
    screenAdminLogin.classList.remove('hidden');
};

// Voltar para tela de login comum
window.hideAdminLogin = function() {
    screenAdminLogin.classList.add('hidden');
    screenLogin.classList.remove('hidden');
};

// Abrir modal de recuperação de senha
window.abrirRecuperarSenha = function() {
    document.getElementById('recuperar-senha-modal').classList.remove('hidden');
};

// Enviar e-mail de recuperação
window.enviarRecuperacao = function() {
    const email = document.getElementById('email-recuperacao').value.trim();
    if (!email) return alert("⚠️ Digite o seu e-mail cadastrado!");

    auth.sendPasswordResetEmail(email)
    .then(() => {
        alert("✅ E-mail enviado! Verifique sua caixa de entrada (ou spam).");
        closeModal('recuperar-senha-modal');
    })
    .catch((erro) => {
        alert("❌ Erro: " + erro.message);
    });
};

// Login de usuário comum (apenas nome)
window.handleLogin = function(event) {
    event.preventDefault();
    const nomeDigitado = document.getElementById('username').value.trim();
    
    if (!nomeDigitado) return alert("⚠️ Por favor, digite seu nome!");

    usuarioAtualNome = nomeDigitado;
    isAdmin = false; // Usuário comum

    atualizarSaudacao();
    screenLogin.classList.add('hidden');
    screenDashboard.classList.remove('hidden');
    renderGifts(); // Carrega os itens
};

// Login de Administrador (E-mail e Senha)
window.handleAdminLogin = function(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const senha = document.getElementById('admin-password').value;

    auth.signInWithEmailAndPassword(email, senha)
    .then((resultado) => {
        const uidLogado = resultado.user.uid;

        // DIAGNÓSTICO: Mostra se o UID está correto
        alert(`🔍 DIAGNÓSTICO DE ACESSO:
Seu UID: ${uidLogado}
UID Cadastrado como Admin: ${MEU_UID}
SÃO IGUAIS? ${uidLogado === MEU_UID ? 'SIM ✅' : 'NÃO ❌'}`);

        // VERIFICA SE É ADMIN
        if (uidLogado === MEU_UID) {
            isAdmin = true;
            usuarioAtualNome = "Administrador";
            mostrarBotoesAdmin(); // Libera os botões
            alert("✅ ACESSO ADMINISTRADOR LIBERADO!");
        } else {
            // Verifica no banco se está na lista de admins
            return db.ref(`admins/${uidLogado}`).once('value').then((snap) => {
                if (snap.exists()) {
                    isAdmin = true;
                    usuarioAtualNome = "Administrador";
                    mostrarBotoesAdmin();
                    alert("✅ ACESSO ADMIN LIBERADO (cadastrado no banco)!");
                } else {
                    isAdmin = false;
                    alert("❌ Acesso apenas como Usuário Comum.");
                }
            });
        }

        // Entra na área principal
        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        atualizarSaudacao();
        renderGifts();
    })
    .catch((erro) => {
        alert("❌ Erro no login: " + erro.message);
    });
};

// Login com Google
window.loginComGoogle = function() {
    auth.signInWithPopup(providerGoogle)
    .then((resultado) => {
        const uidLogado = resultado.user.uid;

        alert(`🔍 DIAGNÓSTICO GOOGLE:
Seu UID Google: ${uidLogado}
UID Admin Principal: ${MEU_UID}
SÃO IGUAIS? ${uidLogado === MEU_UID ? 'SIM ✅' : 'NÃO ❌'}`);

        if (uidLogado === MEU_UID) {
            isAdmin = true;
            usuarioAtualNome = resultado.user.displayName || "Administrador";
            mostrarBotoesAdmin();
            alert("✅ LOGADO COMO ADMIN (GOOGLE)!");
        } else {
            return db.ref(`admins/${uidLogado}`).once('value').then((snap) => {
                isAdmin = snap.exists();
                usuarioAtualNome = resultado.user.displayName || "Usuário";
                if (isAdmin) mostrarBotoesAdmin();
            });
        }

        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        atualizarSaudacao();
        renderGifts();
    })
    .catch((erro) => {
        alert("❌ Erro Google: " + erro.message);
    });
};

// Logout / Sair
window.handleLogout = function() {
    auth.signOut().catch(() => {});
    isAdmin = false;
    usuarioAtualNome = "";
    screenDashboard.classList.add('hidden');
    screenLogin.classList.remove('hidden');
    document.getElementById('username').value = '';
};

// Abrir modal para NOVO item
window.openNewItemModal = function() {
    if (!isAdmin) return alert("❌ Acesso restrito a administradores!");
    
    document.getElementById('edit-modal-title').textContent = "Adicionar Novo Presente";
    document.getElementById('edit-id').value = "";
    document.getElementById('edit-name').value = "";
    document.getElementById('edit-price').value = "";
    document.getElementById('edit-icon').value = "";
    document.getElementById('edit-imagem').value = "";
    document.getElementById('edit-pixkey').value = "";
    document.getElementById('btn-delete').classList.add('hidden');
    document.getElementById('edit-modal').classList.remove('hidden');
};

// Abrir modal para EDITAR item
window.openEditModal = function(itemId) {
    if (!isAdmin) return alert("❌ Acesso restrito a administradores!");

    const item = giftsData.find(g => g.id === itemId);
    if (!item) return;

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

// Abrir modal do PIX e detalhes
window.openPixModal = function(itemId) {
    const item = giftsData.find(g => g.id === itemId);
    if (!item) return;

    itemAtualId = itemId;

    // Preenche dados
    document.getElementById('modal-gift-name').textContent = item.name;
    document.getElementById('modal-gift-value').textContent = item.price;
    document.getElementById('pix-copia-cola').textContent = item.pixKey;
    
    // Gera QR Code
    document.getElementById('modal-qr-code').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(item.pixKey)}`;

    // Verifica se está reservado
    if (item.reservadoPor) {
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

// Abrir modal de Reserva
window.abrirReserva = function(itemId, nomeItem) {
    const item = giftsData.find(g => g.id === itemId);
    if (item && item.reservadoPor) return alert("⚠️ Este item já foi reservado!");

    document.getElementById('reserva-id').value = itemId;
    document.getElementById('reserva-nome-item').textContent = nomeItem;
    document.getElementById('reserva-nome').value = usuarioAtualNome;
    document.getElementById('reserva-modal').classList.remove('hidden');
};

// Confirmar Reserva
window.confirmarReserva = function(event) {
    event.preventDefault();
    const id = document.getElementById('reserva-id').value;
    const nome = document.getElementById('reserva-nome').value.trim();
    const mensagem = document.getElementById('reserva-mensagem').value.trim();

    db.ref(`gifts/${id}`).update({
        reservadoPor: nome,
        mensagem: mensagem,
        status: 'reservado'
    })
    .then(() => {
        alert("✅ Reserva confirmada com sucesso!");
        closeModal('reserva-modal');
        openPixModal(id);
    })
    .catch((erro) => {
        alert("❌ Erro ao reservar: " + erro.message);
    });
};

// Confirmar que o item foi comprado
window.confirmarCompra = function() {
    if (!confirm("Tem certeza que deseja marcar como COMPRADO?")) return;

    db.ref(`gifts/${itemAtualId}`).update({ status: 'pago' })
    .then(() => {
        alert("✅ Compra confirmada!");
        closeModal('pix-modal');
    });
};

// Cancelar reserva
window.cancelarReserva = function() {
    if (!confirm("Tem certeza que deseja CANCELAR esta reserva?")) return;

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

// Reativar item (limpa reserva)
window.reativarItem = function(itemId) {
    if (!isAdmin) return;
    if (!confirm("Reativar este item? Ele ficará disponível novamente.")) return;

    db.ref(`gifts/${itemId}`).update({
        reservadoPor: null,
        mensagem: null,
        status: null
    });
};

// Abrir lista de itens comprados/reservados
window.abrirListaCompras = function() {
    if (!isAdmin) return;

    const comprados = giftsData.filter(g => g.reservadoPor);
    let html = "";

    if (comprados.length === 0) {
        html = "<p class='text-center text-gray-500 py-4'>Nenhum item reservado ou comprado ainda.</p>";
    } else {
        html = comprados.map(item => `
        <div class="p-3 border-b border-gray-200">
            <p class="font-bold text-lg">${item.name} - ${item.price}</p>
            <p class="text-sm text-gray-700">Comprador: ${item.reservadoPor}</p>
            <p class="text-sm text-gray-600 italic">Recado: ${item.mensagem || '---'}</p>
            <p class="text-xs mt-1 ${item.status === 'pago' ? 'text-green-600' : 'text-orange-500'}">
                Status: ${item.status === 'pago' ? 'Pago' : 'Reservado'}
            </p>
        </div>`).join('');
    }

    document.getElementById('lista-compras-conteudo').innerHTML = html;
    document.getElementById('lista-compras-modal').classList.remove('hidden');
};

// Abrir logs de ação
window.abrirLogs = function() {
    if (!isAdmin) return;

    db.ref('logs').orderByKey().limitToLast(30).once('value').then((snap) => {
        const logs = [];
        snap.forEach(c => logs.unshift({ id: c.key, ...c.val() }));

        let html = "";
        if (logs.length === 0) {
            html = "<p class='text-center text-gray-500'>Nenhum registro encontrado.</p>";
        } else {
            html = logs.map(l => `
            <div class="p-2 border-b text-sm">
                <span class="text-gray-500 text-xs">[${l.data} ${l.hora}]</span>
                <strong class="ml-1">${l.tipo}</strong>: ${l.descricao}
                <span class="text-xs text-gray-600 ml-2">por ${l.usuario}</span>
            </div>`).join('');
        }

        document.getElementById('logs-conteudo').innerHTML = html;
        document.getElementById('logs-modal').classList.remove('hidden');
    });
};

// Abrir configurações do sistema
window.openSettingsModal = function() {
    if (!isAdmin) return;

    document.getElementById('cfg-login-title').value = siteConfig.loginTitle || "";
    document.getElementById('cfg-login-subtitle').value = siteConfig.loginSubtitle || "";
    document.getElementById('cfg-main-title').value = siteConfig.mainTitle || "";
    document.getElementById('cfg-welcome-text').value = siteConfig.welcomeText || "";
    document.getElementById('cfg-bg-image').value = siteConfig.backgroundImage || "";
    document.getElementById('cfg-footer-text').value = siteConfig.footerText || "";

    document.getElementById('settings-modal').classList.remove('hidden');
};

// Abrir cadastro de NOVO ADMIN
window.abrirAdicionarAdmin = function() {
    // Apenas o dono do UID principal pode cadastrar outros
    if (!isAdmin || !auth.currentUser || auth.currentUser.uid !== MEU_UID) {
        return alert("❌ Apenas o administrador principal pode cadastrar novos acessos!");
    }
    document.getElementById('admin-modal').classList.remove('hidden');
};

// Cadastrar novo administrador
window.cadastrarNovoAdmin = function(event) {
    event.preventDefault();
    const email = document.getElementById('novo-admin-email').value.trim();
    const senha = document.getElementById('novo-admin-senha').value;

    auth.createUserWithEmailAndPassword(email, senha)
    .then((usuarioCriado) => {
        // Salva o UID no nó 'admins' do banco
        return db.ref(`admins/${usuarioCriado.user.uid}`).set(true);
    })
    .then(() => {
        alert("✅ Novo Administrador cadastrado com sucesso!");
        closeModal('admin-modal');
        document.getElementById('novo-admin-email').value = "";
        document.getElementById('novo-admin-senha').value = "";
    })
    .catch((erro) => {
        alert("❌ Erro: " + erro.message);
    });
};

// Salvar item (novo ou editado)
window.saveItem = function(event) {
    event.preventDefault();
    if (!isAdmin) return;

    const dadosItem = {
        name: document.getElementById('edit-name').value.trim(),
        price: document.getElementById('edit-price').value.trim(),
        icon: document.getElementById('edit-icon').value.trim(),
        imagem: document.getElementById('edit-imagem').value.trim(),
        pixKey: document.getElementById('edit-pixkey').value.trim()
    };

    const id = document.getElementById('edit-id').value;
    const referencia = id ? db.ref(`gifts/${id}`) : db.ref('gifts').push();

    referencia.set(dadosItem)
    .then(() => closeModal('edit-modal'));
};

// Excluir item
window.deleteItem = function() {
    if (!isAdmin || !confirm("Tem certeza que deseja EXCLUIR este item? Essa ação não pode ser desfeita!")) return;

    db.ref(`gifts/${document.getElementById('edit-id').value}`).remove()
    .then(() => closeModal('edit-modal'));
};

// Salvar configurações do sistema
window.saveSettings = function(event) {
    event.preventDefault();
    if (!isAdmin) return;

    const dadosConfig = {
        loginTitle: document.getElementById('cfg-login-title').value,
        loginSubtitle: document.getElementById('cfg-login-subtitle').value,
        mainTitle: document.getElementById('cfg-main-title').value,
        welcomeText: document.getElementById('cfg-welcome-text').value,
        backgroundImage: document.getElementById('cfg-bg-image').value,
        footerText: document.getElementById('cfg-footer-text').value
    };

    db.ref('configuracoes').update(dadosConfig)
    .then(() => closeModal('settings-modal'));
};

// ==============================================
// FUNÇÕES DE APOIO E CARREGAMENTO
// ==============================================

// Atualiza mensagem de boas-vindas
function atualizarSaudacao() {
    welcomeText.innerHTML = (siteConfig.welcomeText || "Olá, <span class='font-bold text-pink-600'>[NOME]</span>! Escolha um item para presentear.")
        .replace("[NOME]", usuarioAtualNome);
}

// Mostra os botões exclusivos de admin
function mostrarBotoesAdmin() {
    btnNewItem.classList.remove('hidden');
    btnSettings.classList.remove('hidden');
    btnListaCompras.classList.remove('hidden');
    btnLogs.classList.remove('hidden');
    btnAdicionarAdmin.classList.remove('hidden');
}

// Registrar ação no log
function registrarLog(tipo, descricao, itemId = null) {
    const agora = new Date();
    db.ref('logs').push({
        tipo: tipo,
        descricao: descricao,
        itemId: itemId,
        data: agora.toLocaleDateString('pt-BR'),
        hora: agora.toLocaleTimeString('pt-BR'),
        usuario: usuarioAtualNome
    });
}

// Renderiza os itens na tela
function renderGifts() {
    if (!giftsGrid) return;

    if (giftsData.length === 0) {
        giftsGrid.innerHTML = "<p class='text-center col-span-full bg-white/80 p-6 rounded-xl'>Nenhum presente cadastrado ainda.</p>";
        return;
    }

    giftsGrid.innerHTML = giftsData.map(item => `
    <div class="card-item bg-white rounded-xl shadow p-6 relative ${item.reservadoPor ? 'reservado' : ''}">
        <!-- Botão Editar (só admin vê) -->
        ${isAdmin ? `<button onclick="openEditModal('${item.id}')" class="absolute top-2 right-10 text-gray-600 hover:text-pink-500 text-lg">✏️</button>` : ''}

        <!-- Ícone/Imagem -->
        <div class="text-4xl mb-4">
            <img src="${item.icon || 'https://cdn-icons-png.flaticon.com/512/3099/3099358.png'}" alt="Ícone" class="w-12 h-12 object-contain">
        </div>

        <!-- Dados do Item -->
        <h3 class="font-bold text-lg text-gray-800 mb-1">${item.name}</h3>
        <p class="text-pink-600 font-bold text-xl mb-3">${item.price}</p>

        <!-- Botão de Ação -->
        <button 
            onclick="${item.reservadoPor ? `openPixModal('${item.id}')` : `abrirReserva('${item.id}','${item.name.replace(/'/g, "\\'")}')`}"
            class="w-full py-2.5 rounded-lg font-semibold transition-colors ${item.reservadoPor ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-pink-500 hover:bg-pink-600 text-white'}">
            ${item.reservadoPor ? 'Ver Detalhes / PIX' : 'Escolher este presente'}
        </button>
    </div>`).join('');
}

// ==============================================
// INICIALIZAÇÃO DO SISTEMA
// ==============================================
document.addEventListener("DOMContentLoaded", () => {
    // Carrega configurações do site
    db.ref('configuracoes').on('value', (snap) => {
        siteConfig = snap.val() || {};
        
        document.getElementById('login-title').textContent = siteConfig.loginTitle || "Lista de Presentes";
        document.getElementById('login-subtitle').textContent = siteConfig.loginSubtitle || "Identifique-se para acessar";
        document.getElementById('main-title').textContent = siteConfig.mainTitle || "Nossos Presentes";
        footerText.textContent = siteConfig.footerText || "© 2026 - Todos os direitos reservados";

        if (siteConfig.backgroundImage) {
            paginaPrincipal.style.backgroundImage = `url(${siteConfig.backgroundImage})`;
            paginaPrincipal.style.backgroundSize = 'cover';
            paginaPrincipal.style.backgroundPosition = 'center';
        }

        if (usuarioAtualNome) atualizarSaudacao();
    });

    // Carrega lista de presentes
    db.ref('gifts').on('value', (snap) => {
        giftsData = [];
        snap.forEach((child) => {
            giftsData.push({
                id: child.key,
                ...child.val()
            });
        });
        renderGifts();
    });
});
