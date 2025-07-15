document.addEventListener('DOMContentLoaded', function() {
    // Initialize Image Compressor
    const imageFileInput = document.getElementById('image-file-input');
    const imageUploadBtn = document.getElementById('image-upload-btn');
    const imageCompressBtn = document.getElementById('image-compress-btn');
    const imageDownloadBtn = document.getElementById('image-download-btn');
    const imageDropZone = document.getElementById('image-drop-zone');
    const imageQualitySlider = document.getElementById('image-quality');
    const imageQualityValue = document.getElementById('image-quality-value');
    const imageMaxWidth = document.getElementById('image-max-width');
    const imageMaxHeight = document.getElementById('image-max-height');
    const imageFormat = document.getElementById('image-format');
    
    // Check if elements exist on the page
    if (!imageFileInput || !imageUploadBtn || !imageCompressBtn || !imageDownloadBtn || !imageDropZone) {
        return;
    }
    
    // Event listeners
    imageUploadBtn.addEventListener('click', function() {
        imageFileInput.click();
    });
    
    imageFileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const fileName = file.name;
            const fileSize = formatFileSize(file.size);
            
            document.getElementById('image-file-name').textContent = fileName;
            document.getElementById('image-file-size').textContent = fileSize;
            
            // Show image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.getElementById('image-preview');
                img.src = e.target.result;
                
                // Get image dimensions
                const tempImg = new Image();
                tempImg.onload = function() {
                    document.getElementById('image-file-dimensions').textContent = `${this.width} × ${this.height} px`;
                };
                tempImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            document.getElementById('image-file-info').style.display = 'block';
        }
    });
    
    // Update quality value display
    imageQualitySlider.addEventListener('input', function() {
        const quality = Math.round(this.value * 100);
        imageQualityValue.textContent = `${quality}%`;
    });
    
    imageCompressBtn.addEventListener('click', compressImage);
    imageDownloadBtn.addEventListener('click', downloadCompressedImage);
    
    // Compress image
    function compressImage() {
        const file = imageFileInput.files[0];
        
        if (!file) {
            alert('Please select an image file first');
            return;
        }
        
        showLoading(true);
        
        const quality = parseFloat(imageQualitySlider.value);
        const maxWidth = imageMaxWidth.value ? parseInt(imageMaxWidth.value) : null;
        const maxHeight = imageMaxHeight.value ? parseInt(imageMaxHeight.value) : null;
        const format = imageFormat.value === 'original' ? null : imageFormat.value;
        
        new Compressor(file, {
            quality: quality,
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            mimeType: format ? `image/${format}` : null,
            success(result) {
                // Show comparison
                const originalImg = document.getElementById('image-original-preview');
                originalImg.src = URL.createObjectURL(file);
                
                const compressedImg = document.getElementById('image-compressed-preview');
                compressedImg.src = URL.createObjectURL(result);
                
                // Original stats
                document.getElementById('image-original-size').textContent = formatFileSize(file.size);
                
                // Compressed stats
                document.getElementById('image-compressed-size').textContent = formatFileSize(result.size);
                
                // Calculate savings
                const savings = Math.round((1 - (result.size / file.size)) * 100);
                document.getElementById('image-savings').textContent = `${savings}% smaller`;
                document.getElementById('image-savings').style.color = savings > 0 ? 'var(--success-color)' : 'var(--error-color)';
                
                // Get compressed image dimensions
                const tempImg = new Image();
                tempImg.onload = function() {
                    document.getElementById('image-compressed-dimensions').textContent = `${this.width} × ${this.height} px`;
                    document.getElementById('image-original-dimensions').textContent = `${this.width} × ${this.height} px`;
                };
                tempImg.src = URL.createObjectURL(result);
                
                // Get original image dimensions
                const tempImg2 = new Image();
                tempImg2.onload = function() {
                    document.getElementById('image-original-dimensions').textContent = `${this.width} × ${this.height} px`;
                };
                tempImg2.src = URL.createObjectURL(file);
                
                // Show result
                document.getElementById('image-result').style.display = 'block';
                
                // Store blob for download
                imageDownloadBtn.setAttribute('data-blob', URL.createObjectURL(result));
                imageDownloadBtn.setAttribute('data-filename', file.name.replace(/\.[^/.]+$/, '') + '_compressed.' + (format || file.name.split('.').pop()));
                
                showLoading(false);
            },
            error(err) {
                console.error('Compression error:', err);
                alert('Error compressing image: ' + err.message);
                showLoading(false);
            }
        });
    }
    
    // Download compressed image
    function downloadCompressedImage() {
        const blobUrl = this.getAttribute('data-blob');
        const fileName = this.getAttribute('data-filename');
        
        if (!blobUrl || !fileName) {
            alert('No file to download. Please compress an image first.');
            return;
        }
        
        fetch(blobUrl)
            .then(response => response.blob())
            .then(blob => {
                downloadFile(fileName, blob);
                console.log('Download successful:', fileName);
            })
            .catch(error => {
                console.error('Download error:', error);
                alert('Error downloading file: ' + error.message);
            });
    }
});