<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Presentes</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#EC4899',
                        secondary: '#F472B6',
                        light: '#FDF2F8',
                        dark: '#831843'
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                    },
                }
            }
        }
    </script>
    <style type="text/tailwindcss">
        @layer utilities {
            .content-auto {
                content-visibility: auto;
            }
            .modal-overlay {
                @apply fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4;
            }
            .card-item {
                @apply relative overflow-hidden;
            }
            .card-overlay {
                @apply absolute inset-0 bg-white/70 -z-10;
            }
            .reservado {
                @apply opacity-70 border-2 border-gray-400 bg-gray-100/50;
            }
            .icon-img {
                @apply w-12 h-12 object-contain;
            }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-pink-100 to-purple-200 min-h-screen font-sans">

    <!-- Tela de Login -->
    <section id="screen-login" class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 to-purple-200">
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
            <div class="text-center mb-8">
                <h1 id="login-title" class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-primary mb-2">Lista de Presentes</h1>
                <p id="login-subtitle" class="text-gray-600">Identifique-se para acessar</p>
            </div>

            <form onsubmit="handleLogin(event)" class="space-y-5">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
                    <input type="text" id="username" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                        placeholder="Digite seu nome completo">
                </div>

                <button type="submit" 
                    class="w-full bg-primary hover:bg-dark text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]">
                    Acessar Lista
                </button>

                <div class="text-center mt-4">
                    <button type="button" onclick="showAdminLogin()" class="text-sm text-gray-500 hover:text-primary transition">
                        Acesso Administrador
                    </button>
                </div>
            </form>
        </div>
    </section>

    <!-- Tela de Login Admin -->
    <section id="screen-admin-login" class="hidden fixed inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 to-purple-200">
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Área Administrativa</h2>
                <p class="text-gray-600">Acesso restrito</p>
            </div>

            <form onsubmit="handleAdminLogin(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input type="email" id="admin-email" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input type="password" id="admin-password" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition">
                </div>

                <button type="submit" 
                    class="w-full bg-primary hover:bg-dark text-white font-semibold py-3 px-4 rounded-lg transition">
                    Entrar
                </button>

                <button type="button" onclick="loginComGoogle()" 
                    class="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2">
                    <i class="fa fa-google"></i> Entrar com Google
                </button>

                <div class="text-center">
                    <button type="button" onclick="hideAdminLogin()" class="text-sm text-gray-500 hover:text-primary transition">
                        Voltar
                    </button>
                </div>
            </form>
        </div>
    </section>

    <!-- Tela Principal -->
    <main id="screen-dashboard" class="hidden container mx-auto px-4 py-6 max-w-7xl">
        <!-- Cabeçalho -->
        <header class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
                <h2 id="main-title" class="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-gray-800">Presentes</h2>
                <p id="welcomeText" class="text-gray-600 mt-1">Olá! Escolha um item para presentear via PIX.</p>
            </div>

            <div class="flex flex-wrap gap-2">
                <button id="btn-new-item" onclick="openNewItemModal()" class="hidden bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                    <i class="fa fa-plus"></i> Novo Item
                </button>
                <button id="btn-settings" onclick="openSettingsModal()" class="hidden bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                    <i class="fa fa-cog"></i> Configurações
                </button>
                <button id="btn-lista-compras" onclick="abrirListaCompras()" class="hidden bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                    <i class="fa fa-list-check"></i> Lista de Comprados
                </button>
                <button id="btn-logs" onclick="abrirLogs()" class="hidden bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                    <i class="fa fa-history"></i> Logs
                </button>
                <button onclick="handleLogout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                    <i class="fa fa-sign-out"></i> Sair
                </button>
            </div>
        </header>

        <!-- Área de Fundo Personalizada -->
        <div id="pagina-principal" class="relative rounded-2xl shadow-xl p-6 mb-8 min-h-[60vh] bg-cover bg-center bg-white/80 backdrop-blur-sm" style="background-image: url('');">
            <div class="absolute inset-0 bg-white/60 -z-10 rounded-2xl"></div>

            <!-- Grade de Presentes -->
            <div id="gifts-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                <!-- Itens carregados via JS -->
            </div>
        </div>

        <!-- Rodapé -->
        <footer class="text-center text-gray-600 text-sm">
            <p id="footer-text">© 2026 Lista de Presentes</p>
        </footer>
    </main>


    <!-- ============= MODAIS ============= -->

    <!-- Modal Editar / Adicionar Item -->
    <div id="edit-modal" class="hidden modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-5">
                <h3 id="edit-modal-title" class="text-xl font-bold text-gray-800">Editar Item</h3>
                <button onclick="closeModal('edit-modal')" class="text-gray-500 hover:text-gray-800 text-xl">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <form onsubmit="saveItem(event)" class="space-y-4">
                <input type="hidden" id="edit-id">

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
                    <input type="text" id="edit-name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Valor (ex: R$ 50,00)</label>
                    <input type="text" id="edit-price" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Link do Ícone</label>
                    <input type="url" id="edit-icon" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://...">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Link da Imagem de Fundo</label>
                    <input type="url" id="edit-imagem" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://...">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Chave PIX Principal</label>
                    <input type="text" id="edit-pixkey" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>

                <!-- CAMPO CHAVE ALTERNATIVA -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Chave PIX Alternativa</label>
                    <input type="text" id="edit-pix-alternativa" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Chave alternativa (opcional)">
                </div>

                <div class="flex gap-2 pt-2">
                    <button type="submit" class="flex-1 bg-primary hover:bg-dark text-white py-2 rounded-lg">Salvar</button>
                    <button type="button" id="btn-delete" onclick="deleteItem()" class="hidden bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg">Excluir</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal PIX -->
    <div id="pix-modal" class="hidden modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md text-center">
            <div class="flex justify-between items-center mb-4">
                <h3 id="modal-gift-name" class="text-xl font-bold text-gray-800"></h3>
                <button onclick="closeModal('pix-modal')" class="text-gray-500 hover:text-gray-800 text-xl">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <p class="text-gray-600 mb-4">Valor: <span id="modal-gift-value" class="font-bold text-primary text-lg"></span></p>

            <!-- QR Code -->
            <div class="flex justify-center mb-4">
                <img id="modal-qr-code" src="" alt="QR Code PIX" class="w-48 h-48 object-contain rounded-lg shadow">
            </div>

            <!-- CHAVE PIX PRINCIPAL -->
            <div class="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500 mb-1">Chave PIX:</p>
                <div class="flex items-center justify-center gap-2">
                    <span id="pix-copia-cola" class="font-mono text-sm font-medium text-gray-800 break-all"></span>
                    <button onclick="copyPixKey()" class="text-blue-600 hover:text-blue-800 text-lg" title="Copiar chave">📋</button>
                </div>
            </div>

            <!-- ✅ CHAVE ALTERNATIVA ABAIXO DO QR CODE (EXATO COMO PEDIU) -->
            <div id="area-chave-alternativa" class="p-2 bg-pink-50 rounded-lg border border-pink-100">
                <p class="text-xs text-gray-600 mb-1">Chave Alternativa:</p>
                <div class="flex items-center justify-center gap-2">
                    <span id="pix-alternativa" class="font-mono text-sm font-medium text-gray-800 break-all"></span>
                    <button onclick="copiarChaveAlternativa()" class="text-green-600 hover:text-green-800 text-lg" title="Copiar chave alternativa">📋</button>
                </div>
            </div>

            <!-- Dados da Reserva -->
            <div class="mt-5 text-left space-y-2 bg-pink-50 p-3 rounded-lg">
                <p class="text-sm"><strong>Reservado por:</strong> <span id="modalReservadoPor" class="text-gray-700"></span></p>
                <p class="text-sm"><strong>Recado:</strong> <span id="modalMensagemRecado" class="text-gray-700 italic"></span></p>
            </div>

            <!-- Botões de Ação -->
            <div id="botoes-acao-pix" class="mt-6 flex flex-col gap-2">
                <button onclick="confirmarCompra()" class="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition">
                    ✅ Confirmar Compra
                </button>
                <button onclick="cancelarReserva()" class="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition">
                    ❌ Cancelar Reserva
                </button>
            </div>
        </div>
    </div>

    <!-- Modal Reserva -->
    <div id="reserva-modal" class="hidden modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-5">
                <h3 class="text-xl font-bold text-gray-800">Reservar Item</h3>
                <button onclick="closeModal('reserva-modal')" class="text-gray-500 hover:text-gray-800 text-xl">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <p class="mb-4 text-gray-600">Item: <strong id="reserva-nome-item"></strong></p>

            <form onsubmit="confirmarReserva(event)" class="space-y-4">
                <input type="hidden" id="reserva-id">

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
                    <input type="text" id="reserva-nome" required class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" readonly>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Deixe um recado (opcional)</label>
                    <textarea id="reserva-mensagem" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Espero que goste! 😊"></textarea>
                </div>

                <button type="submit" class="w-full bg-primary hover:bg-dark text-white py-2 rounded-lg font-semibold transition">
                    Confirmar Reserva
                </button>
            </form>
        </div>
    </div>

    <!-- Modal Lista de Comprados -->
    <div id="lista-compras-modal" class="hidden modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-5">
                <h3 class="text-xl font-bold text-gray-800">📋 Lista de Itens Comprados/Reservados</h3>
                <button onclick="closeModal('lista-compras-modal')" class="text-gray-500 hover:text-gray-800 text-xl">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <div id="lista-compras-conteudo" class="space-y-3">
                <!-- Conteúdo carregado via JS -->
            </div>
        </div>
    </div>

    <!-- Modal Logs -->
    <div id="logs-modal" class="hidden modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-5">
                <h3 class="text-xl font-bold text-gray-800">📜 Histórico de Alterações</h3>
                <button onclick="closeModal('logs-modal')" class="text-gray-500 hover:text-gray-800 text-xl">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <div id="logs-conteudo" class="space-y-2 text-sm">
                <!-- Conteúdo carregado via JS -->
            </div>
        </div>
    </div>

    <!-- Modal Configurações -->
    <div id="settings-modal" class="hidden modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-5">
                <h3 class="text-xl font-bold text-gray-800">⚙️ Configurações do Sistema</h3>
                <button onclick="closeModal('settings-modal')" class="text-gray-500 hover:text-gray-800 text-xl">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <form onsubmit="saveSettings(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Título da Tela de Login</label>
                    <input type="text" id="cfg-login-title" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Subtítulo da Login</label>
                    <input type="text" id="cfg-login-subtitle" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
                    <input type="text" id="cfg-main-title" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Texto de Boas-vindas</label>
                    <textarea id="cfg-welcome-text" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Imagem de Fundo (URL)</label>
                    <input type="url" id="cfg-bg-image" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Texto do Rodapé</label>
                    <input type="text" id="cfg-footer-text" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>

                <button type="submit" class="w-full bg-primary hover:bg-dark text-white py-2 rounded-lg">Salvar Configurações</button>
            </form>
        </div>
    </div>


    <!-- Importação dos Scripts -->
    <script type="module" src="firebase.js"></script>
    <script type="module" src="app.js"></script>

    <!-- FUNÇÃO COPIAR CHAVE ALTERNATIVA -->
    <script>
        function copiarChaveAlternativa() {
            const texto = document.getElementById('pix-alternativa').textContent;
            if(texto && texto.trim() !== "") {
                navigator.clipboard.writeText(texto)
                    .then(() => alert("✅ Chave alternativa copiada!"))
                    .catch(() => alert("❌ Erro ao copiar, copie manualmente."));
            } else {
                alert("⚠️ Nenhuma chave alternativa cadastrada.");
            }
        }
    </script>
</body>
</html>
