import { db, auth, providerGoogle, ref, onValue, set, update, push, remove, get, child, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';

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
  document.getElementById(modalId)?.classList.add('hidden');
};

window.copyPixKey = function() {
  navigator.clipboard.writeText(pixCopiaCola.textContent)
    .then(() => alert("✅ Código PIX copiado!"))
    .catch(() => alert("❌ Erro ao copiar, copie manualmente."));
};

window.showAdminLogin = () => {
  screenLogin.classList.add('hidden');
  screenAdminLogin.classList.remove('hidden');
};

window.hideAdminLogin = () => {
  screenAdminLogin.classList.add('hidden');
  screenLogin.classList.remove('hidden');
};

window.handleAdminLogin = async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const senha = document.getElementById('admin-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, senha);
    isAdmin = true;
    usuarioAtualNome = "Administrador";
    screenAdminLogin.classList.add('hidden');
    screenDashboard.classList.remove('hidden');
    mostrarBotoesAdmin();
    atualizarSaudacao();
    renderGifts();
    alert("✅ Logado como Administrador!");
  } catch (erro) {
    alert("❌ Erro: Verifique e-mail e senha.");
  }
};

window.loginComGoogle = async () => {
  try {
    await signInWithPopup(auth, providerGoogle);
    isAdmin = true;
    usuarioAtualNome = auth.currentUser.displayName || "Administrador";
    screenAdminLogin.classList.add('hidden');
    screenDashboard.classList.remove('hidden');
    mostrarBotoesAdmin();
    atualizarSaudacao();
    renderGifts();
    alert("✅ Logado com Google!");
  } catch (erro) {
    alert("❌ Erro Google: " + erro.message);
  }
};

window.handleLogin = (e) => {
  e.preventDefault();
  const nome = document.getElementById('username').value.trim();
  if (nome) {
    isAdmin = false;
    usuarioAtualNome = nome;
    atualizarSaudacao();
    screenLogin.classList.add('hidden');
    screenDashboard.classList.remove('hidden');
    // Esconde tudo de admin
    btnNewItem.classList.add('hidden');
    btnSettings.classList.add('hidden');
    btnListaCompras.classList.add('hidden');
    btnLogs.classList.add('hidden');
    renderGifts();
  }
};

window.handleLogout = async () => {
  await signOut().catch(() => {});
  screenDashboard.classList.add('hidden');
  screenLogin.classList.remove('hidden');
  isAdmin = false;
  usuarioAtualNome = "";
  document.getElementById('username').value = '';
};

window.openNewItemModal = () => {
  if (!isAdmin) return alert("❌ Acesso restrito!");
  editModal.classList.remove('hidden');
  document.getElementById('edit-modal-title').textContent = "Adicionar Presente";
  editId.value = "";
  editName.value = "";
  editPrice.value = "";
  editIcon.value = "";
  editImagem.value = "";
  editPixKey.value = "";
  btnDelete.classList.add('hidden');
};

window.openEditModal = (id) => {
  if (!isAdmin) return alert("❌ Acesso restrito!");
  const g = giftsData.find(i => i.id === id);
  if (!g) return;
  editModal.classList.remove('hidden');
  document.getElementById('edit-modal-title').textContent = "Editar Presente";
  editId.value = g.id;
  editName.value = g.name;
  editPrice.value = g.price;
  editIcon.value = g.icon;
  editImagem.value = g.imagem || "";
  editPixKey.value = g.pixKey;
  btnDelete.classList.remove('hidden');
};

window.openPixModal = (id) => {
  const g = giftsData.find(i => i.id === id);
  if (!g) return;
  itemAtualId = id;

  modalGiftName.textContent = g.name;
  modalGiftValue.textContent = g.price;
  pixCopiaCola.textContent = g.pixKey;
  modalQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(g.pixKey)}`;

  if (g.reservadoPor) {
    modalReservadoPor.textContent = g.reservadoPor;
    modalMensagemRecado.textContent = g.mensagem || "Sem mensagem";
    botoesAcaoPix.classList.remove('hidden');
  } else {
    modalReservadoPor.textContent = "Disponível";
    modalMensagemRecado.textContent = "";
    botoesAcaoPix.classList.add('hidden');
  }
  pixModal.classList.remove('hidden');
};

window.abrirReserva = (id, nomeItem) => {
  const g = giftsData.find(i => i.id === id);
  if (!g) return;
  if (g.reservadoPor) return alert("⚠️ Já está reservado!");

  reservaId.value = id;
  reservaNomeItem.textContent = nomeItem;
  reservaNome.value = usuarioAtualNome;
  reservaMensagem.value = "";
  reservaModal.classList.remove('hidden');
};

window.confirmarReserva = async (e) => {
  e.preventDefault();
  const id = reservaId.value;
  const nome = reservaNome.value.trim();
  const msg = reservaMensagem.value.trim();
  if (!nome) return alert("❌ Nome obrigatório!");

  try {
    await update(ref(db, `gifts/${id}`), {
      reservadoPor: nome,
      mensagem: msg,
      status: 'reservado'
    });
    registrarLog("RESERVA", `Reservado por ${nome}`, id);
    alert("✅ Reserva feita!");
    closeModal('reserva-modal');
    openPixModal(id);
  } catch (erro) {
    alert("❌ Erro: " + erro.message);
  }
};

window.confirmarCompra = async () => {
  if (!itemAtualId) return;
  if (!confirm("Marcar como PAGO?")) return;
  await update(ref(db, `gifts/${itemAtualId}`), { status: 'pago' });
  registrarLog("VENDA", "Compra confirmada", itemAtualId);
  alert("✅ Marcado como pago!");
  closeModal('pix-modal');
};

window.cancelarReserva = async () => {
  if (!itemAtualId) return;
  if (!confirm("Cancelar reserva?")) return;
  await update(ref(db, `gifts/${itemAtualId}`), {
    reservadoPor: null,
    mensagem: null,
    status: null
  });
  registrarLog("CANCELAMENTO", "Reserva cancelada", itemAtualId);
  alert("✅ Reserva cancelada!");
  closeModal('pix-modal');
};

// ✅ REATIVAR: NÃO APAGA NADA, SÓ VOLTA DISPONÍVEL
window.reativarItem = async (id) => {
  if (!isAdmin) return alert("❌ Acesso restrito!");
  if (!confirm("Reativar? Nome e mensagem ficam salvos, só volta a aparecer como disponível.")) return;

  await update(ref(db, `gifts/${id}`), {
    status: null
    // NÃO apaga reservadoPor nem mensagem
  });
  registrarLog("REATIVACAO", "Item reativado (dados mantidos)", id);
  alert("✅ Item reativado!");
};

window.abrirListaCompras = async () => {
  if (!isAdmin) return;
  const div = document.getElementById('lista-compras-conteudo');
  div.innerHTML = "";
  const reservados = giftsData.filter(g => g.reservadoPor);
  if (reservados.length === 0) {
    div.innerHTML = "<p class='text-center text-gray-500'>Nenhum item reservado.</p>";
  } else {
    reservados.forEach(g => {
      div.innerHTML += `
        <div class="p-4 border rounded mb-2">
          <p class="font-bold">${g.name}</p>
          <p>Por: ${g.reservadoPor}</p>
          <p>Mensagem: ${g.mensagem || '-'}</p>
          <p>Status: ${g.status || 'disponível'}</p>
        </div>
      `;
    });
  }
  document.getElementById('lista-compras-modal').classList.remove('hidden');
};

window.abrirLogs = async () => {
  if (!isAdmin) return;
  const div = document.getElementById('logs-conteudo');
  div.innerHTML = "";
  const snap = await get(ref(db, 'logs'));
  if (!snap.exists()) {
    div.innerHTML = "<p class='text-center text-gray-500'>Sem registros.</p>";
  } else {
    let logs = [];
    snap.forEach(c => logs.unshift({ id: c.key, ...c.val() }));
    logs.forEach(l => {
      div.innerHTML += `
        <div class="text-sm border-b py-2">
          <span class="text-gray-500">[${l.data} ${l.hora}]</span>
          <strong>${l.tipo}</strong> — ${l.descricao} <em>(${l.usuario})</em>
        </div>
      `;
    });
  }
  document.getElementById('logs-modal').classList.remove('hidden');
};

window.openSettingsModal = () => {
  if (!isAdmin) return;
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
  if (!isAdmin) return;
  const dados = {
    name: editName.value.trim(),
    price: editPrice.value.trim(),
    icon: editIcon.value.trim(),
    imagem: editImagem.value.trim() || "",
    pixKey: editPixKey.value.trim()
  };
  if (editId.value) {
    await update(ref(db, `gifts/${editId.value}`), dados);
    registrarLog("EDIÇÃO", `Item alterado: ${dados.name}`, editId.value);
  } else {
    const novo = push(ref(db, 'gifts'));
    await set(novo, dados);
    registrarLog("CRIAÇÃO", `Novo item: ${dados.name}`, novo.key);
  }
  closeModal('edit-modal');
};

window.deleteItem = async () => {
  if (!isAdmin) return;
  if (!confirm("Excluir definitivamente?")) return;
  await remove(ref(db, `gifts/${editId.value}`));
  registrarLog("EXCLUSÃO", "Item excluído", editId.value);
  closeModal('edit-modal');
};

window.saveSettings = async (e) => {
  e.preventDefault();
  if (!isAdmin) return;
  const dados = {
    loginTitle: cfgLoginTitle.value,
    loginSubtitle: cfgLoginSubtitle.value,
    mainTitle: cfgMainTitle.value,
    welcomeText: cfgWelcomeText.value,
    backgroundImage: cfgBgImage.value,
    footerText: cfgFooterText.value
  };
  await update(ref(db, 'configuracoes'), dados);
  registrarLog("CONFIG", "Configurações alteradas");
  closeModal('settings-modal');
};


// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  onValue(ref(db, 'configuracoes'), snap => {
    if (snap.exists()) {
      siteConfig = snap.val();
      document.getElementById('login-title').textContent = siteConfig.loginTitle || "Lista de Presentes";
      document.getElementById('login-subtitle').textContent = siteConfig.loginSubtitle || "Entre com seu nome";
      document.getElementById('main-title').textContent = siteConfig.mainTitle || "Presentes";
      footerText.textContent = siteConfig.footerText || "© 2026";
      if (siteConfig.backgroundImage) paginaPrincipal.style.backgroundImage = `url(${siteConfig.backgroundImage})`;
      if (usuarioAtualNome) atualizarSaudacao();
    } else {
      set(ref(db, 'configuracoes'), {
        loginTitle: "Lista de Presentes",
        loginSubtitle: "Digite seu nome para entrar",
        mainTitle: "Presentes",
        welcomeText: "Olá, [NOME]! Escolha um item.",
        footerText: "© 2026 Lista de Presentes"
      });
    }
  });

  onValue(ref(db, 'gifts'), snap => {
    giftsData = [];
    snap.forEach(c => giftsData.push({ id: c.key, ...c.val() }));
    renderGifts();
  });
});


// FUNÇÕES AUXILIARES
function atualizarSaudacao() {
  welcomeText.innerHTML = (siteConfig.welcomeText || "Olá, [NOME]!").replace("[NOME]", `<span class="font-bold text-pink-600">${usuarioAtualNome}</span>`);
}

function mostrarBotoesAdmin() {
  btnNewItem.classList.remove('hidden');
  btnSettings.classList.remove('hidden');
  btnListaCompras.classList.remove('hidden');
  btnLogs.classList.remove('hidden');
}

function registrarLog(tipo, descricao, itemId = null) {
  const agora = new Date();
  push(ref(db, 'logs'), {
    tipo, descricao,
    data: agora.toLocaleDateString('pt-BR'),
    hora: agora.toLocaleTimeString('pt-BR'),
    usuario: usuarioAtualNome,
    itemId
  });
}


// ✅ RENDER: BOTÃO REATIVAR NO PRÓPRIO ITEM (SÓ ADMIN)
function renderGifts() {
  giftsGrid.innerHTML = "";
  if (giftsData.length === 0) {
    giftsGrid.innerHTML = "<p class='col-span-full text-center text-gray-500'>Nenhum presente cadastrado.</p>";
    return;
  }

  giftsData.forEach(gift => {
    const card = document.createElement('div');
    card.className = `card-item bg-white rounded-xl shadow p-4 relative ${gift.reservadoPor ? 'reservado' : ''}`;

    // Botão editar só admin
    const btnEditar = isAdmin ? `
      <button onclick="openEditModal('${gift.id}')" class="absolute top-2 right-10 text-gray-600 hover:text-pink-600">✏️</button>
    ` : "";

    // ✅ Botão REATIVAR SÓ ADMIN, NO PRÓPRIO ITEM
    const btnReativar = (isAdmin && gift.reservadoPor) ? `
      <button onclick="reativarItem('${gift.id}')" class="absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">🔄 Reativar</button>
    ` : "";

    // Botão de ação
    const btnAcao = gift.reservadoPor
      ? `<button onclick="openPixModal('${gift.id}')" class="w-full bg-gray-500 text-white py-2 rounded">Ver detalhes</button>`
      : `<button onclick="abrirReserva('${gift.id}', '${gift.name.replace(/'/g, "\\'")}')" class="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded">Escolher</button>`;

    card.innerHTML = `
      ${btnEditar}
      ${btnReativar}
      <div class="text-center mb-3">
        <img src="${gift.icon}" class="w-16 h-16 mx-auto" alt="Ícone">
      </div>
      <h3 class="font-bold text-lg mb-1">${gift.name}</h3>
      <p class="text-pink-600 font-semibold mb-3">${gift.price}</p>
      ${btnAcao}
    `;

    giftsGrid.appendChild(card);
  });
}
