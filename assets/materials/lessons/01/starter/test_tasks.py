import copy
import unittest
from tasks import load_tasks, select_tasks, sort_tasks, get_task

class TaskTests(unittest.TestCase):
    def setUp(self):
        self.rows = load_tasks()

    def test_sort_missing_due(self):
        self.assertEqual([r["id"] for r in sort_tasks(self.rows)], [3, 1, 4, 2])

    def test_tie_and_input_unchanged(self):
        rows = [self.rows[3], self.rows[0], self.rows[1]]
        original = copy.deepcopy(rows)
        self.assertEqual([r["id"] for r in sort_tasks(rows)], [1, 4, 2])
        self.assertEqual(rows, original)

    def test_empty_and_all_missing(self):
        self.assertEqual(sort_tasks([]), [])
        rows = [dict(self.rows[1], id=8), dict(self.rows[1], id=5)]
        self.assertEqual([r["id"] for r in sort_tasks(rows)], [5, 8])

    def test_filter(self):
        self.assertEqual([r["id"] for r in select_tasks(self.rows, "done")], [3])
        self.assertEqual(len(select_tasks(self.rows)), 4)
        with self.assertRaisesRegex(ValueError, "INVALID_STATUS"):
            select_tasks(self.rows, "unknown")

    def test_lookup(self):
        self.assertEqual(get_task(self.rows, 2)["due"], None)
        with self.assertRaisesRegex(LookupError, "NOT_FOUND"):
            get_task(self.rows, 999)
        for value in [0, -1, True, "1"]:
            with self.assertRaisesRegex(ValueError, "INVALID_ID"):
                get_task(self.rows, value)

if __name__ == "__main__":
    unittest.main()
