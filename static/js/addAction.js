function addAction(){
    $("#new_action_button").click(function(){
        addActionSetup();
    });
}

function addActionSetup(){
    $("#create_action_layout").empty();
    loadNewActionBody();
    loadNewActionObj();
    $("#new-action-name-select").change(function(){
        loadNewActionObj();
    });

    // submit add new action
    $("#submit_add_action_button").click(function(){
        let action_idx = $("#new-action-name-select option:selected").val();
        let action = action_selects[action_idx];
        let new_action = [action[0]];
        for(let obj_idx=1; obj_idx<Object.keys(action).length;obj_idx++){
            let obj = $(".new-action-obj-"+obj_idx+" option:selected").text();
            new_action.push(obj);
        }
        createVirtualNewAction(new_action);
    });
}

function createVirtualNewAction(new_action){
    let action_str = new_action.join(', ');
    $("<div class='new-action-sortable'><div class='new-action-div'>"+action_str+"</div></div>").appendTo("#new_action_layout");
    $(".new-action-sortable").sortable({
        connectWith: "#planning",
        stop: function(event, div){
            let insert_idx = div.item.index();
            console.log(insert_idx);
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "/add_new_action",
                data: JSON.stringify({new_action: new_action, insert_idx: insert_idx}),
                success: function (data) {
                    myData = data;
                    // reload planning
                    loadInitialSetting();
                    createPlanning();
                    // clear add action layout
                    $("#create_action_layout").empty();
                },
                dataType: "json"
            });
        },
        // disable certain initial-state, goal state
        cancel: ".initial-state, .goal-state"
    }).disableSelection();
}

function loadNewActionBody(){
    $("<h3>New Action</h3><div id='create_action_form' class='form-group-lg'></div>").appendTo("#create_action_layout");
    $("<br/><button class='btn btn-primary' id='submit_add_action_button'>Submit</button>").appendTo("#create_action_form");
    let name_label = $("<label for='new-action-name-select' id='new-action-name-label'>action-name</label>").insertBefore("#submit_add_action_button");
    let name_select = $("<select class='form-control' id='new-action-name-select'></select>").insertBefore("#submit_add_action_button");
    for(let act_idx in action_selects){
        let act = action_selects[act_idx];
        let name = act[0];
        name_select.append($("<option>").attr("value",act_idx).text(name));
    }
}

function loadNewActionObj(){
    // remove all previous obj selects
    $("#create_action_form >select[id!='new-action-name-select']").remove();
    $("#create_action_form >label[id!='new-action-name-label']").remove();
    $("#create_action_form >br").remove();
    $("<br/>").insertBefore("#submit_add_action_button");
    // create new ones according to selected action
    let selected_idx = $("#new-action-name-select option:selected").val();
    let selected_act = $("#new-action-name-select option:selected").text();
    for(let obj_idx=1; obj_idx<Object.keys(action_selects[selected_idx]).length;obj_idx++){
        let obj = action_selects[selected_idx][obj_idx];
        let obj_type = action_params[selected_act][obj];
        let obj_label = $("<label for='"+obj_type+"'>"+obj+"</label>").insertBefore("#submit_add_action_button");
        let obj_select = $("<select class='new-action-obj-"+obj_idx+" form-control' id='"+obj_type+"'></select><br/>").insertBefore("#submit_add_action_button");
        for(let obj_name_idx in objects[obj_type]){
            let obj_name = objects[obj_type][obj_name_idx];
            obj_select.append($("<option>").attr("value",obj_name_idx).text(obj_name));
        }
    }
}