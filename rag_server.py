from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from rag_engine import RAGSystem
import os
import pypdf
import io

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    rag_system.initialize()
    yield
    # Shutdown (if needed)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_system = RAGSystem()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    response = rag_system.chat(request.message)
    return {"response": response}

class RoadmapRequest(BaseModel):
    company: str
    role: str

@app.post("/roadmap")
async def roadmap(request: RoadmapRequest):
    data = rag_system.generate_roadmap(request.company, request.role)
    return data

@app.post("/analyze-skills")
async def analyze_skills(
    company: str = Form(...),
    role: str = Form(...),
    file: UploadFile = File(...)
):
    # Read file
    content = await file.read()
    filename = file.filename.lower()
    text = ""
    
    if filename.endswith(".pdf"):
        try:
            pdf_reader = pypdf.PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
        except Exception as e:
             return {"error": f"Failed to parse PDF: {str(e)}"}
    else:
        # Assume text
        try:
            text = content.decode("utf-8", errors="ignore")
        except:
            return {"error": "Failed to decode text file"}
            
    if not text.strip():
        return {"error": "Could not extract text from file"}
    
    result = rag_system.analyze_skills(company, role, text)
    return result

@app.post("/analyze-ats")
async def analyze_ats(
    company: str = Form(...),
    role: str = Form(...),
    file: UploadFile = File(...)
):
    # Read file
    content = await file.read()
    filename = file.filename.lower()
    text = ""
    
    if filename.endswith(".pdf"):
        try:
            pdf_reader = pypdf.PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
        except Exception as e:
             return {"error": f"Failed to parse PDF: {str(e)}"}
    else:
        try:
            text = content.decode("utf-8", errors="ignore")
        except:
            return {"error": "Failed to decode text file"}
            
    if not text.strip():
        return {"error": "Could not extract text from file"}
    
    result = rag_system.analyze_resume_ats(company, role, text)
    return result

class CompanyRequest(BaseModel):
    company: str

@app.post("/experiences")
async def get_experiences(request: CompanyRequest):
    data = rag_system.get_experiences(request.company)
    return data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
