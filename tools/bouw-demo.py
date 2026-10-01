#!/usr/bin/env python3
"""Maakt een demo van de app in één HTML-bestand (voor een voorbeeld of een artifact).
Gebruik: python3 tools/bouw-demo.py [uitvoer.html] [--data kelder.json]
Met --data start de demo met die gegevens in plaats van de ingebouwde voorbeeldwijnen.
Zet zo'n gegevensbestand nooit in de repository."""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / "app"
idx = (root / "index.html").read_text()
head = re.search(r"<!--DEMO-HEAD-->([\s\S]*?)<!--/DEMO-HEAD-->", idx).group(1)
body = re.search(r"<!--DEMO-BODY-->([\s\S]*?)<!--/DEMO-BODY-->", idx).group(1)
# zonder de basis-reset (het artifact levert die zelf)
head = re.sub(r":root\{padding-top[^\n]*\n[^\n]*\[hidden\][^\n]*\n", "", head)
scripts = "".join(f"<script>\n{(root / f).read_text()}\n</script>\n" for f in ["kaarten.js", "velden.js", "bewaking.js", "app.js"])
args = sys.argv[1:]
data = ""
if "--data" in args:
    i = args.index("--data"); data = pathlib.Path(args[i + 1]).read_text(encoding="utf8"); del args[i:i + 2]
    scripts = "<script>window.WK_DEMO_DATA=" + data.replace("</", "<\\/") + ";</script>\n" + scripts
out = pathlib.Path(args[0] if args else "wijnkelder-demo.html")
out.write_text(head.strip() + "\n" + body.strip() + "\n" + scripts)
print(out, round(out.stat().st_size / 1024), "KB")
