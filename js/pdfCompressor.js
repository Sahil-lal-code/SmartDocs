document.addEventListener('DOMContentLoaded', function() {
    // Initialize PDF Compressor
    const pdfFileInput = document.getElementById('pdfc-file-input');
    const pdfUploadBtn = document.getElementById('pdfc-upload-btn');
    const pdfCompressBtn = document.getElementById('pdfc-compress-btn');
    const pdfDownloadBtn = document.getElementById('pdfc-download-btn');
    const pdfDropZone = document.getElementById('pdfc-drop-zone');
    const pdfQuality = document.getElementById('pdf-quality');
    const pdfRemoveMetadata = document.getElementById('pdf-remove-metadata');
    const pdfDownsampleImages = document.getElementById('pdf-downsample-images');
    
    // Check if elements exist on the page
    if (!pdfFileInput || !pdfUploadBtn || !pdfCompressBtn || !pdfDownloadBtn || !pdfDropZone) {
        return;
    }
    
    // Event listeners
    pdfUploadBtn.addEventListener('click', function() {
        pdfFileInput.click();
    });
    
    pdfFileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const fileName = file.name;
            const fileSize = formatFileSize(file.size);
            
            document.getElementById('pdfc-file-name').textContent = fileName;
            document.getElementById('pdfc-file-size').textContent = fileSize;
            
            // Get PDF page count
            const reader = new FileReader();
            reader.onload = function(event) {
                const typedArray = new Uint8Array(event.target.result);
                
                pdfjsLib.getDocument(typedArray).promise
                    .then(function(pdf) {
                        document.getElementById('pdfc-file-pages').textContent = `${pdf.numPages} pages`;
                    })
                    .catch(function(error) {
                        console.error('PDF page count error:', error);
                    });
            };
            reader.readAsArrayBuffer(file);
            
            document.getElementById('pdfc-file-info').style.display = 'block';
        }
    });
    
    pdfCompressBtn.addEventListener('click', compressPdf);
    pdfDownloadBtn.addEventListener('click', downloadCompressedPdf);
    
    // Compress PDF
    async function compressPdf() {
        const file = pdfFileInput.files[0];
        
        if (!file) {
            alert('Please select a PDF file first');
            return;
        }
        
        showLoading(true);
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            // Apply compression options based on quality setting
            switch (pdfQuality.value) {
                case 'low':
                    // Minimal compression
                    if (pdfDownsampleImages.checked) {
                        const images = await pdfDoc.getPages().reduce(async (acc, page) => {
                            const pageImages = await page.getImages();
                            return [...(await acc), ...pageImages];
                        }, []);
                        
                        for (const image of images) {
                            const imageDict = image.node;
                            const imageXObject = await pdfDoc.context.lookup(imageDict);
                            await imageXObject.normalize();
                        }
                    }
                    break;
                    
                case 'high':
                    // Aggressive compression
                    if (pdfDownsampleImages.checked) {
                        const images = await pdfDoc.getPages().reduce(async (acc, page) => {
                            const pageImages = await page.getImages();
                            return [...(await acc), ...pageImages];
                        }, []);
                        
                        for (const image of images) {
                            const imageDict = image.node;
                            const imageXObject = await pdfDoc.context.lookup(imageDict);
                            await imageXObject.normalize();
                            imageXObject.set(PDFLib.Name.of('Width'), PDFLib.Number.of(Math.floor(imageXObject.getWidth() * 0.7)));
                            imageXObject.set(PDFLib.Name.of('Height'), PDFLib.Number.of(Math.floor(imageXObject.getHeight() * 0.7)));
                        }
                    }
                    break;
                    
                case 'medium':
                default:
                    // Balanced compression
                    if (pdfDownsampleImages.checked) {
                        const images = await pdfDoc.getPages().reduce(async (acc, page) => {
                            const pageImages = await page.getImages();
                            return [...(await acc), ...pageImages];
                        }, []);
                        
                        for (const image of images) {
                            const imageDict = image.node;
                            const imageXObject = await pdfDoc.context.lookup(imageDict);
                            await imageXObject.normalize();
                            imageXObject.set(PDFLib.Name.of('Width'), PDFLib.Number.of(Math.floor(imageXObject.getWidth() * 0.85)));
                            imageXObject.set(PDFLib.Name.of('Height'), PDFLib.Number.of(Math.floor(imageXObject.getHeight() * 0.85)));
                        }
                    }
                    break;
            }
            
            // Remove metadata if requested
            if (pdfRemoveMetadata.checked) {
                pdfDoc.setTitle('');
                pdfDoc.setAuthor('');
                pdfDoc.setSubject('');
                pdfDoc.setKeywords([]);
                pdfDoc.setProducer('');
                pdfDoc.setCreator('');
                pdfDoc.setCreationDate(new Date(0));
                pdfDoc.setModificationDate(new Date(0));
            }
            
            // Save compressed PDF
            const compressedPdfBytes = await pdfDoc.save({
                useObjectStreams: true,
                // Add more compression options here if needed
            });
            
            const compressedPdfBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
            
            // Show comparison
            document.getElementById('pdfc-original-size').textContent = formatFileSize(file.size);
            document.getElementById('pdfc-compressed-size').textContent = formatFileSize(compressedPdfBlob.size);
            
            // Calculate savings
            const savings = Math.round((1 - (compressedPdfBlob.size / file.size)) * 100);
            document.getElementById('pdfc-savings').textContent = `${savings}% smaller`;
            document.getElementById('pdfc-savings').style.color = savings > 0 ? 'var(--success-color)' : 'var(--error-color)';
            
            // Get page count for compressed PDF (same as original)
            const tempPdfDoc = await PDFLib.PDFDocument.load(compressedPdfBytes);
            document.getElementById('pdfc-compressed-pages').textContent = `${tempPdfDoc.getPageCount()} pages`;
            document.getElementById('pdfc-original-pages').textContent = `${tempPdfDoc.getPageCount()} pages`;
            
            // Show result
            document.getElementById('pdfc-result').style.display = 'block';
            
            // Store blob for download
            pdfDownloadBtn.setAttribute('data-blob', URL.createObjectURL(compressedPdfBlob));
            pdfDownloadBtn.setAttribute('data-filename', file.name.replace('.pdf', '_compressed.pdf'));
            
            showLoading(false);
        } catch (error) {
            console.error('PDF compression error:', error);
            alert('Error compressing PDF: ' + error.message);
            showLoading(false);
        }
    }
    
    // Download compressed PDF
    function downloadCompressedPdf() {
        const blobUrl = this.getAttribute('data-blob');
        const fileName = this.getAttribute('data-filename');
        
        if (!blobUrl || !fileName) {
            alert('No file to download. Please compress a PDF first.');
            return;
        }
        
        fetch(blobUrl)
            .then(response => response.blob())
            .then(blob => {
                const savings = Math.round((1 - (blob.size / pdfFileInput.files[0].size)) * 100);
                downloadFile(fileName, blob);
                showSuccessMessage(fileName, formatFileSize(blob.size), savings);
            })
            .catch(error => {
                console.error('Download error:', error);
                alert('Error downloading file: ' + error.message);
            });
    }
});