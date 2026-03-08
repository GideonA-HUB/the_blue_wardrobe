from pathlib import Path
from tempfile import TemporaryDirectory

from django.test import SimpleTestCase, TestCase
from rest_framework.test import APIClient

from .models import Collection


class StoreModelTests(TestCase):
    def test_collection_string_representation(self):
        collection = Collection.objects.create(code='TBW-001', title='Blue Wardrobe Signature')
        self.assertEqual(str(collection), 'TBW-001 - Blue Wardrobe Signature')


class StoreApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_favicon_endpoint_uses_frontend_fallback(self):
        with TemporaryDirectory() as temp_dir:
            build_dir = Path(temp_dir)
            (build_dir / 'favicon.ico').write_bytes(b'ico')
            with self.settings(FRONTEND_BUILD_DIR=build_dir, STATIC_ROOT=build_dir):
                response = self.client.get('/favicon.ico')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.content, b'ico')


class FrontendShellTests(SimpleTestCase):
    def test_root_serves_frontend_shell(self):
        with TemporaryDirectory() as temp_dir:
            build_dir = Path(temp_dir)
            (build_dir / 'index.html').write_text('<!doctype html><html><body>THE BLUE WARDROBE</body></html>', encoding='utf-8')
            with self.settings(FRONTEND_BUILD_DIR=build_dir):
                response = self.client.get('/')
                self.assertEqual(response.status_code, 200)
                self.assertIn(b'THE BLUE WARDROBE', response.content)
