from langchain_huggingface import HuggingFaceEmbeddings

def get_embedding_function():
    """
    Returns an instance of HuggingFaceEmbeddings for generating text embeddings.
    """
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")