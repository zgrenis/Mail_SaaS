from sentence_transformers import SentenceTransformer

_model = None

def get_model():            #? lazy loading for embedding model (memory optimization) 
    global _model           # global is used to modify global variable _model otherwise python assumes it is a new local variable
    if _model is not None:
        return _model   
    try:
        print("Model loading")
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
        print("model loaded successfully")  
    except MemoryError:
        print("RAM Insufficient Error")
        _model = None 
    except Exception as e:
        print(f"Error: {e}")
        _model = None
    return _model

def embed_text(text: str) -> list[float]:       # embeddings return from this function 
    return get_model().encode(text, normalize_embeddings=True).tolist()