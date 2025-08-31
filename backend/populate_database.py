import argparse
import os
import shutil
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from langchain_chroma import Chroma
from get_embedding_function import get_embedding_function

CHROMA_PATH = "chroma_db"
DATA_PATH = "data"

def main():
    parser = argparse.ArgumentParser(description="Populate or reset the Chroma database with document embeddings.")
    parser.add_argument("--reset", action="store_true", help="Reset the Chroma database if it exists.")
    args = parser.parse_args()
    if args.reset:
        clear_database()
    
    # Create or update the Chroma database
    documents = load_documents()
    chunks = split_documents(documents)
    add_to_chroma(chunks)


def clear_database():
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)
        print(f"Cleared existing Chroma database at {CHROMA_PATH}.")

def load_documents():
    document_loader = PyPDFDirectoryLoader(DATA_PATH)
    return document_loader.load()

def split_documents(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False
    )
    return text_splitter.split_documents(documents)

def add_to_chroma(chunks : list[Document]):
    db = Chroma(
        persist_directory=CHROMA_PATH, 
        embedding_function= get_embedding_function()
    )

    chunks_with_ids = calculate_ids(chunks)

    existing = db.get(include=[])
    existing_ids = set(existing["ids"])
    print(f"Existing IDs in database: {len(existing_ids)}")

    new_chunks = []
    for chunk in chunks_with_ids:
        if chunk.metadata["id"] not in existing_ids:
            new_chunks.append(chunk)
    
    if len(new_chunks):
        print(f"Adding {len(new_chunks)} new chunks to the database.")
        new_chunk_ids = [chunk.metadata["id"] for chunk in new_chunks]
        db.add_documents(new_chunks, ids=new_chunk_ids)

    else:
        print("No new chunks to add. Database is up to date.")



def calculate_ids(chunks):
    last_page_id = None
    current_chunk_index = 0

    for chunk in chunks:
        source = chunk.metadata.get("source", "unknown_source")
        page = chunk.metadata.get("page", 0)
        current_page_id = f"{source}:{page}"

        if current_page_id == last_page_id:
            current_chunk_index += 1
        else:
            current_chunk_index = 0
    
        chunk_id = f"{current_page_id}:{current_chunk_index}"
        chunk.metadata["id"] = chunk_id
        
        last_page_id = current_page_id

    return chunks

if __name__ == "__main__":
    main()