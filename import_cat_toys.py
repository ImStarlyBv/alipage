import re
import time
import urllib.request
import urllib.error
import json

IMPORT_URL = "https://kittycontrol.shop/api/admin/products/import"
MARKUP = 1.5
DELAY = 2  # seconds between requests to avoid hammering the AE API

def extract_ids(md_file):
    ids = []
    with open(md_file, "r") as f:
        for line in f:
            m = re.search(r"/item/(\d+)\.html", line)
            if m:
                ids.append(m.group(1))
    return ids

def import_product(aliexpress_id):
    payload = json.dumps({"aliexpressId": aliexpress_id, "markup": MARKUP}).encode()
    req = urllib.request.Request(
        IMPORT_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read())
            return resp.status, body
    except urllib.error.HTTPError as e:
        body = {}
        try:
            body = json.loads(e.read())
        except Exception:
            pass
        return e.code, body

def main():
    ids = extract_ids("cat_toys_products.md")
    total = len(ids)
    print(f"Found {total} products to import\n")

    ok = skipped = failed = 0

    for i, pid in enumerate(ids, 1):
        status, body = import_product(pid)

        if status == 201:
            ok += 1
            title = body.get("product", {}).get("title", "")[:60].encode("ascii", "replace").decode()
            print(f"[{i}/{total}] OK       {pid}  {title}")
        elif status == 409:
            skipped += 1
            print(f"[{i}/{total}] SKIP     {pid}  (already imported)")
        else:
            failed += 1
            err = body.get("error", "unknown error")
            print(f"[{i}/{total}] FAIL {status}  {pid}  {err}")

        if i < total:
            time.sleep(DELAY)

    print(f"\nDone — imported: {ok}  skipped: {skipped}  failed: {failed}")

if __name__ == "__main__":
    main()
