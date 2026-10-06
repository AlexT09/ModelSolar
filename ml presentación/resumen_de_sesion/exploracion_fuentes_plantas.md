# Exploración de fuentes abiertas de datos de plantas solares FV

> **Estado de verificación.** Solo se hicieron 2 búsquedas web. (V) = confirmado en la sesión; (NV) = no verificado, de conocimiento previo. Hay que revisar URL, licencia y cobertura de cada fuente antes de citarla.
> Confirmado: API del CEN de Chile, DKASC, PVDAQ en OEDI (CC-BY 4.0) y la licencia por registro de Zenodo.

## Fuentes con generación por planta (las más útiles)

| # | Fuente | País | URL | Resolución | Plantas y periodo | Coordenadas y capacidad | Módulo o tecnología | Licencia | Clave |
|---|---|---|---|---|---|---|---|---|---|
| 1 | CEN, API Operación | Chile | operacion.api.coordinador.cl (V) | Horaria | ~300 a 400 plantas FV/PMGD (NV), desde ~2010s | Sí, por topología (V) | Parcial (NV) | Pública, condiciones del portal (NV) | Sí, registro (V) |
| 2 | NREL PVDAQ (OEDI) | EE. UU. y otros | data.openei.org/submissions/4568 | 1 a 15 min | ~100 o más sistemas, 2010 a 2023 | Sí, kW | Sí, módulo e inversor, fija o seguidor | CC-BY 4.0 (V) | No |
| 3 | DKASC Alice Springs | Australia | dkasolarcentre.com.au (V) | 5 min | Más de 30 arreglos, 2008 a hoy | Sí (un solo sitio) | Sí, fabricante y tecnología | T&C del sitio (V) | No |
| 4 | EIA-860 y EIA-923 | EE. UU. | eia.gov/electricity/data | Mensual (923) | ~4 a 5 mil plantas FV, 2001 a hoy | Sí, MW AC y DC, seguidor o fija | Tecnología de celda, sin fabricante | Dominio público | Solo API v2 |
| 5 | ONS Dados Abertos | Brasil | dados.ons.org.br (NV) | Horaria o diaria | Decenas de complejos, pocos años | Capacidad sí; coordenadas parcial | No | CC-BY (NV) | No |
| 6 | CENACE | México | cenace.gob.mx (NV) | Horaria | ~100 centrales FV (NV) | Capacidad sí | No | Pública (NV) | No, difícil de automatizar |
| 7 | OpenNEM / Open Electricity | Australia | api.openelectricity.org.au (NV) | 5 a 30 min | ~200 plantas FV | Sí | No | MIT o CC-BY (NV) | Sí, gratis |
| 8 | AEMO NEMWeb | Australia | nemweb.com.au (NV) | 5 min | Por DUID | Capacidad sí; coordenadas no | No | Pública | No |
| 9 | COES | Perú | coes.org.pe | 30 min | ~7 a 10 centrales FV | Parcial | No | Pública | No |
| 10 | CAMMESA | Argentina | cammesaweb.cammesa.com | Horaria o diaria | ~40 o más FV | Capacidad sí | No | Pública | No |
| 11 | ERCOT | Texas | ercot.com/gridinfo/generation | 15 min | Por recurso, desde ~2018 | Con EIA-860 | No | Pública (NV) | Suscripción (NV) |
| 12 | PVOutput | Global | pvoutput.org | 5 a 15 min | Cientos de miles de sistemas | Aproximada, kW | Sí, autodeclarado | No abierta, uso no comercial | Sí, con límite |
| 13 | XM | Colombia | servapibi.xm.com.co | Horaria | 16 plantas (ya usada) | Verificadas | Pendiente | Pública | No |

## Fuentes agregadas o sin generación por planta

| Fuente | País | Qué ofrece | Uso posible |
|---|---|---|---|
| CAISO OASIS | California | Producción FV agregada, 5 min | Poco útil por planta |
| Elexon BMRS, Sheffield PV_Live | Reino Unido | Agregado nacional o regional | Solo contexto |
| ENTSO-E Transparency | Europa | Agregado por tipo; por unidad solo ≥100 MW | Limitado para FV |
| SMARD, Energy-Charts | Alemania | Agregado por zona | Solo contexto |
| Marktstammdatenregister | Alemania | ~4 millones de instalaciones: capacidad, ubicación, módulos | Especificaciones, sin generación |
| Open Power System Data | Europa | Series nacionales y registro de plantas | Metadatos |
| REE ESIOS | España | Agregado por tecnología | Solo contexto |
| Terna, GSE Atlaimpianti | Italia | Agregado y registro | Metadatos |
| Grid-India, CEA | India | Reportes por estado, PDFs | Poco útil |
| Kaggle "Solar Power Generation Data" | India | 2 plantas, 34 días, por inversor | Solo prototipado |
| OCCTO, TEPCO | Japón | Agregado por área | Solo contexto |
| NEA, CEC | China | Estadística agregada | Sin datos por planta |
| Eskom, REIPPPP | Sudáfrica | Agregado | Solo contexto |
| ONEE, MASEN | Marruecos | Reportes anuales | Poco útil |
| DEWA, EWEC | Emiratos | Sin datos abiertos | No sirve |

## Metadatos globales de plantas (sin generación real)

| Fuente | URL | Contenido | Licencia |
|---|---|---|---|
| Global Energy Monitor, Global Solar Power Tracker | globalenergymonitor.org | Miles de plantas ≥1 MW con coordenadas, MW, año y tecnología parcial | CC BY 4.0 |
| WRI Global Power Plant Database | datasets.wri.org | ~10 mil plantas solares, generación estimada | CC BY 4.0 |
| OpenStreetMap vía Overpass | overpass-turbo.eu | Más de 100 mil polígonos | ODbL |
| PVGIS, NASA POWER, Global Solar Atlas | re.jrc.ec.europa.eu/pvg_tools | Irradiancia y clima por punto | CC-BY |

## Especificaciones de módulos

| Fuente | Contenido | Licencia |
|---|---|---|
| CEC Module Database | Pmax, Voc, Isc, coeficiente de temperatura, NOCT, tecnología, bifacial | Pública |
| pvlib `retrieve_sam` | Acceso a CECMod, SandiaMod y CECInverter | BSD-3 |
| NREL SAM libraries | CSV de módulos e inversores | Abierta |
| Sandia Module Database | Coeficientes del modelo Sandia | Pública |
| PVsyst `.PAN` | Muy completa | Propietaria |

## Conclusiones

- Casi ningún portal abierto da el **fabricante del panel por planta**. Solo DKASC, PVDAQ, MaStR (parcial) y PVOutput (autodeclarado). El plan de "sacar las especificaciones del modelo de panel" se limita a pocas fuentes. Para el resto toca estimar con la tecnología, la fecha de instalación y las tablas CEC.
- Para generación por planta a nivel horaria o diaria, lo más útil es Chile (CEN), Australia (OpenNEM y AEMO), Argentina, Perú, México y Brasil, más EIA-923 mensual con EIA-860 como metadatos.
- Para validación fina con módulo y clima: DKASC y PVDAQ.
- Para ubicación y capacidad global: GEM y WRI. Para clima: PVGIS o NASA POWER.

## Recomendación

1. Piloto con Chile (clave gratis) y Australia (OpenNEM), que dan el volumen más alto de plantas por país.
2. Complementar con EE. UU. (EIA-860 y 923, mensual) y LATAM (CAMMESA, COES, ONS, CENACE).
3. Usar DKASC y PVDAQ para validar el efecto de la tecnología del módulo.
4. Unir todo con el mismo clima (PVGIS o Open-Meteo) para que no cambie la fuente entre países.
