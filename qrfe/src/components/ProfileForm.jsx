import React, { useEffect, useState } from 'react';
import api from '../api';

export default function ProfileForm() {
  const [form, setForm] = useState({
    name: '',
    student_id: '',
    class_group: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      // 🔁 SESUAIKAN endpoint backend kamu
      const { data } = await api.get('/praktikan/me');
      // normalisasi data
      setForm({
        name: data?.name ?? '',
        student_id: data?.student_id ?? '',
        class_group: data?.class_group ?? '',
        phone: data?.phone ?? ''
      });
    } catch {
      // abaikan
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      // 🔁 SESUAIKAN endpoint backend kamu
      await api.put('/praktikan/me', form);
      setNotice('Profil berhasil diperbarui.');
    } catch (err) {
      setNotice(err?.response?.data?.message || 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
      setTimeout(() => setNotice(''), 2500);
    }
  };

  const input =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  return (
    <div className="rounded-xl bg-white p-4 shadow ring-1 ring-slate-200">
      <h3 className="mb-3 text-lg font-semibold text-slate-800">Profil Praktikan</h3>
      <form onSubmit={onSubmit} className="grid gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
          <input name="name" value={form.name} onChange={onChange} className={input} required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">NPM / NIM</label>
          <input name="student_id" value={form.student_id} onChange={onChange} className={input} required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Kelas / Grup</label>
          <input name="class_group" value={form.class_group} onChange={onChange} className={input} placeholder="PSTI C 2023" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">No. WhatsApp</label>
          <input name="phone" value={form.phone} onChange={onChange} className={input} placeholder="08xxxxxxxxxx" />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-1 w-full rounded-xl bg-blue-600 py-2.5 text-white font-semibold shadow hover:bg-blue-700 active:scale-[.98] disabled:bg-slate-400 transition"
        >
          {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
        </button>

        {notice && (
          <div
            className={`text-sm mt-2 rounded-lg px-3 py-2 ${
              notice.includes('berhasil')
                ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                : 'bg-red-100 text-red-700 ring-1 ring-red-200'
            }`}
          >
            {notice}
          </div>
        )}
      </form>
    </div>
  );
}
