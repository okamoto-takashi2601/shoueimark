const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { collection, getDocs, setDoc, getDoc, doc, updateDoc, deleteDoc, db } = require('../utils/fb');
const { v4: uuid } = require('uuid');
const { isLoggedIn } = require('../middleware');
const generateHtmlFromFormData = require('../public/javascript/forCreatePdf');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const {GoogleAuth} = require('google-auth-library');
const {google} = require('googleapis');


//to show list
router.get('/', isLoggedIn, catchAsync(async (req, res) => {

    const branchRef = doc(db, 'WB_1212様', "in_process");
    const branchSnap = await getDoc(branchRef);
    let branchs = []
    if (branchSnap.exists()) {
        let docData = branchSnap.data()
        branchs = Object.values(docData).map(d => d.name)
    }

    let docs = collection(db, 'WB_1212様')
    const products = await getDocs(docs)
        .then(snapshot => {
            let _products = snapshot.docs.map(doc => {
                let docData = doc.data()
                docData.id = doc.id
                return docData
            })
                .filter(doc => doc.date)
                .sort((a, b) => Number(a.status.split('-')[0]) - Number(b.status.split('-')[0]))
                .sort((a, b) => Number(a.path_no) - Number(b.path_no))
                .sort((a, b) => Number(a.cus_id) - Number(b.cus_id))
                .sort((a, b) => Number(a.delivery.split('-')[0]) - Number(b.delivery.split('-')[0]))
                .sort((a, b) => new Date(b.date) - new Date(a.date))

            const settings = snapshot.docs.map(doc => {
                let docData = doc.data()
                docData.id = doc.id
                return docData
            })
                .filter(doc => doc.id == "setting")[0]
            return { "_product": _products, "_place": branchs, "_delivery": settings.delivery, "_status": settings.status, "_selectPlace": "" }
        });
    res.render('products/index', { "products" : products });
}));

router.post('/filter', isLoggedIn, catchAsync(async (req, res) => {
    let { place } = req.body;

    const branchRef = doc(db, 'WB_1212様', "in_process");
    const branchSnap = await getDoc(branchRef);
    let branchs = []
    if (branchSnap.exists()) {
        let docData = branchSnap.data()
        branchs = Object.values(docData).map(d => d.name)
    }

    let docs = collection(db, 'WB_1212様');

    const products = await getDocs(docs)
        .then(snapshot => {
            let _products = snapshot.docs.map(doc => {
                let docData = doc.data();
                docData.id = doc.id;
                return docData;
            })
                .filter(doc => doc.date);

            let __products = _products;
            if (place) {
                __products = _products.filter(doc => doc.place == place);
            }

            let ___products = __products
                .sort((a, b) => Number(a.status.split('-')[0]) - Number(b.status.split('-')[0]))
                .sort((a, b) => Number(a.path_no) - Number(b.path_no))
                .sort((a, b) => Number(a.cus_id) - Number(b.cus_id))
                .sort((a, b) => Number(a.delivery.split('-')[0]) - Number(b.delivery.split('-')[0]))
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            const settings = snapshot.docs.map(doc => {
                let docData = doc.data();
                docData.id = doc.id;
                return docData;
            })
                .filter(doc => doc.id == "setting")[0];

            // リクエストからの場所を _selectPlace にセットする
            return { "_product": ___products, "_place": branchs, "_delivery": settings.delivery, "_status": settings.status, "_selectPlace": place };

        });

    res.render('products/index', { products });

}));

//go add new
router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    const branchRef = doc(db, 'WB_1212様', "in_process");
    const branchSnap = await getDoc(branchRef);
    let branchs = []
    if (branchSnap.exists()) {
        let docData = branchSnap.data()
        branchs = Object.values(docData).map(d => d.name)
    }
    let docs = collection(db, 'WB_1212様')
    const setting = await getDocs(docs)
        .then(snapshot => {
            const settings = snapshot.docs.map(doc => {
                let docData = doc.data()
                docData.id = doc.id
                return docData
            })
                .filter(doc => doc.id == "setting")[0]
            return { "_place": branchs, "_delivery": settings.delivery, "_status": settings.status }

        });
    const docMaterial = doc(db, 'WB_1212様', "materials");

    const _material  = await getDoc(docMaterial);
    let material = []
    if (_material.exists()) {
        material = Object.values(_material.data()).map(e=>e.cus_name)

    } 
    res.render('products/new', { "setting": setting ,"materials" : material})
}));


//to add new
// コンパクト化したコード
router.post('/', isLoggedIn, catchAsync(async (req, res) => {
    let vals = req.body;
    const okaDate = new Date(new Date() - new Date().getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 10);
    const emptyFields = ["order_no", "file_url", "status", "delivery_place"];
    const staffFields = Array.from({ length: 12 }, (_, i) => `staff${i + 2}`);
    const specProcessFields = Array.from({ length: 6 }, (_, i) => [`specs_1_${i + 1}`, `specs_2_${i + 1}`, `specs_3_${i + 1}`, `specs_4_${i + 1}`, `specs_5_${i + 1}`, `specs_6_${i + 1}`, `process_1_${i + 1}`, `process_2_${i + 1}`, `process_3_${i + 1}`, `process_4_${i + 1}`, `process_5_${i + 1}`, `process_6_${i + 1}`]);

    vals["registerDate"] = okaDate;
    emptyFields.forEach(field => vals[field] = "");
    staffFields.forEach(field => vals[field] = "");
    specProcessFields.forEach(group => group.forEach(field => vals[field] = ""));

    vals["status"] = "0-見積";

    let quote = {
        "quote_tax": "",
        "quote_sum": "",
        "quote_create_date": okaDate,
        "quote_total_amount": "",
        "quote_payment_terms": "",
        "quote_expiration_date": ""
    };
    for (let i = 0; i < 17; i++) {
        quote[`quote_name_col${i}`] = "";
        quote[`quote_quantity_col${i}`] = "";
        quote[`quote_unit_col${i}`] = "";
        quote[`quote_price_col${i}`] = "";
        quote[`quote_amount_col${i}`] = "";
    }
    vals["quote"] = quote;

    let new_item_name = `${vals.place}_${vals.cus_id}_${okaDate}_${uuid()}`;
    await setDoc(doc(db, 'WB_1212様', new_item_name), vals);
    res.redirect('/products');
}));


//upload files 
const auth = new GoogleAuth({
    keyFilename: './ServiceAccount.json',
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, originalName);
    }
});

const upload = multer({ storage: storage });

const drive = google.drive({ version: 'v3', auth });

router.post('/:id',  upload.array('files', 10), async (req, res) => {
    const kind = req.query.kind;
  
    if (kind === "upload") {

      try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files uploaded.');
        }
        let fileLinks = [];

        for (const file of req.files) {
            const filePath = path.join(__dirname, '..', 'uploads', file.filename);

            const fileMetadata = {
                name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
                parents: ["19WpqxPEKSbFjDVkz5erH5wZp6r7ALnOW"]
            };

            const media = {
                mimeType: file.mimetype,
                body: fs.createReadStream(filePath)
            };

            const response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, webViewLink',
            });

            fs.unlinkSync(filePath);
            fileLinks.push({url : response.data.webViewLink,name : Buffer.from(file.originalname, 'latin1').toString('utf8')});
        }

        await putData(req, res, "/upload", fileLinks);

      } catch (error) {
        res.status(500).send(`Error uploading file.${error}`);
      }
    }
    if (kind === "removeFile") {
        const productId = req.params.id;
        const fileIndex = Number(req.query.fileIndex);
        
        const productRef = doc(db, 'WB_1212様', productId);
        const productDoc = await getDoc(productRef);
        let newFiles = []
        if (productDoc.exists()) {
            let productFiles = productDoc.data().files
            if(productFiles.length>1){
                newFiles = productFiles.splice(fileIndex, 1); 
            }
            updatedData = { ...{"files":  newFiles} };
            await updateDoc(productRef, updatedData);
            res.redirect('/products')
        }
    }
});


//go edit form
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    getData(req, res, "edit")
}));

//to edit
router.put('/:id', isLoggedIn, catchAsync(async (req, res) => {
    putData(req, res, "/edit");
}));

//to delete
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const docRef = doc(db, 'WB_1212様', id);
    try {
        await deleteDoc(docRef);
        res.redirect('/products');
    } catch (e) {
        console.error('Error deleting document:', e);
    }

}));


//go quotation
router.get('/:id/quotation', isLoggedIn, catchAsync(async (req, res) => {
    getData(req, res, "quotation");
}));

//edit on quotation
router.put('/:id/quotation', isLoggedIn, catchAsync(async (req, res) => {
    putData(req, res, "/quotation");
}));


//go structural_work_chedule
router.get('/:id/structural_work_chedule', isLoggedIn, catchAsync(async (req, res) => {
    getData(req, res, "structural_work_chedule")
}));

//edit on structural_work_chedule
router.put('/:id/structural_work_chedule', isLoggedIn, catchAsync(async (req, res) => {
    putData(req, res, "/structural_work_chedule");
}));

//go quoteForm
router.get('/:id/quoteform', isLoggedIn, catchAsync(async (req, res) => {
    getData(req, res, "quoteform")
}));

//edit on quoteForm
router.put('/:id/quoteform', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const vals = req.body
    const docRef = doc(db, 'WB_1212様', id);
    const product = await getDoc(docRef) ;
    if (product.exists()) {
        let docData = product.data()
        for (var key in vals) {
            // Check if the property starts with "quote_"
            if (key.startsWith("quote_")) {
                // If yes, assign it to the data property of the new object
                docData.quote[key] = vals[key];
            }else{
                docData[key] = vals[key];
            }
        }
        docData["id"] = id
        await updateDoc(docRef, docData);
        res.render('products/quoteform', { ...docData });

    } else {
        console.log('No such document!');
    }
}));

// Route to handle form submission and generate PDF
router.post('/generate-pdf', async (req, res) => {
    try {
        const formData = req.body; // フォームデータを受け取る
        const htmlData = generateHtmlFromFormData(formData); // フォームデータからHTMLを生成する関数を呼び出す

        // Puppeteerを使用してPDFを生成する
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlData, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        // クライアントにPDFを送信する
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});
router.get('/download-pdf', (req, res) => {
    const filePath = req.query.filePath;
    res.download(filePath);
});

//checksheet

router.get('/:id/checksheet', isLoggedIn, catchAsync(async (req, res) => {
    getData(req, res, "checksheet")
}));

//specs

router.get('/:id/specs', isLoggedIn, catchAsync(async (req, res) => {
    getData(req, res, "specs")
}));

//get function
async function getData(req, res, page){
    const { id } = req.params;
    const branchRef = doc(db, 'WB_1212様', "in_process");
    const branchSnap = await getDoc(branchRef);
    let branchs = []
    if (branchSnap.exists()) {
        let docData = branchSnap.data()
        branchs = Object.values(docData).map(d => d.name)
    }

    let docs = collection(db, 'WB_1212様')
    const setting = await getDocs(docs)
        .then(snapshot => {
            const settings = snapshot.docs.map(doc => {
                let docData = doc.data()
                docData.id = doc.id
                return docData
            })
                .filter(doc => doc.id == "setting")[0]
            return { "_place": branchs, "_delivery": settings.delivery, "_status": settings.status }

        });
        
    const docMaterial = doc(db, 'WB_1212様', "materials");

    const _material  = await getDoc(docMaterial);
    let material = []
    if (_material.exists()) {
        material = Object.values(_material.data()).map(e=>e.cus_name)

    } 

    const docRef = doc(db, 'WB_1212様', id);
    try {
        const product = await getDoc(docRef);
        if (product.exists()) {
            let docData = product.data()
            docData["id"] = id

            res.render('products/'+ page, { "data": docData, "setting": setting ,"materials" : material});
        } else {
            console.log('No such document!');
        }
    } catch (e) {
        console.error('Error getting document:', e);
    }
}

//put function
async function putData(req, res, page,fileLinks){
    const { id } = req.params;
    const vals = req.body
    const branchRef = doc(db, 'WB_1212様', "in_process");
    const branchSnap = await getDoc(branchRef);
    let branchs = []
    if (branchSnap.exists()) {
        let docData = branchSnap.data()
        branchs = Object.values(docData).map(d => d.name)
    }

    const docRef = doc(db, 'WB_1212様', id);
    let docs = collection(db, 'WB_1212様')
    const setting = await getDocs(docs)
    .then(snapshot => {
        const settings = snapshot.docs.map(doc => {
            let docData = doc.data()
            docData.id = doc.id
            return docData
        })
        .filter(doc => doc.id == "setting")[0]
        return { "_place": branchs, "_delivery": settings.delivery, "_status": settings.status }
        
    });
    
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let updatedData = {};
            if(page == "/upload"){    
                let files = []
                if (!docSnap.data().files) {
                    files = [];
                }else{
                    files = docSnap.data().files
                }
              fileLinks.forEach(fileLink=>{
                files.push({url : fileLink.url, name : fileLink.name} );
              })

             updatedData = { ...docSnap.data(), ...{"files": files} };

            }else{
                updatedData = { ...docSnap.data(), ...vals };
            }
            await updateDoc(docRef, updatedData);
        } 
        const product = await getDoc(docRef);
        if (product.exists()) {
            let docData = product.data()
            docData["id"] = id
            req.flash('success', "保存しました");
            if(page=="/edit"){
                res.redirect('/products');
            }else if(page=="/upload"){
                res.redirect('/products')
            }else{
                res.render('products' + page, {"data" : { ...docData },"setting": setting});
            }
            
        } else {
            console.log('No such document!');
        }
    } catch (e) {
        console.error('Error updating document:', e);
    }
}

module.exports = router;