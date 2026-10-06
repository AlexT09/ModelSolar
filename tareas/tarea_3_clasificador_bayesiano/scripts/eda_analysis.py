import csv

column_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'num']

data = []
with open('heart+disease/processed.cleveland.data', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        data.append(row)

# 1. Missing values
missing = {col: 0 for col in column_names}
for row in data:
    for i, val in enumerate(row):
        if val == '?':
            missing[column_names[i]] += 1

print("=== MISSING VALUES ===")
for k, v in missing.items():
    if v > 0:
        print(f"{k}: {v} ({(v/len(data))*100:.2f}%)")

# 2. Target distribution
target = [1 if float(row[-1]) > 0 else 0 for row in data]
count_0 = target.count(0)
count_1 = target.count(1)
print("\n=== TARGET DISTRIBUTION ===")
print(f"0 (No disease): {count_0} ({count_0/len(data)*100:.2f}%)")
print(f"1 (Disease): {count_1} ({count_1/len(data)*100:.2f}%)")

# 3. Data Leak / Categorical Uniques
print("\n=== UNIQUES IN CATEGORICAL ===")
categorical_indices = [1, 2, 5, 6, 8, 10, 12] # sex, cp, fbs, restecg, exang, slope, thal
for idx in categorical_indices:
    uniques = set([row[idx] for row in data if row[idx] != '?'])
    print(f"{column_names[idx]}: {uniques}")

