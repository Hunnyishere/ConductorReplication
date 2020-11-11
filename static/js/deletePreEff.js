function deletePreOrEff(){
    $(".pos-pre_delete_button").each(function(){
        $(this).click(function(){
            let [act_idx, pre_idx] = this.id.split('-');
            sendDeleteRequest("pos-pre", act_idx, pre_idx);
        });
    });

    $(".neg-pre_delete_button").each(function(){
        $(this).click(function(){
            let [act_idx, pre_idx] = this.id.split('-');
            sendDeleteRequest("neg-pre", act_idx, pre_idx);
        });
    });

    $(".pos-eff_delete_button").each(function(){
        $(this).click(function(){
            let [act_idx, eff_idx] = this.id.split('-');
            sendDeleteRequest("pos-eff", act_idx, eff_idx);
        });
    });

    $(".neg-eff_delete_button").each(function(){
        $(this).click(function(){
            let [act_idx, eff_idx] = this.id.split('-');
            sendDeleteRequest("neg-eff", act_idx, eff_idx);
        });
    });
}

function sendDeleteRequest(target_name, act_idx, pre_idx){
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/delete_pre",
        data: JSON.stringify({act_idx: act_idx, target_name: target_name, pre_idx: pre_idx}),
        success: function (data) {
            myData = data;
            // reload planning
            loadInitialSetting();
            createPlanning();
        },
        dataType: "json"
    });
}