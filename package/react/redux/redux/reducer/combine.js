import { combineReducers } from "redux";

let reducers = {};
 
const rq = require.context('./', false, /\.js/);

rq.keys().forEach( key => {
    const name = key.split('/')[1];
    // 排除当前文件
    if(!__filename.includes(name)) {
        const v = rq(key);
       if( v && v.default ) {
            //  educers[file] = v.default;
            reducers = v.default;
       }
    }
});

export default combineReducers( { ...reducers } );
