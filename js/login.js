// login.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize password toggle
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
    });
    
    // Initialize login form
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        loginUser();
    });
    
    // Initialize social login buttons
    document.querySelector('.google-btn').addEventListener('click', function() {
        socialLogin('google');
    });
    
    document.querySelector('.facebook-btn').addEventListener('click', function() {
        socialLogin('facebook');
    });
});

function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Here you would typically send this data to your server for authentication
    console.log('Login attempt:', { email, password, remember });
    
    // For demo purposes, let's just redirect to dashboard
    if (email && password) {
        // Simulate loading
        showLoading();
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showError('Please enter both email and password');
    }
}

function socialLogin(provider) {
    console.log(`Logging in with ${provider}`);
    
    // Simulate loading
    showLoading();
    
    // Redirect after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function showLoading() {
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    loginBtn.disabled = true;
    
    const socialButtons = document.querySelectorAll('.social-buttons button');
    socialButtons.forEach(button => {
        button.disabled = true;
    });
}

function showError(message) {
    // Check if error message already exists
    let errorElement = document.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        
        // Insert after form heading
        const formHeading = document.querySelector('.login-form p');
        formHeading.insertAdjacentElement('afterend', errorElement);
    }
    
    errorElement.textContent = message;
    
    // Add some styling
    errorElement.style.color = '#f44336';
    errorElement.style.marginBottom = '15px';
    errorElement.style.fontSize = '14px';
}