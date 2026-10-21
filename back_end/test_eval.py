import os
import sys
import json

# Change dir to back_end
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing evaluator...")
    from evaluator import evaluate_vstep
    res = evaluate_vstep("Hometown", "part1", "I live in Hanoi. It is very beautiful.", 120.0, 10.0)
    with open("output.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=4)
    print("Evaluate success. Check output.json")
except Exception as e:
    print("Evaluator failed:")
    import traceback
    traceback.print_exc()
