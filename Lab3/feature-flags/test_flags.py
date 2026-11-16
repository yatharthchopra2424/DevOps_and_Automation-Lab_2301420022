"""Unit tests for the FeatureFlags class — Lab 3
Student ID: 2301420022
Run with: python feature-flags/test_flags.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import unittest
from feature_flags import FeatureFlags


class TestFeatureFlagsInit(unittest.TestCase):
    def test_empty_init(self):
        ff = FeatureFlags()
        self.assertEqual(ff.all_flags(), {})

    def test_initial_flags(self):
        ff = FeatureFlags({"dark_mode": True, "beta_ui": False})
        self.assertTrue(ff.is_enabled("dark_mode"))
        self.assertFalse(ff.is_enabled("beta_ui"))

    def test_nonexistent_flag_returns_false(self):
        ff = FeatureFlags()
        self.assertFalse(ff.is_enabled("nonexistent"))


class TestFeatureFlagsMutation(unittest.TestCase):
    def setUp(self):
        self.ff = FeatureFlags({"dark_mode": False, "export_pdf": True})

    def test_enable(self):
        self.ff.enable("dark_mode")
        self.assertTrue(self.ff.is_enabled("dark_mode"))

    def test_disable(self):
        self.ff.disable("export_pdf")
        self.assertFalse(self.ff.is_enabled("export_pdf"))

    def test_enable_new_flag(self):
        self.ff.enable("brand_new")
        self.assertTrue(self.ff.is_enabled("brand_new"))

    def test_disable_new_flag(self):
        self.ff.disable("another_new")
        self.assertFalse(self.ff.is_enabled("another_new"))

    def test_set_true(self):
        self.ff.set("dark_mode", True)
        self.assertTrue(self.ff.is_enabled("dark_mode"))

    def test_set_false(self):
        self.ff.set("export_pdf", False)
        self.assertFalse(self.ff.is_enabled("export_pdf"))

    def test_toggle_off_to_on(self):
        result = self.ff.toggle("dark_mode")  # was False
        self.assertTrue(result)
        self.assertTrue(self.ff.is_enabled("dark_mode"))

    def test_toggle_on_to_off(self):
        result = self.ff.toggle("export_pdf")  # was True
        self.assertFalse(result)
        self.assertFalse(self.ff.is_enabled("export_pdf"))

    def test_remove(self):
        self.ff.remove("dark_mode")
        self.assertFalse(self.ff.is_enabled("dark_mode"))
        self.assertNotIn("dark_mode", self.ff.all_flags())

    def test_remove_nonexistent_no_error(self):
        self.ff.remove("ghost_flag")  # should not raise


class TestFeatureFlagsQuery(unittest.TestCase):
    def test_all_flags_returns_copy(self):
        ff = FeatureFlags({"a": True, "b": False})
        snapshot = ff.all_flags()
        snapshot["a"] = False  # mutate copy
        self.assertTrue(ff.is_enabled("a"))  # original unchanged

    def test_all_flags_count(self):
        ff = FeatureFlags({"x": True, "y": False, "z": True})
        self.assertEqual(len(ff.all_flags()), 3)


class TestFeatureFlagsIntegration(unittest.TestCase):
    def test_full_lifecycle(self):
        ff = FeatureFlags()
        ff.enable("feature_a")
        ff.enable("feature_b")
        ff.disable("feature_a")
        self.assertFalse(ff.is_enabled("feature_a"))
        self.assertTrue(ff.is_enabled("feature_b"))
        ff.toggle("feature_a")
        self.assertTrue(ff.is_enabled("feature_a"))
        ff.remove("feature_b")
        self.assertEqual(list(ff.all_flags().keys()), ["feature_a"])

    def test_multiple_toggles(self):
        ff = FeatureFlags({"flag": False})
        for i in range(6):
            ff.toggle("flag")
        # 6 toggles from False → ends at False (even number)
        self.assertFalse(ff.is_enabled("flag"))


if __name__ == "__main__":
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(__import__("__main__"))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
