"""
OnboardIQ+ — Resume Parser Service
Extracts raw text from uploaded PDF resumes using PyMuPDF.
"""
import io
from pypdf import PdfReader
from io import BytesIO


def parse_resume(file_bytes: bytes) -> str:
    """Extracts raw text from a PDF resume using pypdf."""
    try:
        reader = PdfReader(BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip() # Added .strip() to match original behavior
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""
