import { useState } from 'react';
import { submitReport } from '../api';
import ResultCard from '../components/ResultCard';

function ReportPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [note, setNote] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [locStatus, setLocStatus] = useState('');

  function fetchLocation() {
    if (!navigator.geolocation) {
      setLocStatus('Geolocation not supported');
      return;
    }
    setLocStatus('Fetching location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocStatus('Location acquired');
      },
      () => setLocStatus('Location denied — enter manually')
    );
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    if (!lat) fetchLocation();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!image) { setError('Please select a photo'); return; }
    if (!lat || !lng) { setError('Location is required'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', image);
      fd.append('lat', lat);
      fd.append('lng', lng);
      if (note.trim()) fd.append('note', note.trim());
      const data = await submitReport(fd);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="section-title mb-5">Report an Issue</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo upload */}
        <div>
          <label className="block cursor-pointer">
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-5 transition-colors ${
                preview ? 'border-gray-300' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-44 rounded object-cover" />
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-gray-500">Take / Upload Photo</span>
                  <span className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 10 MB</span>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Location */}
        <fieldset>
          <div className="flex items-center justify-between mb-1.5">
            <legend className="text-sm font-medium text-gray-700">Location</legend>
            <button
              type="button"
              onClick={fetchLocation}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Auto-detect
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="22.7196"
              className="input-field"
              aria-label="Latitude"
            />
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="75.8577"
              className="input-field"
              aria-label="Longitude"
            />
          </div>
          {locStatus && <p className="text-xs text-gray-500 mt-1">{locStatus}</p>}
        </fieldset>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Note <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Near main gate"
            className="input-field"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? 'Analyzing…' : 'Submit Report'}
        </button>
      </form>

      {result && (
        <div className="mt-5">
          {result.type === 'no_issue' ? (
            <div className="card px-4 py-6 text-center">
              <p className="text-sm text-gray-500">No infrastructure issue detected in this image.</p>
            </div>
          ) : (
            <ResultCard issue={result} />
          )}
        </div>
      )}
    </div>
  );
}

export default ReportPage;
