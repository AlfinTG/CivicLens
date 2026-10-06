import axios from 'axios';
import mockIssues from './mock/issues.json';

const USE_MOCK = false;

const http = axios.create({
  baseURL: '',
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('civiclens_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function adminLogin(password) {
  const res = await http.post('/api/admin/login', { password });
  return res.data;
}

export async function submitReport(formData) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    return mockIssues[0];
  }
  const res = await http.post('/api/report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function fetchIssues(status) {
  if (USE_MOCK) {
    if (status) return mockIssues.filter((i) => i.status === status);
    return mockIssues;
  }
  const params = status ? { status } : {};
  const res = await http.get('/api/issues', { params });
  return res.data;
}

export async function fetchIssue(id) {
  if (USE_MOCK) {
    return mockIssues.find((i) => i.id === id) || null;
  }
  const res = await http.get(`/api/issues/${id}`);
  return res.data;
}

export async function updateIssueStatus(id, status) {
  if (USE_MOCK) {
    const issue = mockIssues.find((i) => i.id === id);
    if (issue) issue.status = status;
    return issue;
  }
  const res = await http.patch(`/api/issues/${id}`, { status });
  return res.data;
}

export async function fetchStats() {
  if (USE_MOCK) {
    const total = mockIssues.length;
    const open = mockIssues.filter((i) => i.status === 'open').length;
    const in_progress = mockIssues.filter((i) => i.status === 'in_progress').length;
    const resolved = mockIssues.filter((i) => i.status === 'resolved').length;
    const by_type = {};
    mockIssues.forEach((i) => {
      by_type[i.type] = (by_type[i.type] || 0) + 1;
    });
    return { total, open, in_progress, resolved, by_type };
  }
  const res = await http.get('/api/stats');
  return res.data;
}

export async function healthCheck() {
  const res = await http.get('/api/health');
  return res.data;
}
