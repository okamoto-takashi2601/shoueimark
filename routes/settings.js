const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {getDoc ,doc,setDoc,  updateDoc , db } =  require('../utils/fb');
const { isLoggedIn } = require('../middleware');

const {GoogleAuth} = require('google-auth-library');
const {google} = require('googleapis');


//get subcontractors list
router.get('/subcontractors',isLoggedIn, catchAsync(async (req, res) =>{
    getData(req, res, "subcontractors")
}));
//to add new subcontractors
router.post('/subcontractors',isLoggedIn,  catchAsync(async (req, res) => {
    let setData = {
        cus_id : Number(req.body.cus_id),
        cus_name : req.body.cus_name,
        process : [req.body.process],
    }

     try {
        const docRef = doc(db, 'WB_1212様', "subcontractors");
        const _subcontractors = await getDoc(docRef);
        let subcontractors = _subcontractors.data();
        let set_subcontractor_name = setData.cus_id
        subcontractors[set_subcontractor_name] = setData;
        await updateDoc(docRef, subcontractors);

        res.redirect('/settings/subcontractors');  
    } catch (error) {
        console.error("Error creating material", error);
    }
}));

//to delete a subcontractors
router.delete('/subcontractors/:id', isLoggedIn, catchAsync(async (req, res) => {
    const cus_id = req.params.id; 
    const docRef = doc(db, 'WB_1212様', 'subcontractors'); 
    const _subcontractors = await getDoc(docRef);

    if (_subcontractors.exists()) {
        let subcontractors = _subcontractors.data();
        const filteredItems = filterOutItem(subcontractors, cus_id, "cus_id"); 
        await setDoc(docRef, filteredItems);
        res.redirect('/settings/subcontractors');
    } else {
        console.error('Error deleting a subcontractor');
    }
}));

//to add new customer
router.post('/customers',isLoggedIn,  catchAsync(async (req, res) => {
    const setData = {
        cus_folder_id : "",
        status : "0-見積",
        cus_id : req.body._cus_id,
        cus_name : req.body._cus_name,
        delivery : req.body._delivery,
        note : req.body._note,
    }
    const folderName = req.body._cus_id + "_" + req.body._cus_name.replace(/[^\w]/g, ""); // 顧客名から特殊文字を削除
     try {
        setData["cus_folder_id"] = await createFolder(folderName, "0ANHa0DNbTbTsUk9PVA"); // 非同期関数の呼び出しをawaitで待機

        const docRef = doc(db, 'WB_1212様', "customers");
        const _customers = await getDoc(docRef);
        let customers = _customers.data();
        customers[String(req.body._cus_id)] = setData;
        await updateDoc(docRef, customers);

        res.redirect('/settings/customers'); // リダイレクト先のパスを修正
    } catch (error) {
        console.error("Error creating customer folder:", error);
        res.status(500).send("Error creating customer folder"); // エラーが発生した場合のレスポンスを追加
    }
}));

//get customer list
router.get('/customers',isLoggedIn, catchAsync(async (req, res) =>{
    getData(req, res, "customers")

}));

//to update a customer
router.put('/customers/:id', isLoggedIn, catchAsync(async (req, res) => {
    const cus_id = req.params.id;  
    const vals = req.body;  
    vals["status"] ="0-見積"
    const docRef = doc(db, 'WB_1212様', 'customers'); 
    const _customers = await getDoc(docRef);
    if (_customers.exists()) {
        console.log(req.body)
        let customers = _customers.data();
        customers[String(cus_id)] = vals;
        await updateDoc(docRef, customers);
        res.redirect('/settings/customers');
    } else {
        console.error('Error updating document');
    }
}));

//to delete a customer
router.delete('/customers/:id', isLoggedIn, catchAsync(async (req, res) => {
    const cus_id = req.params.id; // ルーターパラメーターから顧客IDを取得

    const docRef = doc(db, 'WB_1212様', 'customers'); 
    const _customers = await getDoc(docRef);

    if (_customers.exists()) {
        let customers = _customers.data();
        const filteredItems = filterOutItem(customers, cus_id, "cus_id"); 
        await setDoc(docRef, filteredItems);
        res.redirect('/settings/customers');
    } else {
        console.error('Error deleting a customer');
    }
}));


//to add new material / material customer
router.post('/materials',isLoggedIn,  catchAsync(async (req, res) => {
    let kind = req.query.kind
    let setData = {}
    if(kind == "customer"){
        setData = {
            cus_id : Number(req.body.new_cus_id_2),
            cus_name : req.body.new_cus_name_2,
            material_name : "未登録",
            type : "",
            x : 0,
            y : 0,
            z : 0,
            price : 0,
            ma : false,
            pf : false,
            lm : false,
            se : false,
            wf : false,
            ms : false,
            remark : ""
        }
    }else{
        setData = {
            cus_id : Number(req.body.new_cus_id),
            cus_name : req.body.new_cus_name,
            material_name : req.body.new_material_name,
            type : req.body.new_type=="on"?"Roll":"",
            x : Number(req.body.new_x),
            y : Number(req.body.new_y),
            z : Number(req.body.new_z),
            price : Number(req.body.new_price),
            ma : req.body.new_ma == "on"?true:false,
            pf : req.body.new_pf == "on"?true:false,
            lm : req.body.new_lm == "on"?true:false,
            se : req.body.new_se == "on"?true:false,
            wf : req.body.new_wf == "on"?true:false,
            ms : req.body.new_ms == "on"?true:false,
            remark : req.body.new_remark,
        }
    }
     try {
        const docRef = doc(db, 'WB_1212様', "materials");
        const _materials = await getDoc(docRef);
        let materials = _materials.data();
        let set_material_name = setData.cus_id + "_" +  random_name()
        materials[set_material_name] = setData;
        await updateDoc(docRef, materials);

        res.redirect('/settings/materials');  
    } catch (error) {
        console.error("Error creating material", error);
    }
}));

// get material list
router.get('/materials', isLoggedIn, catchAsync(async (req, res) => {
    const docRef = doc(db, 'WB_1212様', 'materials');
    const materialsDoc = await getDoc(docRef);

    if (materialsDoc.exists()) {
        let materials = materialsDoc.data();
        let sortedMaterials = create_materials_mcustomer_obj(materials, 'cus_id', 'material_name');
        res.render('settings/materials', sortedMaterials);
    } else {
        res.status(404).send('Materials not found');
    }
}));

//update a material / material customer
router.put('/materials/:id',isLoggedIn,  catchAsync(async (req, res) => {
    const kind = req.query.kind
    const id = req.params.id
    const vals = req.body;  
    const docRef = doc(db, 'WB_1212様', 'materials'); 
    const _materials = await getDoc(docRef);
    if (_materials.exists()) {
        let materials = _materials.data();
        if( kind == "customer" ){
            for (const key in materials) {
                if (materials.hasOwnProperty(key)) {
                    if (Number(materials[key].cus_id) === Number(id)) {
                        materials[key].cus_name = vals.cus_name;
                        materials[key].cus_id = Number(vals.cus_id);
                    }
                }
            }
        }else{
            vals[cus_id] = Number(vals[cus_id])
            materials[id] = vals;
        }
        await updateDoc(docRef, materials);
        res.redirect('/settings/materials');
    } else {
        console.error('Error updating material');
    }
}));
// to delete a material / material customer
router.delete('/materials/:id', isLoggedIn, catchAsync(async (req, res) => {
    const kind = req.query.kind
    const id = req.params.id
    const docRef = doc(db, 'WB_1212様', 'materials');
    const _materials = await getDoc(docRef);
    if (_materials.exists()) {
        let materials = _materials.data();
        let filteredMaterials = {}
        if(kind == "customer"){
            filteredMaterials = filterOutItem(materials, id,"cus_id")
        }else{
            filteredMaterials = filterOutItem(materials, id,"material_id");
        }
        await setDoc(docRef, filteredMaterials);
        res.redirect('/settings/materials');
    } else {
        console.error('Error deleting a material');
        res.status(404).send('Material not found');
    }
}));

//other 
router.get('/other', isLoggedIn, catchAsync(async (req, res) => {
    getData(req, res, "other")
}))

//to add new state/delivery/process
router.post('/other',isLoggedIn,  catchAsync(async (req, res) => {
    const kind = req.query.kind
    let db_name = kind =="process"?"processs":"setting";
    const docRef = doc(db, 'WB_1212様', db_name);
    const _setting = await getDoc(docRef);
    let setting = _setting.data();

    if(kind =="process"){
        let new_process_name = req.body.type + "_" + req.body.name
        setting[new_process_name] = req.body
    }else{
        let oldData = setting[kind];
        oldData.push(req.body);
        setting[kind] = oldData ;  
    }

    await updateDoc(docRef, setting);
    res.redirect('/settings/other');

}));

//to update a state/delivery/process/inks
router.put('/other/:id', isLoggedIn, catchAsync(async (req, res) => {
    const  id  = req.params.id
    const kind = req.query.kind

    let db_name = "setting"
    if(kind =="process"){db_name = "processs"};
    if(kind =="ink"){db_name = "inks"};

    const docRef = doc(db, 'WB_1212様', db_name);
    const _setting = await getDoc(docRef);
    let setting = _setting.data();
    
    if(kind =="process"){
        delete setting[id];
        let new_process_name = req.body.type + "_" + req.body.name
        setting[new_process_name] = req.body
        await setDoc(docRef, setting)
    }else if(kind =="ink"){
        setting[id] = req.body
        await updateDoc(docRef, setting)
    }else{
        let is_setting = setting[kind]
        if(kind =="branch"){
            setting[kind] = Object.values(req.body).filter(n=>n)
        }else{
            is_setting[id] =  req.body
            setting[kind] = is_setting
        }
        await updateDoc(docRef, setting)
    }
    
    res.redirect('/settings/other');

}));


//to delete a state/delivery/process/inks
router.delete('/other/:id', isLoggedIn, catchAsync(async (req, res) => {
    const  id  = req.params.id
    const kind = req.query.kind

    let db_name = kind =="process"?"processs":"setting";
    const docRef = doc(db, 'WB_1212様', db_name);
    const _setting = await getDoc(docRef);
    let setting = _setting.data();
    
    if(kind =="process"){
        delete setting[id];
    }else{
        let is_setting = setting[kind]
        is_setting.splice(id, 1);
        setting[kind] = is_setting
    }
    
    await setDoc(docRef, setting)
    res.redirect('/settings/other');
}));

//get function
async function getData(req, res, page){
    let delivery,status,process,branch,inks
    let obj = {}
    if(page =="subcontractors"){
        const docRef = doc(db, 'WB_1212様', "subcontractors"); 
        const _subcontractors = await getDoc(docRef);

        const process_docRef = doc(db, 'WB_1212様', "processs"); 
        const _process = await getDoc(process_docRef)
        if (_process.exists()) {
            const processData = _process.data();
            const processArray = Object.values(processData); // Convert object values to array
            process = processArray.filter(doc => doc.type.includes("外注")).map(doc => doc.name);
        } 

        if (_subcontractors.exists()) {
            let subcontractors = _subcontractors.data()
            obj = { "subcontractors" : subcontractors, "process":  process};
        } 
    }else{
        const setting_docRef = doc(db, 'WB_1212様', "setting"); 
        const _setting = await getDoc(setting_docRef)
        if (_setting.exists()) {
            delivery = _setting.data().delivery
            status = _setting.data().status
            branch  = _setting.data().branch
        } 
        
        if(page =="customers"){
            const docRef = doc(db, 'WB_1212様', "customers"); 
            const _customers = await getDoc(docRef);
            if (_customers.exists()) {
                let customers = _customers.data()
                obj = { "all_customers" : customers, "delivery":  delivery};
            } 
        }else{
            const ink_docRef = doc(db, 'WB_1212様', "inks"); 
            const _inks = await getDoc(ink_docRef)
            if (_inks.exists()) {
                inks = sort_obj(_inks.data(),"name","name",)
            } 
            
            const process_docRef = doc(db, 'WB_1212様', "processs"); 
            const _process = await getDoc(process_docRef)
            if (_process.exists()) {
                process = sort_obj(_process.data(),"type","name",)
            } 
            
            obj = { "status" : status, "delivery":  delivery, "processs":  process, "branchs" : branch, "inks" : inks };
        }
    }

    res.render('settings/' + page, obj);
}

async function createFolder(folderName, driveId) {
    const auth = new GoogleAuth({
        keyFilename: './ServiceAccount.json',
        scopes: ['https://www.googleapis.com/auth/drive']
    });
    const authClient = await auth.getClient();
    google.options({auth: authClient});

    const service = google.drive({version: 'v3', auth});
    const fileMetadata = {
    //   parents: [driveId],
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      supportsAllDrives :true
    };
    try {
        const file = await service.files.create({
          resource: fileMetadata,
          fields: 'id',
        });
        console.log('Folder Id:', file.data.id);
        return file.data.id;
      } catch (err) {
        // TODO(developer) - Handle error
        throw err;
      }
  }

function filterOutItem( obj, val , type ) {
    const new_obj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)){
            if(type == "material_id" && key !== val){
                new_obj[key] = obj[key];
            }
            if(type == "cus_id" && Number(obj[key].cus_id) !== Number(val)){
                new_obj[key] = obj[key];
            }
        }
    }
    return new_obj;
  }


function sort_obj(obj, prop, prop2) {
    const sortedKeys = Object.keys(obj).sort((a, b) => {
        const itemA = obj[a];
        const itemB = obj[b];
        
        if (typeof itemA[prop] === 'string') {
            if (itemA[prop] !== itemB[prop]) {
                return itemA[prop].localeCompare(itemB[prop]);
            }
            return itemA[prop2].localeCompare(itemB[prop2]);
        } else {
            if (itemA[prop] !== itemB[prop]) {
                return itemB[prop] - itemA[prop];
            }
            return itemB[prop2] - itemA[prop2];
        }
    });

    const sortedObj = {};
    sortedKeys.forEach(key => {
        sortedObj[key] = obj[key];
    });

    return sortedObj;
}

function create_materials_mcustomer_obj(obj, prop, prop2) {
    const sortedObj = sort_obj(obj, prop, prop2)
    const uniqueCusNamesMap = new Map();
    for (const value of Object.values(sortedObj)) {
        if (value.cus_id) {
            uniqueCusNamesMap.set(value.cus_id, value.cus_name);
        }
    }

    const uniqueCusNames = Array.from(uniqueCusNamesMap)
        .sort((a, b) => a[0] - b[0])
        .map(([id, name]) => ({ cus_id: id, cus_name: name }));
    return { "materials": sortedObj, "cus_names": uniqueCusNames };
}

function random_name() {
    var length = 16,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
module.exports = router;