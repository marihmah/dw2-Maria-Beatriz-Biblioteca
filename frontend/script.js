

// Estado local e configuração da API
let livros = [];
let filtro = { genero: '', ano: '', status: '', texto: '' };
let ordenacao = { campo: 'titulo', direcao: 'asc' };
let paginaAtual = 1;
const ITENS_POR_PAGINA = 10;
const API_URL = 'http://localhost:8000/livros'; // Ajuste se necessário
// Gêneros padrão caso a base não tenha nenhum definido
const DEFAULT_GENEROS = [
	'Ficção',
	'Não-ficção',
	'Fantasia',
	'Romance',
	'Infantil',
	'Ciência',
	'História',
	'Biografia'
];

// Função utilitária para buscar todos os livros da API
async function fetchLivros() {
	try {
		const res = await fetch(API_URL);
		if (!res.ok) {
			console.warn('Falha ao buscar livros, status:', res.status);
			livros = [];
			return;
		}
		livros = await res.json();
	} catch (err) {
		console.warn('Erro ao buscar livros da API:', err);
		// não trava a inicialização — usa lista vazia para que os filtros padrão sejam aplicados
		livros = [];
	}
}

// Função utilitária para criar um novo livro na API
async function criarLivro(livro) {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(livro)
	});
	let data = null;
	try { data = await res.json(); } catch (e) { }
	if (!res.ok) {
		throw new Error((data && (data.detail || data.message)) || 'Falha ao criar livro');
	}
	return data;
}

// Função utilitária para editar um livro na API
async function editarLivro(id, livro) {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(livro)
	});
	let data = null;
	try { data = await res.json(); } catch (e) { }
	if (!res.ok) {
		throw new Error((data && (data.detail || data.message)) || 'Falha ao editar livro');
	}
	return data;
}

// Função utilitária para deletar um livro na API
async function deletarLivro(id) {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	let data = null;
	try { data = await res.json(); } catch (e) { }
	if (!res.ok) {
		throw new Error((data && (data.detail || data.message)) || 'Falha ao deletar livro');
	}
	return true;
}

// Função utilitária para atualizar status de empréstimo/devolução
async function emprestarOuDevolverLivro(id, acao) {
	// Backend expõe /emprestar e /devolver como POST
	const res = await fetch(`${API_URL}/${id}/${acao}`, { method: 'POST' });
	let data = null;
	try { data = await res.json(); } catch (e) { }
	if (!res.ok) {
		throw new Error((data && (data.detail || data.message)) || 'Falha na operação');
	}
	return data;
}

// Elementos DOM
const cardList = document.getElementById('card-list');
const paginacao = document.getElementById('paginacao');
const modalNovoLivro = document.getElementById('modal-novo-livro');
const btnNovoLivro = document.getElementById('btn-novo-livro');
const formLivro = document.getElementById('form-livro');
const fecharModalNovo = document.getElementById('fechar-modal-novo');
const searchInput = document.getElementById('search');
const filtroGenero = document.getElementById('filtro-genero');
const filtroAno = document.getElementById('filtro-ano');
const filtroStatus = document.getElementById('filtro-status');
const btnExportar = document.getElementById('btn-exportar');

// Funções utilitárias
function salvarLocalStorage() {
	localStorage.setItem('livros', JSON.stringify(livros));
	localStorage.setItem('ordenacao', JSON.stringify(ordenacao));
}
function carregarLocalStorage() {
	const l = localStorage.getItem('livros');
	if (l) livros = JSON.parse(l);
	const o = localStorage.getItem('ordenacao');
	if (o) ordenacao = JSON.parse(o);
}


// Renderização dos cards de livros
function renderizarCards() {
	let filtrados = livros.filter(livro => {
		const texto = filtro.texto.toLowerCase();
		return (
			(!filtro.genero || livro.genero === filtro.genero) &&
			(!filtro.ano || livro.ano == filtro.ano) &&
			(!filtro.status || livro.status === filtro.status) &&
			(
				livro.titulo.toLowerCase().includes(texto) ||
				livro.autor.toLowerCase().includes(texto)
			)
		);
	});
	// Ordenação
	filtrados.sort((a, b) => {
		let cmp = 0;
		if (ordenacao.campo === 'titulo') {
			cmp = a.titulo.localeCompare(b.titulo);
		} else if (ordenacao.campo === 'ano') {
			cmp = a.ano - b.ano;
		}
		return ordenacao.direcao === 'asc' ? cmp : -cmp;
	});
	// Paginação
	const total = filtrados.length;
	const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
	const fim = inicio + ITENS_POR_PAGINA;
	const pagina = filtrados.slice(inicio, fim);
	cardList.innerHTML = pagina.map(livro => `
		<div class="card">
			<div class="titulo">${livro.titulo}</div>
			<div class="autor">${livro.autor}</div>
			<div class="ano">Ano: ${livro.ano}</div>
			<div class="genero">Gênero: ${livro.genero || '-'} </div>
			<div class="status" data-status="${livro.status}">Status: ${livro.status}</div>
			<button onclick="abrirModalEmprestimo('${livro.id}')">Empréstimo/Devolução</button>
			<button onclick="editarLivroModal('${livro.id}')">Editar</button>
			<button onclick="excluirLivro('${livro.id}')">Excluir</button>
		</div>
	`).join('') || '<p>Nenhum livro encontrado.</p>';
	renderizarPaginacao(total);
}

function renderizarPaginacao(total) {
	const totalPaginas = Math.ceil(total / ITENS_POR_PAGINA);
	paginacao.innerHTML = '';
	for (let i = 1; i <= totalPaginas; i++) {
		const btn = document.createElement('button');
		btn.textContent = i;
		btn.disabled = i === paginaAtual;
		btn.onclick = () => { paginaAtual = i; renderizarCards(); };
		paginacao.appendChild(btn);
	}
}

// Filtros
searchInput.addEventListener('input', e => {
	filtro.texto = e.target.value;
	paginaAtual = 1;
	renderizarCards();
});
filtroGenero.addEventListener('change', e => {
	filtro.genero = e.target.value;
	paginaAtual = 1;
	renderizarCards();
});
filtroAno.addEventListener('change', e => {
	filtro.ano = e.target.value;
	paginaAtual = 1;
	renderizarCards();
});
filtroStatus.addEventListener('change', e => {
	filtro.status = e.target.value;
	paginaAtual = 1;
	renderizarCards();
});

// Modal Novo Livro
btnNovoLivro.addEventListener('click', abrirModalNovoLivro);
fecharModalNovo.addEventListener('click', fecharModalNovoLivro);
// Acessibilidade: foco automático e rotação de foco no modal
function abrirModalNovoLivro() {
	modalNovoLivro.hidden = false;
	// garantir que o form não está em modo edição
	delete formLivro.dataset.editingId;
	setTimeout(() => document.getElementById('titulo').focus(), 100);
	// Roda o foco entre os campos do modal
	const focusables = modalNovoLivro.querySelectorAll('input, select, button');
	let idx = 0;
	modalNovoLivro.onkeydown = function(e) {
		if (e.key === 'Tab') {
			e.preventDefault();
			idx = e.shiftKey ? (idx - 1 + focusables.length) % focusables.length : (idx + 1) % focusables.length;
			focusables[idx].focus();
		}
	};
}
function fecharModalNovoLivro() {
	modalNovoLivro.hidden = true;
	formLivro.reset();
	delete formLivro.dataset.editingId;
	modalNovoLivro.onkeydown = null;
	btnNovoLivro.focus(); // Retorna foco para botão principal
}
window.addEventListener('keydown', e => {
	if (e.altKey && e.key.toLowerCase() === 'n') {
		abrirModalNovoLivro();
		e.preventDefault();
	}
	if (e.key === 'Escape') {
		if (!modalNovoLivro.hidden) fecharModalNovoLivro();
	}
});


// CRUD Livro (agora integrado com API)
// Helper simples para mostrar notificações temporárias no topo
function showNotification(msg, timeout = 2500) {
	const el = document.createElement('div');
	el.textContent = msg;
	el.style.position = 'fixed';
	el.style.top = '1rem';
	el.style.right = '1rem';
	el.style.background = '#10B981';
	el.style.color = '#fff';
	el.style.padding = '0.6rem 1rem';
	el.style.borderRadius = '6px';
	el.style.zIndex = 9999;
	document.body.appendChild(el);
	setTimeout(() => el.remove(), timeout);
}

formLivro.addEventListener('submit', async e => {
	e.preventDefault();
	const editingId = formLivro.dataset.editingId || null;
	const titulo = document.getElementById('titulo').value.trim();
	const autor = document.getElementById('autor').value.trim();
	const ano = parseInt(document.getElementById('ano').value);
	const genero = document.getElementById('genero').value;
	const isbn = document.getElementById('isbn').value.trim();
	const status = document.getElementById('status').value;

	// Validações
	if (titulo.length < 3 || titulo.length > 90) {
		alert('Título deve ter entre 3 e 90 caracteres.');
		return;
	}
	if (ano < 1900 || ano > new Date().getFullYear()) {
		alert('Ano inválido.');
		return;
	}

	// Edição
	if (editingId) {
		const editado = { titulo, autor, ano, genero, isbn, status };
		try {
			const updated = await editarLivro(editingId, editado);
			// atualiza estado local
			const idx = livros.findIndex(l => l.id == editingId);
			if (idx >= 0) livros[idx] = updated;
			salvarLocalStorage();
			popularFiltros();
			fecharModalNovoLivro();
			delete formLivro.dataset.editingId;
			renderizarCards();
			showNotification('Livro editado com sucesso.');
		} catch (err) {
			alert(err.message || 'Erro ao editar livro.');
		}
		return;
	}

	// Criação
	if (livros.some(l => l.titulo.toLowerCase() === titulo.toLowerCase())) {
		alert('Já existe um livro com esse título.');
		return;
	}

	const novoLivro = { titulo, autor, ano, genero, isbn, status, data_emprestimo: null };
	try {
		const criado = await criarLivro(novoLivro);
		if (criado && criado.id) {
			livros.push(criado);
			salvarLocalStorage();
			popularFiltros();
			fecharModalNovoLivro();
			renderizarCards();
			showNotification('Livro adicionado com sucesso.');
		} else {
			// fallback seguro: recarrega do servidor
			await fetchLivros();
			popularFiltros();
			fecharModalNovoLivro();
			renderizarCards();
			showNotification('Livro adicionado.');
		}
	} catch (err) {
		alert(err.message || 'Erro ao adicionar livro');
	}
});

// Função para abrir modal de edição de livro (exemplo simplificado)
window.editarLivroModal = function(id) {
	const livro = livros.find(l => l.id == id);
	if (!livro) return;
	document.getElementById('titulo').value = livro.titulo;
	document.getElementById('autor').value = livro.autor;
	document.getElementById('ano').value = livro.ano;
	document.getElementById('genero').value = livro.genero;
	document.getElementById('isbn').value = livro.isbn;
	document.getElementById('status').value = livro.status;
	modalNovoLivro.hidden = false;
	// marca que o form está em modo edição
	formLivro.dataset.editingId = id;
}

// Função para excluir livro
window.excluirLivro = async function(id) {
	if (confirm('Tem certeza que deseja excluir este livro?')) {
		await deletarLivro(id);
		await fetchLivros();
		renderizarCards();
	}
}

// Modal de empréstimo/devolução

// Acessibilidade: foco automático e rotação de foco no modal de empréstimo
window.abrirModalEmprestimo = function(id) {
	const livro = livros.find(l => l.id == id);
	if (!livro) return;
	const modal = document.getElementById('modal-emprestimo');
	const detalhes = document.getElementById('emprestimo-detalhes');
	detalhes.innerHTML = `<p><b>${livro.titulo}</b> - ${livro.autor}<br>Status: <span data-status="${livro.status}">${livro.status}</span></p>`;
	modal.hidden = false;
	setTimeout(() => document.getElementById('confirmar-emprestimo').focus(), 100);
	// Roda o foco entre os botões do modal
	const focusables = modal.querySelectorAll('button');
	let idx = 0;
	modal.onkeydown = function(e) {
		if (e.key === 'Tab') {
			e.preventDefault();
			idx = e.shiftKey ? (idx - 1 + focusables.length) % focusables.length : (idx + 1) % focusables.length;
			focusables[idx].focus();
		}
	};
	// Botão de confirmar
	document.getElementById('confirmar-emprestimo').onclick = async function() {
		try {
			const result = await emprestarOuDevolverLivro(id, livro.status === 'emprestado' ? 'devolver' : 'emprestar');
			// atualiza estado local com o objeto retornado
			const idx = livros.findIndex(l => l.id == id);
			if (idx >= 0 && result) livros[idx] = result;
			salvarLocalStorage();
			popularFiltros();
			renderizarCards();
			modal.hidden = true;
			modal.onkeydown = null;
			btnNovoLivro.focus();
			showNotification('Operação realizada.');
		} catch (err) {
			alert(err.message || 'Erro ao realizar operação');
		}
	};
	document.getElementById('fechar-modal-emprestimo').onclick = function() {
		modal.hidden = true;
		modal.onkeydown = null;
		btnNovoLivro.focus();
	};
}

// Exportar CSV/JSON
btnExportar.addEventListener('click', () => {
	const filtrados = livros.filter(livro => {
		const texto = filtro.texto.toLowerCase();
		return (
			(!filtro.genero || livro.genero === filtro.genero) &&
			(!filtro.ano || livro.ano == filtro.ano) &&
			(!filtro.status || livro.status === filtro.status) &&
			(
				livro.titulo.toLowerCase().includes(texto) ||
				livro.autor.toLowerCase().includes(texto)
			)
		);
	});
	const json = JSON.stringify(filtrados, null, 2);
	const csv = 'titulo,autor,ano,genero,isbn,status\n' + filtrados.map(l => `${l.titulo},${l.autor},${l.ano},${l.genero},${l.isbn},${l.status}`).join('\n');
	// Download
	const blob = new Blob([json], {type: 'application/json'});
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = 'livros.json';
	a.click();
	// CSV download
	const blob2 = new Blob([csv], {type: 'text/csv'});
	const a2 = document.createElement('a');
	a2.href = URL.createObjectURL(blob2);
	a2.download = 'livros.csv';
	a2.click();
});


// Popular filtros de gênero e ano
function popularFiltros() {
	// Extrai gêneros presentes na base; se nenhum, usa os padrões
	let generos = Array.from(new Set(livros.map(l => l.genero))).filter(Boolean);
	if (generos.length === 0) generos = DEFAULT_GENEROS.slice();
	filtroGenero.innerHTML = '<option value="">Todos</option>' + generos.map(g => `<option value="${g}">${g}</option>`).join('');

	// Também popular o select do modal de cadastro/edição
	const generoModal = document.getElementById('genero');
	if (generoModal) {
		generoModal.innerHTML = '<option value="">(nenhum)</option>' + generos.map(g => `<option value="${g}">${g}</option>`).join('');
	}

	const anos = Array.from(new Set(livros.map(l => l.ano))).sort();
	filtroAno.innerHTML = '<option value="">Todos</option>' + anos.map(a => `<option value="${a}">${a}</option>`).join('');
}

// Inicialização: busca livros da API e renderiza
async function init() {
	await fetchLivros();
	popularFiltros();
	renderizarCards();
}
init();

// Comentários explicativos:
// - CRUD real via API: funções fetchLivros, criarLivro, editarLivro, deletarLivro, emprestarOuDevolverLivro
// - Filtros, ordenação, paginação, exportação, validações e modais já implementados
// - Modal de empréstimo/devolução agora respeita regra de negócio (não permite emprestar se já emprestado)
// - Edição e exclusão de livros adicionadas
// - Acessibilidade: uso de ARIA, tabindex, roles, labels associadas, foco automático e rotação de foco nos modais, atalhos de teclado, navegação por tab, retorno de foco ao fechar modal
