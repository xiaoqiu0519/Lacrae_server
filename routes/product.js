var express = require("express");
var router = express.Router();
const path = require('path');
const pathLib = require('path');
const multer = require("multer");
const fs = require("fs");
const filepath = './public/database/imgdata.json';
const uploadimg = multer({dest:'./public/images'});
var routerpath = path.join(__dirname,'../')
const readFilefun = () =>{
  return new Promise((resolve,reject)=>{
    fs.exists('public/database',(exists)=>{
      if(!exists){
        fs.mkdir('public/database',{ recursive: true },(err)=>{
          fs.writeFile(filepath,null,(err,data)=>{
            if(err){
              reject(err)
            }
            resolve()
          });
        })
        return;
      }
      fs.exists(filepath,(exists)=>{
        if(exists){
          fs.readFile(filepath,(err,data)=>{
            if(err){
              reject(err)
            }
            let list = (data.toString() != 'null' && data.toString()) ? JSON.parse(data.toString()) : [];
            if(list){
              for (const key in list) {
                list[key].sort((a,b)=>{
                  if (Number(a.sort) < Number(b.sort)) {
                    return -1;
                  } else if (a.sort == b.sort) {
                    return 0;
                  } else {
                    return 1;
                  }
                })
              }
            }
            resolve(list)
          })
        }else{
          fs.writeFile(filepath,null,(err,data)=>{
            if(err){
              reject(err)
            }
            resolve()
          });
        }
      })
    })
  })
}
const writeFileFun =(filepath,str)=>{
  return new Promise((resolve,reject)=>{
    fs.writeFile(filepath,JSON.stringify(str),function(err){
      if(err){
        reject(err)
      }
      resolve()
    })
  })
  
}


router.post('/add', uploadimg.fields([
  {name:'small_ch'},
  {name:'small_en'},
  {name:'small_jp'},
  {name:'detail_h5_ch'},
  {name:'detail_h5_en'},
  {name:'detail_h5_jp'},
  {name:'detail_pc_ch'},
  {name:'detail_pc_en'},
  {name:'detail_pc_jp'}
]) , (req,res,next)=>{
  readFilefun().then((data)=>{
    let redisobj = {}
    let obj = {
      1:{},
      2:{},
      3:{}
    }
    const { sort } = req.body
    for (const key in req.files) {
      let newName = req.files[key][0].path + pathLib.parse(req.files[key][0].originalname).ext;
      redisobj[req.files[key][0].fieldname] = newName;
      fs.rename(req.files[key][0].path,newName,function(err){
        if(err)throw err
      });
    }
    let time = new Date().getTime()
    obj[1]['id'] = time;
    obj[2]['id'] = time;
    obj[3]['id'] = time;
    if(sort)obj[1][sort] = sort;
    if(sort)obj[2][sort] = sort;
    if(sort)obj[3][sort] = sort;
    obj[1]['small_ch'] = redisobj.small_ch;
    obj[2]['small_en'] = redisobj.small_en;
    obj[3]['small_jp'] = redisobj.small_jp;
    obj[1]['detail_h5_ch'] = redisobj.detail_h5_ch;
    obj[2]['detail_h5_en'] = redisobj.detail_h5_en;
    obj[3]['detail_h5_jp'] = redisobj.detail_h5_jp;
    obj[1]['detail_pc_ch'] = redisobj.detail_pc_ch;
    obj[2]['detail_pc_en'] = redisobj.detail_pc_en;
    obj[3]['detail_pc_jp'] = redisobj.detail_pc_jp;
    if(!data || data.length == 0){
      data = {
        1:[],
        2:[],
        3:[]
      }
    }
    data[1].push(obj[1])
    data[2].push(obj[2])
    data[3].push(obj[3])
    writeFileFun(filepath,data).then((data)=>{
      res.json({
        error:'0000',
        message:'添加成功'
      })
    })
  })
})

router.post('/update',(req,res,next)=>{
  const { id , sort } = req.body;
  readFilefun().then((data)=>{
    if(!id){
      res.json({
        error:'0001',
        message:'id不能为空'
      })
      return;
    }
    let obj = {
      1:[],
      2:[],
      3:[]
    }
    for (const key in data) {
      data[key].forEach((m,n)=>{
        if( Number(m.id) == Number(id)){
          m.sort = sort;
        }
        obj[key].push(m);
      })
    }
    writeFileFun(filepath,obj).then((data)=>{
      res.json({
        error:'0000',
        message:'修改成功'
      })
    })
  })
})
router.get('/delete',(req,res,next)=>{
  const { id } = req.query;
  readFilefun().then((data)=>{
    if(!id){
      res.json({
        error:'0001',
        message:'id不能为空'
      })
      return;
    }
    let obj = {
      1:[],
      2:[],
      3:[]
    }
    for (const key in data) {
      data[key].forEach((m,n)=>{
        if( Number(m.id) != Number(id)){
          obj[key].push(m)
        }else{
          for (const argument in m) {
            fs.exists(`${routerpath}${m[argument]}`,(exists)=>{
              if(exists){
                fs.unlink(`${routerpath}${m[argument]}`,(err)=>{
                  if(err){
                    console.log(err)
                  }
                  
                })
              }
            })
            
          }
        }
      })
    }
    writeFileFun(filepath,obj).then((data)=>{
      res.json({
        error:'0000',
        message:'删除成功'
      })
    })
  })
})
router.get('/getlist',(req,res,next)=>{
  readFilefun().then((data)=>{
    res.json({
      error:'0000',
      data
    })
  })
})
module.exports = router;
