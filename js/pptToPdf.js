document.addEventListener('DOMContentLoaded', function() {
    // Initialize PPT to PDF converter
    const pptFileInput = document.getElementById('ppt-file-input');
    const pptUploadBtn = document.getElementById('ppt-upload-btn');
    const pptConvertBtn = document.getElementById('ppt-convert-btn');
    const pptDownloadBtn = document.getElementById('ppt-download-btn');
    const pptDropZone = document.getElementById('ppt-drop-zone');
    
    // Check if elements exist on the page
    if (!pptFileInput || !pptUploadBtn || !pptConvertBtn || !pptDownloadBtn || !pptDropZone) {
        return;
    }
    
    // Event listeners
    pptUploadBtn.addEventListener('click', function() {
        pptFileInput.click();
    });
    
    pptFileInput.addEventListener('change', function() {
        showFileInfo('ppt-file-input', 'ppt-file-info');
    });
    
    pptConvertBtn.addEventListener('click', convertPptToPdf);
    pptDownloadBtn.addEventListener('click', downloadConvertedPdf);
    
    // Convert PPT to PDF (simulated)
    function convertPptToPdf() {
        const file = pptFileInput.files[0];
        
        if (!file) {
            alert('Please select a PowerPoint file first');
            return;
        }
        
        showLoading(true);
        
        // In a real implementation, we would use a library to extract slides and convert to PDF
        // For this demo, we'll simulate the conversion with a simple PDF containing the filename
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text(`Converted from: ${file.name}`, 15, 20);
        doc.text('This is a simulated PowerPoint to PDF conversion.', 15, 30);
        doc.text('In a real implementation, slides would be rendered here.', 15, 40);
        
        // Save PDF as blob
        const pdfBlob = doc.output('blob');
        
        // Show result
        const fileName = file.name.replace(/\.pptx?$/, '.pdf');
        const fileSize = formatFileSize(pdfBlob.size);
        
        showConversionResult('ppt-result', fileName, fileSize);
        
        // Store blob for download
        pptDownloadBtn.setAttribute('data-blob', URL.createObjectURL(pdfBlob));
        pptDownloadBtn.setAttribute('data-filename', fileName);
        
        showLoading(false);
    }
    
    // Download converted PDF
    function downloadConvertedPdf() {
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