//Upload snow WaterML file to HydroShare
var displayStatus = $('#display-status');


$('#hydroshare-proceed').on('click', function ()  {
           //This function only works on HTML5 browsers.
    console.log('running hydroshare-proceed!!');

    //now we construct the WaterML..
    var waterml_link = $("#waterml-link").attr("href");
    var upload_link = '/apps/snow-inspector/upload-to-hydroshare/';

    displayStatus.removeClass('error');
    displayStatus.addClass('uploading');
    displayStatus.html('<em>Uploading...</em>');

    var resourceAbstract = $('#resource-abstract').val();
    var resourceTitle = $('#resource-title').val();
    var resourceKeywords = $('#resource-keywords').val() ? $('#resource-keywords').val() : "";
    var resourceType = $('#resource-type').val();
    var resourcePublic = $("#resource-public").prop("checked");

    if (!resourceTitle || !resourceKeywords || !resourceAbstract)
    {
        displayStatus.removeClass('uploading');
        displayStatus.addClass('error');
        displayStatus.html('<em>You must provide all metadata information.</em>');
        return
    }

    var csrf_token = getCookie('csrftoken');
    $(this).prop('disabled', true);
    $.ajax({
        type: 'POST',
        url: upload_link,
        headers:{'X-CSRFToken':csrf_token},
        dataType:'json',
        data: {'title':resourceTitle, 'abstract': resourceAbstract,
            'keyword': resourceKeywords, 'res_type':resourceType,
            'waterml_link': waterml_link, 'public': resourcePublic},
        success: function (data) {
            debugger;
            $('#hydroshare-proceed').prop('disabled', false);
            if ('error' in data) {
                displayStatus.removeClass('uploading');
                displayStatus.addClass('error');
                displayStatus.html('<em>' + data.error + '</em>');
            }
            else
            {
                displayStatus.removeClass('uploading');
                displayStatus.addClass('success');
                displayStatus.html('<em>' + data.success + ' View in HydroShare <a href="https://www.hydroshare.org/resource/' + data.newResource +
                    '" target="_blank">HERE</a></em>');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error");
            debugger;
            $('#hydroshare-proceed').prop('disabled', false);
            console.log(jqXHR + '\n' + textStatus + '\n' + errorThrown);
            displayStatus.removeClass('uploading');
            displayStatus.addClass('error');
            displayStatus.html('<em>' + errorThrown + '</em>');
        }
    });
});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}