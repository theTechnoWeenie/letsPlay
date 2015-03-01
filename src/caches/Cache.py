from threading import Lock

def locked(method):
    """Method decorator. Requires a lock object at self._lock"""
    def newmethod(self, *args, **kwargs):
        with self._lock:
            return method(self, *args, **kwargs)
    return newmethod

class Cache:
    def __init__(self):
        self._lock = Lock()
        self._cache = {}

    def get(self, id):
        try:
            return self._cache[id]
        except KeyError:
            return None

    @locked
    def set(self, id, value):
        self._cache[id] = value


if __name__ == "__main__":
    c = Cache()
    c.set(1, {"this":1234})
    assert c.get(1)["this"] == 1234
