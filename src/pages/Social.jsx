import { useState } from 'react';
import { Users, Share2, Copy, Download, Upload } from 'lucide-react';
import { useHabits } from '../contexts/HabitContext';
import { useToast } from '../components/ui/Toast';

export default function Social() {
  const { habits, exportHabit, importHabit } = useHabits();
  const { addToast } = useToast();
  const [importCode, setImportCode] = useState('');
  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'
  const [selectedHabitId, setSelectedHabitId] = useState(habits[0]?.id || '');

  const handleCopyCode = () => {
    if (!selectedHabitId) return;
    const code = exportHabit(selectedHabitId);
    navigator.clipboard.writeText(code);
    addToast('Código copiado al portapapeles', 'success');
  };

  const handleImport = () => {
    if (!importCode.trim()) return;
    const newHabit = importHabit(importCode);
    if (newHabit) {
      addToast('Hábito importado correctamente', 'success');
      setImportCode('');
    } else {
      addToast('Código inválido', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Social</h1>
          <p className="page-subtitle">Compartí hábitos con amigos</p>
        </div>
      </div>

      <div className="tabs mb-6" style={{ maxWidth: '400px' }}>
        <button 
          className={`tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <Share2 size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Compartir Hábito
        </button>
        <button 
          className={`tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          <Download size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Importar
        </button>
      </div>

      <div className="grid-2">
        {activeTab === 'export' ? (
          <div className="card">
            <h3 className="card-title mb-4">Exportar Hábito</h3>
            <p className="card-subtitle mb-4">
              Seleccioná un hábito para generar un código que podés enviarle a tus amigos.
            </p>
            
            {habits.length === 0 ? (
              <p className="text-muted">No tenés hábitos para compartir.</p>
            ) : (
              <>
                <div className="form-group">
                  <select 
                    className="form-select"
                    value={selectedHabitId}
                    onChange={e => setSelectedHabitId(e.target.value)}
                  >
                    {habits.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="share-code mb-4">
                  {selectedHabitId ? exportHabit(selectedHabitId) : 'Selecciona un hábito'}
                </div>
                
                <button className="btn btn-primary w-100" onClick={handleCopyCode}>
                  <Copy size={18} /> Copiar Código
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="card">
            <h3 className="card-title mb-4">Importar Hábito</h3>
            <p className="card-subtitle mb-4">
              Pegá acá el código que te compartieron para agregar el hábito a tu lista.
            </p>
            
            <div className="form-group">
              <textarea
                className="form-input"
                rows="4"
                placeholder="Pegá el código acá..."
                value={importCode}
                onChange={e => setImportCode(e.target.value)}
              />
            </div>
            
            <button className="btn btn-primary" onClick={handleImport}>
              <Upload size={18} /> Importar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
