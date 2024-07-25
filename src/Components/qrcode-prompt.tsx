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
    const [name, setName] = useState("");
    const [id, setId] = useState("");
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
       <dialog ref={reference} className="QRPrompt">
            <img src={X} alt="" className="XMark" onClick={() => [
              setQRCodeValue(""),
              reference.current?.close()
            ]} />
            <h2>Enter Student Info</h2>
            <label htmlFor="">Name: </label>
            <input type="text" onChange={(e) =>{
                setName(e.target.value)
              setQRCodeValue(`${e.target.value}|${id}`)}} placeholder="Name"/>
            <br />
            <br />
            <label htmlFor="">Id: </label>

            <input type="text" onChange={(e) => {setId(e.target.value)
              setQRCodeValue(`${name}|${e.target.value}`)}} placeholder="Id"/>
            <br />
            <br />
           
            <div className="qrcode__download" ref={qrCodeRef}>
                <div className="qrcode__image">
                <QRCode value={qrCodeValue} size={100} />
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