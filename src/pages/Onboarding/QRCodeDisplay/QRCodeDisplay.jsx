import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRCodeDisplay = ({ email }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const qrValue = `https://payment.isfc.com/qr/${email || 'user'}`;
      QRCode.toCanvas(canvasRef.current, qrValue, {
        width: 256,
        margin: 1,
        color: {
          dark: '#000',
          light: '#fff'
        }
      });
    }
  }, [email]);

  return (
    <div className="qr-code-container glass-panel p-4 mt-6 text-center">
      <h3 className="mb-4">Scan QR Code to Pay</h3>
      <div className="qr-code-wrapper">
        <canvas ref={canvasRef}></canvas>
      </div>
      <p className="text-sm mt-4 text-muted">Please scan this QR code with your preferred payment app</p>
    </div>
  );
};

export default QRCodeDisplay;
