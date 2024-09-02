

function generateHtmlFromFormData(formData){
    html =  `
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <form id="quoteform" class="text-center" novalidate class="validated-form"> 
        <div class="container">
            <h1 class="text-center mt-5">御 見 積 書</h1>
            <div class="d-flex justify-content-between">
                <div class="d-flex flex-column mb-3 text-start">
                    <div class="d-flex flex-row mb-3 text-start  fs-3 fw-bold">
                        <input class="border-0   fs-3 fw-bold" type="text" name="cus_name" id="" value="${formData. cus_name}" readonly>
                        <span>様</span>
                    </div>

                    <label class="fs-4 mb-3" >下記の通りお見積申し上げます。</label>

                    <div class="d-flex flex-row mb-1 text-start">
                        <span class=" w-25">納期 : </span>
                        <input class="border-0 mx-2" type="date" name="date" id=""  value="${formData. date}"required>
                    </div>

                    <div class="d-flex flex-row mb-1 text-start">
                        <span class=" w-25">納入場所：</span>
                        <input class="border-0 mx-2" type="text" name="delivery_place" id=""  value="${formData. delivery_place}"required>
                    </div>

                    <div class="d-flex flex-row mb-1 text-start">
                        <span class=" w-25">お支払条件：</span>
                        <input class="border-0 mx-2" type="text" name="quote_payment_terms" id=""  value="${formData. quote_payment_terms}"required>
                    </div>

                    <div class="d-flex flex-row mb-1 text-start">
                        <span >見積有効期限：</span>
                        <input class="border-0 mx-2" type="date" name="quote_expiration_date" id=""  value="${formData. quote_expiration_date}"required>
                    </div>

                    <div class="d-flex flex-row  text-start">
                        <span class="w-50  fs-3 fw-bold text-start">合計金額</span>
                        <input class="fs-3 fw-bold border-0 mx-2" type="text" name="quote_total_amount" id=""  value="${formData. quote_total_amount}"required>
                    </div>
                </div>
                <div class="d-flex flex-column  text-start">
                    <input class="border-0 mb-5 text-end" type="date" name="quote_create_date" id=""  value="${formData. quote_create_date}"required>
                    <span class="border-0 fs-5 mb-2 mt-5 fw-bold">株式会社 正栄マーク製作所</span>
                    <span class="border-0 mb-2">〒170-0001</span>
                    <span class="border-0 mb-2">東京都 豊島区西巣鴨 1-11-18</span>
                    <span class="border-0 mb-2">TEL 03-3940-7700</span>
                    <span class="border-0 mb-2">FAX 03-3940-7701</span>
                </div>

            </div>
            <div class="row">
                <table class="table table-bordered  table-hover text-center  table-sm border-dark-subtle">
                    <thead>
                        <tr>
                            <th style="width:35%">部番 品名 仕様</th>
                            <th>数量</th>
                            <th>単位</th>
                            <th>単価</th>
                            <th>金額</th>
                        </tr>
                    </thead>
                    <tbody>
                    `             
    for(i = 0 ; i < 17 ; i++)  {
        html+=`
            <tr>
            <td><input class="border-0 w-100 text-center" type="text" name="quote_name_col${i}" value="${formData[`quote_name_col${i}`] || ''}"></td>
            <td><input class="border-0 w-100 text-center" type="text" name="quote_quantity_col${i}" value="${formData[`quote_quantity_col${i} `] || ''}"></td>
            <td><input class="border-0 w-100 text-center" type="text" name="quote_unit_col${i}" value="${formData[`quote_unit_col${i} `] || ''}"></td>
            <td><input class="border-0 w-100 text-center" type="text" name="quote_price_col${i}" value="${formData[`quote_price_col${i} `] || ''}"></td>
            <td><input class="border-0 w-100 text-center" type="text" name="quote_amount_col${i}" value="${formData[`quote_amount_col${i}`] || ''}"></td>
            </tr>
        
        `

                    }
                    
    html+=`
                            <tr>
                                <td><input class="border-0 w-100"  ></td>
                                <td><input class="border-0 w-100"  ></td>
                                <td><input class="border-0 w-100"  ></td>
                                <td><input class="border-0 w-100 text-center" type="text" name="" id="" value="消費税"></td>
                                <td><input class="border-0 w-100 text-center" type="text" name="quote_tax" id="" value="${formData. quote_tax}"></td>

                            </tr>
                            <tr>
                                <td><input class="border-0 w-100" type="text" name="" id=""></td>
                                <td><input class="border-0 w-100" type="text" name="" id=""></td>
                                <td><input class="border-0 w-100" type="text" name="" id=""></td>
                                <td><input class="border-0 w-100 fw-bold text-center" type="text" name="" id="" value="合計"></td>
                                <td><input class="border-0 w-100 fw-bold text-center" type="text" name="quote_sum" id="" value="${formData. quote_sum}"></td>

                            </tr>
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    </form>
    `
    return html;

}

module.exports = generateHtmlFromFormData;