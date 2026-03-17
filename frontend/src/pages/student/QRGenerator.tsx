import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../lib/api';
import { RefreshCw, ShieldCheck } from 'lucide-react';

const QRGenerator = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const fetchToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/attendance/generate-qr');
      setToken(res.data.qrToken);
      setTimeLeft(30);
    } catch (err: any) {
      setError('Failed to generate secure QR token. Make sure you are assigned to a class.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
    const intervalId = setInterval(fetchToken, 25000); // refresh every 25s

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', animation: 'slideUp 0.3s ease' }}>
      
      <div className="glass-panel" style={{ textAlign: 'center', maxWidth: '450px', width: '100%', padding: '3rem 2rem' }}>
        <div style={{
          display: 'inline-flex',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '1rem',
          borderRadius: '50%',
          marginBottom: '1.5rem',
          color: 'var(--accent-secondary)'
        }}>
          <ShieldCheck size={48} />
        </div>
        
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your Attendance QR</h1>
        <p style={{ marginBottom: '2rem' }}>Show this to your teacher to get marked.</p>

        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
            {error}
          </div>
        )}

        <div className="qr-container" style={{ padding: '2rem', display: 'flex', justifyContent: 'center', backgroundColor: '#fff', marginBottom: '1.5rem' }}>
          {loading && !token ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <RefreshCw className="spinner" size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : token ? (
            <QRCodeSVG value={token} size={250} level="H" includeMargin={true} />
          ) : (
             <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               No QR generated
             </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <RefreshCw size={16} className={loading ? "spinner" : ""} />
          <span>Refreshing in <strong>{timeLeft}s</strong></span>
        </div>

        <p style={{ fontSize: '0.85rem', marginTop: '1.5rem', opacity: 0.7 }}>
          This is a short-lived token generated automatically to prevent fraud.
        </p>

        <button 
          onClick={fetchToken} 
          className="btn btn-secondary" 
          style={{ width: '100%', marginTop: '1.5rem' }}
          disabled={loading}
        >
          Force Refresh Now
        </button>
      </div>

    </div>
  );
};

export default QRGenerator;
