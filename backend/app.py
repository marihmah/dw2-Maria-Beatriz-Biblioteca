
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models import Livro
from database import SessionLocal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schema para Livro
class LivroSchema(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=90)
    autor: str = Field(..., min_length=1, max_length=90)
    ano: int = Field(..., ge=1900, le=datetime.now().year)
    genero: Optional[str] = None
    isbn: Optional[str] = None
    status: str = Field(default="disponivel")
    data_emprestimo: Optional[datetime] = None

class LivroOut(LivroSchema):
    id: int
    class Config:
        from_attributes = True

# GET /livros?search=&genero=&ano=&status=
@app.get("/livros", response_model=List[LivroOut])
def listar_livros(search: Optional[str] = "", genero: Optional[str] = None, ano: Optional[int] = None, status: Optional[str] = None):
    session = SessionLocal()
    query = session.query(Livro)
    if search:
        query = query.filter((Livro.titulo.ilike(f"%{search}%")) | (Livro.autor.ilike(f"%{search}%")))
    if genero:
        query = query.filter(Livro.genero == genero)
    if ano:
        query = query.filter(Livro.ano == ano)
    if status:
        query = query.filter(Livro.status == status)
    livros = query.all()
    session.close()
    return livros

# POST /livros
@app.post("/livros", response_model=LivroOut)
def criar_livro(livro: LivroSchema):
    session = SessionLocal()
    # Validação: título único
    if session.query(Livro).filter(Livro.titulo == livro.titulo).first():
        session.close()
        raise HTTPException(status_code=400, detail="Já existe um livro com esse título.")
    novo = Livro(**livro.dict())
    session.add(novo)
    session.commit()
    session.refresh(novo)
    session.close()
    return novo

# PUT /livros/{id}
@app.put("/livros/{id}", response_model=LivroOut)
def editar_livro(id: int, livro: LivroSchema):
    session = SessionLocal()
    obj = session.query(Livro).filter(Livro.id == id).first()
    if not obj:
        session.close()
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    for k, v in livro.dict().items():
        setattr(obj, k, v)
    session.commit()
    session.refresh(obj)
    session.close()
    return obj

# DELETE /livros/{id}
@app.delete("/livros/{id}")
def deletar_livro(id: int):
    session = SessionLocal()
    obj = session.query(Livro).filter(Livro.id == id).first()
    if not obj:
        session.close()
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    session.delete(obj)
    session.commit()
    session.close()
    return {"ok": True}

# POST /livros/{id}/emprestar
@app.post("/livros/{id}/emprestar", response_model=LivroOut)
def emprestar_livro(id: int):
    session = SessionLocal()
    obj = session.query(Livro).filter(Livro.id == id).first()
    if not obj:
        session.close()
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    if obj.status == "emprestado":
        session.close()
        raise HTTPException(status_code=400, detail="Livro já está emprestado.")
    obj.status = "emprestado"
    obj.data_emprestimo = datetime.utcnow()
    session.commit()
    session.refresh(obj)
    session.close()
    return obj

# POST /livros/{id}/devolver
@app.post("/livros/{id}/devolver", response_model=LivroOut)
def devolver_livro(id: int):
    session = SessionLocal()
    obj = session.query(Livro).filter(Livro.id == id).first()
    if not obj:
        session.close()
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    if obj.status == "disponivel":
        session.close()
        raise HTTPException(status_code=400, detail="Livro já está disponível.")
    obj.status = "disponivel"
    obj.data_emprestimo = None
    session.commit()
    session.refresh(obj)
    session.close()
    return obj
