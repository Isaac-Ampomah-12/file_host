function showModal() {
    document.getElementById("overlay").style.display = "block";
}

function closeModal() {
    document.getElementById("overlay").style.display = "none";
}

//get URL query parameters
function getParamenter(parameterName) {
    let parameters = new URLSearchParams(window.location.search);
    return parameters.get(parameterName);
}

// Get all files
$(document).ready(function () {
    

    let userRole = getParamenter('userRole'); 
    // let userId = getParamenter('userId'); 

    console.log(userRole);
    // console.log(userId);
    if (userRole === 'admin'){
        // $("#show_modal_btn").css("display") = "block";
        // document.getElementById("show_modal_btn").style.display = "block";
        $("#show_modal_btn").css("display","block");

    }
    // else {
        
    // }
    $.ajax({
        url: 'http://localhost:8080/allFiles',
        type: 'GET',
        success: function(files) {
            console.log(files);
            let grid = $('#grid');
            let gridContent = "";
            files.forEach(file => {
                gridContent = `
                <div id="row" class="row">
                    <div id="action_field" class="action_field">
                    <b id="${file.fileName}" class="download_btn" onclick="download(this.id)">Download</b>
                    <b id="${file.fileId}" class="send_email" onclick="fileToEmail(this.id)">Email</b>
                    </div>
                    <div id="title_field" class="title_field">${file.title}</div>
                    <div id="file_name_${file.fileId}" onclick="fileEmailCount(this.id)" class="file_name_field">${file.fileName}</div>
                    <div id="description_field" class="description_field">${file.description}</div>
                </div>
                `;
                grid.append(gridContent);
            });

        },
        error: function (err) {
            console.log(err);
        }
    })
});

//Get Specific files or files
$('#search_btn').click(function (e) {
    e.preventDefault();
    let searchInfo = {
        search: $('#search_input').val()
    }
    $("#grid").html("");
    $.ajax({
        url: 'http://localhost:8080/fileSearch',
        type: 'POST',
        data: JSON.stringify(searchInfo),
        dataType: 'json',
        contentType: "application/json",
        success: function(files) {

            if (files.length !== 0) {
                console.log(files);
                let grid = $('#grid');
                let gridContent = "";
                files.forEach(file => {
                    
                    gridContent = `
                    <div id="row" class="row">
                        <div id="action_field" class="action_field"><p id="download_btn${file.fileId}" class="download_btn">Download</p>
                        <p id="${file.fileId}" class="send_email" onclick="fileToEmail(this.id)">Email</p></div>
                        <div id="title_field" class="title_field">${file.title}</div>
                        <div id="file_name_field" class="file_name_field" onclick="fileEmailCount(this.id)">${file.fileName}</div>
                        <div id="description_field" class="description_field">${file.description}</div>
                    </div>
                    `;
                    grid.append(gridContent);


                });
            }else{
                alert("No such FIle");
            }

        },
        error: function (err) {
            console.log(err);
        }
    })
});

// send file to email
const fileEmailCount = (click_id) => {
    let fileId = click_id.split("_")[2];
    // console.log(fileId);

    let countInput = {
        fileId : fileId
    }

    $.ajax({
        url: 'http://localhost:8080/fileEmailCount',
        type: 'POST',
        data: JSON.stringify(countInput),
        dataType: 'json',
        contentType: "application/json",
        success: (result) => {
            console.log(result);
            if(result) alert("Email Count = " + result.fileCount);
           
        },
        error: (err) => {
            console.log(err);
        }

    });

}

// file to an email adress
const fileToEmail = (click_id) => {
    let fileId = click_id;
    // console.log(fileId);
    let recepientEmail = prompt("Receipient email");
    // console.log(recepientEmail);

    let emailInfo = {
        fileId: fileId,
        recepientEmail: recepientEmail
    };
    
    console.log(emailInfo);
    $.ajax({
        url: 'http://localhost:8080/fileEmail',
        type: 'POST',
        data: JSON.stringify(emailInfo),
        dataType: 'json',
        contentType: "application/json",
        success: (result) => {
            console.log(result);
            if(result) alert("File Sent to " + recepientEmail);
           
        },
        error: (err) => {
            console.log(err);
        }

    });

}


const download = (click_id) => {
    let filefile = click_id;
    console.log(filefile);

    window.location.href = `http://localhost:8080/fileDownload?fileName=${filefile}`;

    // let recepientEmail = prompt("Receipient email");
    // console.log(recepientEmail);

    // let emailInfo = {
    //     fileId: fileId,
    //     recepientEmail: recepientEmail
    // };
    
    // console.log(emailInfo);
    // $.ajax({
    //     url: 'http://localhost:8080/fileEmail',
    //     type: 'POST',
    //     data: JSON.stringify(emailInfo),
    //     dataType: 'json',
    //     contentType: "application/json",
    //     success: (result) => {
    //         console.log(result);
    //         if(result) alert("File Sent to " + recepientEmail);
           
    //     },
    //     error: (err) => {
    //         console.log(err);
    //     }

    // });

}


//Upload a file
$('#upload_btn').click(function (e) {
    e.preventDefault();
    // let fileInfo = {
    //     "title": $('#title').val(),
    //     "description": $('#description').val(),
    //     "upload": $('#file').val(),


    // };

    var title =  $('#title').val();
    var description =  $('#description').val();
    var file_data =  $('#file').prop('files')[0];
    var form_data = new FormData();
    form_data.append("file", file_data);
    form_data.append("title",title);
    form_data.append("description",description);

    $.ajax({
        url: 'http://localhost:8080/fileUpload',
        type: 'POST',
        dataType: 'script',
        Cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        
        // url: 'http://localhost:8080/fileUpload',
        // type: 'POST',
        // data: JSON.stringify(fileInfo),
        // dataType: 'json',
        // contentType: "application/json",
        success: function(files) {
            if (files.length !== 0) {
                console.log(files);
                let grid = $('#grid');
                let gridContent = "";
                files.forEach(file => {
                    gridContent = `
                    <div id="row" class="row">
                        <div id="action_field" class="action_field"><p id="download_btn${file.fileId}" class="download_btn">Download</p><p id="send_email${file.fileId}" class="send_email">Email</p></div>
                        <div id="title_field" class="title_field">${file.title}</div>
                        <div id="file_name_field" class="file_name_field">${file.fileName}</div>
                        <div id="description_field" class="description_field">${file.description}</div>
                    </div>
                    `;
                    grid.append(gridContent);
                });
            }else{
                alert("No such FIle");
            }

        },
        error: function (err) {
            console.log(err);
        }
    })
});

// fileEmailCOunt

