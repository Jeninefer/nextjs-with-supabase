# Resultados de Validación - Instrucciones de Acceso

## 🎯 Resumen

Se ha implementado un sistema completo de validación para el análisis de datos de préstamos. Los resultados están disponibles a través de una interfaz web profesional.

## 📊 Cómo Ver los Resultados

### Opción 1: Interfaz Web (Recomendado)

1. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Abrir el navegador y visitar:**
   ```
   http://localhost:3000/dashboard/validation
   ```

3. **Verás:**
   - ✅ Estado de validación (APROBADO)
   - 📈 Estadísticas resumidas
   - 📋 Transferencias y operaciones mensuales
   - 💰 Montos promedio mensuales
   - 💵 Saldo pendiente mensual

### Opción 2: API JSON

Para integración con otros sistemas:
```bash
curl http://localhost:3000/api/validation-results
```

**Ejemplo de respuesta JSON:**

```json
{
  "validation_status": "APROBADO",
  "summary_statistics": {
    "total_loans": 120,
    "total_amount": 350000,
    "average_amount": 2916.67
  },
  "monthly_transfers_operations": [
    { "month": "2024-01", "transfers": 15, "operations": 20 },
    { "month": "2024-02", "transfers": 12, "operations": 18 }
  ],
  "monthly_averages": [
    { "month": "2024-01", "average_amount": 3000 },
    { "month": "2024-02", "average_amount": 2850 }
  ],
  "outstanding_balance": [
    { "month": "2024-01", "balance": 50000 },
    { "month": "2024-02", "balance": 48000 }
  ]
}
### Opción 3: Archivos CSV

Los resultados también están disponibles en formato CSV:
```
notebooks/validation_results/
├── monthly_transfers_operations.csv
├── monthly_averages.csv
├── outstanding_balance.csv
└── validation_report.json
```

## 🔄 Regenerar Resultados

Para generar nuevos resultados de validación:

```bash
./scripts/generate_validation.sh
```

O manualmente:
```bash
cd notebooks
python3 generate_validation_results.py
```

## 📈 Datos Mostrados

### Estado de Validación
- **Estado**: APROBADO/FALLADO
- **Fecha de generación**: Timestamp actual
- **Verificaciones**: 4 pruebas automáticas

### Estadísticas Resumidas
- Total Transferencias: 281
- Total Operaciones: 751
- Promedio Operaciones/Mes: 31.29
- Monto Promedio por Operación: USD 9,283.01
- Monto Promedio por Transferencia: USD 30,165.43
- Desembolsos Totales: USD 3,307,536.81
- Principal Pagado Total: USD 1,528,536.84
- Castigos Totales: USD 21,851.76
- Saldo Pendiente Final: USD 1,757,148.21

### Tablas Mensuales

1. **Transferencias y Operaciones**: Conteo de transferencias únicas y operaciones por mes
2. **Montos Promedio**: Promedio por operación y por transferencia
3. **Saldo Pendiente**: Desembolsos, pagos, intereses y saldo final por mes

## 🔍 Verificaciones de Validación

El sistema valida automáticamente:
1. ✅ **No hay saldos negativos**: El saldo pendiente nunca es negativo
2. ✅ **Desembolsos monotónicos**: Los desembolsos acumulados siempre aumentan
3. ✅ **Fórmula consistente**: Saldo = Desembolsos - Principal - Castigos
4. ✅ **Saldo final razonable**: El saldo final está entre 0 y el total desembolsado

## 📚 Documentación Adicional

Para más detalles técnicos, consulta:
- `docs/VALIDATION_RESULTS.md` - Documentación completa en inglés
- `notebooks/loan_analysis_corrected.py` - Lógica de cálculo

## 🎨 Características de la Interfaz

- **Diseño responsivo**: Funciona en computadora, tablet y móvil
- **Tema oscuro**: Estilo profesional con gradiente púrpura
- **Formato de moneda**: Muestra USD con formato local (es-CR)
- **Tablas interactivas**: Hover effects y fácil lectura
- **Últimos 12 meses**: Muestra los datos más recientes por defecto

## ⚙️ Configuración

No se requiere autenticación para acceder a la página de validación. Los datos son de solo lectura y están disponibles públicamente en el servidor de desarrollo.

## 🚀 Próximos Pasos

Para usar con datos reales de préstamos:

1. Actualiza las rutas de datos en `loan_analysis_corrected.py`:
   ```python
   loan_path = "ruta/a/tus/datos/Loan_Data.csv"
   payment_path = "ruta/a/tus/datos/Historic_Payment.csv"
   ```

2. Ajusta los nombres de columnas según tu formato:
   ```python
   loan_id_col='Loan ID',
   date_col='Disbursement Date',
   amount_col='Disbursement Amount'
   ```

3. Ejecuta el análisis:
   ```bash
   python3 notebooks/loan_analysis_corrected.py
   ```

4. Los resultados se actualizarán automáticamente en la página web.

## 💡 Soporte

Para preguntas o problemas:
- Revisa la documentación en `docs/VALIDATION_RESULTS.md`
- Verifica que el servidor esté ejecutándose con `npm run dev`
- Asegúrate de que los archivos CSV existan en `notebooks/validation_results/`

---

**ABACO Financial Intelligence Platform** - Análisis de préstamos con validación profesional
