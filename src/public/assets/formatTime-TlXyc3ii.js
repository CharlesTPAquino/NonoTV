function n(r){if(r==null||isNaN(r))return"N/A";const o=Math.floor(r/60),f=Math.floor(r%60);return o>0?`${o}h ${f}m`:`${f}m`}export{n as f};
