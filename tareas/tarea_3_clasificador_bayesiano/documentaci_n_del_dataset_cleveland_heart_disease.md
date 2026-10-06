# Documentación del Conjunto de Datos Clínicos (Cleveland Heart Disease)

Este documento detalla la estructura completa, la documentación de los atributos y las 14 características principales utilizadas en los modelos de clasificación para el diagnóstico de enfermedades cardíacas a partir del conjunto de datos de Cleveland.

## 1. Tabla Resumen de Atributos Principales

| Variable Name | Role | Type | Demographic | Description | Units | Missing Values |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| age | Feature | Integer | Age | age in years | years | no |
| sex | Feature | Categorical | Sex | sex (1 = male; 0 = female) | | no |
| cp | Feature | Categorical | | chest pain type (1 = typical angina; 2 = atypical angina; 3 = non-anginal pain; 4 = asymptomatic) | | no |
| trestbps | Feature | Integer | | resting blood pressure (in mm Hg on admission to the hospital) | mm Hg | no |
| chol | Feature | Integer | | serum cholestoral in mg/dl | mg/dl | no |
| fbs | Feature | Categorical | | fasting blood sugar > 120 mg/dl (1 = true; 0 = false) | | no |
| restecg | Feature | Categorical | | resting electrocardiographic results (0 = normal; 1 = having ST-T wave abnormality; 2 = showing probable or definite left ventricular hypertrophy) | | no |
| thalach | Feature | Integer | | maximum heart rate achieved | | no |
| exang | Feature | Categorical | | exercise induced angina (1 = yes; 0 = no) | | no |
| oldpeak | Feature | Integer | | ST depression induced by exercise relative to rest | | no |
| slope | Feature | Categorical | | the slope of the peak exercise ST segment (1 = upsloping; 2 = flat; 3 = downsloping) | | no |
| ca | Feature | Integer | | number of major vessels (0-3) colored by flourosopy | | yes |
| thal | Feature | Categorical | | 3 = normal; 6 = fixed defect; 7 = reversable defect | | yes |
| num | Target | Integer | | diagnosis of heart disease (angiographic disease status: 0 = < 50% diameter narrowing; 1 = > 50% diameter narrowing) | | no |

---

## 2. Documentación Completa de los 14 Atributos Utilizados

1. **age**: Edad en años.
2. **sex**: Sexo ($1 = \text{masculino}; 0 = \text{femenino}$).
3. **cp (Tipo de dolor torácico)**:
   * Valor 1: Angina típica
   * Valor 2: Angina atípica
   * Valor 3: Dolor no anginoso
   * Valor 4: Asintomático
4. **trestbps**: Presión arterial en reposo (en mm Hg al ingresar al hospital).
5. **chol**: Colesterol sérico en $\text{mg/dl}$.
6. **fbs**: Azúcar en sangre en ayunas $> 120 \text{ mg/dl}$ ($1 = \text{verdadero}; 0 = \text{falso}$).
7. **restecg**: Resultados electrocardiográficos en reposo:
   * Valor 0: Normal
   * Valor 1: Con anomalía de la onda ST-T (inversiones de la onda T y/o elevación o depresión del ST $> 0.05 \text{ mV}$)
   * Valor 2: Muestra hipertrofia ventricular izquierda probable o definitiva según los criterios de Estes.
8. **thalach**: Frecuencia cardíaca máxima alcanzada.
9. **exang**: Angina inducida por el ejercicio ($1 = \text{sí}; 0 = \text{no}$).
10. **oldpeak**: Depresión del segmento ST inducida por el ejercicio en relación con el reposo.
11. **slope**: La pendiente del segmento ST en el ejercicio máximo:
    * Valor 1: Pendiente ascendente
    * Valor 2: Plano
    * Valor 3: Pendiente descendente
12. **ca**: Número de vasos principales ($0-3$) coloreados por fluoroscopia.
13. **thal**: 
    * 3 = Normal
    * 6 = Defecto fijo
    * 7 = Defecto reversible
14. **num**: Diagnóstico de enfermedad cardíaca (estado de enfermedad angiográfica):
    * Valor 0: $< 50\%$ de estrechamiento del diámetro
    * Valor 1: $> 50\%$ de estrechamiento del diámetro (atributo objetivo o *target*).

---

## 3. Listado Completo de Variables Originales (Base de Datos de Cleveland)

El repositorio original contiene hasta 76 atributos de los cuales se seleccionaron los 14 anteriores para la mayoría de los análisis experimentales:

1. `id`: Número de identificación del paciente.
2. `ccf`: Número de seguro social (reemplazado por un valor ficticio de 0).
3. `age`: Edad en años.
4. `sex`: Sexo ($1 = \text{masculino}; 0 = \text{femenino}$).
5. `painloc`: Ubicación del dolor torácico ($1 = \text{subesternal}; 0 = \text{otro}$).
6. `painexer`: Provocado por el esfuerzo ($1 = \text{sí}; 0 = \text{otro}$).
7. `relrest`: Aliviado después del reposo ($1 = \text{sí}; 0 = \text{otro}$).
8. `pncaden`: Suma de las variables 5, 6 y 7.
9. `cp`: Tipo de dolor torácico (1 a 4).
10. `trestbps`: Presión arterial en reposo.
11. `htn`: Hipertensión.
12. `chol`: Colesterol sérico.
13. `smoke`: Fumador ($1 = \text{sí}; 0 = \text{no}$).
14. `cigs`: Cigarrillos por día.
15. `years`: Años fumando.
16. `fbs`: Azúcar en sangre en ayunas.
17. `dm`: Antecedentes de diabetes.
18. `famhist`: Antecedentes familiares de enfermedad de las arterias coronarias.
19. `restecg`: Resultados de ECG en reposo (0 a 2).
20. `ekgmo`: Mes de la lectura del ECG de esfuerzo.
21. `ekgday`: Día de la lectura del ECG de esfuerzo.
22. `ekgyr`: Año de la lectura del ECG de esfuerzo.
23. `dig`: Digitalis usada durante el ECG de esfuerzo.
24. `prop`: Betabloqueante usado.
25. `nitr`: Nitratos usados.
26. `pro`: Bloqueador de canales de calcio usado.
27. `diuretic`: Diurético usado.
28. `proto`: Protocolo de ejercicio (1 a 12, incluyendo Bruce, Kottus, Balke, etc.).
29. `thaldur`: Duración de la prueba de esfuerzo en minutos.
30. `thaltime`: Tiempo en que se observó la depresión de la medida ST.
31. `met`: METs alcanzados.
32. `thalach`: Frecuencia cardíaca máxima.
33. `thalrest`: Frecuencia cardíaca en reposo.
34. `tpeakbps`: Presión arterial máxima de ejercicio (parte 1).
35. `tpeakbpd`: Presión arterial máxima de ejercicio (parte 2).
36. `dummy`: Variable ficticia.
37. `trestbpd`: Presión arterial en reposo secundaria.
38. `exang`: Angina inducida por ejercicio.
39. `xhypo`: Hipotensión por esfuerzo.
40. `oldpeak`: Depresión ST.
41. `slope`: Pendiente del segmento ST.
42. `rldv5`: Altura en reposo.
43. `rldv5e`: Altura en pico de ejercicio.
44. `ca`: Número de vasos principales.
45. `restckm`: Irrelevante.
46. `exerckm`: Irrelevante.
47. `restef`: Fracción de eyección por radionuclido en reposo.
48. `restwm`: Anomalía del movimiento de la pared en reposo (0 a 3).
49. `exeref`: Fracción de eyección por radionuclido en ejercicio.
50. `exerwm`: Movimiento de la pared en ejercicio.
51. `thal`: Estado de talasemia / perfusión (3, 6, 7).
52. `thalsev`: No utilizado.
53. `thalpul`: No utilizado.
54. `earlobe`: No utilizado.
55. `cmo`: Mes de cateterismo cardíaco.
56. `cday`: Día de cateterismo cardíaco.
57. `cyr`: Año de cateterismo cardíaco.
58. `num`: Diagnóstico de enfermedad cardíaca (atributo predicho).
59. `lmt`: Vascularización (atributos 59 a 68 representan vasos específicos).
60. `ladprox`: Lesión en LAD proximal.
61. `laddist`: Lesión en LAD distal.
62. `diag`: Lesión en diagonal.
63. `cxmain`: Circunfleja principal.
64. `ramus`: Rama intermedia.
65. `om1`: Obtusa marginal 1.
66. `om2`: Obtusa marginal 2.
67. `rcaprox`: Coronaria derecha proximal.
68. `rcadist`: Coronaria derecha distal.
69. `lvx1` a `lvx5`: No utilizados.
70. `cathef`: No utilizado.
71. `junk`: No utilizado.
72. `name`: Apellido del paciente (reemplazado por cadena ficticia "name").