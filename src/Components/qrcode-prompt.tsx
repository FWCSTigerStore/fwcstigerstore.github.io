import { RefObject, useRef, useState } from "react";
import QRCode from "react-qr-code";
import "./qrcode-prompt.css";



import * as htmlToImage from "html-to-image";

import X from "../assets/xmark.png";

type QRCodePromptProps = {
    reference: RefObject<HTMLDialogElement>;
}

function QRCodePrompt({reference}: QRCodePromptProps){
    const [qrCodeValue, setQRCodeValue] = useState("");
    const [qrIsVisible, setQRIsVisible] = useState(false);
    const qrCodeRef = useRef(null);

    const downloadQRCode = () => {
        htmlToImage
          .toPng(qrCodeRef.current)
          .then(function (dataUrl) {
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = "qr-code.png";
            link.click();
          })
          .catch(function (error) {
            console.error("Error generating QR code:", error);
          });
      };

    return (
       <dialog ref={reference}>
            <img src={X} alt="" className="XMark" onClick={() => [
              setQRCodeValue(""),
              reference.current?.close()
            ]} />
            <h2>Enter Student ID</h2>
            <input type="text" onChange={(e) => setQRCodeValue(e.target.value)} />
            <br />
            <br />
            <button onClick={() => setQRIsVisible(true)}>Generate QR Code</button>
            <br />
            <br />
           
            <div className="qrcode__download" ref={qrCodeRef}>
                <div className="qrcode__image">
                <QRCode value={qrCodeValue} size={300} />
                </div>
            </div>
              <br />
              <button onClick={() => {
                  downloadQRCode();
                  
                  
              }}>Download QR Code</button>
            
           
       </dialog>
    )
}

export default QRCodePrompt;