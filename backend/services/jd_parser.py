"""
OnboardIQ+ — Job Description Parser Service
Extracts and cleans raw text from provided job descriptions.
"""

def parse_jd(jd_text: str) -> str:
    """
    Cleans and normalizes the job description text.
    In a real app, this might handle Word docs or URLs.
    """
    if not jd_text:
        return ""
    
    # Strip unnecessary whitespace and normalize newlines
    cleaned_text = '\n'.join([line.strip() for line in jd_text.splitlines() if line.strip()])
    return cleaned_text
