import urllib.request
import json
import base64
import time

# Search github for alfa-romeo.svg
url = 'https://api.github.com/search/code?q=alfa+romeo+extension:svg+path:icons+repo:twbs/icons'
url2 = 'https://api.github.com/search/code?q=alfaromeo+extension:svg+path:icons'

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
        print("twbs/icons:", [i['path'] for i in data.get('items', [])])
except Exception as e:
    print(e)
