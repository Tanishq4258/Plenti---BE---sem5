/**
 * PLENTI — SURPLUS FOOD MARKETPLACE
 * Authentication & Account Management Client Script
 *
 * Handles client-side form validation, password strength calculation,
 * password visibility toggling, account type switching, and token/session storage.
 */

const AUTH_STORAGE_KEYS = {
  USER: 'plenti_user',
  ACCESS_TOKEN: 'plenti_access_token',
  REFRESH_TOKEN: 'plenti_refresh_token'
};

const Auth = {
  // Session storage helpers
  saveSession(user, access = 'demo_access_token_' + Date.now(), refresh = 'demo_refresh_token_' + Date.now()) {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, access);
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refresh);
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.USER));
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }
};

window.Auth = Auth;

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLoginForm();
  initSignupForm();
  initSocialAuth();
});

// ==================== PASSWORD TOGGLING ====================
function initPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-toggle-password');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';

      // Switch SVG icon between eye and eye-off
      this.innerHTML = isText ? getEyeIcon() : getEyeOffIcon();
      this.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
    });
  });
}

function getEyeIcon() {
  return `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  `;
}

function getEyeOffIcon() {
  return `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  `;
}

// ==================== FORM VALIDATION HELPERS ====================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + 'Error');
  if (input) {
    input.classList.add('error');
    input.classList.remove('success');
  }
  if (errorEl) {
    const span = errorEl.querySelector('span');
    if (span) span.textContent = message;
    errorEl.classList.add('show');
  }
}

function clearError(inputId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + 'Error');
  if (input) {
    input.classList.remove('error');
  }
  if (errorEl) {
    errorEl.classList.remove('show');
  }
}

function markSuccess(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.classList.remove('error');
    input.classList.add('success');
  }
}

// ==================== LOGIN FORM CONTROLLER ====================
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('loginSubmit');
  const forgotLink = document.querySelector('.form-forgot');

  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      const currentEmail = emailInput?.value.trim() || '';
      const promptEmail = prompt('Please enter your email address to receive password reset instructions:', currentEmail);
      if (promptEmail) {
        if (isValidEmail(promptEmail)) {
          alert(`Password reset link sent to ${promptEmail}! Check your inbox.`);
        } else {
          alert('Please provide a valid email address.');
        }
      }
    });
  }

  // Live input validation
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      if (!val) {
        showError('loginEmail', 'Email is required.');
      } else if (!isValidEmail(val)) {
        showError('loginEmail', 'Please enter a valid email address.');
      } else {
        clearError('loginEmail');
        markSuccess('loginEmail');
      }
    });
    emailInput.addEventListener('input', () => clearError('loginEmail'));
  }

  if (passwordInput) {
    passwordInput.addEventListener('blur', () => {
      if (!passwordInput.value) {
        showError('loginPassword', 'Password is required.');
      } else {
        clearError('loginPassword');
      }
    });
    passwordInput.addEventListener('input', () => clearError('loginPassword'));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';

    if (!email) {
      showError('loginEmail', 'Email is required.');
      valid = false;
    } else if (!isValidEmail(email)) {
      showError('loginEmail', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError('loginEmail');
    }

    if (!password) {
      showError('loginPassword', 'Password is required.');
      valid = false;
    } else if (password.length < 6) {
      showError('loginPassword', 'Password must be at least 6 characters.');
      valid = false;
    } else {
      clearError('loginPassword');
    }

    if (!valid) return;

    // Simulate login processing
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in…';

    setTimeout(() => {
      // Create user profile
      const user = {
        name: email.split('@')[0],
        email: email,
        account_type: 'customer'
      };

      Auth.saveSession(user);

      const successEl = document.getElementById('loginSuccess');
      if (successEl) {
        successEl.classList.add('show');
      }

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }, 700);
  });
}

// ==================== SIGNUP FORM CONTROLLER ====================
function initSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const firstNameInput = document.getElementById('signupFirstName');
  const lastNameInput = document.getElementById('signupLastName');
  const emailInput = document.getElementById('signupEmail');
  const phoneInput = document.getElementById('signupPhone');
  const passwordInput = document.getElementById('signupPassword');
  const confirmPasswordInput = document.getElementById('signupConfirmPassword');
  const submitBtn = document.getElementById('signupSubmit');

  let selectedAccountType = 'customer';

  // Account Type Selector
  const typeCustomerBtn = document.getElementById('typeCustomerBtn');
  const typeBusinessBtn = document.getElementById('typeBusinessBtn');

  if (typeCustomerBtn && typeBusinessBtn) {
    typeCustomerBtn.addEventListener('click', () => {
      typeCustomerBtn.classList.add('active');
      typeCustomerBtn.setAttribute('aria-pressed', 'true');
      typeBusinessBtn.classList.remove('active');
      typeBusinessBtn.setAttribute('aria-pressed', 'false');
      selectedAccountType = 'customer';
    });

    typeBusinessBtn.addEventListener('click', () => {
      typeBusinessBtn.classList.add('active');
      typeBusinessBtn.setAttribute('aria-pressed', 'true');
      typeCustomerBtn.classList.remove('active');
      typeCustomerBtn.setAttribute('aria-pressed', 'false');
      selectedAccountType = 'business';
    });
  }

  // Password Strength Meter
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      clearError('signupPassword');
      updatePasswordStrength(passwordInput.value);
    });
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => {
      clearError('signupConfirmPassword');
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const firstName = firstNameInput?.value.trim() || '';
    const lastName = lastNameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';
    const confirmPassword = confirmPasswordInput?.value || '';

    if (!firstName) {
      showError('signupFirstName', 'First name is required.');
      valid = false;
    } else {
      clearError('signupFirstName');
    }

    if (!lastName) {
      showError('signupLastName', 'Last name is required.');
      valid = false;
    } else {
      clearError('signupLastName');
    }

    if (!email) {
      showError('signupEmail', 'Email is required.');
      valid = false;
    } else if (!isValidEmail(email)) {
      showError('signupEmail', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError('signupEmail');
    }

    if (!password) {
      showError('signupPassword', 'Password is required.');
      valid = false;
    } else if (password.length < 8) {
      showError('signupPassword', 'Password must be at least 8 characters.');
      valid = false;
    } else {
      clearError('signupPassword');
    }

    if (!confirmPassword) {
      showError('signupConfirmPassword', 'Please confirm your password.');
      valid = false;
    } else if (confirmPassword !== password) {
      showError('signupConfirmPassword', 'Passwords do not match.');
      valid = false;
    } else {
      clearError('signupConfirmPassword');
    }

    if (!valid) return;

    // Simulate account registration
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';

    setTimeout(() => {
      const user = {
        name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phoneInput?.value.trim() || '',
        account_type: selectedAccountType
      };

      Auth.saveSession(user);

      const successEl = document.getElementById('signupSuccess');
      if (successEl) {
        successEl.classList.add('show');
      }

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    }, 800);
  });
}

function updatePasswordStrength(password) {
  const segments = document.querySelectorAll('.strength-segment');
  const label = document.getElementById('strengthLabel');
  if (!segments.length) return;

  // Reset
  segments.forEach(seg => {
    seg.className = 'strength-segment';
  });

  if (!password) {
    if (label) label.textContent = '';
    return;
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score === 1) {
    segments[0].classList.add('weak');
    if (label) {
      label.textContent = 'Weak password';
      label.style.color = '#EF4444';
    }
  } else if (score === 2) {
    segments[0].classList.add('fair');
    segments[1].classList.add('fair');
    if (label) {
      label.textContent = 'Fair password';
      label.style.color = '#F59E0B';
    }
  } else if (score === 3) {
    segments[0].classList.add('good');
    segments[1].classList.add('good');
    segments[2].classList.add('good');
    if (label) {
      label.textContent = 'Good password';
      label.style.color = '#10B981';
    }
  } else if (score >= 4) {
    segments[0].classList.add('strong');
    segments[1].classList.add('strong');
    segments[2].classList.add('strong');
    segments[3].classList.add('strong');
    if (label) {
      label.textContent = 'Strong password ✓';
      label.style.color = '#059669';
    }
  }
}

// ==================== SOCIAL AUTH BUTTONS ====================
function initSocialAuth() {
  const googleBtns = [document.getElementById('googleLoginBtn'), document.getElementById('googleSignupBtn')];
  const appleBtns = [document.getElementById('appleLoginBtn'), document.getElementById('appleSignupBtn')];

  googleBtns.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.style.opacity = '0.7';
      btn.textContent = 'Connecting to Google…';
      setTimeout(() => {
        const user = {
          name: 'Google User',
          email: 'user@gmail.com',
          account_type: 'customer',
          provider: 'google'
        };
        Auth.saveSession(user);
        window.location.href = 'index.html';
      }, 900);
    });
  });

  appleBtns.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.style.opacity = '0.7';
      btn.textContent = 'Connecting to Apple…';
      setTimeout(() => {
        const user = {
          name: 'Apple User',
          email: 'user@icloud.com',
          account_type: 'customer',
          provider: 'apple'
        };
        Auth.saveSession(user);
        window.location.href = 'index.html';
      }, 900);
    });
  });
}
