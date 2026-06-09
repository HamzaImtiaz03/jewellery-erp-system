import zipfile
import re
import xml.etree.ElementTree as ET

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

path = r"D:\Jewellery ERP System\Jewellery_ERP_Complete_SRS_v4.3.1.docx"

def text_of_paragraph(p):
    parts = []
    for node in p.iter():
        if node.tag == W + 't':
            parts.append(node.text or '')
        elif node.tag == W + 'tab':
            parts.append('\t')
        elif node.tag == W + 'br':
            parts.append('\n')
    return ''.join(parts)

def style_of(p):
    pPr = p.find(W + 'pPr')
    if pPr is None:
        return None
    pStyle = pPr.find(W + 'pStyle')
    if pStyle is None:
        return None
    return pStyle.get(W + 'val')

def numbering_of(p):
    pPr = p.find(W + 'pPr')
    if pPr is None:
        return None
    numPr = pPr.find(W + 'numPr')
    if numPr is None:
        return None
    ilvl = numPr.find(W + 'ilvl')
    lvl = ilvl.get(W + 'val') if ilvl is not None else '0'
    return lvl

out = []

with zipfile.ZipFile(path) as z:
    with z.open('word/document.xml') as f:
        tree = ET.parse(f)
        root = tree.getroot()

body = root.find(W + 'body')

def walk(elem):
    for child in elem:
        if child.tag == W + 'p':
            txt = text_of_paragraph(child)
            style = style_of(child)
            lvl = numbering_of(child)
            prefix = ''
            if style and style.startswith('Heading'):
                num = style.replace('Heading', '')
                prefix = '#' * (int(num) if num.isdigit() else 1) + ' '
            elif style == 'Title':
                prefix = '# '
            elif lvl is not None:
                prefix = '  ' * int(lvl) + '- '
            if txt.strip() or prefix:
                out.append(prefix + txt)
            else:
                out.append('')
        elif child.tag == W + 'tbl':
            out.append('\n[TABLE]')
            for row in child.findall(W + 'tr'):
                cells = []
                for cell in row.findall(W + 'tc'):
                    cell_text = ' '.join(text_of_paragraph(p) for p in cell.findall(W + 'p'))
                    cells.append(cell_text.strip())
                out.append('| ' + ' | '.join(cells) + ' |')
            out.append('[/TABLE]\n')

walk(body)

result = '\n'.join(out)
# collapse excessive blank lines
result = re.sub(r'\n{3,}', '\n\n', result)

with open(r"D:\Jewellery ERP System\_SRS_extracted.md", 'w', encoding='utf-8') as f:
    f.write(result)

print("Lines:", len(out))
print("Chars:", len(result))
