import nbformat as nbf

nb = nbf.v4.new_notebook()
cells = []

# ==========================================
# INTRODUCCIÓN
# ==========================================
cells.append(nbf.v4.new_markdown_cell("""# 4.4.1. Clasificación de enfermedades cardíacas con modelos bayesianos

## Objetivo general
Aplicar un modelo supervisado de clasificación basado en la probabilidad bayesiana (GaussianNB) para predecir la presencia o ausencia de enfermedad cardíaca en pacientes a partir de indicadores clínicos. El objetivo es:
1. Construir un pipeline de preprocesamiento y clasificación usando GaussianNB.
2. Evaluar el desempeño del modelo usando métricas estándar y visualizaciones.
3. Analizar el impacto de cada variable en la predicción desde la perspectiva probabilística.

## Contexto aplicado
Los sistemas de salud buscan modelos interpretables para apoyar el diagnóstico temprano de enfermedades. El diagnóstico de enfermedad cardíaca requiere estimar el riesgo de forma transparente a partir de múltiples mediciones clínicas. Los clasificadores bayesianos son una herramienta adecuada por su rapidez, simplicidad e interpretabilidad.

## Descripción del Dataset
Trabajamos con el dataset "Cleveland Heart Disease" de la UCI Machine Learning Repository (303 pacientes, 14 atributos). Aunque el repositorio original contiene 76 atributos, se seleccionaron los 14 más relevantes para la mayoría de los análisis experimentales.

Diccionario de variables clínicas:

| Variable | Tipo | Descripción |
|----------|------|-------------|
| age | Numérica | Edad del paciente en años |
| sex | Categórica | Sexo (1 = masculino; 0 = femenino) |
| cp | Categórica | Tipo de dolor torácico (1 = Angina típica; 2 = Angina atípica; 3 = Dolor no anginoso; 4 = Asintomático) |
| trestbps | Numérica | Presión arterial en reposo (mm Hg al ingresar al hospital) |
| chol | Numérica | Colesterol sérico en mg/dl |
| fbs | Categórica | Azúcar en sangre en ayunas > 120 mg/dl (1 = verdadero; 0 = falso) |
| restecg | Categórica | Resultados electrocardiográficos en reposo (0 = Normal; 1 = Anomalía onda ST-T; 2 = Hipertrofia ventricular izquierda) |
| thalach | Numérica | Frecuencia cardíaca máxima alcanzada durante prueba de esfuerzo |
| exang | Categórica | Angina inducida por el ejercicio (1 = sí; 0 = no) |
| oldpeak | Numérica | Depresión del segmento ST inducida por el ejercicio en relación con el reposo |
| slope | Categórica | Pendiente del segmento ST en el ejercicio máximo (1 = Ascendente; 2 = Plano; 3 = Descendente) |
| ca | Numérica | Número de vasos principales (0-3) coloreados por fluoroscopia |
| thal | Categórica | Estado de talasemia / perfusión (3 = Normal; 6 = Defecto fijo; 7 = Defecto reversible) |
| num | Objetivo | Diagnóstico de enfermedad cardíaca (0 = Ausencia; 1-4 = Presencia) |"""))

# ==========================================
# EDA
# ==========================================
cells.append(nbf.v4.new_markdown_cell("""## 1. Carga y análisis exploratorio del dataset (EDA)"""))

cells.append(nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

sns.set_theme(style="darkgrid")
plt.rcParams["figure.figsize"] = (10, 5)

column_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'num']

df = pd.read_csv('heart+disease/processed.cleveland.data', names=column_names, na_values='?')

print(f"Dimensiones del dataset: {df.shape[0]} pacientes, {df.shape[1]} variables")
display(df.head(10))"""))

cells.append(nbf.v4.new_code_cell("""df.info()"""))

cells.append(nbf.v4.new_code_cell("""display(df.describe())"""))

cells.append(nbf.v4.new_markdown_cell("""De las estadísticas descriptivas, se destaca que:
- La edad promedio de los pacientes es de ~54 años, con un rango entre 29 y 77 años.
- La presión arterial en reposo promedio es de ~131 mm Hg, con valores extremos hasta 200 mm Hg.
- El colesterol promedio es ~246 mg/dl. Se detectan valores muy altos (hasta 564 mg/dl) que podrían ser atípicos pero clínicamente posibles.
- La frecuencia cardíaca máxima promedio es ~149 bpm, consistente con poblaciones con riesgo cardíaco."""))

# --- Nulos ---
cells.append(nbf.v4.new_markdown_cell("""### Limpieza de valores faltantes"""))

cells.append(nbf.v4.new_code_cell("""nulos = df.isnull().sum()
print("Valores nulos por columna:")
print(nulos[nulos > 0])
print(f"\\nTotal de filas con al menos un nulo: {df.isnull().any(axis=1).sum()} de {len(df)} ({(df.isnull().any(axis=1).sum() / len(df)) * 100:.2f}%)")

df.dropna(inplace=True)
print(f"\\nDimensión del dataset tras eliminar nulos: {df.shape}")"""))

cells.append(nbf.v4.new_markdown_cell("""Solo las variables 'ca' (4 nulos) y 'thal' (2 nulos) presentan valores faltantes, lo que representa apenas el 1.98% de las filas. Se eliminan las filas afectadas en lugar de imputar, ya que en un dataset de solo 303 registros, imputar datos médicos con la media o la moda podría introducir sesgos innecesarios. El dataset queda con 297 registros."""))

# --- Target ---
cells.append(nbf.v4.new_markdown_cell("""### Transformación de la variable objetivo y balanceo de clases"""))

cells.append(nbf.v4.new_code_cell("""df['target'] = df['num'].apply(lambda x: 1 if x > 0 else 0)
df.drop('num', axis=1, inplace=True)

dist = df['target'].value_counts(normalize=True) * 100
print(f"Clase 0 (Sin enfermedad): {dist[0]:.1f}%  ({df['target'].value_counts()[0]} pacientes)")
print(f"Clase 1 (Con enfermedad): {dist[1]:.1f}%  ({df['target'].value_counts()[1]} pacientes)")

fig, ax = plt.subplots(figsize=(6, 4))
sns.countplot(x='target', data=df, palette=["#3f3e6fd1", "#85c6a9"], ax=ax)
ax.set_xticklabels(['Sin enfermedad (0)', 'Con enfermedad (1)'])
plt.title('Distribución de la variable objetivo')
plt.ylabel('Cantidad de pacientes')
plt.show()"""))

cells.append(nbf.v4.new_markdown_cell("""Las clases están distribuidas en 53.9% (160 pacientes sin enfermedad) y 46.1% (137 pacientes con enfermedad). Al estar tan equilibradas, no es necesario aplicar técnicas de remuestreo (SMOTE) ni ajustar pesos de clase. GaussianNB no posee el parámetro class_weight, y en este caso no lo necesitaría de todas formas."""))

# --- Categóricas ---
cells.append(nbf.v4.new_markdown_cell("""### Distribución de variables categóricas"""))

cells.append(nbf.v4.new_code_cell("""categorical_vars = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'thal']

fig, axes = plt.subplots(2, 4, figsize=(18, 8))
axes = axes.flatten()

for i, col in enumerate(categorical_vars):
    sns.countplot(x=col, hue='target', data=df, palette=["#3f3e6fd1", "#85c6a9"], ax=axes[i])
    axes[i].set_title(f'{col}')
    axes[i].legend(['Sano', 'Enfermo'], fontsize=8)

axes[-1].set_visible(False)
plt.suptitle('Distribución de variables categóricas por clase', fontsize=14)
plt.tight_layout()
plt.show()"""))

cells.append(nbf.v4.new_markdown_cell("""Del análisis de las variables categóricas por clase se observa que:
- En 'cp' (tipo de dolor torácico), los pacientes asintomáticos (cp=4) tienen una proporción mucho mayor de enfermedad, lo cual es clínicamente esperado: la ausencia de dolor no implica ausencia de enfermedad.
- En 'sex', los hombres (sex=1) presentan mayor proporción de enfermedad que las mujeres.
- En 'exang' (angina inducida por ejercicio), los pacientes con exang=1 tienen mayor tasa de enfermedad.
- La variable 'fbs' (azúcar en ayunas) parece tener poca capacidad discriminante, con distribuciones similares en ambas clases."""))

# --- KDE numéricas ---
cells.append(nbf.v4.new_markdown_cell("""### Distribución de variables numéricas por clase (Justificación de GaussianNB)
Para justificar el uso de GaussianNB, necesitamos verificar que las variables numéricas sigan distribuciones aproximadamente normales dentro de cada clase."""))

cells.append(nbf.v4.new_code_cell("""numerical_vars = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']

fig, axes = plt.subplots(1, 5, figsize=(20, 4))

for i, col in enumerate(numerical_vars):
    sns.kdeplot(df[df['target'] == 0][col], fill=True, color="blue", label="Sano", ax=axes[i])
    sns.kdeplot(df[df['target'] == 1][col], fill=True, color="red", label="Enfermo", ax=axes[i])
    axes[i].set_title(f'{col}')
    axes[i].legend(fontsize=8)

plt.suptitle('Distribuciones de variables numéricas por clase (KDE)', fontsize=14)
plt.tight_layout()
plt.show()"""))

cells.append(nbf.v4.new_markdown_cell("""Las distribuciones KDE revelan información clave:
- 'thalach' (frecuencia cardíaca máxima) muestra la separación más clara entre clases: los pacientes enfermos tienden a alcanzar frecuencias máximas más bajas. Este es un indicador fisiológico conocido de compromiso cardíaco.
- 'oldpeak' (depresión ST) presenta una distribución fuertemente sesgada a la derecha en ambas clases, pero los pacientes enfermos tienen valores más altos. Esta variable viola parcialmente la suposición de normalidad de GaussianNB.
- 'age', 'trestbps' y 'chol' muestran distribuciones razonablemente normales, lo que justifica el uso de GaussianNB como modelo base."""))

# --- Boxplots ---
cells.append(nbf.v4.new_code_cell("""fig, axes = plt.subplots(1, 5, figsize=(20, 4))

for i, col in enumerate(numerical_vars):
    sns.boxplot(x='target', y=col, data=df, palette=["#3f3e6fd1", "#85c6a9"], ax=axes[i])
    axes[i].set_title(f'{col}')
    axes[i].set_xticklabels(['Sano', 'Enfermo'])

plt.suptitle('Boxplots de variables numéricas por clase', fontsize=14)
plt.tight_layout()
plt.show()"""))

cells.append(nbf.v4.new_markdown_cell("""Los boxplots complementan el análisis KDE permitiendo visualizar medianas, rangos intercuartílicos y valores atípicos:
- En 'thalach', la mediana de los pacientes enfermos es visiblemente más baja que la de los sanos, confirmando su poder discriminante.
- En 'oldpeak', los pacientes enfermos presentan una mediana más alta y una mayor dispersión de valores atípicos superiores.
- En 'chol', ambas clases tienen medianas similares y varios outliers altos, lo que sugiere que el colesterol por sí solo no es un discriminador fuerte en este dataset.
- En 'age', la mediana de los enfermos es ligeramente superior, consistente con la evidencia médica de que la edad es un factor de riesgo cardiovascular."""))

# --- Correlación ---
cells.append(nbf.v4.new_markdown_cell("""### Análisis de correlación entre variables (Multicolinealidad y Data Leak)"""))

cells.append(nbf.v4.new_code_cell("""plt.figure(figsize=(12, 10))
sns.heatmap(df.corr(), annot=True, cmap='coolwarm', fmt=".2f", vmin=-1, vmax=1)
plt.title("Matriz de correlación completa entre variables")
plt.show()"""))

cells.append(nbf.v4.new_markdown_cell("""Interpretación de la matriz de correlación:

Respecto a multicolinealidad:
- No se detectan pares de variables independientes con correlación extremadamente alta (|r| > 0.7), por lo que no hay necesidad de eliminar variables por redundancia estadística.

Respecto a Data Leak (fuga de datos):
- Las variables 'ca' (vasos coloreados por fluoroscopia) y 'thal' (estudio de perfusión con talio) presentan las correlaciones más fuertes con el target (~0.46 y ~0.52 respectivamente).
- En la práctica clínica real, estas pruebas son confirmatorias, costosas e invasivas. Se realizan precisamente cuando ya existe la sospecha de enfermedad cardíaca. Usarlas como predictoras crearía una fuga de datos: estaríamos "prediciendo" la enfermedad usando resultados de pruebas que solo se hacen cuando ya se sospecha de ella.
- Para construir un modelo aplicable como sistema de alerta temprana (triaje clínico), procederemos a eliminar 'ca' y 'thal' de nuestras características predictoras."""))

cells.append(nbf.v4.new_code_cell("""df.drop(['ca', 'thal'], axis=1, inplace=True)
print("Variables finales para el modelo de alerta temprana:")
print([c for c in df.columns if c != 'target'])
display(df.head())"""))

# ==========================================
# PREPROCESAMIENTO Y PIPELINE
# ==========================================
cells.append(nbf.v4.new_markdown_cell("""## 2. Preprocesamiento y codificación

Definimos las variables categóricas y numéricas tras haber eliminado 'ca' y 'thal'. Usaremos:
- OneHotEncoder (con drop='first' para evitar la trampa de la variable dummy) para las categóricas.
- StandardScaler para las numéricas, lo cual es necesario especialmente para la comparación con LogisticRegression.

## 3. Definición del pipeline con GaussianNB

Crearemos tres pipelines para comparar el rendimiento:
1. GaussianNB (requerido por la tarea)
2. BernoulliNB (opcional, para comparación)
3. LogisticRegression (para comparación como lo sugiere el enunciado)"""))

cells.append(nbf.v4.new_code_cell("""from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.naive_bayes import GaussianNB, BernoulliNB
from sklearn.linear_model import LogisticRegression

X = df.drop('target', axis=1)
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=42, stratify=y)

print(f"Train: {X_train.shape[0]} muestras | Test: {X_test.shape[0]} muestras")

categorical_cols = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope']
numerical_cols = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']

preprocessor = ColumnTransformer(transformers=[
    ("num", StandardScaler(), numerical_cols),
    ("cat", OneHotEncoder(drop="first", handle_unknown='ignore'), categorical_cols)
])

pipe_gaussian = Pipeline(steps=[("preprocessing", preprocessor), ("classifier", GaussianNB())])
pipe_bernoulli = Pipeline(steps=[("preprocessing", preprocessor), ("classifier", BernoulliNB())])
pipe_logistic = Pipeline(steps=[("preprocessing", preprocessor), ("classifier", LogisticRegression(max_iter=1000))])"""))

# --- Verificación codificación ---
cells.append(nbf.v4.new_markdown_cell("""### Verificación de la codificación
Para validar que el preprocesamiento funciona correctamente, mostramos cómo quedan los datos después de aplicar el OneHotEncoder y StandardScaler."""))

cells.append(nbf.v4.new_code_cell("""preprocessor.fit(X_train)

ohe = preprocessor.named_transformers_['cat']
cat_names = list(ohe.get_feature_names_out(categorical_cols))
feature_names = numerical_cols + cat_names

X_train_transformed = preprocessor.transform(X_train)
df_transformed = pd.DataFrame(X_train_transformed, columns=feature_names)

print(f"Columnas después de codificación ({len(feature_names)} features):")
print(feature_names)
display(df_transformed.head())"""))

# --- Validación Cruzada ---
cells.append(nbf.v4.new_markdown_cell("""### Validación cruzada
Evaluamos la robustez de los tres clasificadores sobre el conjunto de entrenamiento usando validación cruzada de 5 pliegues (CV=5). Esto nos permite estimar el rendimiento esperado sin tocar el conjunto de test."""))

cells.append(nbf.v4.new_code_cell("""cv_gaussian = cross_val_score(pipe_gaussian, X_train, y_train, cv=5, scoring='accuracy')
cv_bernoulli = cross_val_score(pipe_bernoulli, X_train, y_train, cv=5, scoring='accuracy')
cv_logistic = cross_val_score(pipe_logistic, X_train, y_train, cv=5, scoring='accuracy')

print("Resultados de Validación Cruzada (Accuracy, 5 folds):")
print(f"  GaussianNB:          {cv_gaussian.mean():.4f} (+/- {cv_gaussian.std():.4f})")
print(f"  BernoulliNB:         {cv_bernoulli.mean():.4f} (+/- {cv_bernoulli.std():.4f})")
print(f"  LogisticRegression:  {cv_logistic.mean():.4f} (+/- {cv_logistic.std():.4f})")

pipe_gaussian.fit(X_train, y_train)
pipe_logistic.fit(X_train, y_train)"""))

cells.append(nbf.v4.new_markdown_cell("""Interpretación de la validación cruzada:
El modelo con mejor rendimiento promedio es LogisticRegression (0.7733), seguido de BernoulliNB (0.7686) y GaussianNB (0.7495). La diferencia entre GaussianNB y LogisticRegression es de 0.0238, lo que evidencia que las relaciones entre variables médicas contienen información predictiva que el modelo bayesiano no captura al asumir independencia estricta. Sin embargo, GaussianNB presenta una desviación estándar de 0.0666, lo que indica cierta variabilidad entre los pliegues de validación, probablemente causada por el tamaño reducido del dataset (207 muestras de entrenamiento)."""))

# ==========================================
# EVALUACIÓN
# ==========================================
cells.append(nbf.v4.new_markdown_cell("""## 4. Evaluación de resultados y visualizaciones

### Métricas de clasificación (Accuracy, Precision, Recall, F1-score)"""))

cells.append(nbf.v4.new_code_cell("""from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_curve, auc

y_pred_gauss = pipe_gaussian.predict(X_test)
y_prob_gauss = pipe_gaussian.predict_proba(X_test)[:, 1]

acc = accuracy_score(y_test, y_pred_gauss)
print(f"Accuracy en test: {acc:.4f}\\n")
print("Reporte de Clasificación (GaussianNB):")
print(classification_report(y_test, y_pred_gauss, target_names=['Sano (0)', 'Enfermo (1)']))"""))

# --- Matriz de confusión ---
cells.append(nbf.v4.new_markdown_cell("""### Matriz de confusión"""))

cells.append(nbf.v4.new_code_cell("""cm = confusion_matrix(y_test, y_pred_gauss)
plt.figure(figsize=(6, 4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False,
            xticklabels=['Pred: Sano', 'Pred: Enfermo'],
            yticklabels=['Real: Sano', 'Real: Enfermo'])
plt.title('Matriz de Confusión - GaussianNB')
plt.show()"""))

cells.append(nbf.v4.new_markdown_cell("""Interpretación de la matriz de confusión:
De los 42 pacientes realmente enfermos en el conjunto de test, el modelo identificó correctamente a 28 (66.7% de sensibilidad) y falló en 14, clasificándolos como sanos (Falsos Negativos). Estos 14 Falsos Negativos representan el error más peligroso en el contexto médico: pacientes que no recibirían tratamiento a tiempo.

De los 48 pacientes realmente sanos, el modelo clasificó correctamente a 37 (77.1% de especificidad). Los 11 Falsos Positivos representan pacientes sanos que se enviarían innecesariamente a pruebas adicionales, un costo aceptable frente al riesgo de no detectar enfermos. En un sistema de triaje clínico, se podría ajustar el umbral de decisión del modelo (por ejemplo, de 0.5 a 0.4) para reducir los Falsos Negativos a costa de incrementar los Falsos Positivos."""))

# --- Distribución de probabilidades ---
cells.append(nbf.v4.new_markdown_cell("""### Distribución de predicciones y probabilidad condicional"""))

cells.append(nbf.v4.new_code_cell("""plt.figure(figsize=(8, 5))
sns.kdeplot(y_prob_gauss[y_test == 0], fill=True, color="blue", label="Clase Real: Sano (0)")
sns.kdeplot(y_prob_gauss[y_test == 1], fill=True, color="red", label="Clase Real: Enfermo (1)")
plt.axvline(x=0.5, color='black', linestyle='--', label='Umbral de decisión (0.5)')
plt.title("Distribución de probabilidades predichas por GaussianNB")
plt.xlabel("Probabilidad predicha de enfermedad")
plt.ylabel("Densidad")
plt.legend()
plt.show()"""))

cells.append(nbf.v4.new_markdown_cell("""Este gráfico muestra cómo el modelo asigna probabilidades a cada paciente. Las densidades de la clase Sano (azul) y Enfermo (rojo) se separan hacia los extremos (0.0 y 1.0 respectivamente), lo que indica que el modelo tiene una capacidad discriminativa razonable. El área de solapamiento en el centro (~0.4-0.6) representa pacientes cuyos indicadores clínicos son ambiguos, es decir, pacientes "fronterizos" donde el modelo tiene menos certeza. En un contexto clínico real, estos pacientes se beneficiarían de pruebas adicionales confirmatorias."""))

# --- Curva ROC ---
cells.append(nbf.v4.new_markdown_cell("""### Curva ROC y AUC: Comparación GaussianNB vs LogisticRegression"""))

cells.append(nbf.v4.new_code_cell("""y_prob_log = pipe_logistic.predict_proba(X_test)[:, 1]

fpr_g, tpr_g, _ = roc_curve(y_test, y_prob_gauss)
roc_auc_g = auc(fpr_g, tpr_g)

fpr_l, tpr_l, _ = roc_curve(y_test, y_prob_log)
roc_auc_l = auc(fpr_l, tpr_l)

plt.figure(figsize=(7, 5))
plt.plot(fpr_g, tpr_g, color='darkorange', lw=2, label=f'GaussianNB (AUC = {roc_auc_g:.2f})')
plt.plot(fpr_l, tpr_l, color='green', lw=2, label=f'LogisticRegression (AUC = {roc_auc_l:.2f})')
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Clasificador aleatorio')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('Tasa de Falsos Positivos')
plt.ylabel('Tasa de Verdaderos Positivos')
plt.title('Curvas ROC - Comparación de Modelos')
plt.legend(loc="lower right")
plt.show()

print(f"AUC GaussianNB:          {roc_auc_g:.4f}")
print(f"AUC LogisticRegression:  {roc_auc_l:.4f}")"""))

cells.append(nbf.v4.new_markdown_cell("""Interpretación de las curvas ROC:
LogisticRegression obtiene un AUC de 0.8924, superando al GaussianNB (AUC = 0.8616) por 0.0308. Esto es esperado: LogisticRegression no asume independencia estricta entre las variables, lo que le permite capturar relaciones lineales entre indicadores médicos correlacionados (por ejemplo, edad-presión arterial, oldpeak-thalach). Ambos modelos superan ampliamente al clasificador aleatorio (AUC = 0.50), confirmando su capacidad predictiva real incluso sin las variables invasivas 'ca' y 'thal'."""))

# --- Análisis bayesiano ---
cells.append(nbf.v4.new_markdown_cell("""### Análisis de relevancia de variables según las probabilidades bayesianas
GaussianNB aprende la media (theta_) y la varianza (var_) de cada característica para cada clase. Podemos extraer estos parámetros del modelo entrenado para analizar cuáles variables tienen mayor poder discriminante desde la perspectiva bayesiana: aquellas donde la diferencia de medias entre clases es más grande son las que más influyen en la verosimilitud.

Nota: como las variables fueron escaladas con StandardScaler, las diferencias de medias están en escala estandarizada (unidades de desviación estándar), lo que las hace directamente comparables entre sí sin importar las unidades originales (años, mm Hg, mg/dl, etc.)."""))

cells.append(nbf.v4.new_code_cell("""clf = pipe_gaussian.named_steps['classifier']
prep = pipe_gaussian.named_steps['preprocessing']

# Probabilidades a priori aprendidas
print("Probabilidades a priori aprendidas por GaussianNB:")
print(f"  P(Sano)    = {clf.class_prior_[0]:.4f}")
print(f"  P(Enfermo) = {clf.class_prior_[1]:.4f}")

# Nombres de features transformadas
ohe = prep.named_transformers_['cat']
cat_names = list(ohe.get_feature_names_out(categorical_cols))
feature_names = numerical_cols + cat_names

# Medias por clase y diferencia absoluta
medias_clase0 = clf.theta_[0]
medias_clase1 = clf.theta_[1]
diff_medias = np.abs(medias_clase1 - medias_clase0)

importancia = pd.DataFrame({
    'Variable': feature_names,
    'Media Clase 0 (Sano)': medias_clase0,
    'Media Clase 1 (Enfermo)': medias_clase1,
    'Diferencia Absoluta': diff_medias
}).sort_values('Diferencia Absoluta', ascending=False)

display(importancia)

plt.figure(figsize=(10, 6))
plt.barh(importancia['Variable'], importancia['Diferencia Absoluta'], color='steelblue')
plt.xlabel('Diferencia absoluta de medias entre clases (escala estandarizada)')
plt.title('Relevancia de variables según parámetros del modelo bayesiano')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()"""))

cells.append(nbf.v4.new_markdown_cell("""Las probabilidades a priori aprendidas por el modelo (P(Sano) = 0.5411, P(Enfermo) = 0.4589) coinciden exactamente con la proporción observada en el EDA, confirmando que el modelo refleja la distribución real del dataset.

El gráfico de relevancia muestra cuáles variables producen el mayor cambio en la verosimilitud al evaluar un nuevo paciente. Esto permite al profesional de salud entender qué indicadores clínicos está "priorizando" el modelo al momento de estimar el riesgo, otorgándole interpretabilidad directa a la predicción bayesiana."""))

# ==========================================
# CONCLUSIONES
# ==========================================
cells.append(nbf.v4.new_markdown_cell("""## 5. Reflexión crítica y conclusiones

### Justificación del uso de GaussianNB en el contexto médico
Se eligió GaussianNB porque, como lo muestran las distribuciones KDE del EDA, las variables numéricas principales (age, trestbps, chol, thalach) presentan distribuciones razonablemente normales dentro de cada clase. GaussianNB es el modelo recomendado cuando se tienen variables numéricas continuas mezcladas con discretas, y se requiere interpretabilidad probabilística directa.

### Fortalezas del clasificador bayesiano en este contexto
- Velocidad y simplicidad: Es extremadamente rápido de entrenar. En un dataset de 303 pacientes, el tiempo de entrenamiento es prácticamente instantáneo.
- Ausencia de hiperparámetros: A diferencia de modelos como Random Forest o SVM, GaussianNB no requiere optimizaciones costosas. Por esta razón, la tarea restringe el uso de GridSearchCV, ya que no hay parámetros que optimizar.
- Interpretabilidad: A través de los parámetros theta_ (medias por clase) y var_ (varianzas por clase), es posible saber exactamente cómo el modelo "ve" cada variable para cada diagnóstico. Esto lo hace ideal para contextos médicos donde se necesita transparencia en las decisiones.
- Probabilidades calibradas: El modelo entrega probabilidades continuas que pueden interpretarse como nivel de riesgo, permitiendo ajustar umbrales de decisión según la gravedad clínica.

### Limitaciones del modelo
- Suposición de independencia fuerte (Naive): Naive Bayes asume que todas las características clínicas son estadísticamente independientes entre sí dado el diagnóstico. Esto en medicina rara vez se cumple; por ejemplo, la presión arterial y la edad están fisiológicamente correlacionadas. Esto se evidencia en los resultados: LogisticRegression (que no asume independencia) superó a GaussianNB tanto en validación cruzada (0.7733 vs 0.7495) como en AUC (0.8924 vs 0.8616).
- Suposición de normalidad: Asume que las variables continuas siguen una distribución normal dentro de cada clase. Como vimos en el EDA, la variable 'oldpeak' presenta un sesgo fuerte a la derecha, lo que viola parcialmente esta suposición. Una posible mejora sería aplicar transformaciones (logarítmica o Box-Cox) a estas variables antes del entrenamiento.

### Sobre el Data Leak y aplicabilidad real
Decidimos eliminar las variables 'ca' (fluoroscopia de vasos) y 'thal' (perfusión con talio) del modelo. Aunque incluirlas mejoraría las métricas numéricas, estas pruebas son confirmatorias: se realizan cuando ya existe sospecha clínica de enfermedad. Usarlas como predictoras crearía una fuga de datos que inflaría artificialmente el rendimiento del modelo. Al excluirlas, construimos un sistema de alerta temprana realista, basado únicamente en indicadores demográficos, síntomas y pruebas de bajo costo (ECG, presión arterial, colesterol), que podría utilizarse en una sala de emergencias para decidir si un paciente necesita ser derivado a exámenes invasivos más costosos."""))

nb.cells = cells
with open('tarea3.ipynb', 'w', encoding='utf-8') as f:
    nbf.write(nb, f)
