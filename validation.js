// Gabriel Lopez
// Program name: index.html
//Author: Gabriel Lopez
//Date created: 5/4/2026
// Date last edited: 5/8/2026
// Version: 4.10
//Description: This JavaScript file contains all the logic for validating the form fields in real-time and managing cookies for user experience.

// Cookie return function, reference w3schools 
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
// Expiries cookie after 24 hours, 

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function deleteCookie(cname) {
  setCookie(cname, "", -1);
}

// Check for existing user and show welcome message
function checkAndDisplayUser() {
  const userName = getCookie("userFirstName");
  const welcomeDiv = document.getElementById("userWelcome");
  
  if (userName) {
    welcomeDiv.innerHTML = `<p>Welcome back, <strong>${userName}</strong>! | <span style="cursor: pointer; color: #0eb9e4; text-decoration: underline;" onclick="startAsNewUser()">Not ${userName}? Click here to start as NEW USER</span></p>`;
    document.getElementById("firstName").value = userName;
  } else {
    welcomeDiv.innerHTML = `<p>Welcome New User!</p>`;
  }
}

// Start as new user - clear cookie and resets the form, also updates the welcome message to reflect new user status.
function startAsNewUser() {
  deleteCookie("userFirstName");
  document.getElementById("regForm").reset();
  checkAndDisplayUser();
}

// Validation rules for each field to keep code organized and maintainable, 
// Also states the message in red below the field when validation fails.

const validationRules = {
  firstName: { required: true, pattern: /^[A-Za-z'\-]{1,30}$/, msg: "Letters, apostrophes, dashes only (1-30 chars)" },
  middleInitial: { required: false, pattern: /^[A-Za-z]?$/, msg: "Single letter only" },
  lastName: { required: true, pattern: /^[A-Za-z'\-]*[2-5]?[A-Za-z'\-]*$/, msg: "Letters, apostrophes, dashes, numbers 2-5" },
  birthday: { required: true, type: "date", msg: "Date required and valid" },
  moveDate: { required: true, type: "date", msg: "Cannot be in the past" },
  ssn: { required: true, pattern: /^\d{3}-\d{2}-\d{4}$/, msg: "Format: XXX-XX-XXXX" },
  email: { required: true, type: "email", msg: "Valid email required (name@domain.tld)" },
  phone: { required: true, pattern: /^\d{3}-\d{3}-\d{4}$/, msg: "Format: 000-000-0000" },
  addr1: { required: true, minLength: 2, maxLength: 30, msg: "2-30 characters required" },
  addr2: { required: false, minLength: 2, maxLength: 30, msg: "2-30 characters if provided" },
  city: { required: true, minLength: 2, maxLength: 30, msg: "2-30 characters required" },
  state: { required: true, msg: "State required" },
  zip: { required: true, pattern: /^\d{5}(-\d{4})?$/, msg: "5 digits only (Example: XXXXX)" },
  notes: { required: false, noDoubleQuotes: true, msg: "No double quotes allowed" },
  userId: { required: true, pattern: /^[A-Za-z][A-Za-z0-9_-]{4,29}$/, msg: "Start with letter, 5-30 chars, letters/numbers/dash/underscore" },
  password: { required: true, password: true, msg: "8-30 charcters with uppercase, lowercase, digit, special charcter" },
  confirmPassword: { required: true, msg: "Must match password" }
};


//  validation function
function validate(fieldId, value, rules) {
  if (!rules) return "";
  if (!value && rules.required) return `${fieldId.replace(/([A-Z])/g, ' $1').trim()} is required`;
  if (!value) return "";

  if (rules.pattern && !rules.pattern.test(value)) return rules.msg;
  if (rules.minLength && value.length < rules.minLength) return `Minimum ${rules.minLength} characters`;
  if (rules.maxLength && value.length > rules.maxLength) return `Maximum ${rules.maxLength} characters`;
  if (rules.noDoubleQuotes && /"/.test(value)) return "Double quotes not allowed";
  if (rules.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return rules.msg;
  if (rules.type === "date") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateVal = new Date(value + 'T00:00:00');
    if (dateVal > today && fieldId !== "moveDate") return "Cannot be in the future";
    if (fieldId === "birthday") {
      const age = today.getFullYear() - dateVal.getFullYear();
      if (age > 120) return "Age cannot exceed 120 years, you would be dead.";
    }
    if (fieldId === "moveDate" && dateVal < today) return "Cannot be in the past";
  }
  if (rules.password) {
    if (value.length < 8) return "Minimum 8 characters";
    if (value.length > 30) return "Maximum 30 characters";
    if (!/[A-Z]/.test(value)) return "Needs 1 uppercase letter";
    if (!/[a-z]/.test(value)) return "Needs 1 lowercase letter";
    if (!/\d/.test(value)) return "Needs 1 digit";
    if (!/[!@#%^&*()\-_+=\/><.,`~]/.test(value)) return "Needs 1 special character";
  }
  return "";
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


// Display error for a field
function displayError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + 'Err');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.visibility = message ? 'visible' : 'hidden';
    errorEl.style.color = '#b30000';
  }
}

// Auto-format input fields
function autoFormat(field, type) {
  let value = field.value.replace(/\D/g, '');
  if (type === 'ssn' && value.length > 9) value = value.slice(0, 9);
  if (type === 'phone' && value.length > 10) value = value.slice(0, 10);
  if (type === 'zip' && value.length > 9) value = value.slice(0, 9);

  if (type === 'ssn' && value.length >= 5) value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5);
  else if (type === 'ssn' && value.length >= 3) value = value.slice(0, 3) + '-' + value.slice(3);

  if (type === 'phone' && value.length >= 6) value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
  else if (type === 'phone' && value.length >= 3) value = value.slice(0, 3) + '-' + value.slice(3);

  if (type === 'zip' && value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5);

  field.value = value;
}


// Validate all fields
function validateForm() {
  document.querySelectorAll('.error').forEach(el => el.textContent = '');
  let isValid = true;

  Object.entries(validationRules).forEach(([fieldId, rules]) => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    let value = field.value;
    if (fieldId === 'email') value = value.toLowerCase();

    let error = validate(fieldId, value, rules);
    if (fieldId === 'confirmPassword') {
      const password = document.getElementById('password').value;
      if (!value) error = "Please confirm password";
      else if (password !== value) error = "Passwords do not match";
    }

    if (error) {
      displayError(fieldId, error);
      isValid = false;
    }
  });

  // Validate radio buttons
  ['vaccinated', 'housing'].forEach(name => {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      const group = document.querySelector(`input[name="${name}"]`).closest('.group');
      let errorEl = group.querySelector('.error');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error';
        group.appendChild(errorEl);
      }
      errorEl.textContent = `Please select ${name}`;
      isValid = false;
    }
  });

  return isValid;
}


// Get form data
function getFormData() {
  const form = document.getElementById('regForm');
  const formData = new FormData(form);
  const data = {};

  for (let [key, value] of formData.entries()) {
    if (key === 'history') {
      if (!data[key]) data[key] = [];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }
  return data;
}

// Display form summary
function displayFormSummary(formData) {
  const labels = {
    firstName: 'First Name',
    middleInitial: 'Middle Initial',
    lastName: 'Last Name',
    birthday: 'Birthday',
    moveDate: 'Move In Date',
    ssn: 'SSN',
    email: 'Email',
    phone: 'Phone',
    addr1: 'Address Line 1',
    addr2: 'Address Line 2',
    city: 'City',
    state: 'State',
    zip: 'Zip',
    history: 'Medical History',
    vaccinated: 'Vaccinated',
    housing: 'Housing',
    salary: 'Salary Range',
    notes: 'Notes',
    userId: 'User ID'
  };

  let html = '<table style="width: 100%; border-collapse: collapse;">';
  for (const [key, value] of Object.entries(formData)) {
    if (value && value !== '') {
      let displayVal = value;
      if (Array.isArray(value)) displayVal = value.join(', ');
      else if (key === 'salary') displayVal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
      else if (key === 'password' || key === 'confirmPassword' || key === 'ssn') displayVal = '••••••••';

      html += `<tr style="border-bottom: 1px solid #ddd;"><td style="padding: 10px; font-weight: bold; width: 30%;">${labels[key] || key}</td><td style="padding: 10px;">${displayVal}</td></tr>`;
    }
  }
  html += '</table>';

  document.getElementById('summary-content').innerHTML = html;
  document.getElementById('summary-section').style.display = 'block';
  document.getElementById('summary-section').scrollIntoView({ behavior: 'smooth' });
}


// Setup salary slider display
function initializeSalarySlider() {
  const slider = document.getElementById('salary');
  const display = document.getElementById('salaryDisplay');
  if (!slider || !display) return;

  const fmt = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  display.textContent = fmt(slider.value);
  slider.addEventListener('input', () => { display.textContent = fmt(slider.value); });
}

//  FETCH API - Load States from External File 
// Load State options from states.html using Fetch API (referenced w3schools/little bit of copilot help)
async function loadStates() {
  try {
    console.log('Starting to load states...');
    const response = await fetch('states.html');
    console.log('Fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const statesHTML = await response.text();
    console.log('States HTML received:', statesHTML.substring(0, 50));
    
    const stateSelect = document.getElementById('state');
    if (!stateSelect) {
      console.error('State select element not found!');
      return;
    }
    
    stateSelect.innerHTML = statesHTML;
    console.log('States loaded successfully from states.html');
  } catch (error) {
    console.error('Error loading states:', error);
    // Add default option if fetch fails
    const stateSelect = document.getElementById('state');
    if (stateSelect) {
      stateSelect.innerHTML = '<option value="">-- Select State--</option><option value="AL">AL</option><option value="AK">AK</option>';
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  // Check for existing user cookie and display welcome message
  checkAndDisplayUser();
  
  // Load states from external file
  loadStates();
  // Set date constraints
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minBirthday = new Date(today);
  minBirthday.setFullYear(minBirthday.getFullYear() - 120);

  document.getElementById('birthday').max = today.toISOString().split('T')[0];
  document.getElementById('birthday').min = minBirthday.toISOString().split('T')[0];
  document.getElementById('moveDate').min = today.toISOString().split('T')[0];

  // salary slider
  initializeSalarySlider();

  // Real-time validation for all fields
  Object.keys(validationRules).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const handler = () => {
      if (fieldId === 'ssn') autoFormat(field, 'ssn');
      if (fieldId === 'phone') autoFormat(field, 'phone');
      if (fieldId === 'zip') autoFormat(field, 'zip');
      if (fieldId === 'email') field.value = field.value.toLowerCase();

      const error = validate(fieldId, field.value, validationRules[fieldId]);
      if (fieldId === 'confirmPassword' && document.getElementById('password').value) {
        const pwd = document.getElementById('password').value;
        const confirmErr = field.value !== pwd ? "Passwords do not match" : "";
        displayError(fieldId, confirmErr);
      } else {
        displayError(fieldId, error);
      }

      // Save firstName to cookie when valid (24 hour expiry)
      if (fieldId === 'firstName' && !error && field.value.trim()) {
        setCookie("userFirstName", field.value.trim(), 1);
        checkAndDisplayUser();
      }
    };

    field.addEventListener(fieldId.includes('date') ? 'change' : 'input', handler);
  });

  // Validate button
  document.getElementById('validateBtn').addEventListener('click', () => {
    if (validateForm()) {
      const formData = getFormData();
      displayFormSummary(formData);
    }
  });

  // submit button
  document.getElementById('confirm-submit-btn')?.addEventListener('click', () => {
    const firstName = document.getElementById('firstName').value.trim();
    if (firstName) {
      setCookie("userFirstName", firstName, 1);
    }
    window.location.href = 'thankyou.html';
  });

  // summary button
  document.getElementById('close-summary-btn')?.addEventListener('click', () => {
    document.getElementById('summary-section').style.display = 'none';
  });
});
