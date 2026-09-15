import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../context/I18nContext.jsx';

export function matchCrop(crops, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return null;
  return (
    crops.find(
      (c) =>
        c.name.toLowerCase() === q || (c.localName && c.localName.toLowerCase() === q),
    ) || null
  );
}

function cropLabel(crop) {
  return crop.localName ? `${crop.name} (${crop.localName})` : crop.name;
}

export default function CropPicker({ crops = [], value, onChange, loading = false }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = String(value || '').trim().toLowerCase();
    if (!q) return crops;
    return crops.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.localName && c.localName.toLowerCase().includes(q)),
    );
  }, [crops, value]);

  useEffect(() => {
    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  function chooseCrop(crop) {
    onChange(crop.name);
    setOpen(false);
    inputRef.current?.focus();
  }

  const typedIsNew = String(value || '').trim().length >= 2 && !matchCrop(crops, value);

  return (
    <div className="block text-sm" ref={rootRef}>
      <span className="font-medium text-slate-800 dark:text-slate-100">{t('common.crop')}</span>
      <div className="relative mt-1">
        <input
          ref={inputRef}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          placeholder={loading ? t('cropPicker.loading') : t('cropPicker.placeholder')}
          autoComplete="off"
          required
          minLength={2}
          disabled={loading}
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-crop-800 dark:text-slate-300"
          aria-label={open ? t('cropPicker.closeList') : t('cropPicker.openList')}
          disabled={loading}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}>
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && !loading && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-900"
          >
            {suggestions.map((crop) => (
              <li key={crop.id}>
                <button
                  type="button"
                  role="option"
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-crop-50 dark:hover:bg-slate-800 ${
                    matchCrop([crop], value)
                      ? 'bg-crop-50 font-medium text-crop-900 dark:bg-slate-800 dark:text-crop-100'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => chooseCrop(crop)}
                >
                  {cropLabel(crop)}
                </button>
              </li>
            ))}
            {typedIsNew && (
              <li>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-crop-800 hover:bg-crop-50 dark:text-crop-200 dark:hover:bg-slate-800"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setOpen(false)}
                >
                  {t('cropPicker.useTyped', { name: value.trim() })}
                </button>
              </li>
            )}
            {!suggestions.length && !typedIsNew && (
              <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">{t('cropPicker.empty')}</li>
            )}
          </ul>
        )}
      </div>
      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{t('cropPicker.hint')}</span>
    </div>
  );
}
