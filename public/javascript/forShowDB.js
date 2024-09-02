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

    $(function(){
        var elements = "input";
        $(elements).keypress(function(e) {
        var c = e.which ? e.which : e.keyCode;
        if (c == 13) { 
            var index = $(elements).index(this);
            $(elements + ":gt(" + index + "):first").focus();
            e.preventDefault();
        } 
        });
    });
    window.delete_a_material_cus = function(e) {
        e.preventDefault();
        Swal.fire({
            title: '本当に削除しますか？',
            text: "この仕入れ先の材料データがすべて削除されます",
            icon: 'warning',
            ...swal_options,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'はい、削除します',
            cancelButtonText: 'キャンセル'
        }).then((result) => {
            if (result.isConfirmed) {
                e.target.parentNode.submit();
            }
        });
    };

    window.filterCustomers = async function() {
        let filter_id = document.getElementById("filter_id").value
        let filter_name = document.getElementById("filter_name").value
        let filter_delivery = document.getElementById("filter_delivery").value
        var table = document.getElementById("customerTable");
        var tbody = table.getElementsByTagName("tbody")[0];

        tbody.innerHTML = ''; 

        let customers = await wb_db.doc('customers').get().then(doc => doc.data());
        let delivery = await wb_db.doc('setting').get().then(doc => doc.data().delivery);
        let allData = Object.values(customers)
        if(filter_id){
            let no = filter_id.split("～")
            let startId = Number(no[0])
            let endId = Number(no[1])
            allData = allData.filter(doc=>Number(doc.cus_id) <= endId && Number(doc.cus_id)>=startId)
        }
        if( filter_name){
            allData = allData.filter(doc=>doc.cus_name.includes(filter_name) || filter_name.includes(doc.cus_name))
        }
        if(filter_delivery){
            allData = allData.filter(doc=>doc.delivery == filter_delivery)
        }

        if(allData.length > 0){
            allData.forEach(customer => {
                let deliveryOptions = delivery.filter(d => d.name !== customer.delivery).map(d => `<option value="${d.name}">${d.name}</option>`).join('');
                let element = `
                <tr>
                    <td colspan="5" >
                        <form method="POST" action="/settings/customers/${customer.cus_id}?_method=PUT" novalidate class="validated-form">
                            <div class="d-flex flex-row justify-content-between">
                                <input class="border-0" type="number" name="cus_id" value="${customer.cus_id}" readonly>
                                <input class="w-25 border-0" type="text" name="cus_name" value="${customer.cus_name}">
                                <select class=" border-0" name="delivery">
                                    <option value="${customer.delivery}">${customer.delivery}</option>
                                    ${deliveryOptions}
                                </select>
                                <input class="w-25 border-0" type="text" name="note" value="${customer.note}">
                                <button class="btn btn-info btn-sm">更新</button>
                            </div>
                        </form>
                    </td>
                    <td>
                        <form method="POST" action="/settings/customers/${customer.cus_id}?_method=DELETE" class="d-inline">
                            <button class="btn btn-danger btn-sm">削除</button>
                        </form>
                    </td>
                </tr>
                `;
        
                tbody.innerHTML += element;
            });
        }else{


            tbody.innerHTML += `
            <tr>
                    <td colspan="5">
                        見つかりませんでした
                    </td>
            </tr>
            `;
        }
    }


    window.findName = async function(val) {
        var table = document.getElementById("cusTable");
        var tr = table.getElementsByTagName("tr");
        let _materials = await wb_db.doc('materials').get().then(doc => {
            let all = doc.data()
            all.id = doc.id
            return all
        });
        let materials = Object.values(_materials).filter(doc => Number(doc.cus_id) == Number(val))

        let arr = []
        for (var i = 1; i < tr.length; i++) {
            var tr_id = tr[i].id.split("@@");
            arr.push({cus_id: Number(tr_id[0]),cus_name : tr_id[1]})
        }

        let findCus = arr.filter(c => c.cus_id == Number(val))
        let isCus = 0
        if(findCus.length>0){
            isCus = findCus[0].cus_name
        }

        document.getElementById("new_cus_name").value = isCus
        
        var materialsTable = document.getElementById("materialsTable");
        var tbody = materialsTable.getElementsByTagName("tbody")[0];
        tbody.innerHTML = ''; 
        if(materials.length > 0){
            materials.forEach(material => {
                let element = `
                <tr class="align-middle">
                    <td colspan="15">
                        <form method="POST" action="/settings/materials/${ material.id }?_method=PUT" novalidate class="validated-form">
                            <div class="d-flex flex-row justify-content-between">
                                <input  class="yonpa border-0" type="number" name="cus_id" value="${material.cus_id }" readonly>
                                <input  class="juppa border-0" name="cus_name" value="${material.cus_name }" readonly>
                                <input  class="juppa border-0" name="material_name" value="${material.material_name }">
                                <input  class="sanpa checkbox"  type="checkbox"  name="type" ${material.type?'checked':"" }>
                                <input  class="yonpa border-0"  name="x" value="${material.x }">
                                <input  class="yonpa border-0"  name="y" value="${material.y }">
                                <input  class="sanpa border-0"  name="z" value="${material.z }">
                                <input  class="gopa border-0" type="number" name="price" value="${material.price }">
                                <input  class="border-0"  name="remark" value="${material.remark }">
                                <input  class="gopa checkbox"  type="checkbox" name="ma" ${material.ma?'checked':"" }>
                                <input  class="rokupa checkbox"  type="checkbox"  name="pf" ${material.pf?'checked':"" }>
                                <input  class="gopa checkbox"  type="checkbox"  name="ms" ${material.ms?'checked':"" }>
                                <input  class="gopa checkbox"  type="checkbox"  name="lm" ${material.lm?'checked':"" }>
                                <input  class="gopa checkbox"  type="checkbox"  name="wf" ${material.wf?'checked':"" }>
                                <input  class="gopa checkbox"  type="checkbox"  name="se" ${material.se?'checked':"" }>
                                <button class="sanpa btn btn-info btn-sm">更新</button>
                            </div>
                        </form>
                    </td>
                    <td>
                        <form method="POST" action="/settings/materials/${ material.id }?_method=DELETE" class="d-inline">
                            <button class="btn btn-danger btn-sm">削除</button>
                        </form>
                    </td>
                </tr>
                `;
        
                tbody.innerHTML += element;
            });
        }else{


            tbody.innerHTML += `
            <tr>
                    <td colspan="5">
                        見つかりませんでした
                    </td>
            </tr>
            `;
        }
    }

    // for subcontractors
    window.findNameSub = function(val) {
        var table = document.getElementById("cusTable");
        var tr = table.getElementsByTagName("tr");

        let arr = []
        for (var i = 1; i < tr.length; i++) {
            var tr_id = tr[i].id.split("@@");
            arr.push({cus_id: Number(tr_id[0]),cus_name : tr_id[1]})
        }

        let findCus = arr.filter(c => c.cus_id == Number(val))
        if(findCus.length>0){
            isCus = findCus[0].cus_name
            Swal.fire({
                title : "この外注先は既に登録されてます",
                ...swal_options,
            })
            document.getElementById("new_cus_name").value = ""
            document.getElementById("new_cus_id").value = 0
        }else{
            document.getElementById("new_cus_name").focus()
        }


    }

    window.changeProcess = async function(e) {
        let cus_id = e.target.id;

        // Fetch process data
        let _processs = await wb_db.doc('processs').get().then(doc => doc.data());
        const processArray = Object.values(_processs);
        const process = processArray.filter(doc => doc.type.includes("外注"))
            .map(doc => [doc.type, doc.name])
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(doc => doc[1]);

        // Fetch old subcontractor data
        const _olds = await wb_db.doc('subcontractors').get().then(doc => doc.data());
        const __olds = _olds[cus_id].process.join(",");
        const cus_name = _olds[cus_id].cus_name;

        // Generate HTML content
        let contents = `
        <form id="processForm">
            <label>外注名: ${cus_id} ${cus_name}</label>
            <div class="container">
                <table class="table text-center">
                    <tr>
                        <td>加工名</td>
                        <td>可否</td>
                    </tr>
        `;

        process.forEach(p => {
            contents += `
            <tr>
                <td>${p}</td>
                <td>
                    <input type="checkbox" name="process" value="${p}" ${__olds.includes(p) ? "checked" : ""}>
                </td>
            </tr>
            `;
        });

        contents += `
                </table>
            </div>
            <button type="submit" class="btn btn-primary" >Save</button>
        </form>
        `;

        Swal.fire({
            html: contents,
            ...swal_options,
            showConfirmButton: false // Hide the default confirm button
        });

        document.getElementById('processForm').addEventListener('submit', async (event) => {
            event.preventDefault(); 
            const selectedProcesses = Array.from(document.querySelectorAll('input[name="process"]:checked')).map(input => input.value);
            await wb_db.doc('subcontractors').update({
                [`${cus_id}.process`]: selectedProcesses
            });

        document.getElementById(cus_id + "@process").innerHTML = selectedProcesses.join(",")
            Swal.fire({
                icon: 'success',
                ...swal_options,
                title: 'Saved!',
                text: 'The selected processes have been saved.',
                timer: 2000
            });
        });
    }

    //for other process
    window.changeProcessType = async function(e){
        let branchs = await wb_db.doc('setting').get().then(doc => doc.data().branch);
        let thisId = e.target.id;
        let thisType = e.target.value;
        branchs.forEach(branch => {
            let branch_id = thisId + "_" + branch
            let td = document.getElementById(branch_id);
            if(thisType.includes("内製")){
                let inp = document.createElement("input")
                inp.setAttribute("class","checkbox")
                inp.setAttribute("name", branch)
                td.appendChild(inp)
            }else{
                td.innerHTML = ""
            }
        })
    };
})