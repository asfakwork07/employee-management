import { jwtDecode } from 'jwt-decode';


export const roleGuard=(role:string)=>()=>{


const token =
localStorage.getItem('token');


if(!token)
return false;


const decoded:any =
jwtDecode(token);



return decoded.role === role;


}