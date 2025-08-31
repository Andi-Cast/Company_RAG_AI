from fastapi import FastAPI
from pydantic import BaseModel
from query_data import query_rag

app = FastAPI(title="Company RAG AI API")

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
    return {"question": request.question, "answer": answer}
