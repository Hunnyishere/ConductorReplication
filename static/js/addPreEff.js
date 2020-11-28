function addPreOrEff(){
    $(".pos-pre_add_button").each(function(){
        $(this).click(function(){
            $("#create_precondition_layout").empty();
            $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
            $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
            $(this).addClass("btn-danger");
            let act_idx = this.id;
            addPreSetup("pos-pre",act_idx);
        });
    });

    $(".neg-pre_add_button").each(function(){
        $(this).click(function(){
            $("#create_precondition_layout").empty();
            $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
            $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
            $(this).addClass("btn-danger");
            let act_idx = this.id;
            addPreSetup("neg-pre",act_idx);
        });
    });

    $(".pos-eff_add_button").each(function(){
        $(this).click(function(){
            $("#create_precondition_layout").empty();
            $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
            $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
            $(this).addClass("btn-danger");
            let act_idx = this.id;
            addPreSetup("pos-eff",act_idx);
        });
    });

    $(".neg-eff_add_button").each(function(){
        $(this).click(function(){
            $("#create_precondition_layout").empty();
            $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
            $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
            $(this).addClass("btn-danger");
            let act_idx = this.id;
            addPreSetup("neg-eff",act_idx);
        });
    });
}

function addPreSetup(target_name, act_idx){
    $("#create_pre_layout").empty();
    loadNewPreBody();
    loadNewPreObj();
    $("#new-precondition-name-select").change(function(){
        loadNewPreObj();
    });

    // submit add new pre
    $("#submit_add_precondition_button").click(function(){
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
                $("#create_precondition_layout").empty();
                $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
            },
            dataType: "json"
        });
    });
}

function loadNewPreBody(){
    $("<h3>New Precondition</h3><div id='create_precondition_form' class='form-group-lg'></div>").appendTo("#create_precondition_layout");
    $("<br/><button class='btn btn-primary' id='submit_add_precondition_button'>Submit</button>").appendTo("#create_precondition_form");
    let name_label = $("<label for='new-precondition-name-select' id='new-precondition-name-label'><h4 class='title-text'>precondition-name</h4></label>").insertBefore("#submit_add_precondition_button");
    let name_select = $("<select id='new-precondition-name-select' class='form-control'></select>").insertBefore("#submit_add_precondition_button");
    for(let pre_idx in pre_selects){
        let pre = pre_selects[pre_idx];
        let name = pre[0];
        name_select.append($("<option>").attr("value",pre_idx).text(name));
    }
}

function loadNewPreObj(){
    // remove all previous obj selects
    $("#create_precondition_form >select[id!='new-precondition-name-select']").remove();
    $("#create_precondition_form >label[id!='new-precondition-name-label']").remove();
    $("#create_precondition_form >br").remove();
    $("<br/>").insertBefore("#submit_add_precondition_button");
    // create new ones according to selected precondition
    let selected_idx = $("#new-precondition-name-select option:selected").val();
    let selected_pre = pre_selects[selected_idx];
    for(let obj_idx=1; obj_idx<Object.keys(pre_selects[selected_idx]).length;obj_idx++){
        let obj = pre_selects[selected_idx][obj_idx];
        let obj_type = pre_params[selected_pre.join(';')][obj];
        let obj_label = $("<label for='"+obj_type+"'><h4 class='title-text'>"+obj+"</h4></label>").insertBefore("#submit_add_precondition_button");
        let obj_select = $("<select class='new-precondition-obj-"+obj_idx+" form-control' id='"+obj_type+"'></select><br/>").insertBefore("#submit_add_precondition_button");
        for(let obj_name_idx in objects[obj_type]){
            let obj_name = objects[obj_type][obj_name_idx];
            obj_select.append($("<option>").attr("value",obj_name_idx).text(obj_name));
        }
    }
}