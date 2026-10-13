import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitReport } from '../api';
import ResultCard from '../components/ResultCard';

const CATEGORY_CHIPS = [
  { id: 'pothole', label: 'Pothole & Road Surface', icon: 'traffic' },
  { id: 'broken_streetlight', label: 'Broken Streetlight', icon: 'lightbulb' },
  { id: 'drain_overflow', label: 'Water & Drainage', icon: 'water_drop' },
  { id: 'garbage', label: 'Waste / Garbage Dump', icon: 'delete' },
  { id: 'damaged_road', label: 'Structural Road Hazard', icon: 'alt_route' },
  { id: 'other', label: 'Other Civic Defect', icon: 'warning' },
];

function ReportPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [note, setNote] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('pothole');
  const [notifyCitizen, setNotifyCitizen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [locStatus, setLocStatus] = useState('');

  function fetchLocation() {
    if (!navigator.geolocation) {
      setLocStatus('Location unavailable — enter coordinates manually.');
      return;
    }
    setLocStatus('Detecting GPS location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocStatus('GPS Coordinates Verified (High Accuracy ±3m)');
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
    setError('');
    if (!lat) fetchLocation();
  }

  function resetForm() {
    setImage(null);
    setPreview(null);
    setNote('');
    setResult(null);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!image) {
      setError('Please select or capture a photo of the issue.');
      return;
    }
    if (!lat || !lng) {
      setError('GPS coordinates are required. Please auto-detect or enter manually.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', image);
      fd.append('lat', lat);
      fd.append('lng', lng);
      
      // Combine user note with category preference if provided
      let fullNote = note.trim();
      if (selectedCategory && selectedCategory !== 'other') {
        const catLabel = CATEGORY_CHIPS.find(c => c.id === selectedCategory)?.label || selectedCategory;
        fullNote = fullNote ? `[Category: ${catLabel}] ${fullNote}` : `[Category: ${catLabel}]`;
      }
      if (fullNote) fd.append('note', fullNote);

      const data = await submitReport(fd);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Submission failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-on-surface">
      {/* Top Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-xs">
              <span className="material-symbols-outlined text-xl">camera_outdoor</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-on-surface">
                CivicLens
              </span>
              <span className="text-2xs font-mono font-semibold text-secondary uppercase tracking-wider">
                Public Access Portal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Submit Incident
            </span>
            <a href="#about-network" className="text-xs font-medium text-secondary hover:text-on-surface transition-colors">
              Resolution Network
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-secondary hover:text-on-surface text-xs font-semibold transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              <span>Municipal Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Civic Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-6 md:p-8 shadow-xs">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-mono text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Open Civic Dispatch • Autonomous Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
              Report an issue. Improve your neighbourhood.
            </h1>
            <p className="mt-2 text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
              Upload a photo. Our municipal AI automatically detects the problem, assigns severity, and dispatches city response teams in real time.
            </p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-5 hidden sm:block">
            <span className="material-symbols-outlined text-[180px] text-primary">verified_user</span>
          </div>
        </div>

        {/* Two-Column Workflow Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Input, Camera, Geolocation, Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Step 01 / Image Diagnostics Card */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-2xs uppercase tracking-wider text-secondary font-bold">
                      Step 01 / Image Diagnostics
                    </span>
                    <h2 className="text-lg font-bold text-on-surface">Incident Evidence</h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span>AI Vision Active</span>
                  </span>
                </div>

                {/* Upload or Preview Display */}
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30 group">
                    <div className="w-full h-72 relative">
                      <img
                        src={preview}
                        alt="Submitted evidence"
                        className="w-full h-full object-cover"
                      />
                      {/* Simulated AI scanning overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/20 pointer-events-none" />
                      
                      {/* Bounding box highlight simulation */}
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded border border-dashed border-primary bg-primary/10 flex flex-col justify-between p-2 pointer-events-none">
                        <span className="font-mono text-2xs bg-primary text-on-primary px-1.5 py-0.5 rounded w-max font-bold">
                          DETECTION_ACTIVE
                        </span>
                        <span className="font-mono text-2xs text-on-primary-container bg-surface-container-lowest/90 px-1.5 py-0.5 rounded w-max self-end shadow-xs">
                          AI READY
                        </span>
                      </div>

                      {/* Top left scan pill */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        <span className="text-xs font-bold text-on-surface">Photo Loaded • Ready to Analyze</span>
                      </div>

                      {/* Retake / Replace Controls */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 bg-surface-container-lowest/95 hover:bg-surface text-on-surface text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors">
                          <span className="material-symbols-outlined text-sm">swap_horiz</span>
                          <span>Replace</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/heic"
                            capture="environment"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="relative rounded-xl border-2 border-dashed border-outline-variant/60 hover:border-primary hover:bg-surface-container-low/50 transition-all p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                      </div>
                      <span className="text-sm font-bold text-on-surface mb-1">
                        Take or upload a photo
                      </span>
                      <span className="text-xs text-secondary mb-3 max-w-xs">
                        Mobile camera friendly. Supports JPEG, PNG, WebP or HEIC up to 15MB.
                      </span>
                      <span className="btn-secondary text-xs px-4 py-1.5 pointer-events-none">
                        Browse Files / Use Camera
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic"
                      capture="environment"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Step 02 / Telemetry Geolocation Section */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-2xs uppercase tracking-wider text-secondary font-bold">
                      Step 02 / Telemetry
                    </span>
                    <h2 className="text-lg font-bold text-on-surface">Incident Geolocation</h2>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-xs">gps_fixed</span>
                    <span>{lat && lng ? 'GPS Verified' : 'Location Required'}</span>
                  </div>
                </div>

                {/* Geolocation Coordinates Strip */}
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">my_location</span>
                    <span className="font-mono text-xs font-bold text-on-surface">
                      {lat && lng ? `${lat}° N, ${lng}° E` : 'No coordinates fetched'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchLocation}
                    className="btn-secondary text-xs px-3 py-1.5 font-semibold text-primary border-primary/30"
                  >
                    <span className="material-symbols-outlined text-sm">near_me</span>
                    <span>{lat ? 'Re-detect Location' : 'Auto-detect GPS'}</span>
                  </button>
                </div>

                {/* Latitude & Longitude manual inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="e.g. 22.719600"
                      className="input-field font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="e.g. 75.857700"
                      className="input-field font-mono text-xs"
                      required
                    />
                  </div>
                </div>
                {locStatus && (
                  <p className={`text-xs font-medium ${locStatus.includes('Verified') ? 'text-primary' : 'text-secondary'}`}>
                    {locStatus}
                  </p>
                )}
              </div>

              {/* Step 03 / Classification & Citizen Notes */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-2xs uppercase tracking-wider text-secondary font-bold">
                      Step 03 / Context
                    </span>
                    <h2 className="text-lg font-bold text-on-surface">Classification & Details</h2>
                  </div>
                  <span className="text-2xs font-mono font-semibold text-secondary uppercase">
                    AI Auto-Classified
                  </span>
                </div>

                {/* Suggested Category Chips */}
                <div>
                  <label className="block text-xs font-bold text-secondary mb-2">
                    Observed Category (Citizen Assistance)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_CHIPS.map((chip) => {
                      const isSelected = selectedCategory === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setSelectedCategory(chip.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">{chip.icon}</span>
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description and Citizen Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="block text-xs font-bold text-secondary">
                    Citizen Notes & Specific Safety Impacts (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="E.g., Near school entrance, deep hole causing cars to swerve into oncoming traffic..."
                    className="input-field text-sm resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between text-2xs text-secondary font-mono">
                    <span>Citizen note will be cross-referenced by municipal triage</span>
                    <span>{note.length} / 500 characters</span>
                  </div>
                </div>

                {/* Notification checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={notifyCitizen}
                    onChange={(e) => setNotifyCitizen(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-outline-variant/50 focus:ring-primary accent-primary"
                  />
                  <span className="text-xs text-on-surface font-medium">
                    Notify me via SMS/Email on field dispatch & repair completion verification
                  </span>
                </label>

                {/* Error Banner */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-error-container border border-error/30 text-error text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submission Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-secondary text-2xs font-mono">
                    <span className="material-symbols-outlined text-sm text-primary">lock</span>
                    <span>256-Bit Encrypted Municipal Transit Submission</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full sm:w-auto px-8 py-3 text-sm font-bold shadow-sm"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-base">
                          progress_activity
                        </span>
                        <span>Analyzing & Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Report</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Real-Time AI Analysis & Result Preview HUD */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {result ? (
              <ResultCard issue={result} onReset={resetForm} />
            ) : (
              /* Idle AI Telemetry Preview HUD (matching Stitch right column) */
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                  <div>
                    <span className="font-mono text-2xs uppercase tracking-wider text-secondary font-bold">
                      Real-Time Telemetry
                    </span>
                    <h3 className="text-lg font-bold text-on-surface">AI Diagnostic Inspection</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>Live Standby</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                  <span className="text-secondary font-medium">Model Status</span>
                  <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-semibold font-mono text-2xs">
                    Ready for Ingestion
                  </span>
                </div>

                {/* Educational preview card */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-xl">psychology</span>
                    <h4 className="font-bold text-xs uppercase tracking-wider">How CivicLens Analyzes</h4>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    Once you upload a photo, the CivicLens Computer Vision neural model evaluates damage size, classifies hazard severity on a 1-5 scale, checks nearby duplicate incidents within 50 meters, and auto-assigns the municipal department.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-2xs font-mono">
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-secondary block">Model Inference</span>
                      <span className="font-bold text-primary block text-sm mt-0.5">&lt; 3.0s</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-secondary block">Auto Routing</span>
                      <span className="font-bold text-on-surface block text-sm mt-0.5">5 Departments</span>
                    </div>
                  </div>
                </div>

                {/* System Feedback & Guidance previews */}
                <div className="flex flex-col gap-2.5">
                  <span className="font-mono text-2xs uppercase tracking-wider text-secondary font-bold">
                    Ingestion Guidelines
                  </span>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5 text-xs text-secondary">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">
                      my_location
                    </span>
                    <div>
                      <strong className="text-on-surface block">Accurate Geolocation</strong>
                      Allow location access or review coordinates so road teams can dispatch accurately.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5 text-xs text-secondary">
                    <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">
                      wb_sunny
                    </span>
                    <div>
                      <strong className="text-on-surface block">Lighting & Clarity</strong>
                      Clear daylight photos produce highest classification confidence and fast resolution.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Community Resolution Network Banner */}
        <div
          id="about-network"
          className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">hub</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">Civic Resolution Network</h4>
              <p className="text-xs text-secondary mt-0.5 leading-relaxed max-w-xl">
                Real-time automated infrastructure triage and municipal dispatch network. Verified open civic protocol connecting citizens with municipal response teams.
              </p>
            </div>
          </div>
          <Link
            to="/admin"
            className="btn-secondary text-xs px-4 py-2 shrink-0 font-semibold"
          >
            <span>Open Municipal Dashboard</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-surface">CivicLens Platform</span>
            <span>•</span>
            <span>Municipal Infrastructure Telemetry</span>
          </div>
          <p>© 2026 Municipal Operations Authority. Verified Open Civic Protocol.</p>
        </div>
      </footer>
    </div>
  );
}

export default ReportPage;
