

// Estado local e configuração da API
let livros = [];
let filtro = { genero: '', ano: '', status: '', texto: '' };
let ordenacao = { campo: 'titulo', direcao: 'asc' };
let paginaAtual = 1;
const ITENS_POR_PAGINA = 10;
const API_URL = 'http://localhost:8000/livros'; // Ajuste se necessário

// Função utilitária para buscar todos os livros da API
async function fetchLivros() {
	const res = await fetch(API_URL);
	livros = await res.json();
}

// Função utilitária para criar um novo livro na API
async function criarLivro(livro) {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(livro)
	});
	return res.ok;
}

// Função utilitária para editar um livro na API
async function editarLivro(id, livro) {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(livro)
	});
	return res.ok;
}

// Função utilitária para deletar um livro na API
async function deletarLivro(id) {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	return res.ok;
}

// Função utilitária para atualizar status de empréstimo/devolução
async function emprestarOuDevolverLivro(id, acao) {
	const res = await fetch(`${API_URL}/${id}/${acao}`, { method: 'PATCH' });
	return res.ok;
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
function abrirModalNovoLivro() {
	modalNovoLivro.hidden = false;
	document.getElementById('titulo').focus();
}
function fecharModalNovoLivro() {
	modalNovoLivro.hidden = true;
	formLivro.reset();
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
formLivro.addEventListener('submit', async e => {
	e.preventDefault();
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
	if (livros.some(l => l.titulo.toLowerCase() === titulo.toLowerCase())) {
		alert('Já existe um livro com esse título.');
		return;
	}
	if (ano < 1900 || ano > new Date().getFullYear()) {
		alert('Ano inválido.');
		return;
	}
	const novoLivro = {
		titulo, autor, ano, genero, isbn, status,
		data_emprestimo: null
	};
	await criarLivro(novoLivro); // Chama API
	await fetchLivros(); // Atualiza lista
	fecharModalNovoLivro();
	renderizarCards();
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
	// Ao salvar, chama editarLivro
	formLivro.onsubmit = async function(e) {
		e.preventDefault();
		const editado = {
			titulo: document.getElementById('titulo').value.trim(),
			autor: document.getElementById('autor').value.trim(),
			ano: parseInt(document.getElementById('ano').value),
			genero: document.getElementById('genero').value,
			isbn: document.getElementById('isbn').value.trim(),
			status: document.getElementById('status').value
		};
		await editarLivro(id, editado);
		await fetchLivros();
		fecharModalNovoLivro();
		renderizarCards();
		formLivro.onsubmit = null; // Limpa handler
	};
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
window.abrirModalEmprestimo = function(id) {
	const livro = livros.find(l => l.id == id);
	if (!livro) return;
	const modal = document.getElementById('modal-emprestimo');
	const detalhes = document.getElementById('emprestimo-detalhes');
	detalhes.innerHTML = `<p><b>${livro.titulo}</b> - ${livro.autor}<br>Status: <span data-status="${livro.status}">${livro.status}</span></p>`;
	modal.hidden = false;
	// Botão de confirmar
	document.getElementById('confirmar-emprestimo').onclick = async function() {
		if (livro.status === 'emprestado') {
			// Devolução
			await emprestarOuDevolverLivro(id, 'devolver');
		} else {
			// Empréstimo
			await emprestarOuDevolverLivro(id, 'emprestar');
		}
		await fetchLivros();
		renderizarCards();
		modal.hidden = true;
	};
	document.getElementById('fechar-modal-emprestimo').onclick = function() {
		modal.hidden = true;
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
	const generos = Array.from(new Set(livros.map(l => l.genero))).filter(Boolean);
	filtroGenero.innerHTML = '<option value="">Todos</option>' + generos.map(g => `<option value="${g}">${g}</option>`).join('');
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
// - Acessibilidade: atalhos de teclado, foco gerenciado nos modais
