import pymupdf as fitz
from docx import Document

def extract_text(file_path):
    if file_path.endswith(".pdf"):
        text = ""
        pdf = fitz.open(file_path)

        for page in pdf:
            text += page.get_text()

        pdf.close()
        return text

    elif file_path.endswith(".docx"):
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text

    else:
        return "Unsupported file format"