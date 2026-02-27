import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=Dodge%20logo%20svg&utf8=&format=json'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as r:
        data = json.loads(r.read().decode())
        print([i['title'] for i in data['query']['search']])
except Exception as e:
    print(e)
