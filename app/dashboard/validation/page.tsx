'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface ValidationReport {
  generated_at: string;
  validation_checks: {
    no_negative_outstanding: boolean;
    disbursements_monotonic: boolean;
    formula_consistent: boolean;
    final_outstanding_reasonable: boolean;
  };
  summary_statistics: {
    total_transfers: number;
    total_operations: number;
    avg_transfer_count_per_month: number;
    avg_operation_count_per_month: number;
    avg_amount_per_operation: number;
    avg_amount_per_transfer: number;
    total_disbursements: number;
    total_principal_paid: number;
    total_writeoffs: number;
    final_outstanding_balance: number;
  };
  status: string;
}

interface MonthlyData {
  month: string;
  transfers?: string;
  operations?: string;
  total_disbursements?: string;
  avg_ops_per_transfer?: string;
  avg_amount_per_operation?: string;
  avg_amount_per_transfer?: string;
  month_end?: string;
  disbursement_monthly?: string;
  principal_paid_monthly?: string;
  interest_paid_monthly?: string;
  writeoffs_monthly?: string;
  cum_disbursements?: string;
  cum_principal_paid?: string;
  cum_writeoffs?: string;
  outstanding_eom?: string;
}

interface ValidationData {
  validation_report: ValidationReport;
  monthly_transfers_operations: MonthlyData[];
  monthly_averages: MonthlyData[];
  outstanding_balance: MonthlyData[];
}

export default function ValidationPage() {
  const [data, setData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/validation-results')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center text-2xl">Cargando resultados de validación...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-400 text-center text-2xl">Error: {error || 'No se pudieron cargar los datos'}</div>
        </div>
      </div>
    );
  }

  const { validation_report, monthly_transfers_operations, monthly_averages, outstanding_balance } = data;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-['Lato']">
            Resultados de Validación - Análisis de Préstamos
          </h1>
          <p className="text-purple-300 font-['Poppins']">
            Validación de cálculos mensuales de transferencias y operaciones
          </p>
        </div>

        {/* Validation Status */}
        <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Estado de Validación</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Estado</div>
              <div className={`text-2xl font-bold ${validation_report.status === 'PASSED' ? 'text-green-400' : 'text-red-400'}`}>
                {validation_report.status === 'PASSED' ? '✅ APROBADO' : '❌ FALLADO'}
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Fecha de Generación</div>
              <div className="text-white text-lg">
                {new Date(validation_report.generated_at).toLocaleString('es-CR')}
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-3">Verificaciones de Validación</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(validation_report.validation_checks).map(([key, value]) => (
              <div key={key} className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                <span className="text-white">{key.replace(/_/g, ' ')}</span>
                <span className={`text-xl ${value ? 'text-green-400' : 'text-red-400'}`}>
                  {value ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Summary Statistics */}
        <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Estadísticas Resumidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Total Transferencias</div>
              <div className="text-white text-2xl font-bold">
                {validation_report.summary_statistics.total_transfers.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Total Operaciones</div>
              <div className="text-white text-2xl font-bold">
                {validation_report.summary_statistics.total_operations.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Promedio Operaciones/Mes</div>
              <div className="text-white text-2xl font-bold">
                {formatNumber(validation_report.summary_statistics.avg_operation_count_per_month)}
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Monto Promedio por Operación</div>
              <div className="text-white text-xl font-bold">
                {formatCurrency(validation_report.summary_statistics.avg_amount_per_operation)}
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Monto Promedio por Transferencia</div>
              <div className="text-white text-xl font-bold">
                {formatCurrency(validation_report.summary_statistics.avg_amount_per_transfer)}
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Desembolsos Totales</div>
              <div className="text-white text-xl font-bold">
                {formatCurrency(validation_report.summary_statistics.total_disbursements)}
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Principal Pagado Total</div>
              <div className="text-white text-xl font-bold">
                {formatCurrency(validation_report.summary_statistics.total_principal_paid)}
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Castigos Totales</div>
              <div className="text-white text-xl font-bold">
                {formatCurrency(validation_report.summary_statistics.total_writeoffs)}
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-purple-300 text-sm">Saldo Pendiente Final</div>
              <div className="text-white text-xl font-bold">
                {formatCurrency(validation_report.summary_statistics.final_outstanding_balance)}
              </div>
            </div>
          </div>
        </Card>

        {/* Monthly Transfers and Operations */}
        <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Transferencias y Operaciones Mensuales</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="p-3 text-left">Mes</th>
                  <th className="p-3 text-right">Transferencias</th>
                  <th className="p-3 text-right">Operaciones</th>
                  <th className="p-3 text-right">Total Desembolsos</th>
                  <th className="p-3 text-right">Promedio Ops/Transfer</th>
                </tr>
              </thead>
              <tbody>
                {monthly_transfers_operations.slice(-12).map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3">{row.month}</td>
                    <td className="p-3 text-right">{row.transfers}</td>
                    <td className="p-3 text-right">{row.operations}</td>
                    <td className="p-3 text-right">{row.total_disbursements}</td>
                    <td className="p-3 text-right">{row.avg_ops_per_transfer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Monthly Averages */}
        <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Montos Promedio Mensuales</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="p-3 text-left">Mes</th>
                  <th className="p-3 text-right">Promedio por Operación</th>
                  <th className="p-3 text-right">Promedio por Transferencia</th>
                </tr>
              </thead>
              <tbody>
                {monthly_averages.slice(-12).map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3">{row.month}</td>
                    <td className="p-3 text-right">{formatCurrency(parseFloat(row.avg_amount_per_operation || '0'))}</td>
                    <td className="p-3 text-right">{formatCurrency(parseFloat(row.avg_amount_per_transfer || '0'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Outstanding Balance */}
        <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Saldo Pendiente Mensual</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white text-sm">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="p-2 text-left">Mes</th>
                  <th className="p-2 text-right">Desembolso Mensual</th>
                  <th className="p-2 text-right">Principal Pagado</th>
                  <th className="p-2 text-right">Interés Pagado</th>
                  <th className="p-2 text-right">Castigos</th>
                  <th className="p-2 text-right">Saldo Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {outstanding_balance.slice(-12).map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-2">{row.month_end}</td>
                    <td className="p-2 text-right">{formatCurrency(parseFloat(row.disbursement_monthly || '0'))}</td>
                    <td className="p-2 text-right">{formatCurrency(parseFloat(row.principal_paid_monthly || '0'))}</td>
                    <td className="p-2 text-right">{formatCurrency(parseFloat(row.interest_paid_monthly || '0'))}</td>
                    <td className="p-2 text-right">{formatCurrency(parseFloat(row.writeoffs_monthly || '0'))}</td>
                    <td className="p-2 text-right font-bold text-green-400">
                      {formatCurrency(parseFloat(row.outstanding_eom || '0'))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
