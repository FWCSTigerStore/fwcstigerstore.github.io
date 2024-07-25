import { RefObject, useEffect, useRef, useState } from "react";
import "./giveBucks-prompt.css";

import X from "../assets/xmark.png";

type GiveTigerBucksPromptProps = {
    reference: RefObject<HTMLDialogElement>;
    id: number;
    isScanning: boolean;
    teacherName: string;
    studentName: string;
    studentTigerBucks: number;

}

function GiveTigerBucksPrompt({reference, id, isScanning, teacherName, studentName, studentTigerBucks}: GiveTigerBucksPromptProps){
    const [amount, setAmount] = useState(0);
    const [isGiving, setIsGiving] = useState(false);

    async function changeTigerBucks(){
      //https post to remove bucks
      setIsGiving(true);
      await fetch('https://tiger-store-server.onrender.com/tb', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({id: id, tigerBucks: amount, teacher: teacherName}),
        // body: '{"url":"https://www.theguardian.com/world/2020/oct/24/thousands-join-poland-protests-against-strict-abortion-laws"}'
      })
      setIsGiving(false);
      setAmount(0);
      reference.current?.close();
      alert("Tiger Bucks Given!");
    }


    

    return (
       <dialog ref={reference} className="GiveBucksPrompt">
         <img src={X} alt="" className="XMark" onClick={() => [
              setAmount(0),
              reference.current?.close()
            ]} />
            <h2>Read QR Code</h2>
            
            { isScanning ?
            <div className="center"><div id="reader">
            </div></div> 
            : 
            <>
            <h3>Student: {studentName}</h3>
            <h3>Tiger Bucks: {studentTigerBucks}</h3>
            <label htmlFor="">Amount to give (use negative for removing): </label>
            <input type="number" onChange={(e) => setAmount(e.target.value)} value={amount}/>
            <br />
            <br />

            { isGiving ? 
            <div className="center"><div className="loader"></div></div>
            : <button className="actionBtn" onClick={() => {
                changeTigerBucks();

            }}>Give Tiger Bucks</button>}
            </>}

            
            
       </dialog>
    )
}

export default GiveTigerBucksPrompt;