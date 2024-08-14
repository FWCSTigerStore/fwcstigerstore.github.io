import { RefObject, useRef, useState } from "react";

import "./students-prompt.css";





import X from "../assets/xmark.png";
import { get } from "http";
import { addTigerBucks, getStudents } from "@/firebase";

type StudentsPromptProps = {
    reference: RefObject<HTMLDialogElement>;

    teacherName: string;
}

function StudentsPrompt({reference, teacherName}: StudentsPromptProps){
  const [selectedGrade, setSelectedGrade] = useState(-1);
  const [selectedStudent, setSelectedStudent] = useState(-1);
  const [amount, setAmount] = useState(0);
  const [isGiving, setIsGiving] = useState(false);
  const [students, setStudents] = useState([]);


    return (
       <dialog ref={reference} className="StudentsPrompt">
            <img src={X} alt="" className="XMark" onClick={() => [
             setAmount(0),
             setSelectedGrade(-1),
             setSelectedStudent(-1),
             setStudents([]),
              reference.current?.close()
            ]} />
            <h2>{selectedGrade == -1 ? "Select Grade" : selectedStudent == -1 ? "Select Student" : "Enter amount to give"}</h2>
            <label htmlFor="grades">Grades: </label>
            <select name="grades" id="grades" value={selectedGrade} onChange={async (e) => {
              setSelectedGrade(parseInt(e.target.value))
              if(parseInt(e.target.value) == -1){
                return
              }
              const studentsJson = await getStudents(parseInt(e.target.value))
              const students = JSON.parse(studentsJson as string)
              console.log(students)
              setStudents(students)

            }}>
              <option value={-1}>Select Grade</option>
              <option value={6}>6th Grade</option>
              <option value={7}>7th Grade</option>
              <option value={8}>8th Grade</option>
            </select>
            <br />
            {selectedGrade != -1 && students.length != 0 ? <>
            <label htmlFor="students">Students: </label>
            <select name="students" id="students" value={selectedStudent} onChange={(e) => {
              setSelectedStudent(parseInt(e.target.value))
            }}>
              <option value={-1}>Select Student</option>
              {students.map((student, i) => {
                return <option value={i} key={student.name}>{student.name}</option>
              })}
            </select>
            <br /></> : <></>}

            {selectedStudent == -1 ? <>
            <br /></> : <>
            <h3>Tiger Bucks: {students[selectedStudent].points}</h3>
            <label htmlFor="">Amount to give: </label>
            <input type="number" onChange={(e) => setAmount(parseInt(e.target.value))} value={amount}/>
            <br />
            <br />

            { isGiving ? 
            <div className="center"><div className="loader"></div></div>
            : <button className="actionBtn" onClick={async () => {

                  setIsGiving(true);
                  await addTigerBucks(students[selectedStudent].id, amount, teacherName);
                  setIsGiving(false);
                  setAmount(0);
                  setSelectedGrade(-1);
                  setSelectedStudent(-1);
                  setStudents([]);
                  reference.current?.close();
                  alert("Tiger Bucks Given!");
                  
              }}>Give Tiger Bucks to Student</button>}
            </>}
            

            
            
           
       </dialog>
    )
}

export default StudentsPrompt;