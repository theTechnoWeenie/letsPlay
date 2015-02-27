class Cache:
    def __init__(self):
        self._cache = {}

    def get(self, id):
        try:
            return self._cache[id]
        except KeyError:
            return None

    def set(self, id, value):
        self._cache[id] = value


if __name__ == "__main__":
    c = Cache()
    c.set(1, {"this":1234})
    assert c.get(1)["this"] == 1234
