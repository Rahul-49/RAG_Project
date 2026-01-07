
import os
import glob
import shutil
from dotenv import load_dotenv

# Set Hugging Face Cache Directory
os.environ['HF_HOME'] = os.path.join(os.getcwd(), 'hf_cache')

# LangChain & Chroma imports
from langchain_community.document_loaders import TextLoader
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    from langchain_community.embeddings import HuggingFaceEmbeddings

from langchain_community.vectorstores import Chroma

# Load env vars
load_dotenv()

# Configuration
KNOWLEDGE_BASE_DIR = os.path.join(os.getcwd(), "knowledge_base")
CHROMA_DB_DIR = os.path.join(os.getcwd(), "chroma_db")

def ingest_documents():
    print("Starting Ingestion Process...")
    print(f"Model cache location: {os.environ['HF_HOME']}")
    
    # 1. Initialize Embeddings (Needed to create vectors)
    print(f"Loading Embeddings (sentence-transformers/all-mpnet-base-v2)...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

    # 2. Load Documents
    print(f"Loading documents from {KNOWLEDGE_BASE_DIR}")
    documents = []
    if not os.path.exists(KNOWLEDGE_BASE_DIR):
        print(f"Directory {KNOWLEDGE_BASE_DIR} does not exist.")
        return

    txt_files = glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.txt"))
    for file_path in txt_files:
        try:
            loader = TextLoader(file_path, encoding='utf-8')
            documents.extend(loader.load())
            print(f" - Loaded {os.path.basename(file_path)}")
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
    
    if not documents:
        print("No documents found!")
        return

    # 3. Split Text
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
    )
    splits = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(splits)} chunks.")

    # 4. Create/Overwrite Vector Store
    if os.path.exists(CHROMA_DB_DIR):
         print("Removing existing Chroma DB to ensure fresh ingestion...")
         try:
            shutil.rmtree(CHROMA_DB_DIR)
         except OSError as e:
             print(f"Warning: Could not clear existing DB ({e}).")
    
    print("Creating Vector Store...")
    Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory=CHROMA_DB_DIR
    )
    print("✅ Ingestion Complete. Vector DB created in 'chroma_db/'.")

if __name__ == "__main__":
    ingest_documents()
