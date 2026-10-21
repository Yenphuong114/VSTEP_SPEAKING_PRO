import requests

try:
    with open("dummy.wav", "rb") as f:
        files = {"audio": ("recording.wav", f, "audio/wav")}
        data = {"topic": "Hello", "part": "part1"}
        resp = requests.post("http://127.0.0.1:8000/api/evaluate", files=files, data=data)
        print("Status code:", resp.status_code)
        if resp.status_code == 500:
            print("Response text:", resp.text)
        else:
            print("Success")
except Exception as e:
    print(e)
