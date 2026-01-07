# Placement Pal - RAG Application Details

## 🧠 Retrieval-Augmented Generation (RAG) Architecture

This application uses a sophisticated RAG pipeline to provide accurate, context-aware answers for interview preparation, roadmap generation, and skill analysis.

### 1. Ingestion Pipeline (`ingest.py`)
*   **Chunking Strategy**: Recursive Character Splitting
    *   **Chunk Size**: 500 characters
    *   **Chunk Overlap**: 50 characters
    *   **Library**: `langchain_text_splitters.RecursiveCharacterTextSplitter`
*   **Vector Store**: ChromaDB (Persistent)
*   **Embedding Model**: `sentence-transformers/all-mpnet-base-v2`
    *   **Dimension**: 768
    *   **Reason**: High-performance semantic search optimized for sentence-level tasks.

### 2. Retrieval Engine (`rag_engine.py`)
*   **Retrieval Strategy**: Similarity Search (Top-k)
    *   **Initial Retrieval (k)**: 10 documents
*   **Reranking**: Cross-Encoder
    *   **Model**: `cross-encoder/ms-marco-MiniLM-L-6-v2`
    *   **Process**: Ranks initial results by semantic relevance to the query to select the absolute best context (Top-3 filtered).
*   **Context Window**: Concatenates top reranked document chunks.

### 3. Generation Engine (LLM)
*   **Provider**: Groq
*   **Model**: `llama-3.3-70b-versatile`
*   **Temperature**: 0 (Deterministic, fact-based responses)
*   **Prompts**: Validated with specific instructions to avoid hallucinations and strict JSON formatting for tools.

### 4. Features & Endpoints

| Feature | Endpoint | Description |
| :--- | :--- | :--- |
| **Chatbot** | `/chat` | Answers general queries using RAG context. |
| **Roadmap** | `/roadmap` | Generates role-specific study roadmaps. |
| **Skill Analyzer** | `/analyze_skills` | Compares resume PDF/TXT against job requirements. |
| **ATS Scanner** | `/analyze_ats` | Deep analysis of resume formatting and keywords. |
| **Interview Experiences** | `/experiences` | Retrieves and structures past interview stories. |

### 5. Tech Stack
*   **Backend**: Python, FastAPI, LangChain, ChromaDB
*   **Frontend**: Next.js, TypeScript, Tailwind CSS, Framer Motion
*   **AI/ML**: HuggingFace (Embeddings/Reranker), Groq (LLM Inference)
