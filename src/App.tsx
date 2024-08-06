import { useEffect, useRef, useState } from 'react'


import './App.css'

import QRCodePrompt from './Components/qrcode-prompt'

// import { JWT } from 'google-auth-library';

import GiveTigerBucksPrompt from './Components/giveBucks-prompt'
import {Html5Qrcode} from "html5-qrcode";
import { json } from 'stream/consumers';
import HousesPrompt from './Components/houses-prompt';
import StudentsPrompt from './Components/students-prompt';
import { ComboboxDemo } from './Components/combobox';



// To use Html5Qrcode (more info below)



function App() {
  const qrCodeDialog = useRef<HTMLDialogElement>(null)
  const removeBucksDialog = useRef<HTMLDialogElement>(null)
  const housesDialog = useRef<HTMLDialogElement>(null)
  const studentsDialog = useRef<HTMLDialogElement>(null)

  const [studentId, setStudentId] = useState(0)
  const [studentName, setStudentName] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [teacherName, setTeacherName] = useState('')
  const [password, setPassword] = useState('')
  const [isScanning, setIsScanning] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [studentTigerBucks, setStudentTigerBucks] = useState(0)
  const [houses, setHouses] = useState([])
  const [students, setStudents] = useState([])

  useEffect(() => {
    async function login(){
      //Get local storage
      const localData = localStorage.getItem('tigerStoreLogin')
      if(localData){
        const data = JSON.parse(localData)
        //Check if data is valid
        if(data){
        //Check if id is valid
          const id = data.id
          const name = data.name
          const checkID = await fetch('https://tiger-store-server.onrender.com/login', {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({id: id, name: name})
          })
        
          if(checkID.status === 200){
            setLoggedIn(true)
            setTeacherName(name)
          } else {
            localStorage.removeItem('tigerStoreLogin')
          }
        }
      }
    }
    login()
  }, [])
  

  return (
    <>
    {loggedIn ? <>
      <button className='actionBtn' onClick={async () => {
        qrCodeDialog.current?.showModal()
       
      }}>Create QR Code</button>
      <br />
      <br />
      
      <button className='actionBtn' onClick={() => {
          setIsScanning(true)
          removeBucksDialog.current?.showModal()
          //Wait two seconds
          setTimeout(() => {
            
            const html5QrCode = new Html5Qrcode("reader");
  
          
            async function onScanSuccess(decodeText, decodeResult) {
              if (decodeText === null) {
                  return;
              }
              console.log(`Scan result: ${decodeText}`, decodeResult);
              html5QrCode.stop();
              const numTigerBucks = await fetch('https://tiger-store-server.onrender.com/getTb', {
                method: 'POST',
                mode: 'cors',
                headers: {
                  
                  'Content-Type': 'application/x-www-form-urlencoded',
                 
                },
                body: JSON.stringify({id: decodeText.split('|')[1]})
              })
              console.log(numTigerBucks);
              setStudentTigerBucks(parseInt(await numTigerBucks.text()))
              setStudentId(decodeText.split('|')[1])
              setStudentName(decodeText.split('|')[0])
              setIsScanning(false);
              console.log(`Scan result: ${decodeText}`, decodeResult);
          
              
              
            } 
        
  
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  
  
  
        // If you want to prefer back camera
        html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess);
           
  
          }, 100)
         
      }}>Scan QR Code</button>
      {/* <br />

      <br />
      <button className='actionBtn' onClick={async() => {
        const housesJson = await fetch('https://tiger-store-server.onrender.com/getHouses', {
          method: 'POST',
          mode: 'cors',
          headers: {
            
            'Content-Type': 'application/x-www-form-urlencoded',
           
          },

        })
        const houses = JSON.parse(await housesJson.text())
        console.log(houses)
        setHouses(houses)
        housesDialog.current?.showModal()
      }}>Give Tiger Bucks to a House</button> */}
      <br /><br />
      <button className='actionBtn' onClick={async() => {
        
        console.log(students)
        setStudents(students)
        studentsDialog.current?.showModal()
      }}>Give Student Tiger Bucks</button>
      <br /> <br />
      <button className='actionBtn' onClick={() => {
        localStorage.removeItem('tigerStoreLogin')
        setLoggedIn(false)
      }}>Log Out</button>
      <QRCodePrompt reference={qrCodeDialog} />
      <StudentsPrompt reference={studentsDialog} teacherName={teacherName}/>
      <GiveTigerBucksPrompt reference={removeBucksDialog} id={studentId} isScanning={isScanning} teacherName={teacherName} studentName={studentName} studentTigerBucks={studentTigerBucks}/>
      <HousesPrompt reference={housesDialog} houses={houses} teacherName={teacherName}/>
    </> : <div className='Login'>
      <h1>Login</h1>
      <input type='text' placeholder='Full Name' onChange={(e) => {
        setTeacherName(e.target.value)
      }}/>

      <input type='password' placeholder='Password' onChange={(e) => {
        setPassword(e.target.value)
      }}/>
     {isLoggingIn ?  <div className="center"><div className="loader"></div></div> : <button className="actionBtn" onClick={async () => {
        setIsLoggingIn(true)
        const checkPassword = await fetch('https://tiger-store-server.onrender.com/password', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({password: password, name: teacherName})
        })

        if(checkPassword.status !== 200){
          alert('Incorrect Password')
          setIsLoggingIn(false)
          return
        }

        const id = await checkPassword.text();
        setIsLoggingIn(false)
        setTeacherName(teacherName)
        setLoggedIn(true)
        localStorage.setItem('tigerStoreLogin', JSON.stringify({id: id, name: teacherName}))
      }}>Login</button>}
      </div>}
    </>
  )
}

export default App
