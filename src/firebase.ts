import { initializeApp } from 'firebase/app';
import { httpsCallable, getFunctions } from 'firebase/functions';
import {
    getAuth,EmailAuthProvider,updatePassword, signOut, createUserWithEmailAndPassword, setPersistence, onAuthStateChanged ,signInWithEmailAndPassword, browserSessionPersistence, updateProfile,
    browserLocalPersistence
} from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_PROJECTID,
    storageBucket: import.meta.env.VITE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_APPID
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);
const auth = getAuth(app);




export async function addTigerBucks(id: number, amount: number, teacherName:string){
    const addTigerBucks = httpsCallable(functions, 'addTigerBucks');
    return await addTigerBucks({"id": id, "tigerBucks": amount, "teacher": teacherName});
}

export async function getTigerBucks(id: number){
    const getTigerBucks = httpsCallable(functions, 'getTigerBucks');
    const result = await getTigerBucks({"id": id});
    return result.data;
}

export async function getStudents(grade: number){
    const getStudents = httpsCallable(functions, 'getStudents');
    const result = await getStudents({"grade": grade});
    return result.data;

}

export async function login(email: string, password: string){
    return setPersistence(auth, browserLocalPersistence).then( async () => {
        try{
            await signInWithEmailAndPassword(auth, email, password);
            console.log(auth.currentUser);
            return true;
        } catch (e){
            return false;
        }
    });
    
    
}

export async function logout(){
    return signOut(auth);
}

export async function register(email: string, password: string){
    return setPersistence(auth, browserLocalPersistence).then( async () => {

        try {
            await createUserWithEmailAndPassword(auth, email, password);

            return true;
        }
        catch (e){
            return false;
        }
    });
}

export async function isLoggedIn(setIsLoggedIn: (isLoggedIn: boolean) => void){
   onAuthStateChanged(auth, (user) => {
         if(user){
              setIsLoggedIn(true);
         } else {
              setIsLoggedIn(false);
         }
    });
   
    
}
      


