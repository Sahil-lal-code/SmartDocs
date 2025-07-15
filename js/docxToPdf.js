document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOCX to PDF converter
    const docxFileInput = document.getElementById('docx-file-input');
    const docxUploadBtn = document.getElementById('docx-upload-btn');
    const docxConvertBtn = document.getElementById('docx-convert-btn');
    const docxDownloadBtn = document.getElementById('docx-download-btn');
    const docxDropZone = document.getElementById('docx-drop-zone');
    
    // Check if elements exist on the page
    if (!docxFileInput || !docxUploadBtn || !docxConvertBtn || !docxDownloadBtn || !docxDropZone) {
        return;
    }
    
    // Event listeners
    docxUploadBtn.addEventListener('click', function() {
        docxFileInput.click();
    });
    
    docxFileInput.addEventListener('change', function() {
        showFileInfo('docx-file-input', 'docx-file-info');
    });
    
    docxConvertBtn.addEventListener('click', convertDocxToPdf);
    docxDownloadBtn.addEventListener('click', downloadConvertedPdf);
    
    // Convert DOCX to PDF
    function convertDocxToPdf() {
        const file = docxFileInput.files[0];
        
        if (!file) {
            alert('Please select a DOCX file first');
            return;
        }
        
        showLoading(true);
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const arrayBuffer = event.target.result;
            
            // Use mammoth.js to convert DOCX to HTML
            mammoth.extractRawText({arrayBuffer: arrayBuffer})
                .then(function(result) {
                    const text = result.value;
                    
                    // Use jsPDF to create PDF from text
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    
                    // Split text into lines that fit the page
                    const lines = doc.splitTextToSize(text, 180);
                    
                    // Add text to PDF
                    doc.text(lines, 15, 20);
                    
                    // Save PDF as blob
                    const pdfBlob = doc.output('blob');
                    
                    // Show result
                    const fileName = file.name.replace('.docx', '.pdf');
                    const fileSize = formatFileSize(pdfBlob.size);
                    
                    showConversionResult('docx-result', fileName, fileSize);
                    
                    // Store blob for download
                    docxDownloadBtn.setAttribute('data-blob', URL.createObjectURL(pdfBlob));
                    docxDownloadBtn.setAttribute('data-filename', fileName);
                    
                    showLoading(false);
                })
                .catch(function(error) {
                    console.error('Conversion error:', error);
                    alert('Error converting DOCX to PDF: ' + error.message);
                    showLoading(false);
                });
        };
        
        reader.readAsArrayBuffer(file);
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