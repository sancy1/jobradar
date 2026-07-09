import unittest

from app.services.database import normalize_database_url


class DatabaseAsyncTests(unittest.TestCase):
    def test_normalize_database_url_for_asyncpg(self):
        self.assertEqual(
            normalize_database_url("postgresql://user:pass@localhost:5432/jobradar"),
            "postgresql+asyncpg://user:pass@localhost:5432/jobradar",
        )


if __name__ == "__main__":
    unittest.main()
