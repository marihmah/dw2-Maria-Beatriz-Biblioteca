# seed.py
"""
Script para popular o banco de dados com alguns livros de exemplo.
Execute: python seed.py
"""
from database import SessionLocal
from models import Livro

def seed():
    session = SessionLocal()
    livros = [
        Livro(titulo="Dom Casmurro", autor="Machado de Assis", ano=1899, genero="Romance", isbn="9788572322539", status="disponivel"),
        Livro(titulo="O Pequeno Príncipe", autor="Antoine de Saint-Exupéry", ano=1943, genero="Fantasia", isbn="9788572329798", status="disponivel"),
        Livro(titulo="Capitães da Areia", autor="Jorge Amado", ano=1937, genero="Aventura", isbn="9788520932305", status="disponivel"),
        Livro(titulo="A Hora da Estrela", autor="Clarice Lispector", ano=1977, genero="Romance", isbn="9788532520781", status="disponivel"),
        Livro(titulo="Memórias Póstumas de Brás Cubas", autor="Machado de Assis", ano=1881, genero="Romance", isbn="9788572326063", status="disponivel"),
    ]
    session.add_all(livros)
    session.commit()
    session.close()
    print("Banco de dados populado com livros de exemplo!")

if __name__ == "__main__":
    seed()
