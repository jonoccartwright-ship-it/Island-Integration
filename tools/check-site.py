#!/usr/bin/env python3
"""Static site checker (standard library only).

Usage, from the repository root:   python3 tools/check-site.py

Checks every HTML page for: broken internal links/assets/anchors, title and
description presence and length, canonical URL, one <h1>, image alt/width/height,
valid JSON-LD, Open Graph image existence, and sitemap coverage.
Exit status is 1 if anything fails, so it can run in CI.
"""
import json
import os
import re
import sys
from html.parser import HTMLParser
from urllib.parse import unquote, urldefrag, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://www.island-integration.com"


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs, self.ids, self.imgs, self.h1, self.meta, self.ld = [], set(), [], 0, {}, []
        self.title, self._in_title, self._in_ld, self.canonical = "", False, False, None

    def handle_starttag(self, tag, a):
        a = dict(a)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "title":
            self._in_title = True
        elif tag == "h1":
            self.h1 += 1
        elif tag == "meta":
            k = a.get("name") or a.get("property")
            if k:
                self.meta[k] = a.get("content", "")
        elif tag == "link":
            if a.get("rel") == "canonical":
                self.canonical = a.get("href")
            if a.get("href"):
                self.refs.append(a["href"])
        elif tag == "script":
            if a.get("type") == "application/ld+json":
                self._in_ld = True
            if a.get("src"):
                self.refs.append(a["src"])
        elif tag == "a" and a.get("href"):
            self.refs.append(a["href"])
        elif tag in ("img", "source", "video"):
            for k in ("src", "poster"):
                if a.get(k):
                    self.refs.append(a[k])
            for s in (a.get("srcset") or "").split(","):
                if s.strip():
                    self.refs.append(s.strip().split()[0])
            if tag == "img":
                self.imgs.append(a)

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "script":
            self._in_ld = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_ld:
            self.ld.append(data)


def main():
    pages = []
    for base, _, files in os.walk(ROOT):
        if any(p in base for p in (".git", "node_modules", "tools")):
            continue
        pages += [os.path.join(base, f) for f in files if f.endswith(".html")]
    pages.sort()
    parsed = {}
    for f in pages:
        p = Page()
        p.feed(open(f, encoding="utf-8").read())
        parsed[f] = p

    fails, warns = [], []

    def fail(f, msg):
        fails.append(f"{os.path.relpath(f, ROOT)}: {msg}")

    def warn(f, msg):
        warns.append(f"{os.path.relpath(f, ROOT)}: {msg}")

    titles, descs = {}, {}
    for f, p in parsed.items():
        rel = os.path.relpath(f, ROOT)
        base = os.path.dirname(f)
        noindex = "noindex" in p.meta.get("robots", "")
        t, d = p.title.strip(), p.meta.get("description", "")
        if not t: fail(f, "missing <title>")
        elif len(t) > 65: warn(f, f"title is {len(t)} chars (aim for <= 60-65)")
        if not d: fail(f, "missing meta description")
        elif not 70 <= len(d) <= 165: warn(f, f"description is {len(d)} chars (aim for 70-160)")
        if t in titles: fail(f, f"duplicate title with {titles[t]}")
        if d in descs: fail(f, f"duplicate description with {descs[d]}")
        titles[t], descs[d] = rel, rel
        if p.h1 != 1: fail(f, f"{p.h1} <h1> elements (expected 1)")
        if not noindex:
            if not p.canonical: fail(f, "missing canonical URL")
            elif not p.canonical.startswith(SITE): fail(f, f"canonical off-site: {p.canonical}")
            for k in ("og:title", "og:description", "og:image", "og:url", "twitter:card"):
                if not p.meta.get(k): fail(f, f"missing {k}")
            img = p.meta.get("og:image", "")
            if img.startswith(SITE) and not os.path.exists(os.path.join(ROOT, urlparse(img).path.lstrip("/"))):
                fail(f, f"og:image file not found: {img}")
        for i in p.imgs:
            src = i.get("src", "?")
            if "alt" not in i: fail(f, f"<img {src}> missing alt")
            if not (i.get("width") and i.get("height")): warn(f, f"<img {src}> missing width/height (layout shift)")
        for blob in p.ld:
            try:
                json.loads(blob)
            except ValueError as e:
                fail(f, f"invalid JSON-LD: {e}")
        for ref in p.refs:
            if ref.startswith(("mailto:", "tel:", "data:", "javascript:")) or ref.startswith(("http://", "https://")) and not ref.startswith(SITE):
                continue
            url, frag = urldefrag(ref)
            if ref.startswith(SITE):
                url = url[len(SITE):] or "/"
            if url in ("", "/"):
                target = f if url == "" else os.path.join(ROOT, "index.html")
            elif url.startswith("/"):
                target = os.path.join(ROOT, unquote(url.split("?")[0].lstrip("/")))
            else:
                target = os.path.normpath(os.path.join(base, unquote(url.split("?")[0])))
            if os.path.isdir(target):
                target = os.path.join(target, "index.html")
            if not os.path.exists(target):
                fail(f, f"broken reference: {ref}")
            elif frag and target.endswith(".html") and target in parsed and frag not in parsed[target].ids:
                fail(f, f"anchor #{frag} not found in {os.path.relpath(target, ROOT)}")

    sm = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
    locs = re.findall(r"<loc>(.*?)</loc>", sm)
    for f, p in parsed.items():
        rel = os.path.relpath(f, ROOT)
        if "noindex" in p.meta.get("robots", ""):
            continue
        want = SITE + "/" + ("" if rel == "index.html" else rel)
        if want not in locs: fail(f, f"not listed in sitemap.xml ({want})")
    for l in locs:
        path = l[len(SITE) + 1:] or "index.html"
        if not os.path.exists(os.path.join(ROOT, path)): fail(os.path.join(ROOT, "sitemap.xml"), f"lists missing page {l}")

    print(f"Checked {len(parsed)} pages")
    for w in warns: print("WARN ", w)
    for x in fails: print("FAIL ", x)
    print(f"{len(fails)} failure(s), {len(warns)} warning(s)")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
