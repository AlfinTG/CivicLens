import { useState } from 'react';
import { Link } from 'react-router-dom';
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
      setLocStatus('Location unavailable — enter coordinates manually.');
      return;
    }
    setLocStatus('Detecting location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocStatus('Location detected');
      },
      () => setLocStatus('Location unavailable — enter coordinates manually.')
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

  function resetForm() {
    setImage(null);
    setPreview(null);
    setNote('');
    setResult(null);
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
      setError(err?.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <header className="mb-10 flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">CivicLens</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-gray-900">Report Issue</span>
          <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Admin Login</Link>
        </div>
      </header>

      {!result ? (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Report a problem in your neighborhood.</h2>
            <p className="text-sm text-gray-600">Upload a photo and location. CivicLens identifies the issue and routes it to the right department.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 01 Photo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">01</span>
                <label className="text-sm font-medium text-gray-900">Photo</label>
              </div>
              <label className="block cursor-pointer">
                <div
                  className={`relative flex flex-col items-center justify-center border border-gray-300 rounded-lg p-6 bg-white overflow-hidden transition-colors ${
                    preview ? '' : 'border-dashed hover:border-blue-400 hover:bg-gray-50'
                  }`}
                  style={{ minHeight: '200px' }}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium bg-black/60 px-3 py-1.5 rounded-md">Replace photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <svg className="w-8 h-8 text-blue-600 mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="block text-sm font-medium text-gray-900 mb-1">Take or upload a photo</span>
                      <span className="block text-xs text-gray-500">JPG or PNG up to 10 MB</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* 02 Location */}
            <fieldset className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">02</span>
                  <legend className="text-sm font-medium text-gray-900">Location</legend>
                </div>
                <button
                  type="button"
                  onClick={fetchLocation}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Auto-detect
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="sr-only">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Latitude"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="sr-only">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Longitude"
                    className="input-field"
                  />
                </div>
              </div>
              {locStatus && (
                <p className={`text-xs ${locStatus.includes('detected') ? 'text-green-700' : 'text-gray-500'}`}>
                  {locStatus}
                </p>
              )}
            </fieldset>

            {/* 03 Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">03</span>
                <label className="text-sm font-medium text-gray-900">Details <span className="font-normal text-gray-500">(optional)</span></label>
              </div>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Near main gate, beside the parking area"
                className="input-field"
              />
            </div>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                {error}
              </p>
            )}

            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base shadow-sm">
                {loading ? 'Analyzing report...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="space-y-6">
          <ResultCard issue={result} />
          <button onClick={resetForm} className="btn-secondary w-full py-2.5">
            Submit another report
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportPage;
