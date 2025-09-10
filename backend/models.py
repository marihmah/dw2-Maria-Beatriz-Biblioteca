
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Livro(Base):
    __tablename__ = 'livros'
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(90), nullable=False, index=True)
    autor = Column(String(90), nullable=False, index=True)
    ano = Column(Integer, nullable=False)
    genero = Column(String(40), nullable=True)
    isbn = Column(String(30), nullable=True)
    status = Column(String(20), nullable=False, default="disponivel")
    data_emprestimo = Column(DateTime, nullable=True)
