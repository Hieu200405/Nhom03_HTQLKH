const fs=require('fs'); 
const path='frontend/src/i18n/locales/vi/translation.json'; 
const data=fs.readFileSync(path,'utf8'); 
const obj=JSON.parse(data); 
fs.writeFileSync(path, JSON.stringify(obj,null,2));
