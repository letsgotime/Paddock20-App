import markdown
from weasyprint import HTML

with open("README.md", "r", encoding="utf-8") as f:
    md_text = f.read()

html_body = markdown.markdown(
    md_text,
    extensions=["tables", "fenced_code", "toc", "codehilite"],
)

css = """
@page {
    size: A4;
    margin: 22mm 18mm;
    @bottom-center {
        content: "Paddock20  ·  Technical Overview  ·  Page " counter(page) " / " counter(pages);
        font-size: 8pt;
        color: #8a8f98;
        font-family: 'Helvetica Neue', Arial, sans-serif;
    }
}
* { box-sizing: border-box; }
body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #1c1f24;
}
h1 {
    font-size: 26pt;
    color: #0b0d10;
    border-bottom: 3px solid #e10600;
    padding-bottom: 8px;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
}
h2 {
    font-size: 15pt;
    color: #0b0d10;
    margin-top: 22px;
    border-left: 4px solid #e10600;
    padding-left: 10px;
}
h3 { font-size: 12pt; color: #2a2e35; margin-top: 16px; }
p, li { color: #2a2e35; }
a { color: #e10600; text-decoration: none; }
code {
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 8.8pt;
    background: #f3f4f6;
    padding: 1px 5px;
    border-radius: 4px;
    color: #b30500;
}
pre {
    background: #14171c;
    color: #e6e8eb;
    padding: 12px 14px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 8.5pt;
    line-height: 1.4;
}
pre code { background: transparent; color: #e6e8eb; padding: 0; }
table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 9.3pt;
}
th {
    background: #14171c;
    color: #fff;
    text-align: left;
    padding: 7px 10px;
    font-weight: 600;
}
td { border-bottom: 1px solid #e3e5e8; padding: 6px 10px; vertical-align: top; }
tr:nth-child(even) td { background: #f7f8f9; }
blockquote {
    border-left: 4px solid #ffb300;
    background: #fff8e6;
    margin: 12px 0;
    padding: 8px 14px;
    color: #5c4a00;
    border-radius: 0 6px 6px 0;
}
hr { border: none; border-top: 1px solid #e3e5e8; margin: 20px 0; }
"""

full_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body>{html_body}</body></html>"""

HTML(string=full_html, base_url=".").write_pdf("Paddock20-Technical-Overview.pdf", stylesheets=[__import__("weasyprint").CSS(string=css)])
print("PDF written")
