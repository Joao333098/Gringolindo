import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode } from 'lucide-react';

const PixPayment = ({ amount, copyPasteCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540410.005802BR5913Kaeli System6008Brasilia62070503***6304ABCD" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyPasteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-void-surface p-6 rounded-lg border border-void-border max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6 text-cyber-green">
        <QrCode size={24} />
        <h3 className="text-xl font-mono font-bold">Pagamento via Pix</h3>
      </div>

      <div className="bg-white p-4 rounded-lg w-fit mx-auto mb-6">
         <QRCodeSVG value={copyPasteCode} size={200} />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-text-secondary">
          <span>Valor Total</span>
          <span className="text-2xl font-bold text-white">R$ {amount.toFixed(2)}</span>
        </div>

        <div className="bg-void-highlight p-3 rounded border border-void-border flex items-center justify-between gap-2">
            <code className="text-xs text-text-dim break-all line-clamp-1">{copyPasteCode}</code>
            <button
                onClick={handleCopy}
                className="p-2 hover:bg-void-border rounded transition-colors text-cyber-red"
            >
                {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
        </div>

        <p className="text-xs text-center text-text-dim animate-pulse">
            Aguardando confirmação do pagamento...
        </p>
      </div>
    </div>
  );
};

export default PixPayment;
