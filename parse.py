import PyPDF2
reader = PyPDF2.PdfReader('/Users/erdelyipeter/.gemini/antigravity/brain/c96711a6-8545-4ff3-914d-40cacbb16285/.tempmediaStorage/9532225bd2a5a3f7.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text()
with open("pxp_api_parsed.txt", "w") as f:
    f.write(text)
