
import os
from dotenv import load_dotenv

# Set Hugging Face Cache Directory
os.environ['HF_HOME'] = os.path.join(os.getcwd(), 'hf_cache')

# LangChain & Chroma imports
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from sentence_transformers import CrossEncoder

# Load env vars
load_dotenv()

# Configuration
CHROMA_DB_DIR = os.path.join(os.getcwd(), "chroma_db")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

class RAGSystem:
    def __init__(self):
        self.vectorstore = None
        self.llm = None
        self.reranker = None
        self.embeddings = None
        self.is_initialized = False

    def initialize(self):
        print("Initializing RAG Engine (Inference Only)...")
        
        if not GROQ_API_KEY:
             print("CRITICAL WARNING: GROQ_API_KEY not found in env. Please add it to .env file.")

        # 1. Initialize Embeddings (Needed for query encoding)
        print(f"Loading Embeddings (sentence-transformers/all-mpnet-base-v2)...")
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

        # 2. Load Vector Store
        print("Loading existing Vector Store...")
        if not os.path.exists(CHROMA_DB_DIR):
            print("❌ ERROR: Vector DB not found at 'chroma_db/'. Please run 'python ingest.py' first.")
            self.vectorstore = None
        else:
            self.vectorstore = Chroma(persist_directory=CHROMA_DB_DIR, embedding_function=self.embeddings)
            print("Vector Store connected.")

        # 3. Reranker
        print("Loading Reranker (cross-encoder/ms-marco-MiniLM-L-6-v2)...")
        self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

        # 4. LLM
        print("Initializing LLM (Groq)...")
        self.llm = ChatGroq(
            temperature=0,
            model_name="llama-3.3-70b-versatile", 
            api_key=GROQ_API_KEY
        )

        self.is_initialized = True
        print("✅ RAG Engine Ready for Queries.")

    def chat(self, user_query: str):
        if not self.is_initialized:
            return "System is initializing or failed. Check server logs."
        
        if not self.vectorstore:
            return "Knowledge base is empty. Please run the ingestion script."

        # 1. Retrieve
        try:
             retrieved_docs = self.vectorstore.similarity_search(user_query, k=10)
        except Exception as e:
            # If the collection doesn't exist yet
            return f"Error accessing vector DB: {str(e)}"
        
        if not retrieved_docs:
            return "I couldn't find any relevant information in my knowledge base."

        # 2. Rerank
        pairs = [[user_query, doc.page_content] for doc in retrieved_docs]
        try:
             scores = self.reranker.predict(pairs)
             scored_docs = sorted(zip(retrieved_docs, scores), key=lambda x: x[1], reverse=True)
             top_docs = [doc for doc, score in scored_docs[:3]]
        except Exception as e:
            print(f"Reranking error: {e}. Fallback to top 3 retrieval.")
            top_docs = retrieved_docs[:3]
        
        # 3. Generate
        context = "\n\n".join([doc.page_content for doc in top_docs])
        prompt = f"""You are a helpful assistant for university students, answering based ONLY on the provided context.
If the answer is not in the context, say "I don't have that information in my knowledge base."

Context:
{context}

Question: {user_query}

Answer:"""
        
        try:
            response = self.llm.invoke(prompt)
            return response.content
        except Exception as e:
            return f"Error communicating with LLM: {str(e)}"

    def generate_roadmap(self, company: str, role: str):
        if not self.is_initialized:
            return {"error": "System is initializing"}
        
        query = f"preparation roadmap for {company} {role} interview recruitment process"
        
        # 1. Retrieve
        try:
            retrieved_docs = self.vectorstore.similarity_search(query, k=5)
        except Exception as e:
             return {"error": f"Vector DB Error: {str(e)}"}
        
        if not retrieved_docs:
             return {"error": "No info found"}

        # 2. Context
        context = "\n\n".join([doc.page_content for doc in retrieved_docs])
        
        # 3. Prompt for JSON
        prompt = f"""You are an expert career coach. Create a preparation roadmap for the role of '{role}' at '{company}' based strictly on the context provided.
        
        Context:
        {context}
        
        Requirements:
        - Return ONLY a valid JSON array of objects.
        - Do not wrap in markdown code blocks (like ```json ... ```), just raw JSON.
        - Each object must have these keys:
          - "title": string (Topic name, e.g., "Quantitative Aptitude")
          - "status": string (Set all to "pending")
          - "date": string (Estimated timeline, e.g., "Week 1", "Week 2")
          - "description": string (Brief actionable advice or specific topics to cover from context)
          
        If the context lacks specific details, use general industry standards for that role/company but match the context's emphasis.
        """
        
        try:
            response = self.llm.invoke(prompt)
            content = response.content.strip()
            # Cleanup if LLM adds markdown
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            import json
            return json.loads(content)
        except Exception as e:
             return {"error": f"LLM/Parsing Error: {str(e)}", "raw": response.content if 'response' in locals() else ""}

    def analyze_skills(self, company: str, role: str, resume_text: str):
        if not self.is_initialized:
            return {"error": "System is initializing"}

        query = f"technical skills requirements for {company} {role}"
        
        # 1. Retrieve Context
        try:
            retrieved_docs = self.vectorstore.similarity_search(query, k=5)
            context = "\n\n".join([doc.page_content for doc in retrieved_docs])
        except Exception as e:
            context = "" # Fallback to using LLM's internal knowledge if retrieval fails

        # 2. Prompt
        prompt = f"""You are an expert technical recruiter and career coach.
        
        
        Role: {role}
        Company: {company}
        
        Job Requirements Context (from internal database):
        {context}
        
        Candidate's Resume Text:
        {resume_text[:4000]}  # Truncate to avoid context limit if too huge
        
        Task:
        Analyze the resume against the role requirements.
        
        Requirements:
        - Return ONLY a valid JSON object.
        - Do not wrap in markdown code blocks.
        - The JSON must have these exact keys:
          - "present_skills": ["Skill A", "Skill B", ...],
          - "missing_skills": ["Skill X", "Skill Y", ...],
          - "recommendations": [
              {{ "skill": "Skill X", "action": "Specific advice on how to learn/improve this." }},
              ...
            ]
        
        CRITICAL VALIDATION STEP:
        1. Check if "Candidate's Resume Text" is actually a resume or contains relevant professional details. 
        2. If the text is garbage, empty, or completely unrelated (e.g., a random story, code snippet, or nonsensical text), return:
           {{ "present_skills": [], "missing_skills": ["Resume appears invalid or empty"], "recommendations": [] }}
        3. ONLY extract skills that are EXPLICITLY mentioned in the resume text. Do NOT infer skills slightly related.
        4. Be strict. If a skill is not there, it goes to "missing_skills".
        
        Use the Context to identify specific tools/frameworks {company} prefers.
        """
        
        try:
            response = self.llm.invoke(prompt)
            content = response.content.strip()
            # Cleanup
            if content.startswith("```json"): content = content[7:]
            if content.startswith("```"): content = content[3:]
            if content.endswith("```"): content = content[:-3]
            
            import json
            return json.loads(content)
        except Exception as e:
             return {"error": f"LLM/Parsing Error: {str(e)}"}

    def analyze_resume_ats(self, company: str, role: str, resume_text: str):
        if not self.is_initialized:
            return {"error": "System is initializing"}

        query = f"job description requirements keywords for {company} {role}"
        
        # 1. Retrieve Context
        try:
            retrieved_docs = self.vectorstore.similarity_search(query, k=5)
            context = "\n\n".join([doc.page_content for doc in retrieved_docs])
        except Exception as e:
            context = ""

        # 2. Prompt
        prompt = f"""
You are an Advanced Applicant Tracking System (ATS) Analyzer and Resume Optimization Engine.

Target Role: {role}
Target Company: {company}

Official Job Description (Authoritative Context):
{context}

Candidate Resume (Input Text):
{resume_text[:4000]}

Objective:
Perform a deep ATS compatibility analysis of the candidate’s resume against the job description and generate actionable, role-specific improvements that maximize ATS ranking and recruiter relevance.

        Instructions:
        - Treat the job description as the single source of truth.
        - Use ATS parsing logic, keyword weighting, semantic relevance, and role alignment.
        - Do not invent experience; only optimize wording and structure.
        
        CRITICAL VALIDATION STEP:
        1. Analyze "Candidate Resume" text.
        2. If the document is NOT a resume (e.g. random text, assignment, invalid characters), set "ats_score" to 0 and listing "Invalid Document" in "formatting_issues".
        3. Do NOT hallucinate matches. Only count a keyword if it appears in the text.

        Strict Output Requirements:
        - Return ONLY valid JSON.
        - Do NOT include explanations, markdown, or commentary.
        - Suggestions must be direct, explicit resume modifications (ready to paste), not examples.
        
        Required JSON Schema:
        {{
          "ats_score": 0,
          "missing_keywords": [],
          "formatting_issues": [],
          "tailored_suggestions": []
        }}
        
        Field-Level Expectations:
        - ats_score: Integer 0–100 reflecting true ATS match quality.
        - missing_keywords: High-impact, role-specific keywords required by the job description.
        - formatting_issues: ATS-parsing problems (tables, columns, headers, dates, titles).
        - tailored_suggestions: Direct instructions with exact wording and placement
          (summary, experience, skills, projects). No soft language.
        
        Critical Constraints:
        - No hypothetical phrasing.
        - Use authoritative, ATS-optimized language.
        - Optimize for automated screening and recruiter review.
"""
        
        try:
            response = self.llm.invoke(prompt)
            content = response.content.strip()
            if content.startswith("```json"): content = content[7:]
            if content.startswith("```"): content = content[3:]
            if content.endswith("```"): content = content[:-3]
            
            import json
            return json.loads(content)
        except Exception as e:
            import json
            return json.loads(content)
        except Exception as e:
             return {"error": f"LLM/Parsing Error: {str(e)}"}

    def get_experiences(self, company: str):
        if not self.is_initialized:
            return {"error": "System is initializing"}
        
        query = f"interview experience {company} questions rounds"
        
        # 1. Retrieve
        try:
            retrieved_docs = self.vectorstore.similarity_search(query, k=10)
        except Exception as e:
             return []
        
        if not retrieved_docs:
             return []

        # 2. Context
        context = "\n\n".join([doc.page_content for doc in retrieved_docs])
        
        # 3. Prompt
        prompt = f"""You are a curator of interview experiences. Extract and summarize distinct interview experiences for '{company}' from the following context.
        
        Context:
        {context}
        
        Requirements:
        - Return ONLY a valid JSON array of objects.
        - No markdown formatting.
        - Each object must have:
          - "candidate_profile": string (e.g., "Fresher, CSE")
          - "role": string
          - "rounds": array of strings (List of rounds)
          - "questions_asked": array of strings (Key technical/HR questions)
          - "verdict": string ("Selected" or "Rejected")
          - "tips": string (Advice)

        Ensure the data is extracted strictly from context where possible. If context is generic, synthesize a representative experience based on standard {company} patterns found in the text.
        """
        
        try:
            response = self.llm.invoke(prompt)
            content = response.content.strip()
            if content.startswith("```json"): content = content[7:]
            if content.startswith("```"): content = content[3:]
            if content.endswith("```"): content = content[:-3]
            
            import json
            return json.loads(content)
        except Exception as e:
             return [{"error": f"LLM/Parsing Error: {str(e)}"}]
