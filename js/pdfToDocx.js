document.addEventListener('DOMContentLoaded', function() {
    // Initialize PDF to DOCX converter
    const pdfFileInput = document.getElementById('pdf-file-input');
    const pdfUploadBtn = document.getElementById('pdf-upload-btn');
    const pdfConvertBtn = document.getElementById('pdf-convert-btn');
    const pdfDownloadBtn = document.getElementById('pdf-download-btn');
    const pdfDropZone = document.getElementById('pdf-drop-zone');
    
    // Check if elements exist on the page
    if (!pdfFileInput || !pdfUploadBtn || !pdfConvertBtn || !pdfDownloadBtn || !pdfDropZone) {
        return;
    }
    
    // Event listeners
    pdfUploadBtn.addEventListener('click', function() {
        pdfFileInput.click();
    });
    
    pdfFileInput.addEventListener('change', function() {
        showFileInfo('pdf-file-input', 'pdf-file-info');
    });
    
    pdfConvertBtn.addEventListener('click', convertPdfToDocx);
    pdfDownloadBtn.addEventListener('click', downloadConvertedDocx);
    
    // Set up PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
    
    // Convert PDF to DOCX
    function convertPdfToDocx() {
        const file = pdfFileInput.files[0];
        
        if (!file) {
            alert('Please select a PDF file first');
            return;
        }
        
        showLoading(true);
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const typedArray = new Uint8Array(event.target.result);
            
            // Load PDF document
            pdfjsLib.getDocument(typedArray).promise
                .then(function(pdf) {
                    let textContent = '';
                    
                    // Extract text from each page
                    const extractPageText = function(pageNum) {
                        return pdf.getPage(pageNum).then(function(page) {
                            return page.getTextContent().then(function(textContentObj) {
                                const pageText = textContentObj.items.map(item => item.str).join(' ');
                                textContent += pageText + '\n\n';
                            });
                        });
                    };
                    
                    // Process all pages sequentially
                    const pagePromises = [];
                    for (let i = 1; i <= pdf.numPages; i++) {
                        pagePromises.push(extractPageText(i));
                    }
                    
                    return Promise.all(pagePromises).then(() => textContent);
                })
                .then(function(textContent) {
                    // Create a simple DOCX-like structure (simulated)
                    const docxContent = `
                        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                            <w:body>
                                <w:p>
                                    <w:r>
                                        <w:t>${textContent}</w:t>
                                    </w:r>
                                </w:p>
                            </w:body>
                        </w:document>
                    `;
                    
                    // Create a blob with the DOCX content
                    const blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                    
                    // Show result
                    const fileName = file.name.replace('.pdf', '.docx');
                    const fileSize = formatFileSize(blob.size);
                    
                    showConversionResult('pdf-result', fileName, fileSize);
                    
                    // Store blob for download
                    pdfDownloadBtn.setAttribute('data-blob', URL.createObjectURL(blob));
                    pdfDownloadBtn.setAttribute('data-filename', fileName);
                    
                    showLoading(false);
                })
                .catch(function(error) {
                    console.error('Conversion error:', error);
                    alert('Error converting PDF to DOCX: ' + error.message);
                    showLoading(false);
                });
        };
        
        reader.readAsArrayBuffer(file);
    }
    
    // Download converted DOCX
    function downloadConvertedDocx() {
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