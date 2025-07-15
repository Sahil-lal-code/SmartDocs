// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page loader
    setTimeout(function() {
        document.querySelector('.page-loader').classList.add('fade-out');
        setTimeout(function() {
            document.querySelector('.page-loader').style.display = 'none';
        }, 500);
    }, 1000);
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize FAQ accordion
    initFAQ();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize tool card navigation
    initToolCards();
    
    // Initialize tab functionality
    initTabs();
    
    // Initialize drag and drop
    initDragAndDrop();
});

// Tooltips
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(tooltip => {
        const tooltipText = tooltip.getAttribute('data-tooltip');
        const tooltipElement = document.createElement('span');
        tooltipElement.className = 'tooltip-text';
        tooltipElement.textContent = tooltipText;
        tooltip.appendChild(tooltipElement);
        
        tooltip.addEventListener('mouseenter', function() {
            tooltipElement.style.visibility = 'visible';
            tooltipElement.style.opacity = '1';
        });
        
        tooltip.addEventListener('mouseleave', function() {
            tooltipElement.style.visibility = 'hidden';
            tooltipElement.style.opacity = '0';
        });
    });
}

// FAQ Accordion
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            this.classList.toggle('active');
            const answer = this.nextElementSibling;
            
            if (this.classList.contains('active')) {
                answer.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.classList.remove('active');
                answer.style.maxHeight = '0';
            }
        });
    });
}

// Mobile Menu
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

// Scroll Effects
function initScrollEffects() {
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.glass-header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Animate elements on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.slide-up, .slide-down, .slide-left, .slide-right, .fade-in');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translate(0, 0)';
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
}

// Tool Cards Navigation
function initToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            window.location.href = `convert.html#${tool}`;
        });
    });
}

// Tab Functionality
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Add active class to clicked button and corresponding tab
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Check for hash in URL to open specific tab
    if (window.location.hash) {
        const tabId = window.location.hash.substring(1);
        const tabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        
        if (tabButton) {
            tabButton.click();
        }
    }
}

// Drag and Drop
function initDragAndDrop() {
    const dropZones = document.querySelectorAll('.drop-zone');
    
    dropZones.forEach(zone => {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            zone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, unhighlight, false);
        });
        
        // Handle dropped files
        zone.addEventListener('drop', handleDrop, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        this.classList.add('highlight');
    }
    
    function unhighlight() {
        this.classList.remove('highlight');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            const inputId = this.id.replace('drop-zone', 'file-input');
            const fileInput = document.getElementById(inputId);
            
            if (fileInput) {
                fileInput.files = files;
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        }
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Show file info
function showFileInfo(inputId, infoId) {
    const fileInput = document.getElementById(inputId);
    const fileInfo = document.getElementById(infoId);
    
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const fileName = file.name;
        const fileSize = formatFileSize(file.size);
        
        document.querySelector(`#${infoId} .file-name`).textContent = fileName;
        document.querySelector(`#${infoId} .file-size`).textContent = fileSize;
        
        fileInfo.style.display = 'block';
    }
}

// Show conversion result
function showConversionResult(resultId, fileName, fileSize) {
    const resultElement = document.getElementById(resultId);
    
    document.querySelector(`#${resultId} .result-name`).textContent = fileName;
    document.querySelector(`#${resultId} .result-size`).textContent = fileSize;
    
    resultElement.style.display = 'block';
}

// Download file
function downloadFile(fileName, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show loading state
function showLoading(show = true) {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = '<div class="loader-spinner"></div>';
    
    if (show) {
        document.body.appendChild(loader);
    } else {
        const existingLoader = document.querySelector('.loading-overlay');
        if (existingLoader) {
            existingLoader.remove();
        }
    }
}

// Show success message and redirect
function showSuccessMessage(fileName, fileSize, savings = null) {
    document.getElementById('success-file-name').textContent = fileName;
    document.getElementById('success-file-size').textContent = fileSize;
    
    if (savings) {
        document.getElementById('success-savings').textContent = `${savings}% smaller`;
    } else {
        document.getElementById('success-savings').textContent = '';
    }
    
    window.location.href = 'success.html';
}