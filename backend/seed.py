# seed.py
"""
Script para popular o banco de dados com alguns livros de exemplo.
Execute: python seed.py
"""
try:
    # Quando executado como módulo: python -m backend.seed
    from .database import SessionLocal, Base, engine  # type: ignore
    from .models import Livro  # type: ignore
except ImportError:
    # Fallback para execução direta dentro da pasta backend: python seed.py
    from database import SessionLocal, Base, engine  # type: ignore
    from models import Livro  # type: ignore
from datetime import datetime

# Lista de gêneros usada também no frontend (DEFAULT_GENEROS)
GENEROS = [
    'Ficção', 'Não-ficção', 'Fantasia', 'Romance', 'Infantil', 'Ciência', 'História', 'Biografia'
]

# Dataset: 10 livros por gênero (títulos únicos no sistema inteiro)
DATASET = {
    'Ficção': [
        ("Ecos da Cidade", "L. Andrade", 2012),
        ("Noite Sem Estrelas", "C. Fonseca", 2019),
        ("Ruas de Névoa", "M. Tavares", 2015),
        ("Horizonte Partido", "A. Vieira", 2020),
        ("Silêncio das Máquinas", "R. Morais", 2018),
        ("Véu de Concreto", "T. Cardoso", 2016),
        ("Passos na Madrugada", "B. Luz", 2021),
        ("Fragmentos Urbanos", "J. Paiva", 2014),
        ("Sombras na Janela", "D. Ribeiro", 2017),
        ("O Último Bonde", "N. Farias", 2013),
    ],
    'Não-ficção': [
        ("Introdução à Economia Moderna", "P. Martins", 2022),
        ("Design Centrado no Humano", "S. Almeida", 2021),
        ("Mapeando Sistemas Complexos", "G. Costa", 2020),
        ("Ética na Era Digital", "V. Rocha", 2023),
        ("Comunicação Assertiva", "R. Saraiva", 2019),
        ("Produtividade Sustentável", "E. Mota", 2022),
        ("Psicologia do Hábito", "M. Peixoto", 2018),
        ("Investimentos Essenciais", "F. Correia", 2021),
        ("Fundamentos da Escrita Técnica", "L. Queiroz", 2017),
        ("Introdução à Lógica Argumentativa", "C. Prado", 2016),
    ],
    'Fantasia': [
        ("Guardião da Floresta Rubra", "I. Salles", 2015),
        ("A Torre de Vidro Sombrio", "M. Cunha", 2018),
        ("O Reino Submerso", "A. Torres", 2016),
        ("Marés de Fogo", "J. Lisboa", 2019),
        ("Runas Esquecidas", "T. Campos", 2020),
        ("Jardins de Névoa", "P. Azevedo", 2021),
        ("A Cidade Entre Mundos", "R. Duarte", 2022),
        ("Sombras do Portal", "M. Ferraz", 2017),
        ("O Último Oráculo", "B. Antunes", 2014),
        ("Velas sobre o Abismo", "C. Dias", 2013),
    ],
    'Romance': [
        ("Cartas que Não Enviei", "J. Lacerda", 2019),
        ("Entre Dois Invernos", "R. Melo", 2020),
        ("A Longa Manhã", "C. Dutra", 2018),
        ("Promessas de Outono", "F. Vasconcelos", 2021),
        ("Cais das Memórias", "T. Rangel", 2017),
        ("Azulejos Partidos", "M. Gouveia", 2016),
        ("O Perfume da Chuva", "L. Braga", 2022),
        ("Além da Colina", "N. Silveira", 2015),
        ("O Primeiro Domingo", "E. Furtado", 2014),
        ("A Casa de Luz Baixa", "R. Barros", 2013),
    ],
    'Infantil': [
        ("O Balão Dourado", "K. Nunes", 2021),
        ("A Tartaruga Veloz", "J. Peixinho", 2020),
        ("O Circo da Lua", "B. Clemente", 2019),
        ("Pedro e a Estrela Azul", "L. Andrade", 2022),
        ("Mistério na Escola", "C. Sabiá", 2018),
        ("O Guarda-chuva que Falava", "T. Moura", 2017),
        ("Viagem no Vento", "R. Leite", 2016),
        ("O Segredo da Caixa", "G. Flores", 2023),
        ("O Jardim Invisível", "M. Pires", 2015),
        ("Gotas de Algodão", "A. Prado", 2014),
    ],
    'Ciência': [
        ("Física do Cotidiano", "P. Silveira", 2020),
        ("Química Visual", "D. Magalhães", 2019),
        ("Astronomia Essencial", "L. Faria", 2021),
        ("Genoma em 100 Perguntas", "S. Teixeira", 2022),
        ("Ecossistemas Urbanos", "R. Lemos", 2023),
        ("Introdução à Neurociência", "V. Amaral", 2018),
        ("Energia e Sustentabilidade", "C. Pacheco", 2017),
        ("Matemática Intuitiva", "H. Portela", 2016),
        ("Princípios de Robótica", "T. Valença", 2020),
        ("Cartografia do Clima", "G. Prado", 2021),
    ],
    'História': [
        ("Cidades Antigas do Sul", "E. Torres", 2019),
        ("Reinos e Rotas Comerciais", "B. Lopes", 2021),
        ("Cronistas do Sertão", "C. Abranches", 2018),
        ("Impérios Marítimos", "R. Fernandes", 2020),
        ("A Era dos Mapas", "L. Coutinho", 2017),
        ("Arqueologia Urbana", "T. Moreira", 2016),
        ("Cartas do Front", "M. Guerra", 2015),
        ("A Expedição do Norte", "J. Prado", 2014),
        ("Crônicas da Fronteira", "N. Bastos", 2013),
        ("Memória e Patrimônio", "F. Mendonça", 2022),
    ],
    'Biografia': [
        ("Vida em Movimento", "Ana Ribeiro", 2019),
        ("O Arquiteto da Luz", "Paulo Sá", 2020),
        ("Caminhos de Barro", "Helena Rocha", 2018),
        ("Além do Laboratório", "Carlos Freire", 2021),
        ("Notas de um Maestro", "Julio Mendes", 2017),
        ("Na Trilha do Vento", "Marina Alvim", 2016),
        ("O Relógio e a Ponte", "Rafael Sena", 2015),
        ("Cartas a Mim Mesmo", "Otávio Reis", 2014),
        ("Fragmentos de Tinta", "Isabel Dias", 2013),
        ("O Círculo das Vozes", "Sérgio Linhares", 2022),
    ],
}

def gerar_isbn(idx: int) -> str:
    base = f"97885999{idx:05d}"
    return base[:13]

def seed():
    # Garante que as tabelas existem
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    existentes = {t[0] for t in session.query(Livro.titulo).all()}
    novos = []
    idx_global = 1

    for genero, livros in DATASET.items():
        for (titulo, autor, ano) in livros:
            if titulo in existentes:
                continue
            novos.append(Livro(
                titulo=titulo,
                autor=autor,
                ano=ano,
                genero=genero,
                isbn=gerar_isbn(idx_global),
                status="disponivel",
                data_emprestimo=None
            ))
            idx_global += 1

    if not novos:
        print("Nenhum novo livro para inserir (todos já existem).")
    else:
        session.add_all(novos)
        session.commit()
        print(f"Inseridos {len(novos)} novos livros (total de gêneros cobertos: {len(DATASET)}).")

    session.close()

if __name__ == "__main__":
    seed()
