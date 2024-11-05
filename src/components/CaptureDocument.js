import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import Spinner from './Spinner';

const CaptureDocument = () => {
  const [data, setData] = useState(null);
  const [extractedData, setExtractedData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const handleOnChange = (e) => {
    setData(e.target.files[0]);
  };

  const preprocessImage = (imageSrc) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convert to grayscale and increase contrast
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = avg; // Set R, G, B to avg
        }

        // Optional: Adjust contrast (reduce dark pixels)
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] < 128 ? data[i] * 0.5 : data[i]; // Reduce dark pixels
          data[i + 1] = data[i + 1] < 128 ? data[i + 1] * 0.5 : data[i + 1];
          data[i + 2] = data[i + 2] < 128 ? data[i + 2] * 0.5 : data[i + 2];
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data) {
      setError('Please upload a valid document.');
      return;
    }

    const fileType = data.type;

    if (fileType === 'application/pdf') {
      setError('PDF files are not supported. Please upload an image file.');
      setLoading(false);
      setShowError(true);
      return;
    }

    if (!fileType.startsWith('image/')) {
      setError('Invalid file type. Please upload an image (e.g., .jpg, .jpeg, .png).');
      setLoading(false);
      setShowError(true);
      return;
    }

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const preprocessedImage = await preprocessImage(reader.result);
        console.log('Preprocessed Image:', preprocessedImage); // Log preprocessed image data

        const { data: { text } } = await Tesseract.recognize(preprocessedImage, 'eng', {
          logger: (m) => console.log(m),
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        });

        console.log('Extracted Text:', text); // Log extracted text
        setExtractedData(text.trim());
        setLoading(false);
      } catch (err) {
        console.error('Error during OCR process:', err);
        setError('An unexpected error occurred while processing the document. Please try again later.');
        setShowError(true);
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading the file');
      setLoading(false);
      setShowError(true);
    };

    reader.readAsDataURL(data);
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 md:p-12 lg:p-16 max-w-3xl mx-auto">
      <form className="w-full bg-white shadow-md rounded p-6 md:p-8 lg:p-10 space-y-6">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-center">Capture Driving Licence Information</h1>
        <hr />
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleOnChange} 
          className="block w-full p-2 border border-gray-300 rounded-md"
        />
        <button 
          type='submit' 
          onClick={handleSubmit} 
          disabled={loading} 
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? <Spinner /> : 'Extract Details'}
        </button>
        {error && showError && (
          <div className="text-red-600 border border-red-400 p-4 rounded-md bg-red-50">
            <p>{error}</p>
            <button 
              onClick={() => setShowError(false)} 
              className="mt-2 bg-red-100 px-3 py-1 rounded-md"
            >
              Close
            </button>
          </div>
        )}
        {extractedData && (
          <div className="mt-6 bg-gray-100 p-4 rounded-md overflow-x-auto">
            <h3 className="text-lg font-semibold">Extracted Key Details:</h3>
            <pre className="whitespace-pre-wrap text-sm md:text-base">
              {typeof extractedData === 'object' ? JSON.stringify(extractedData, null, 2) : extractedData}
            </pre>
          </div>
        )}
      </form>
    </div>
  );
};

export default CaptureDocument;
