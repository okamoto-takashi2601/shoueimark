$(document).ready(function() {
    const currentLocation = decodeURIComponent(window.location.pathname);
    $('.nav-link').each(function() {
        if ($(this).attr('href') === currentLocation) {
            $(this).addClass('active');
        }
    });
    
    // Enterキーが押されたときの処理
    $('#quoteform').on('keypress', function(e) {
        return e.which !== 13;

    });

    $('#pdfSaveButton').on('click', function(e) {
        e.preventDefault();
        const formData = $('#quoteform').serialize();
        $.ajax({
            url: '/products/generate-pdf',
            method: 'POST',
            data: formData,
            xhrFields: {
                responseType: 'blob' 
            },
            success: function(response) {
                const blob = new Blob([response], { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'quote.pdf';
                link.click();
            },
            error: function(xhr, status, error) {
                alert('Error generating PDF: ' + error);
            }
        });

    })


    const cells = $('[tabindex="0"]');
    let currentIndex = 1;
    const cellNames = [];

    cells.each(function(index, cell) {
        const name = $(cell).attr('name');
        if (name) {
            cellNames.push(name);
        }
    });

    $(document).on('keydown', function(event) {
        if (event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 13) {
            event.preventDefault();

            const numCols = 4;
            let nextIndex = currentIndex;

            const cellName = event.target.getAttribute('name') ? event.target.getAttribute('name') : $(event.target).parent().attr('name');
            currentIndex = cellNames.indexOf(cellName);

            if (event.keyCode === 40) {
                nextIndex = currentIndex + numCols;
            } else if (event.keyCode === 38) {
                nextIndex = currentIndex - numCols;
            } else if (event.keyCode === 37) {
                nextIndex = currentIndex - 1;
            } else if (event.keyCode === 39 || event.keyCode === 13 ) {
                nextIndex = currentIndex + 1;
            }

            if (nextIndex >= 0 && nextIndex < cells.length) {
                const nextCell = cells.eq(nextIndex);
                const firstChild = nextCell.find("input, select").first();

                if (firstChild.length) {
                    firstChild.focus();
                    try {
                        firstChild.select();
                    } catch (e) {
                        firstChild.focus();
                    }
                } else {
                    nextCell.focus();
                }
                currentIndex = nextIndex;
            }
        }
    });

});
async function createPdf(e){
    e.preventDefault();
    
    const formData = $('#quoteform').serialize();
    $.ajax({
        url: '/products/generate-pdf',
        method: 'POST',
        data: formData,
        xhrFields: {
            responseType: 'blob' 
        },
        success: function(response) {
            const blob = new Blob([response], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'quote.pdf';
            link.click();
        },
        error: function(xhr, status, error) {
            alert('Error generating PDF: ' + error);
        }
    });
}
function cal_quote(e) {
    let sum = 0;

    // 各行の数量と単価から金額を計算する
    for (let i = 0; i < 17; i++) {
        const quantity = parseFloat($(`input[name='quote_quantity_col${i}']`).val()) || 0;
        const price = parseFloat($(`input[name='quote_price_col${i}']`).val()) || 0;
        let amount = ""
        if(quantity && price){   
            amount = quantity * price;
            $(`input[name='quote_amount_col${i}']`).val(changeYen(amount));
            sum += amount;
        }
    }

    // 税金を計算する（10%）
    const tax = sum * 0.1;
    $(`input[name='quote_tax']`).val(changeYen(tax));

    // 合計金額に税金を加える
    const totalAmount = sum*1.1;

    // 合計金額をフォームに表示する
    $('input[name="quote_sum"]').val(changeYen(sum)); // 2桁の小数点まで表示
    $('input[name="quote_total_amount"]').val(changeYen(totalAmount)); // 2桁の小数点まで表示
}

function changeYen(e){
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(e)
}


