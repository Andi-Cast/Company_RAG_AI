import argparse
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_ollama import OllamaLLM

from get_embedding_function import get_embedding_function  

CHROMA_PATH = "chroma_db"

PROMPT_TEMPLATE = """
You are an AI assistant for AC Software employees. 
Use only the provided context to answer. 
If the answer is not in the context, respond with "I don’t know based on the provided information."

When possible:
- Answer in full sentences.  
- Use bullet points for lists.  
- Quote exact policy text if relevant.  

Context:
{context}

Question: {question}
"""

def main(): 
    parser = argparse.ArgumentParser(description="Query the Chroma database with a question.")
    parser.add_argument("question", type=str, help="The question to ask the database.")
    args = parser.parse_args()
    question = args.question

    query_rag(question)

def query_rag(question: str):
    embedding_function = get_embedding_function()
    db = Chroma(
        persist_directory=CHROMA_PATH, 
        embedding_function=embedding_function
    )

    results = db.similarity_search_with_score(question, k=5)

    context = "\n\n".join([doc.page_content for doc, _score in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context, question=question)

    model = OllamaLLM(model="llama3.2:3b", base_url="http://localhost:11434")
    response = model.invoke(prompt)

    sources = [doc.metadata.get("id", None) for doc, _score in results]
    formatted_response = f"Response: {response}\nSources: {sources}"

    print(formatted_response)
    return {
        "answer": response,
        "sources": sources
    }

if __name__ == "__main__":
    main()