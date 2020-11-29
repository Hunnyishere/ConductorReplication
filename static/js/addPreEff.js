function addPreOrEff(){
    $(".pos-pre_add_button").each(function(){
        $(this).click(function(){
            $("#newPreconditionModalBody").empty();
            $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
            $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
            $(this).addClass("btn-danger");
            let act_idx = this.id;
            addPreSetup("pos-pre",act_idx);
        });
    });

    $(".neg-pre_add_button").each(function(){
        $(this).click(function(){
            $("#newPreconditionModalBody").empty();
            $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
            $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
            $(this).addClass("btn-danger");
            let act_idx = this.id;
            addPreSetup("neg-pre",act_idx);
        });
    });

    $(".pos-eff_add_button").each(function(){
        $(this).click(function(){
            $("#newPreconditionModalBody").empty();
            $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
            $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
            $(this).addClass("btn-danger");
            let act_idx = this.id;
            addPreSetup("pos-eff",act_idx);
        });
    });

    $(".neg-eff_add_button").each(function(){
        $(this).click(function(){
            $("#newPreconditionModalBody").empty();
            $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
            $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
            $(this).addClass("btn-danger");
            let act_idx = this.id;
            addPreSetup("neg-eff",act_idx);
        });
    });
}

function addPreSetup(target_name, act_idx){
    $('#newPreconditionModal').modal('toggle');
    $("#newPreconditionModalBody").empty();
    loadNewPreBody();
    loadNewPreObj();
    $("#new-precondition-name-select").change(function(){
        loadNewPreObj();
    });

    // submit add new pre
    $("#submitNewPreconditionModal").click(function(){
        $('#newPreconditionModal').modal('toggle');
        let pre_idx = $("#new-precondition-name-select option:selected").val();
        let pre = pre_selects[pre_idx];
        let new_pre = [pre[0]];
        for(let obj_idx=1; obj_idx<Object.keys(pre).length;obj_idx++){
            let obj = $(".new-precondition-obj-"+obj_idx+" option:selected").text();
            new_pre.push(obj);
        }
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "/add_pre",
            data: JSON.stringify({act_idx: act_idx, target_name: target_name, new_pre: new_pre}),
            success: function (data) {
                myData = data;
                // reload planning
                loadInitialSetting();
                createPlanning();
                // clear add precondition layout
                $("#newPreconditionModalBody").empty();
                $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
            },
            dataType: "json"
        });
    });
}

function loadNewPreBody(){
    let name_label = $("<label for='new-precondition-name-select' id='new-precondition-name-label'><h4 class='title-text'>precondition-name</h4></label>").appendTo("#newPreconditionModalBody");
    let name_select = $("<select id='new-precondition-name-select' class='form-control'></select>").appendTo("#newPreconditionModalBody");
    for(let pre_idx in pre_selects){
        let pre = pre_selects[pre_idx];
        let name = pre[0];
        name_select.append($("<option>").attr("value",pre_idx).text(name));
    }
}

function loadNewPreObj(){
    // remove all previous obj selects
    $("#newPreconditionModalBody >select[id!='new-precondition-name-select']").remove();
    $("#newPreconditionModalBody >label[id!='new-precondition-name-label']").remove();
    // create new ones according to selected precondition
    let selected_idx = $("#new-precondition-name-select option:selected").val();
    let selected_pre = pre_selects[selected_idx];
    for(let obj_idx=1; obj_idx<Object.keys(pre_selects[selected_idx]).length;obj_idx++){
        let obj = pre_selects[selected_idx][obj_idx];
        let obj_type = pre_params[selected_pre.join(';')][obj];
        let obj_label = $("<label for='"+obj_type+"'><h4 class='title-text'>"+obj_type+' - '+obj+"</h4></label>").appendTo("#newPreconditionModalBody");
        let obj_select = $("<select class='new-precondition-obj-"+obj_idx+" form-control' id='"+obj_type+"'></select>").appendTo("#newPreconditionModalBody");
        for(let obj_name_idx in objects[obj_type]){
            let obj_name = objects[obj_type][obj_name_idx];
            obj_select.append($("<option>").attr("value",obj_name_idx).text(obj_name));
        }
    }
}