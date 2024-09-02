let swal_options = {
    background:"rgba(240, 240, 240,1)",
    backdrop: "rgba(250, 250, 250,0)",
    customClass: {
        popup: 'swal2-custom-border'
    },
    // position : "bottom-right"
}
document.addEventListener("DOMContentLoaded", async () => {
    async function getConfig() {
        try {
            const response = await fetch('/config'); // Fetch from the same origin (localhost:3000)
            if (!response.ok) {
                throw new Error('Failed to fetch configuration');
            }
            const config = await response.json();
            // Use the fetched configuration (e.g., initialize Firebase with config)
            const firebaseConfig = {
                apiKey: config.apiKey,
                projectId: config.projectId,
                // Add other configuration properties as needed
            };
            if (firebase.apps.length === 0) {
                firebase.initializeApp(firebaseConfig);
            }
            wb_db = firebase.firestore().collection("WB_1212様");
    
            // Now you can proceed with other operations using wb_db
        } catch (error) {
            console.error('Error fetching configuration:', error);
            // Handle error gracefully
        }
    }

    getConfig();

    $(document).ready(function() {
        const currentLocation = decodeURIComponent(window.location.pathname);
        $('.nav-link').each(function() {
            if ($(this).attr('href') === currentLocation) {
                $(this).addClass('active');
            }
        });

        const elements = "input";
        $(elements).keypress(function(e) {
            const c = e.which ? e.which : e.keyCode;
            if (c == 13) {
                const index = $(elements).index(this);
                $(elements + ":gt(" + index + "):first").focus();
                e.preventDefault();
            }
        });
    });
    window.to_specs_tbl_add_row = function (){
        let rowCount = document.querySelectorAll('#specs_tbl tbody tr').length;
        let newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td style="min-width: 30px;"  onclick="remove_last_row('specs_tbl')">${ String.fromCodePoint(9312 + rowCount) }</td>

            <td>
                <input name="specs_1_${rowCount + 1}" id="specs_1_${rowCount + 1}" placeholder="Click to select" readonly onclick="input_print_line(event)">
            </td>
            <td>
                <input name="specs_2_${rowCount + 1}" id="specs_2_${rowCount + 1}" readonly onclick="input_print_line(event)">
            </td>
            <td>
                <input name="specs_3_${rowCount + 1}" id="specs_3_${rowCount + 1}" readonly onclick="input_print_line(event)">

                <input style="display:none;" name="specs_4_${rowCount + 1}" id="specs_4_${rowCount + 1}" readonly>
                <input style="display:none;" name="specs_5_${rowCount + 1}" id="specs_5_${rowCount + 1}" readonly>
                <input style="display:none;" name="specs_6_${rowCount + 1}" id="specs_6_${rowCount + 1}" readonly>
            </td>
        `;

        document.querySelector('#specs_tbl tbody').appendChild(newRow);
    }

    window.to_flowchat_tbl_add_row = function (){
        let rowCount = document.querySelectorAll('#flowchat_tbl tbody tr').length;
        let newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td style="min-width: 30px;"  onclick="remove_last_row('flowchat_tbl')">${ String.fromCodePoint(9312 + rowCount) }</td>

            <td>
                <input name="process_1_${rowCount + 1}" id="process_1_${rowCount + 1}" placeholder="Click to select" readonly onclick="input_process_line(event)">
            </td>
            <td>
                <input name="process_2_${rowCount + 1}" id="process_2_${rowCount + 1}" readonly onclick="input_process_line(event)">
            </td>
            <td>
                <input name="process_3_${rowCount + 1}" id="process_3_${rowCount + 1}" readonly onclick="input_process_line(event)">
            </td>
            <td>
                <input name="process_4_${rowCount + 1}" id="process_4_${rowCount + 1}">
                <input style="display:none;" name="process_5_${rowCount + 1}" id="process_5_${rowCount + 1}" readonly>
                <input style="display:none;" name="process_6_${rowCount + 1}" id="process_6_${rowCount + 1}" readonly>
            </td>
        `;
        document.querySelector('#flowchat_tbl tbody').appendChild(newRow);
    }
    window.remove_last_row = function (tbl){
        var table = document.getElementById(tbl);
        var rowCount = table.rows.length;
        if (rowCount > 1) {
            var lastRow = table.rows[rowCount - 1];
            var isEmpty = true;

            // Check if the last row is empty
            for (var i = 0; i < lastRow.cells.length; i++) {
            var cellContent = lastRow.cells[i].querySelector('input, select, textarea, label');
            if (cellContent && cellContent.value.trim() !== '') {
                isEmpty = false;
                break;
            }
            }

            if (isEmpty) {
                table.deleteRow(rowCount - 1);
            } else {
                Swal.fire({
                    title : 'The last row is not empty.<br>Please clear its contents before deleting.<br> Are you sure you want to delete it?',
                    icon : "error",
                    ...swal_options
                }

                    
                )
                return
            }
        } else {
            console.log('No rows to remove.');
        }
    }
    window.setCusName = async function (e) {
        let thisId = e ? e : "";
        let thisCus = {};
        let _allCus = await wb_db.doc('customers').get().then(doc => doc.data())
        let allCus = Object.values(_allCus)
        
        if (thisId) {
            let thisCuss = allCus.filter(c => c.cus_id == thisId);
            thisCus = thisCuss[0]
        }

        let content =
            `
            <div class="input-group mb-3">
                <div class="input-group-prepend w-25">
                    <span class="input-group-text">得意先コード</span>
                </div>
                <input class="form-control" type="number" id="cus_id_input" value="${thisId}">
            </div>
            <div class="input-group mb-3">
                <div class="input-group-prepend w-25">
                    <span class="input-group-text">得意先名</span>
                </div>
                <input type="text" class="form-control" id="cus_name_input" readonly value="${thisCus.cus_name || ''}">
            </div>
            <div class="input-group mb-3">
                <div class="input-group-prepend w-25">
                    <span class="input-group-text">基本納入便</span>
                </div>
                <input type="text" class="form-control" id="delivery_input" value="${thisCus.delivery || ''}">
            </div>
            <div class="input-group mb-3">
                <div class="input-group-prepend w-25">
                    <span class="input-group-text">基本備考</span>
                </div>
                <input class="form-control" type="text" id="note_input" value="${thisCus.note || ''}">
            </div>
            `;

        await Swal.fire({
            title: '顧客ID 入力',
            
            html: content,
            showCloseButton: true,
            showCancelButton: true,
            focusConfirm: false,
            
            didOpen: () => {
                const cus_id_el = document.getElementById('cus_id_input');
                cus_id_el.addEventListener('change', (event) => {
                    let _cus_id = event.target.value
                    let _customer = allCus.filter(c => c.cus_id == String(_cus_id));
                    let __cus_name =  "未登録 得意先コードです"
                    if (_customer.length > 0) {
                        __cus_name = _customer[0].cus_name;
                        document.getElementById('delivery_input').value = _customer[0].delivery;
                        document.getElementById('note_input').value = _customer[0].note;
                    }
                    document.getElementById('cus_name_input').value = __cus_name
                        
                });
            },
            preConfirm: () => {
                return {
                    "cus_id": document.getElementById('cus_id_input').value,
                    "cus_name": document.getElementById('cus_name_input').value,
                    "delivery": document.getElementById('delivery_input').value,
                    "note": document.getElementById('note_input').value,
                };
            },
            ...swal_options

        }).then((result) => {
            if (result.isConfirmed) {
                $("#cus_id").val(result.value.cus_id);
                $("#cus_name").val(result.value.cus_name);
                $("#delivery").val(result.value.delivery);
                $("#note").val(result.value.note);
            }
        });
    }

    window.selectMaterialCusName = async function (e){
        const clickX = e.clientX;
        const clickY = e.clientY;

        let  material_cus_name = $("#material_cus_name").val()
        let material_name =  $("#material_name").val()
        let t_material_x =  $("#t_material_x").val()
        let t_material_y =  $("#t_material_y").val()
        let t_material_z =  $("#t_material_z").val() | ""
        let t_material_type =  $("#t_material_type").val() 
        let t_material_price =  $("#t_material_price").val() 

        let options = await wb_db.doc('materials').get()
        .then(doc=>{
            return  Object.values(doc.data()).filter(cus => cus.ma)
            
        });
        
        let now_cus_materials = options.filter(doc=>doc.cus_name == material_cus_name)
        let _material_cus_names = options.map(op => op.cus_name)
        let material_cus_names = [...new Set(_material_cus_names)]
        let content = `
        <div class="input-group mb-3">
            <span class="input-group-text w-25">仕入先</span>
            <select class="form-control" id="material_cus_name_el">
        `
        material_cus_names.forEach(s=>{
            if(s == material_cus_name){
                content+=`<option value="${s}" selected>${s}</option>`
            }else{
                content+=`<option value="${s}">${s}</option>`
            }
        })
        content+=
        `
                </select>
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text w-25">材料名</span>
                <select  class="form-control" id="material_name_el">

            `
            now_cus_materials.forEach(s=>{
                if(s == material_name){
                    content+=`<option value="${s.material_name}" selected>${s.material_name}</option>`
                }else{
                    content+=`<option value="${s.material_names}">${s.material_name}</option>`
                }
            })
            content+=
            `
                </select>
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text w-25">定尺寸法</span>
                <input  class="form-control" id="x_el" value="${t_material_x}" readonly> 
                ×
                <input  class="form-control" id="y_el" value="${t_material_y}" readonly> 
                ×
                <input  class="form-control" id="z_el" value="${t_material_z}" readonly> 
            </div>

            <div class="input-group mb-3">
                <span class="input-group-text w-25">種類</span>
                <input class="form-control" id="type_el" value="${t_material_type}" readonly>
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text w-25">単価</span>
                <input type="number" class="form-control" id="price_el" value="${t_material_price}" readonly>
            </div>
        `
        Swal.fire({
            title: '材料 設定',
            html:content,
            showCloseButton: true,
            ...swal_options,
            showCancelButton: true,
            focusConfirm: false,
            didOpen: () => {
                const swalContainer = Swal.getPopup();
                swalContainer.style.position = 'absolute';
                swalContainer.style.left = `${clickX}px`;
                swalContainer.style.top = `${clickY/5}px`;

                const material_cus_name_el = document.getElementById('material_cus_name_el');
                const material_name_el = document.getElementById('material_name_el');
                const x_el = document.getElementById('x_el');
                const y_el = document.getElementById('y_el');
                const z_el = document.getElementById('z_el');
                const type_el = document.getElementById('type_el');
                const price_el = document.getElementById('price_el');
                material_cus_name_el.addEventListener('change', (event) => {
                    const selectedCusName = event.target.value;
                    now_cus_materials = options.filter(doc => doc.cus_name === selectedCusName);
        
                    material_name_el.innerHTML = "";
                    now_cus_materials.forEach(s => {
                        let option = document.createElement("option");
                        option.innerHTML = option.value = s.material_name;
                        material_name_el.appendChild(option);
                    });
        
                    x_el.value = y_el.value = z_el.value = "";
                    type_el.value = "";
                    price_el.value = 0;
                });
        
                material_name_el.addEventListener('change', (event) => {
                    const selectedMaterialName = event.target.value;
                    const selectedMaterial = now_cus_materials.find(doc => doc.material_name === selectedMaterialName);
        
                    if (selectedMaterial) {
                        x_el.value = selectedMaterial.x;
                        y_el.value = selectedMaterial.y;
                        z_el.value = selectedMaterial.z;
                        type_el.value = selectedMaterial.type?selectedMaterial.type:"定尺";
                        price_el.value = selectedMaterial.price;
                    }
                });
            },
            preConfirm: () => {
                return {
                    material_cus_name :  document.getElementById('material_cus_name_el').value,
                    material_name :  document.getElementById('material_name_el').value,
                    x :  document.getElementById('x_el').value,
                    y :  document.getElementById('y_el').value,
                    z :  document.getElementById('z_el').value,
                    type :  document.getElementById('type_el').value,
                    price : document.getElementById('price_el').value,
                }
            }
        }).then(res=>{
            let vals = res.value
            let type = vals.type
            let y = vals.y
            let cut_x_val = $('#cut_x').val();
            let cut_y_val = $('#cut_y').val();
            if(type == "Roll"){
                y = "M"
                cut_y_val = 1
            }else{
                if(Number(cut_y_val) == 0){
                    cut_y_val = 1
                }
            }
            $('#cut_y').val(cut_y_val)
            $('#material_x').val( Math.floor(Number(vals.x) / Number(cut_x_val) ));
            $('#material_y').val( Math.floor(Number(vals.y) / Number(cut_y_val)));

            $('#material_cus_name').val(vals.material_cus_name);
            $('#material_name').val(vals.material_name);
            $('#t_material_x').val(vals.x);
            $('#t_material_y').val(y);
            $('#t_material_z').val(vals.z);
            $('#t_material_type').val(vals.type);
            $('#t_material_price').val(vals.price);
        })
    }
    window.selectKindOfMark = function (e) {
        let old = e.target.value
        let isCheck = "";
        let val1 = "", val2 = ""
        if(old && old.includes("Φ")){
            val1 = old.replace("Φ","");
            isCheck = "checked";
        }
        if(old && !old.includes("Φ")){
            val1 = old.split("×")[0]
            val2 = old.split("×")[1]
        }

        let content =
        `
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <div class="input-group-text">
                    <input type="checkbox" id="toggleOther" ${isCheck}>
                    <span class="mx-1">Φ</span>
                </div>
            </div>
            <input type="text" class="form-control" id="mark_val" value="${val1}">
            <span class="mx-1 other">×</span>
            <input type="text" class="form-control other" id="mark_val_2"  value="${val2}">
        </div>
        `

        Swal.fire({
            title: 'マーク寸法 入力',
            
            html:content,
            showCloseButton: true,
            ...swal_options,
            showCancelButton: true,
            focusConfirm: false,
            didOpen: () => {
                const toggleOther = document.getElementById('toggleOther');
                const otherElements = document.querySelectorAll('.other');
                toggleOther.addEventListener('change', (event) => {
                    otherElements.forEach(element => {
                        if (event.target.checked) {
                            element.style.display = 'none';
                        } else {
                            element.style.display = 'flex';
                        }
                    });
                });
            },
            preConfirm: () => {
                const markVal = document.getElementById('mark_val').value;
                const markVal2 = document.getElementById('mark_val_2').value;
                const toggleOther = document.getElementById('toggleOther').checked;
                
                if (toggleOther) {
                    return "Φ" + markVal;
                } else {
                    return markVal + "×" + markVal2;
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const outputval = result.value;
                $("#mark").val(outputval);
            }
        });
    }
    window.inputCutNo = function (e) {
        let type = $('#t_material_type').val();
        let xx = $('#t_material_x').val();
        let yy = $('#t_material_y').val();
        let cut_xx = $('#cut_x').val();
        let cut_yy = $('#cut_y').val();
        let cut_material_xx = $('#material_x').val();
        let cut_material_yy = $('#material_y').val();
        Swal.fire({
            title: '材料寸法 設定',
            ...swal_options,
            html: `
            <div class="input-group mb-3">
                <span class="input-group-text w-25">定尺 寸法</span>
                <input type="text" class="form-control" id="x" value="${xx}" readonly>
                <span class="input-group-text other">×</span>
                <input type="text" class="form-control other" id="y"  value="${type=='Roll'?'M':yy}" readonly>
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text w-25">裁断 回数</span>
                <input type="number" class="form-control" id="_cut_x"  value="${cut_xx}" >
                <span class="input-group-text other">×</span>
                <input type="number" class="form-control other" id="_cut_y" value="${cut_yy?type=='Roll'?0:cut_yy:''}">
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text w-25">材 寸</span>
                <input type="number" class="form-control" id="_cut_material_x"  value="${cut_material_xx}" >
                <span class="input-group-text other">×</span>
                <input type="number" class="form-control other" id="_cut_material_y"  value="${cut_material_yy}" >
            </div>
            `,
            showCloseButton: true,
            showCancelButton: false,
            focusConfirm: false,
            didOpen: () => {
                const x = document.getElementById('x').value;
                const y = document.getElementById('y').value;
                let _y = y;
                if (y === 'M') _y = 1000;

                const cut_x = document.getElementById('_cut_x');
                const cut_y = document.getElementById('_cut_y');
                const cut_material_x = document.getElementById('_cut_material_x');
                const cut_material_y = document.getElementById('_cut_material_y');

                cut_x.addEventListener('change', (event) => {
                    if (event.target.value) {
                        cut_material_x.value = Math.floor(x*10 / event.target.value)/10;
                    }
                });

                cut_y.addEventListener('change', (event) => {
                    if (event.target.value) {
                        cut_material_y.value = Math.floor(_y*10 / event.target.value)/10;
                    }
                });
            },
            preConfirm: () => {
                return {
                    "cut_x": document.getElementById('_cut_x').value,
                    "cut_y": document.getElementById('_cut_y').value,
                    "material_x": document.getElementById('_cut_material_x').value,
                    "material_y": document.getElementById('_cut_material_y').value
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const outputval = result.value;
                $('#cut_x').val(outputval.cut_x);
                $('#cut_y').val(outputval.cut_y);
                $('#material_x').val(outputval.material_x);
                $('#material_y').val(outputval.material_y);
            }
        });
    }
    window.selectPlace = function (e){
        let old = e.target.value
        wb_db.doc('setting').get()
        .then(doc=>{
            let branks = doc.data().branch
            const _options =  branks.reduce((json,value,key) => { 
                json[value] = value
                return json
            }, {});
            Swal.fire({
                title: '手配先 選択',
                input: 'radio',
                ...swal_options,
                inputOptions: _options,
                showCloseButton: true,
                showCancelButton: false,
                width : "640px",
                inputValue : old
            })
            .then((p) => {
                if (p.isConfirmed) {
                    if(p.value){
                        e.target.value = p.value
                    }
                }
            })
        })
            
    }

    window.input_print_line = async function (e) {
        let cus = await wb_db.doc('materials').get().then(doc=>doc.data())
        let inks = await wb_db.doc('inks').get().then(doc=>doc.data())
        let no = e.target.id.split("_")[2]
        let specs_1 = $('#specs_1_' + no).val();
        let specs_2 = $('#specs_2_' + no).val();
        let specs_3 = $('#specs_3_' + no).val();
        let specs_5 = $('#specs_5_' + no).val();

        let material_x = $('#material_x').val();
        let material_y = $('#material_y').val();

        const specs_1_lts = ["削除","材料","保護フィルム","マスキング","ラミネート","両面テープ","セパレーター","インク"]

        const specs_1_lts_json =  specs_1_lts.reduce((json,value,key) => { 
            json[value] = value
            return json
        }, {})

        Swal.fire({
            title: `構造仕様 ${no} 設定`,
            input: "select",
            inputOptions: specs_1_lts_json,
            showCloseButton: true,
            ...swal_options,
            showCancelButton: true,
            confirmButtonText: '次へ',
            cancelButtonText: 'キャンセル',
            inputValue : specs_1,
            inputValidator: (value) => {
                if (!value) {
                    return '項目を選択してください!';
                }
            }
        }).then((res1) => {
            if (res1.isConfirmed) {
                let isType = res1.value 
                if(isType == "削除"){ //削除
                    Swal.fire({
                        title: `印刷順${no}を削除してもよろしいでしょうか`,
                        showCloseButton: true,
                        ...swal_options,
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                    })
                    .then(cf =>{
                        if(cf.isConfirmed){
                            $('#specs_1_' + no).val("");
                            $('#specs_2_' + no).val("");
                            $('#specs_3_' + no).val("");
                            $('#specs_4_' + no).val("");
                            $('#specs_5_' + no).val("");
                            $('#specs_6_' + no).val("");
                        }
                    })
                }else{
                    let __cus_names = Object.values(cus).filter(c => {
                        let conditions = [];
                        if (c.pf) conditions.push("保護フィルム");
                        if (c.ms) conditions.push("マスキング");
                        if (c.lm) conditions.push("ラミネート");
                        if (c.wf) conditions.push("両面テープ");
                        if (c.se) conditions.push("セパレーター");
                    
                        return conditions.includes(isType)
                    });
                    if(isType == "材料"){ //材料
                        let material_cus_name = $('#material_cus_name').val();
                        let material_name = $('#material_name').val();
                        let t_material_x = $('#t_material_x').val();
                        let t_material_type = $('#t_material_type').val();
                        let t_material_y = t_material_type=="Roll"?"1000":$('#t_material_y').val();
                        let t_material_price = $('#t_material_price').val();
                        let _price = Math.ceil( Number(t_material_price) *(Number(material_x)*Number(material_y)) /(Number(t_material_x)*Number(t_material_y))*10)/10
                        let _spec4 = t_material_type=="Roll"?"M":t_material_y
                        let _spec5 = t_material_type=="Roll"?t_material_price + "円/m2":t_material_price + "円/枚"
                        $('#specs_1_' + no).val(isType);
                        $('#specs_2_' + no).val(material_cus_name);
                        $('#specs_3_' + no).val(material_name);
                        $('#specs_4_' + no).val(String(t_material_x) + "×" +String( _spec4));
                        $('#specs_5_' + no).val(_spec5);
                        $('#specs_6_' + no).val(_price);
                        return
                    }else if(isType == "インク"){ //インク
                        let content1 = `
                        <div class="input-group mb-3">
                            <span class="mx-1 input-group-text w-25">インク種</span>
                            <select class="form-control" id="spec2">
                        `
                        let specs2 = ["文字","ベタ","鏡面","チヂミ","アミ","糊"]
                        specs2.forEach(s=>{
                            if(s == specs_2){
                                content1+=`<option value="${s}" selected>${s}</option>`
                            }else{
                                content1+=`<option value="${s}">${s}</option>`
                            }
                        })
                        content1+=
                        `
                                </select>
                            </div>
                            <div class="input-group mb-3">
                                <span class="mx-1 input-group-text w-25">色 数</span>
                                <select type="number" class="form-control" id="spec3">
                        `
                        for(let j = 1; j < 26;j++){
                            if(j == Number(specs_3)){
                                content1+=`<option value="${j}" selected>${j}</option>`
                            }else{
                                content1+=`<option value="${j}">${j}</option>`
                            }
                        }
                        content1+=
                        `
                                </select>
                            </div>
                        `
                        Swal.fire({
                            title: `構造仕様${no} 設定<br>種類①: ${isType}`,
                            html: content1,
                            showCloseButton: true,
                            ...swal_options,
                            showCancelButton: true,
                            confirmButtonText: '追加',
                            cancelButtonText: 'キャンセル',
                            preConfirm: () => {
                                return {
                                    spec2 : $('#spec2').val(), //インク種
                                    spec3 : $('#spec3').val() //インク数
                                }
            
                            }
                        }).then((res2) => {
                            if (res2.isConfirmed) {
                                let ink = Object.values(inks).filter(ik => ik.name == res2.value.spec2)[0]
                                let spec4_val = ink.price  ,spec5_val = Number(specs_5)>0?Number(specs_5):100, spec6_val = 0
                                if(res2.value.spec2 =="文字"){
                                    spec6_val = Number(res2.value.spec3) * spec4_val  //ink number * 文字 単価
                                }else{
                                    spec6_val = Number(material_x)*Number(material_y)*Number(spec4_val)* Number(specs_5)/100000000 // 製品面積(M2)*インク単価* %
                                }
                                $('#specs_1_' + no).val(isType);
                                $('#specs_2_' + no).val(res2.value.spec2);
                                $('#specs_3_' + no).val(res2.value.spec3);
                                $('#specs_4_' + no).val(spec4_val + ink.unit);
                                $('#specs_5_' + no).val(spec5_val);
                                $('#specs_6_' + no).val(spec6_val);
                            }
                        });
                    }else{ //Other
                        let content2 = `
                        <div class="input-group mb-3">
                            <span class="mx-1 input-group-text w-25">仕入れ先</span>
                            <select class="form-control" id="spec2">
                        `
                        let _cus_names =[""].concat(__cus_names.map(cc => cc.cus_name))
                        let cus_names = [...new Set(_cus_names)];
                        cus_names.forEach(s=>{
                            if(specs_2 == s){
                                content2+=`<option value="${s}" selected>${s}</option>`
        
                            }else{
                                content2+=`<option value="${s}">${s}</option>`
        
                            }
                        })
                        content2+=
                        `
                                </select>
                            </div>
                        `
                        if(specs_3 && specs_1 == res1.value){

                                let option = __cus_names.filter(c => c.cus_name == specs_2 && c.material_name == specs_3)[0]
                                let _val = `${option.material_name }@@${option.x }@@${option.y }@@${option.z?option.z:"-" }@@${option.type?option.type:"定尺" }@@${option.price }`
                                let _text =  `${option.material_name } ${option.x }X${option.y } ${option.type }`
        
                                content2 +=`
                                <div class="input-group mb-3">
                                <span class="mx-1 input-group-text w-25">材料名</span>
                                <select type="number" class="form-control" id="spec3">
                                    <option value="${_val}">${_text}</option>
                                </select>
                                <div class="input-group mb-3">
                                    <span class="mx-1 input-group-text">X/Y/Z/種類/単価</span>
                                    <input  class="form-control" id="spec4" value="${option.x }/${option.type=="Roll"?"M":option.y}/${option.z?option.z:"-" }/${option.type?option.type:"定尺" }/${option.price }">
                                </div>
                                <div class="input-group mb-3">
                                    <span class="mx-1 input-group-text">Remark</span>
                                    <input  class="form-control" id="remark" value="${option.remark}">
                                </div>
                                `
                        }else{

                            content2+=
                            `
                                <div class="input-group mb-3">
                                    <span class="mx-1 input-group-text w-25">材料名</span>
                                    <select type="number" class="form-control" id="spec3">
                                    </select>
                                </div>
                                <div class="input-group mb-3">
                                    <span class="mx-1 input-group-text">X/Y/Z/種類/単価</span>
                                    <input  class="form-control" id="spec4">
                                </div>
                                <div class="input-group mb-3">
                                <span class="mx-1 input-group-text">Remark</span>
                                <input  class="form-control" id="remark" >
                            </div>
                            `
                        }
                        Swal.fire({
                            title: `構造仕様${no} 設定<br>種類①: ${isType}`,
                            html: content2,
                            showCloseButton: true,
                            ...swal_options,
                            showCancelButton: true,
                            confirmButtonText: '追加',
                            cancelButtonText: 'キャンセル',
                            didOpen: () => {
                                const spec2 = document.getElementById('spec2');
                                const spec3 = document.getElementById('spec3');
                                spec2.addEventListener('change', (event) => {
                                    spec3.innerHTML  = ""
                                    if (event.target.value) {
                                        let options = __cus_names.filter(c => c.cus_name == event.target.value)
                                        if(options){
                                            if(!spec3.value){
                                                $("#spec3").append(`<option value=""></option>`);
                                            }
                                            options.forEach(option =>{
                                                let val = `${option.material_name }@@${option.x }@@${option.type=="Roll"?"M":option.y }@@${option.z?option.z:"-" }@@${option.type?option.type:"定尺" }@@${option.price }@@${option.remark}`
                                                let text =  `${option.material_name }${option.type }`
                                                if(spec3.value == val){
                                                    $("#spec3").append(`<option value="${val}" selected >${text}</option>`);
                                                }else{
                                                    $("#spec3").append(`<option value="${val}">${text}</option>`);
                                                }
                                            })
                                        }
                                    }
                                });
                    
                                spec3.addEventListener('change', (event) => {
                                    if (event.target.value && event.target.value.length>5) {
                                        let arr = event.target.value.split("@@")
                                        let newArr = arr.slice(1, arr.length - 1);
                                        let remark = arr[arr.length - 1];
                                        let spec4Value = newArr.join("/");
                                        $('#spec4').val(spec4Value);
                                        $('#remark').val(remark);
                                    }
                                });
                            },
            
                            preConfirm: () => {
                                let spec2_val = $('#spec2').val()
                                let spec3_val = $('#spec3').val()
                                let specss4_val = document.getElementById('spec4').value.split("/")
                                let t_ma_x = Number(specss4_val[0])
                                let t_ma_y = specss4_val[3]=="Roll"?1000:Number(specss4_val[1])
                                let t_ma_price = Number(specss4_val[4])
                                let ma_price = Math.ceil(t_ma_price *(Number(material_x)*Number(material_y)) /(Number(t_ma_x)*Number(t_ma_y))*10)/10
                                let _spec3 = spec3_val > 0? spec3_val : spec3_val.split("@@")[0]
                                let _spec4 = specss4_val[3]=="Roll"?"M":specss4_val[1]
                                let _spec5 = specss4_val[3]=="Roll"?"円/m2":t_ma_price + "円/枚";
                                
                                return {
                                    spec2 : spec2_val,
                                    spec3 : _spec3,
                                    spec4 : String(t_ma_x) + "×" +  String(_spec4),
                                    spec5 : _spec5,
                                    spec6 : ma_price
                                    
            
                                }
            
                            }
                        }).then((res2) => {
                            if (res2.isConfirmed) {
                                $('#specs_1_' + no).val(isType);
                                $('#specs_2_' + no).val(res2.value.spec2);
                                $('#specs_3_' + no).val(res2.value.spec3);
                                $('#specs_4_' + no).val(res2.value.spec4);
                                $('#specs_5_' + no).val(res2.value.spec5);
                                $('#specs_6_' + no).val(res2.value.spec6);
                            }
                        });
                    }
        
                }
            }
        });
    }
    window.input_process_line = async function (e){
        let processs = await wb_db.doc('processs').get().then(doc=>doc.data())
        let subcontractors = await wb_db.doc('subcontractors').get().then(doc=>doc.data())
        let branchs = await wb_db.doc('processs').get().then(doc=>doc.data())
        let branchs_name = await wb_db.doc('setting').get().then(doc=>doc.data().branch)
        let no = e.target.id.split("_")[2]
        let process_1 = $('#process_1_' + no).val();
        let process_2 = $('#process_2_' + no).val();
        let process_3 = $('#process_3_' + no).val();
        const process_1_lts = ["削除","外注 印刷","外注 加工","内製 印刷","内製 加工","内製 検査"]
        const process_1_lts_json =  process_1_lts.reduce((json,value,key) => { 
            json[value] = value
            return json
        }, {})
        Swal.fire({
            title: `フローチャート ${no} 設定`,
            input: "select",
            inputOptions: process_1_lts_json,
            showCloseButton: true,
            ...swal_options,
            showCancelButton: true,
            confirmButtonText: '次へ',
            cancelButtonText: 'キャンセル',
            inputValue : process_1,
            inputValidator: (value) => {
                if (!value) {
                    return '項目を選択してください!';
                }
            }
        }).then((res1) => {
            if (res1.isConfirmed) {
                let isType = res1.value 
                if(isType == "削除"){ //削除
                    Swal.fire({
                        title: `工順 ${no}を削除してもよろしいでしょうか`,
                        showCloseButton: true,
                        showCancelButton: false,
                        ...swal_options,
                        confirmButtonText: 'OK',
                    })
                    .then(cf =>{
                        if(cf.isConfirmed){
                            $('#process_1_' + no).val("");
                            $('#process_2_' + no).val("");
                            $('#process_3_' + no).val("");
                            $('#process_4_' + no).val("");
                            $('#process_5_' + no).val("");
                            $('#process_6_' + no).val("");
                        }
                    })
                }else{
                    let __processs = Object.values(processs).filter(c => c.type == isType);
                    let content2 = `
                    <div class="input-group mb-3">
                        <span class="mx-1 input-group-text w-25">工程</span>
                        <select class="form-control" id="process2">
                    `
                    let _processs =[""].concat(__processs.map(cc => cc.name))
                    _processs.forEach(s=>{
                        if(process_2 == s){
                            content2+=`<option value="${s}" selected>${s}</option>`

                        }else{
                            content2+=`<option value="${s}">${s}</option>`

                        }
                    })
                    content2+=
                    `
                            </select>
                        </div>
                    `
                    if(process_3 && process_1 == isType){
                            content2 +=`
                            <div class="input-group mb-3">
                            <span class="mx-1 input-group-text w-25">加工先</span>
                            <select type="number" class="form-control" id="process3">
                                <option value="${process_3}">${process_3}</option>
                            </select>
                            `
                    }else{

                        content2+=
                        `
                            <div class="input-group mb-3">
                                <span class="mx-1 input-group-text w-25">加工先</span>
                                <select type="number" class="form-control" id="process3">
                                </select>
                            </div>
                        `
                    }
                    Swal.fire({
                        title: `フローチャート ${no} 設定<br>種類: ${isType}`,
                        html: content2,
                        showCloseButton: true,
                        showCancelButton: true,
                        ...swal_options,
                        confirmButtonText: '追加',
                        cancelButtonText: 'キャンセル',
                        didOpen: () => {
                            const process2 = document.getElementById('process2');
                            const process3 = document.getElementById('process3');
                            process2.addEventListener('change', (event) => {
                                process3.innerHTML  = ""
                                if (event.target.value) {
                                    let options = []
                                    if(isType == "外注 印刷" || isType == "外注 加工" ){
                                        options = Object.values(subcontractors).filter(c => c.process.includes(event.target.value)).map(cc =>cc.cus_name)
                                    }else{
                                        let _options = []
                                        Object.values(branchs).filter(c => c.name.includes(event.target.value)).map(cc =>{
                                            branchs_name.forEach(b_name => {
                                                if(cc[b_name]){ _options.push(b_name)}
                                            })
                                        })
                                        options = [...new Set(_options)];
                                        
                                    }
                                    if(options){
                                        if(!process3.value){
                                            $("#process3").append(`<option value=""></option>`);
                                        }
                                        options.forEach(opt =>{
                                            if(process3.value == opt){
                                                $("#process3").append(`<option value="${opt}" selected >${opt}</option>`);
                                            }else{
                                                $("#process3").append(`<option value="${opt}">${opt}</option>`);
                                            }
                                        })
                                    }
                                }
                            });
                
                        },
        
                        preConfirm: () => {
                            return {
                                process2 : $('#process2').val(),
                                process3 : $('#process3').val()
                            }
        
                        }
                    }).then((res2) => {
                        if (res2.isConfirmed) {
                            $('#process_1_' + no).val(isType);
                            $('#process_2_' + no).val(res2.value.process2);
                            $('#process_3_' + no).val(res2.value.process3);

                        }
                    });

                }
            }
        });
    }

    window.changeSpec31 = function (e){
        let specs_31_name = e.target.name;  // specs_3_No
        let specs_31_val = e.target.value.split("×");
        let specs_31_val_x = specs_31_val[0];
        let specs_31_val_y = specs_31_val[1];

        let specs_4_name = specs_31_name.replace('31', '4');
        let specs_4_val = $(`input[name="${specs_4_name}"]`).val();
        let specs_5_name = specs_31_name.replace('31', '5');
        let specs_5_val = $(`input[name="${specs_5_name}"]`).val();
        let specs_6_name = specs_31_name.replace('31', '6');
        let specs_7_name = specs_31_name.replace('31', '7');
        let layout_sum = Number($(`#layout_sum`).val());

        
        let content =
        `
        <div class="mb-3 row">
            <label for="staticEmail" class="col-sm-2 col-form-label">材料</label>
            <div class="col-sm-10">
                <input type="text" readonly class="form-control-plaintext" id="staticEmail" value="${specs_4_val + '  '+ specs_5_val}">
            </div>
        </div>
        <div class="input-group input-group-sm mb-2">
            <label class="col-sm-2 col-form-label w-25">使用サイズ</label>
            <input type="number" class="form-control" id="specs31_x" value="${specs_31_val_x}">
            <span  class="form-text mx-2">x</span>
            <input type="number" class="form-control" id="specs31_y" value="${specs_31_val_y}">

        </div>

        `
        Swal.fire({
            title: '使用ｻﾞｲｽﾞ設定',
            html:content,
            showCloseButton: true,
            ...swal_options,
            showCancelButton: true,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    specs31_x : document.getElementById('specs31_x').value,
                    specs31_y : document.getElementById('specs31_y').value
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const outputval = result.value;
                e.target.value = result.value.specs31_x + "×" + result.value.specs31_y
                $("#mark").val(outputval);
                let t_material_x = Number(specs_4_val.split("×")[0]);
                let t_material_y = specs_4_val.split("×")[1] =="M"?1000:Number(specs_4_val.split("×")[1]);
                let t_price = Number(specs_5_val.split("円")[0])
                let ma_price = Math.ceil((t_price *Number(result.value.specs31_x)*Number(result.value.specs31_y) /(t_material_x*t_material_y))*10)/10
                let ma_price_ = Math.ceil(ma_price*10/layout_sum)/10
                $(`input[name="${specs_6_name}"]`).val(ma_price)
                $(`input[name="${specs_7_name}"]`).val(ma_price_)
                

            }
        });

    }

    window.changeLot = function (e){
        let lot_name = e.target.name; //lot_1
        let lot_val = e.target.value;
        let layout_sum = Number($(`#layout_sum`).val());

        let sheet_quantity_1_name = lot_name.replace('lot_', 'sheet_quantity_') + "_1";
        let sheet_quantity_2_name = lot_name.replace('lot_', 'sheet_quantity_') + "_2";

        let sheet_quantity_spare_per_name = lot_name.replace('lot_', 'sheet_quantity_spare_') + "_per";
        let sheet_quantity_spare_per_val = $(`input[name="${sheet_quantity_spare_per_name}"]`).val()?$(`input[name="${sheet_quantity_spare_per_name}"]`).val():10;
        let sheet_quantity_spare_name = lot_name.replace('lot_', 'sheet_quantity_spare_');

        let sheet_quantity_1_name_val = Math.ceil( lot_val / layout_sum )
        let spare_val = Math.ceil( sheet_quantity_1_name_val * sheet_quantity_spare_per_val/100)
        console.log(lot_val,sheet_quantity_1_name_val)
        $(`input[name="${sheet_quantity_1_name}"]`).val(sheet_quantity_1_name_val)
        $(`input[name="${sheet_quantity_2_name}"]`).val(sheet_quantity_1_name_val)
        $(`input[name="${sheet_quantity_spare_name}"]`).val(spare_val)
    }

    window.to_input_out_process = function (e){
        
    }
});