import math
import re
from typing import List, Tuple, Dict, Optional
import httpx
from app.core.config import settings

def clean_tokens(text: str) -> List[str]:
    """Tokenize and clean words and bigrams."""
    words = re.findall(r'\b[a-zA-Z0-9_+#.-]+\b', text.lower())
    # Generate unigrams and bigrams for phrase capturing (e.g. 'machine learning', 'ci/cd')
    tokens = list(words)
    for i in range(len(words) - 1):
        tokens.append(f"{words[i]} {words[i+1]}")
    return tokens

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Compute cosine similarity between two numerical vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
    return max(0.0, min(1.0, dot / (norm1 * norm2)))

def generate_tfidf_vectors(text1: str, text2: str) -> Tuple[List[float], List[float]]:
    """
    Generate TF-IDF vectors for two documents using pure Python standard library.
    Captures unigrams and bigrams with sublinear term-frequency scaling.
    """
    tokens1 = clean_tokens(text1)
    tokens2 = clean_tokens(text2)

    # Vocabulary
    vocab = sorted(list(set(tokens1 + tokens2)))
    if not vocab:
        return [0.0], [0.0]

    # Term counts
    tf1: Dict[str, int] = {}
    for t in tokens1: tf1[t] = tf1.get(t, 0) + 1

    tf2: Dict[str, int] = {}
    for t in tokens2: tf2[t] = tf2.get(t, 0) + 1

    # Document frequency across the 2 documents
    doc_count = 2.0
    v1: List[float] = []
    v2: List[float] = []

    for term in vocab:
        df = (1 if term in tf1 else 0) + (1 if term in tf2 else 0)
        idf = math.log((doc_count + 1.0) / (df + 1.0)) + 1.0

        # Sublinear TF: 1 + log(tf) if tf > 0 else 0
        w1 = (1.0 + math.log(tf1[term])) * idf if term in tf1 else 0.0
        w2 = (1.0 + math.log(tf2[term])) * idf if term in tf2 else 0.0

        v1.append(w1)
        v2.append(w2)

    return v1, v2

async def get_gemini_embedding(text: str) -> Optional[List[float]]:
    """Fetch text embedding from Google Gemini API."""
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("your-"):
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}"
    payload = {
        "model": "models/text-embedding-004",
        "content": {
            "parts": [{"text": text[:2048]}] # Cap to first 2048 chars for embedding
        }
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data.get("embedding", {}).get("values")
    except Exception as e:
        print(f"[Warning] Gemini embedding failed, falling back to TF-IDF vectorizer: {e}")
    return None

async def compute_semantic_similarity(resume_text: str, job_text: str) -> float:
    """
    Computes semantic similarity [0.0 - 1.0] between resume and job description.
    Uses Gemini vector embeddings if key is present, otherwise uses TF-IDF N-gram cosine similarity.
    """
    if not resume_text.strip() or not job_text.strip():
        return 0.0

    # Try Gemini vector embeddings
    emb1 = await get_gemini_embedding(resume_text)
    emb2 = await get_gemini_embedding(job_text)
    if emb1 and emb2:
        return cosine_similarity(emb1, emb2)

    # Fallback to TF-IDF cosine similarity
    v1, v2 = generate_tfidf_vectors(resume_text, job_text)
    return cosine_similarity(v1, v2)
