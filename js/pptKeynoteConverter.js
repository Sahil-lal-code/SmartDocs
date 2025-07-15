document.addEventListener('DOMContentLoaded', function() {
    // Initialize PPT ↔ Keynote converter
    const keynoteFileInput = document.getElementById('keynote-file-input');
    const keynoteUploadBtn = document.getElementById('keynote-upload-btn');
    const keynoteConvertBtn = document.getElementById('keynote-convert-btn');
    const keynoteDownloadBtn = document.getElementById('keynote-download-btn');
    const keynoteDropZone = document.getElementById('keynote-drop-zone');
    const keynoteConvertOption = document.getElementById('keynote-convert-option');
    
    // Check if elements exist on the page
    if (!keynoteFileInput || !keynoteUploadBtn || !keynoteConvertBtn || !keynoteDownloadBtn || !keynoteDropZone) {
        return;
    }
    
    // Event listeners
    keynoteUploadBtn.addEventListener('click', function() {
        keynoteFileInput.click();
    });
    
    keynoteFileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const fileName = file.name;
            const fileSize = formatFileSize(file.size);
            const fileType = fileName.endsWith('.key') ? 'Keynote' : 'PowerPoint';
            
            document.getElementById('keynote-file-name').textContent = fileName;
            document.getElementById('keynote-file-size').textContent = fileSize;
            document.getElementById('keynote-file-type').textContent = fileType;
            
            // Set icon based on file type
            const icon = document.getElementById('keynote-file-icon');
            icon.className = fileName.endsWith('.key') ? 'fas fa-file' : 'fas fa-file-powerpoint';
            
            // Update conversion options based on file type
            if (fileName.endsWith('.key')) {
                keynoteConvertOption.innerHTML = `
                    <option value="key-ppt">KEY to PPTX (PowerPoint)</option>
                `;
            } else if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
                keynoteConvertOption.innerHTML = `
                    <option value="ppt-key">PPT/PPTX to KEY (Keynote)</option>
                `;
            }
            
            document.getElementById('keynote-file-info').style.display = 'block';
        }
    });
    
    keynoteConvertBtn.addEventListener('click', convertPresentation);
    keynoteDownloadBtn.addEventListener('click', downloadConvertedPresentation);
    
    // Convert presentation (simulated)
    function convertPresentation() {
        const file = keynoteFileInput.files[0];
        
        if (!file) {
            alert('Please select a PowerPoint or Keynote file first');
            return;
        }
        
        showLoading(true);
        
        // In a real implementation, we would convert between formats
        // For this demo, we'll simulate the conversion by creating a ZIP with a renamed file
        
        const conversionType = keynoteConvertOption.value;
        let newFileName, newFileExtension, newFileType;
        
        if (conversionType === 'ppt-key') {
            newFileExtension = '.key';
            newFileName = file.name.replace(/\.pptx?$/, newFileExtension);
            newFileType = 'Keynote';
        } else {
            newFileExtension = '.pptx';
            newFileName = file.name.replace(/\.key$/, newFileExtension);
            newFileType = 'PowerPoint';
        }
        
        // Create a zip file with the converted file
        const zip = new JSZip();
        zip.file(newFileName, file);
        
        zip.generateAsync({ type: 'blob' })
            .then(function(content) {
                // Show result
                const resultFileName = file.name.replace(/\.[^/.]+$/, '') + '_converted.zip';
                const fileSize = formatFileSize(content.size);
                
                document.getElementById('keynote-result-name').textContent = resultFileName;
                document.getElementById('keynote-result-size').textContent = fileSize;
                
                // Set icon based on converted type
                const icon = document.getElementById('keynote-result-icon');
                icon.className = newFileExtension === '.key' ? 'fas fa-file' : 'fas fa-file-powerpoint';
                
                document.getElementById('keynote-result').style.display = 'block';
                
                // Store blob for download
                keynoteDownloadBtn.setAttribute('data-blob', URL.createObjectURL(content));
                keynoteDownloadBtn.setAttribute('data-filename', resultFileName);
                
                showLoading(false);
            })
            .catch(function(error) {
                console.error('Conversion error:', error);
                alert('Error converting file: ' + error.message);
                showLoading(false);
            });
    }
    
    // Download converted presentation
    function downloadConvertedPresentation() {
        const blobUrl = this.getAttribute('data-blob');
        const fileName = this.getAttribute('data-filename');
        
        if (!blobUrl || !fileName) {
            alert('No file to download. Please convert a file first.');
            return;
        }
        
        fetch(blobUrl)
            .then(response => response.blob())
            .then(blob => {
                downloadFile(fileName, blob);
                showSuccessMessage(fileName, formatFileSize(blob.size));
            })
            .catch(error => {
                console.error('Download error:', error);
                alert('Error downloading file: ' + error.message);
            });
    }
});