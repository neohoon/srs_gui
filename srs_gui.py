#!/usr/bin/python
"""
Very simple HTTP server in python.

Usage::
    ./dummy-web-server.py [<port>]
Send a GET request::
    curl http://localhost
Send a HEAD request::
    curl -I http://localhost
Send a POST request::
    curl -d "foo=bar&bin=baz" http://localhost
"""
import os
import sys
import glob
import serial
# from multiprocessing import Process
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
import webbrowser
import configparser
import json

PORT_NUMBER = 8080
DEFAULT_HTML = "srs_gui.html"
if sys.platform.startswith('win'):
    CLIENT_EXE_FNAME = "client.bat"
elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
    CLIENT_EXE_FNAME = "client.sh"
elif sys.platform.startswith('darwin'):
    CLIENT_EXE_FNAME = "client.sh"
else:
    CLIENT_EXE_FNAME = ""


# This class will handles any incoming request from
# the browser
class MyHandler(BaseHTTPRequestHandler):

    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    # Handler for the GET requests
    def do_GET(self):
        """
        with open(html_file, 'r') as f:
            data = f.read()
        self._set_headers()
        # Send the html message
        self.wfile.write(data.encode())
        return
        """
        self._set_headers()
        real_path = '.' + self.path
        if real_path.split('/')[1] == '':
            real_path += DEFAULT_HTML
        print("do_GET.path: " + real_path)
        with open(real_path, 'r') as f:
            data = f.read()
        self.wfile.write(data.encode())
        return

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])  # Gets the size of data
        post_dict = json.loads(self.rfile.read(content_length).decode())  # Gets the data itself
        print(post_dict)
        self._set_headers()

        if post_dict["cmd"] == "uart_check":
            ports = list_serial_ports()
            if isinstance(ports, list):
                res_dict = {"status": "OK", "ports": ports}
            else:
                res_dict = {"status": "NOK"}
        elif post_dict["cmd"] == "run":
            platform = post_dict['args'][0]['platform']
            if platform == 'Xwr16xx':
                dsp_script = generate_DSP_script_for_Xwr16xx(post_dict['args'][0]['params'])
                uart = config_UART(post_dict['args'][1]['params'])
                uart.open()
                uart.write(dsp_script.encode())
                res = uart.read()
                res = res.decode() if isinstance(res, bytes) else res
                res = 'UART response : ' + res
                res_dict = {"status": "OK", "remark": res}
            else:
                res_dict = {"status": "NOK",
                            "remark": "Unknown platform, {}".format(platform)}
        elif post_dict["cmd"] == "load":
            config = configparser.ConfigParser()
            config.read_string(post_dict["args"][0])
            res_dict = {s: dict(config.items(s)) for s in config.sections()}
        elif post_dict["cmd"] == "exit":
            res_dict = {"status": "OK"}
        else:
            res_dict = {"status": "NOK", "remark": "Unknown command, {}".format(post_dict["cmd"])}

        print(res_dict)
        self.wfile.write(json.dumps(res_dict).encode())

        if post_dict["cmd"] == "exit":
            sys.exit()


def list_serial_ports():
    """
    List serial port names.
    :raises EnvironmentError:
        On unsupported or unknown platforms.
    :return:
        A list of the serial ports available on the system.
    """
    if sys.platform.startswith('win'):
        ports = ['COM%s' % (i + 1) for i in range(256)]
    elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
        # this excludes your current terminal "/dev/tty"
        ports = glob.glob('/dev/tty[A-Za-z]*')
    elif sys.platform.startswith('darwin'):
        ports = glob.glob('/dev/tty.*')
    else:
        raise EnvironmentError('Unsupported platform')

    result = []
    for port in ports:
        try:
            s = serial.Serial(port)
            s.close()
            result.append(port)
        except (OSError, serial.SerialException):
            pass
    return result


def config_UART(params):
    ser = serial.Serial()
    ser.port = params['port']
    ser.baudrate = int(params['baud_rate'])
    ser.bytesize = int(params['byte_size'])
    ser.parity = params['parity']
    ser.stopbits = int(params['stop_bits'])
    ser.timeout = int(params['time_out'])
    return ser


def generate_DSP_script_for_Xwr16xx(params):
    """
    range_max = int(params['range_max'])
    range_resol = int(params['range_resol'])
    velocity_max = int(params['velocity_max'])
    velocity_resol = int(params['velocity_resol'])
    frame_duration = int(params['frame_duration'])
    snr_thresh = int(params['snr_thresh'])
    rx_gain = int(params['rx_gain'])
    power_backoff = int(params['power_backoff'])
    mti_weight = int(params['mti_weight'])
    """
    return str(params)


def run_browser(url):
    time.sleep(2)
    print(" Run browser with {}".format(url))
    webbrowser.open_new(url)
    exit()


def run_server(server=None):
    print('Started http server on port {:d}'.format(PORT_NUMBER))
    try:
        # Wait forever for incoming http requests
        server.serve_forever()
    except KeyboardInterrupt:
        print('^C received, shutting down the web server')
        server.socket.close()


def run_client(url):
    try:
        os.remove(CLIENT_EXE_FNAME)
    except all:
        pass
    if sys.platform.startswith('win'):
        with open(CLIENT_EXE_FNAME, "w") as fid:
            fid.write("timeout 3\nstart \"\" " + url)
        os.system("start /min cmd.exe /c " + CLIENT_EXE_FNAME)
    elif sys.platform.startswith('darwin'):
        with open(CLIENT_EXE_FNAME, "w") as fid:
            fid.write("sleep 3\nopen " + url)
        os.system("chmod u+x " + CLIENT_EXE_FNAME)
        os.system(CLIENT_EXE_FNAME + "&")
    elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
        pass
    else:
        raise EnvironmentError('Unsupported OS platform')


def run(server_class=HTTPServer, handler_class=MyHandler, port=PORT_NUMBER):
    server_address = ('', port)
    server = server_class(server_address, handler_class)
    url = "http://localhost:{}".format(port)
    run_client(url)
    run_server(server)
    """
    processes = [Process(target=run_server, args=(server,)), Process(target=run_browser, args=(url,))]
    for p in processes:
        p.start()
    for p in processes:
        p.join()
    """


if __name__ == "__main__":
    if len(sys.argv) == 2:
        run(port=int(sys.argv[1]))
    else:
        run()
