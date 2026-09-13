"""Необязательный пример. Устанавливать Python для сдачи не нужно."""

def classify_by_rule(text):
    words = ("проектор", "монитор", "клавиатур")
    return "Оборудование" if any(word in text.lower() for word in words) else "Уточнить"

assert classify_by_rule("Сломалась клавиатура") == "Оборудование"
assert classify_by_rule("Помогите") == "Уточнить"
print("Две проверки прошли. Это ручное правило, не обучение модели.")
