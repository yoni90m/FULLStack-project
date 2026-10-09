/**
 * Bus Transportation Management System
 * Authentication Handler: auth.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const regScheduleSelect = document.getElementById('reg-schedule');

  // Load available schedules into registration bus dropdown
  if (regScheduleSelect) {
    apiFetch('/schedules').then(res => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        regScheduleSelect.innerHTML = '<option value="">-- Choose Your Bus & Route --</option>';
        res.data.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.schedule_id;
          opt.textContent = `🚍 ${s.bus_number || 'Bus'} • ${s.route_name || 'Route'} (${s.departure_time || 'Scheduled'}) • $${parseFloat(s.fare || 0).toFixed(2)}`;
          regScheduleSelect.appendChild(opt);
        });
      }
    }).catch(() => {});
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('login-email') || document.getElementById('login-username');
      const passwordInput = document.getElementById('login-password');

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      if (!email) {
        showToast('error', 'Validation Error', 'Please enter your email address.');
        if (emailInput) emailInput.focus();
        return;
      }
      if (!password) {
        showToast('error', 'Validation Error', 'Please enter your password.');
        if (passwordInput) passwordInput.focus();
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Signing in...';
      submitBtn.disabled = true;

      try {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, username: email, password })
        });

        if (response.success) {
          showToast('success', 'Welcome!', response.message || 'Login successful.');
          const token = (response.data && response.data.token) || response.token || 'auth-token';
          const user = (response.data && response.data.user) || response.user;
          localStorage.setItem('bus_auth_token', token);
          if (user) {
            setCurrentUser(user);
          }
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 600);
        } else {
          showToast('error', 'Login Failed', response.message || 'Invalid email or password.');
        }
      } catch (err) {
        showToast('error', 'Connection Error', 'Failed to connect to authentication server');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Handle Registration
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();
      const password = document.getElementById('reg-password').value.trim();
      const confirmPassword = document.getElementById('reg-confirm-password').value.trim();
      const scheduleId = document.getElementById('reg-schedule')?.value || '';
      const seatNumber = document.getElementById('reg-seat')?.value.trim() || '';

      // Validation
      if (!name || !username || !email || !phone || !password) {
        showToast('error', 'Validation Error', 'All fields are required.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('error', 'Validation Error', 'Please provide a valid email address.');
        return;
      }

      if (password.length < 6) {
        showToast('error', 'Validation Error', 'Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        showToast('error', 'Validation Error', 'Passwords do not match.');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Registering & Reserving Bus...';
      submitBtn.disabled = true;

      try {
        const payload = {
          name,
          username,
          email,
          phone,
          password,
          schedule_id: scheduleId ? parseInt(scheduleId, 10) : null,
          seat_number: seatNumber || null
        };

        const response = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (response.success) {
          showToast('success', 'Registration Successful', 'Account & bus reservation created! Redirecting to sign in...');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1200);
        } else {
          showToast('error', 'Registration Failed', response.message || 'Could not register user');
        }
      } catch (err) {
        showToast('error', 'Error', 'Failed to communicate with server');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

});
