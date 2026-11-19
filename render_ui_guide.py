from html import escape
from pathlib import Path
import re

lines = Path('WadaLink_UI_Design_Guide.md').read_text(encoding='utf-8').splitlines()
html = ['<!doctype html><meta charset="utf-8"><style>body{font-family:Arial;color:#131B2E;line-height:1.5;margin:42px}h1{color:#004AC6;border-bottom:3px solid #06B6D4}h2{color:#006A63;margin-top:28px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #DDE7EE;padding:8px}th{background:#004AC6;color:white}li{margin:4px}code{background:#F1F6FA;padding:2px 5px}</style>']
list_open = False
table_open = False
for line in lines:
    if not line.strip():
        if list_open: html.append('</ul>'); list_open = False
        if table_open: html.append('</table>'); table_open = False
        continue
    if line.startswith('# '): html.append('<h1>'+escape(line[2:])+'</h1>'); continue
    if line.startswith('## '): html.append('<h2>'+escape(line[3:])+'</h2>'); continue
    if line.startswith('### '): html.append('<h3>'+escape(line[4:])+'</h3>'); continue
    if line.startswith('- '):
        if not list_open: html.append('<ul>'); list_open = True
        html.append('<li>'+escape(line[2:])+'</li>'); continue
    if line.startswith('|'):
        if '---' in line: continue
        if not table_open: html.append('<table>'); table_open = True
        cells = [escape(x.strip()) for x in line.strip('|').split('|')]
        html.append('<tr>'+''.join('<td>'+x+'</td>' for x in cells)+'</tr>'); continue
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', escape(line))
    html.append('<p>'+text+'</p>')
if list_open: html.append('</ul>')
if table_open: html.append('</table>')
html.append('<p style="color:#737686">WedaLink UI Design Guide</p>')
Path('WadaLink_UI_Design_Guide.html').write_text(''.join(html), encoding='utf-8')
