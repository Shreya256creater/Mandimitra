import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '../context/I18nContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function PriceTrendChart({ data = [] }) {
  const { t } = useI18n();
  const { isDark } = useTheme();

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-dashed border-crop-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        {t('chart.empty')}
      </div>
    );
  }

  const axis = isDark ? '#94a3b8' : '#64748b';
  const grid = isDark ? '#334155' : '#dceee0';

  return (
    <div className="mm-card p-4">
      <h3 className="mb-2 px-1 text-sm font-semibold text-crop-900 dark:text-crop-100">{t('chart.title')}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: axis }} stroke={axis} />
            <YAxis tick={{ fontSize: 11, fill: axis }} stroke={axis} />
            <Tooltip formatter={(v) => [`₹${v}`, t('chart.modal')]} />
            <Line type="monotone" dataKey="modalPrice" stroke={isDark ? '#4ade80' : '#2f6f3d'} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
