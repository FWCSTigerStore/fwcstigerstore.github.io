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
import { getTigerBucks, isLoggedIn, login, logout, register } from './firebase';



// To use Html5Qrcode (more info below)



function App() {
  const qrCodeDialog = useRef<HTMLDialogElement>(null)
  const removeBucksDialog = useRef<HTMLDialogElement>(null)
  const housesDialog = useRef<HTMLDialogElement>(null)
  const studentsDialog = useRef<HTMLDialogElement>(null)

  const [studentId, setStudentId] = useState(0)
  const [studentName, setStudentName] = useState('')
  const [email, setEmail] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [teacherName, setTeacherName] = useState('')
  const [password, setPassword] = useState('')
  const [isScanning, setIsScanning] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [studentTigerBucks, setStudentTigerBucks] = useState(0)
  const [houses, setHouses] = useState([])
  const [students, setStudents] = useState([])
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    async function login(){
      //Get local storage
      await isLoggedIn(setLoggedIn)
      const localData = localStorage.getItem('tigerStoreLogin')
      if(localData){
        const data = JSON.parse(localData)
        //Check if data is valid
        if(data){
        //Check if id is valid

          const name = data.name
         
        

          setTeacherName(name)
          
         
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
              const numTigerBucks = await getTigerBucks(parseInt(decodeText.split('|')[1]))
              console.log(numTigerBucks);
              setStudentTigerBucks(parseInt(await numTigerBucks as string))
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
      <button className='actionBtn' onClick={async() => {
        localStorage.removeItem('tigerStoreLogin')
        await logout()
        setLoggedIn(false)
      }}>Log Out</button>
      <QRCodePrompt reference={qrCodeDialog} />
      <StudentsPrompt reference={studentsDialog} teacherName={teacherName}/>
      <GiveTigerBucksPrompt reference={removeBucksDialog} id={studentId} isScanning={isScanning} teacherName={teacherName} studentName={studentName} studentTigerBucks={studentTigerBucks}/>
      <HousesPrompt reference={housesDialog} houses={houses} teacherName={teacherName}/>
    </> : isRegistering ? <div className='Login'>
      <h1>Create Account</h1>
      <input type='text' placeholder='Full Name' onChange={(e) => {
        setTeacherName(e.target.value)
      }}/>
      <input type='text' placeholder='Email' onChange={(e) => {
        setEmail(e.target.value)
      }}/>

      <input type='password' placeholder='Password' onChange={(e) => {
        setPassword(e.target.value)
      }}/>
     {isLoggingIn ?  <div className="center"><div className="loader"></div></div> : <button className="actionBtn" onClick={async () => {
        setIsLoggingIn(true)
        if(password.length < 6){
          setIsLoggingIn(false)
          alert('Password must be at least 6 characters')
          return
        }
        const checkPassword = await register(email, password)
        if(!checkPassword){
          setIsLoggingIn(false)
          alert('Unable to create account, try again')
          return
        }

        setIsLoggingIn(false)
        setTeacherName(teacherName)
        setLoggedIn(true)
        localStorage.setItem('tigerStoreLogin', JSON.stringify({name: teacherName}))
      }}>Create Account</button>
      }
      <button className='actionBtn' onClick={() =>{
        setIsRegistering(false)
      }}>Login</button>
      </div> :<div className='Login'>
      <h1>Login</h1>
      <input type='text' placeholder='Full Name' onChange={(e) => {
        setTeacherName(e.target.value)
      }}/>
      <input type='text' placeholder='Email' onChange={(e) => {
        setEmail(e.target.value)
      }}/>

      <input type='password' placeholder='Password' onChange={(e) => {
        setPassword(e.target.value)
      }}/>
     {isLoggingIn ?  <div className="center"><div className="loader"></div></div> : <button className="actionBtn" onClick={async () => {
        setIsLoggingIn(true)
        const checkPassword = await login(email, password)
        if(!checkPassword){
          setIsLoggingIn(false)
          alert('Wrong email or password')
          return
        }

        setIsLoggingIn(false)
        setTeacherName(teacherName)
        setLoggedIn(true)
        localStorage.setItem('tigerStoreLogin', JSON.stringify({name: teacherName}))
      }}>Login</button>}
      <button className='actionBtn' onClick={() =>{
        setIsRegistering(true)
      }}>Create an Account</button>
      </div>}
    </>
  )
}

export default App
