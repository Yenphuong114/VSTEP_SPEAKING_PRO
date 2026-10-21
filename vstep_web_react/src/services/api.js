// Dynamic backend URL:
// Relative URL ('') automatically works on port 8000, mobile LAN, and Vite dev proxy (5173)
export const BACKEND_URL = '';

export async function loginApi(password) {
  const resp = await fetch(`${BACKEND_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Wrong password');
  }

  return await resp.json(); // { role: "admin" | "teacher" }
}

export async function evaluateSpeechApi(audioBlob, topic, part, filename = 'speech.wav') {
  const formData = new FormData();
  formData.append('audio', audioBlob, filename);
  formData.append('topic', topic);
  formData.append('part', part);

  const resp = await fetch(`${BACKEND_URL}/api/evaluate`, {
    method: 'POST',
    body: formData
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Evaluation failed on server');
  }

  return await resp.json();
}

export async function getRubricApi() {
  const resp = await fetch(`${BACKEND_URL}/api/rubric`);
  if (!resp.ok) throw new Error('Failed to load rubric');
  return await resp.json();
}

export async function saveRubricApi(rubricPayload, role = '') {
  const currentRole = role || sessionStorage.getItem('vstep_role') || '';
  const resp = await fetch(`${BACKEND_URL}/api/rubric`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': currentRole
    },
    body: JSON.stringify({ ...rubricPayload, user_role: currentRole })
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to save rubric');
  }

  return await resp.json();
}
