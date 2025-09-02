from fastapi import FastAPI
from pydantic import BaseModel
from query_data import query_rag
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Company RAG AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend dev server
    allow_credentials=True,
    allow_methods=["*"],   # allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],   # allow all headers
)

# Request body schema
class QueryRequest(BaseModel):
    question: str

# Root test route
@app.get("/")
def read_root():
    return {"message": "RAG API is running!"}

# Query endpoint
@app.post("/query")
def ask_question(request: QueryRequest):
    answer = query_rag(request.question)
    return {"question": request.question, "answer": answer.get("answer"), "sources": answer.get("sources")}
