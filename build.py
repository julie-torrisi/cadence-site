# Builds design-ai.html (icons inlined) and design-ai-preview.html (everything inlined + sample data).
import json, re
icons = json.load(open('icons.json'))
def svg(m):
    name, cls = m.group(1), (m.group(2) or '')
    ic = icons[name]
    dots = ''.join(f'<circle cx="{d[0]}" cy="{d[1]}" r="{ic["r"]}"{" class=\"red\"" if len(d) > 2 else ""}/>' for d in ic['dots'])
    strokes = ''.join(f'<path d="{s}" class="red-stroke" fill="none" stroke-width="2" stroke-linecap="round"/>' for s in ic.get('strokes', []))
    return f'<svg class="ico {cls}" viewBox="0 0 {ic["size"]} {ic["size"]}" aria-hidden="true">{dots}{strokes}</svg>'
h = re.sub(r'\{\{icon:(\w+)(?::(\w+))?\}\}', svg, open('design-ai.src.html').read())
open('design-ai.html', 'w').write(h)
p = h.replace('<script src="jtc-dots.js"></script>', '<script>\n' + open('jtc-dots.js').read() + '\n</script>')
p = p.replace('<script src="jtc-visuals.js"></script>', '<script>window.JTC_STATS = ' + open('data/stats.sample.json').read() + ';</script>\n<script>\n' + open('jtc-visuals.js').read() + '\n</script>')
p = p.replace('<title>How I Use AI</title>', '<title>How I Use AI Preview</title>')
open('design-ai-preview.html', 'w').write(p)
print('built')
