import nagisa
from http.server import BaseHTTPRequestHandler
from http.server import HTTPServer
from urllib.parse import urlparse, unquote, parse_qs

class HttpGetHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urlparse(self.path).query
        args = parse_qs(query)
        if not ('text' in args):
            self.send_response(404)
            return
        text = parse_qs(query)['text'][0]

        words = nagisa.tagging(text)

        self.send_response(200)
        self.send_header("Content-type", "text/plain; charset=UTF-8")
        self.end_headers()
        self.wfile.write('\n'.join(words.words).encode())

def run(server_class=HTTPServer, handler_class=BaseHTTPRequestHandler):
    server_address = ('', 8000)
    httpd = server_class(server_address, handler_class)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()

run(handler_class=HttpGetHandler)