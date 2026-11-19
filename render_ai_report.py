from html import escape
from pathlib import Path
import re

src = Path('audit_repo/ai_feat_status_2026-11-19.md').read_text(encoding='utf-8').splitlines()
out = ['<!doctype html><meta charset="utf-8"><style>body{font-family:Arial;color:#131B2E;line-height:1.5;margin:42px}h1{color:#004AC6;border-bottom:3px solid #06B6D4}h2{color:#006A63;margin-top:28px}h3{color:#003EA8}table{border-collapse:collapse;width:100%;margin:12px 0 20px}td,th{border:1px solid #DDE7EE;padding:8px;text-align:left}th{background:#004AC6;color:white}li{margin:4px}code{background:#F1F6FA;padding:2px 5px}</style>']
list_open = table_open = False
for line in src:
    if not line.strip():
        if list_open: out.append('</ul>'); list_open=False
        if table_open: out.append('</table>'); table_open=False
        continue
    if line.startswith('# '): out.append('<h1>'+escape(line[2:])+'</h1>'); continue
    if line.startswith('## '): out.append('<h2>'+escape(line[3:])+'</h2>'); continue
    if line.startswith('### '): out.append('<h3>'+escape(line[4:])+'</h3>'); continue
    if line.startswith('- '):
        if not list_open: out.append('<ul>'); list_open=True
        out.append('<li>'+escape(line[2:])+'</li>'); continue
    if line.startswith('|'):
        if '---' in line: continue
        if not table_open: out.append('<table>'); table_open=True
        cells=[escape(x.strip()) for x in line.strip('|').split('|')]
        out.append('<tr>'+''.join('<td>'+x+'</td>' for x in cells)+'</tr>'); continue
    if line.startswith('```'): continue
    text=re.sub(r'`([^`]+)`', r'<code>\1</code>', escape(line))
    out.append('<p>'+text+'</p>')
if list_open: out.append('</ul>')
if table_open: out.append('</table>')
Path('audit_repo/ai_feat_status_2026-11-19.html').write_text(''.join(out), encoding='utf-8')
