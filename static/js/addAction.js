function addAction(){
    $("#new_action_button").click(function(){
        $('#newActionModal').modal('toggle');
        $("#newActionModalFooter").empty();
        $("#newActionModalFooter").append(`<button type="button" class="btn btn-primary" id="submitNewActionModal">Create</button>`)
        addActionSetup();
    });
}

function addActionSetup(){
    $("#newActionModalBody").empty();
    loadNewActionBody();
    loadNewActionObj();
    $("#new-action-name-select").change(function(){
        loadNewActionObj();
    });

    // submit add new action
    $("#submitNewActionModal").click(function(){
        $('#newActionModal').modal('toggle');
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
    $("<div class='new-action-sortable'><div class='new-action-div mb-5'><h4 class='action-text ml-3'>"+action_str+"</h4></div></div>").appendTo("#new_action_layout");
    $(".new-action-sortable").sortable({
        connectWith: "#planning",
        stop: function(event, div){
            let insert_idx = div.item.index();
            //console.log(insert_idx);
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
                    $("#newActionModalBody").empty();
                },
                dataType: "json"
            });
        },
        // disable certain initial-state, goal state
        cancel: ".initial-state, .goal-state"
    }).disableSelection();
}

function loadNewActionBody(){
    let name_label = $("<label for='new-action-name-select' id='new-action-name-label'><h4 class='title-text'>action-name</h4></label>").appendTo("#newActionModalBody");
    let name_select = $("<select class='form-control' id='new-action-name-select'></select>").appendTo("#newActionModalBody");
    for(let act_idx in action_selects){
        let act = action_selects[act_idx];
        let name = act[0];
        name_select.append($("<option>").attr("value",act_idx).text(name));
    }
}

function loadNewActionObj(){
    // remove all previous obj selects
    $("#newActionModalBody >select[id!='new-action-name-select']").remove();
    $("#newActionModalBody >label[id!='new-action-name-label']").remove();
    // create new ones according to selected action
    let selected_idx = $("#new-action-name-select option:selected").val();
    let selected_act = $("#new-action-name-select option:selected").text();
    for(let obj_idx=1; obj_idx<Object.keys(action_selects[selected_idx]).length;obj_idx++){
        let obj = action_selects[selected_idx][obj_idx];
        let obj_type = action_params[selected_act][obj];
        let obj_label = $("<label for='"+obj_type+"'><h4 class='title-text'>"+obj_type+' - '+obj+"</h4></label>").appendTo("#newActionModalBody");
        let obj_select = $("<select class='new-action-obj-"+obj_idx+" form-control' id='"+obj_type+"'></select>").appendTo("#newActionModalBody");
        for(let obj_name_idx in objects[obj_type]){
            let obj_name = objects[obj_type][obj_name_idx];
            obj_select.append($("<option>").attr("value",obj_name_idx).text(obj_name));
        }
    }
}