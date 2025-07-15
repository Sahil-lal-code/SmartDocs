document.addEventListener('DOMContentLoaded', function() {
    // Get theme elements
    const themeToggle = document.querySelector('.theme-toggle');
    const themeColorButtons = document.querySelectorAll('.theme-color');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const savedColor = localStorage.getItem('color');
    
    // Apply saved theme or default
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update toggle icon
        if (savedTheme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    if (savedColor) {
        document.documentElement.setAttribute('data-theme', savedColor);
        
        // Update active color button
        themeColorButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-color') === savedColor) {
                button.classList.add('active');
            }
        });
    }
    
    // Toggle dark/light mode
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update toggle icon
            this.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }
    
    // Change theme color
    themeColorButtons.forEach(button => {
        button.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            
            // Remove active class from all buttons
            themeColorButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set theme color
            document.documentElement.setAttribute('data-theme', color);
            localStorage.setItem('color', color);
        });
    });
});