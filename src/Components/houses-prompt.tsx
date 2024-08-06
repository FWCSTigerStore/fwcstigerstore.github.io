import { RefObject, useRef, useState } from "react";

import "./houses-prompt.css";





import X from "../assets/xmark.png";

type HousesPromptProps = {
    reference: RefObject<HTMLDialogElement>;
    houses: JSON[];
    teacherName: string;
}

function HousesPrompt({reference, houses, teacherName}: HousesPromptProps){
  const [selectedHouse, setSelectedHouse] = useState(-1);
  const [amount, setAmount] = useState(0);
  const [isGiving, setIsGiving] = useState(false);


    return (
       <dialog ref={reference} className="HousesPrompt">
            <img src={X} alt="" className="XMark" onClick={() => [
              setSelectedHouse(-1),
              setAmount(0),
              reference.current?.close()
            ]} />
            <h2>{selectedHouse == -1 ? "Select House" : "Enter amount to give"}</h2>
            <label htmlFor="houses">House: </label>
            <select name="houses" id="houses" value={selectedHouse} onChange={(e) => {
              setSelectedHouse(parseInt(e.target.value))
            }}>
              <option value={-1}>Select House</option>
              {houses.map((house, i) => {
                return <option value={i} key={house.name}>{house.name}</option>
              })}
            </select>
            <br />

            {selectedHouse == -1 ? <>
            <br /></> : <>
            <h3>Tiger Bucks: {houses[selectedHouse].points}</h3>
            <label htmlFor="">Amount to give: </label>
            <input type="number" onChange={(e) => setAmount(parseInt(e.target.value))} value={amount}/>
            <br />
            <br />

            { isGiving ? 
            <div className="center"><div className="loader"></div></div>
            : <button className="actionBtn" onClick={async () => {

                  setIsGiving(true);
                  await fetch('https://tiger-store-server.onrender.com/tbHouses', {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: JSON.stringify({id: houses[selectedHouse].id, tigerBucks: amount, teacher: teacherName}),
                    // body: '{"url":"https://www.theguardian.com/world/2020/oct/24/thousands-join-poland-protests-against-strict-abortion-laws"}'
                  })
                  setIsGiving(false);
                  setAmount(0);
                  setSelectedHouse(-1);

                  reference.current?.close();
                  alert("Tiger Bucks Given!");
                  
              }}>Give Tiger Bucks to House</button>}
            </>}
            

            
            
           
       </dialog>
    )
}

export default HousesPrompt;