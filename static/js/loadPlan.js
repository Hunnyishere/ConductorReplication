// setting the graphs
function createSvg(act_idx, pre_idx) {
    // create new svg object
    let new_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    new_svg.setAttribute('id', act_idx + "-" + pre_idx);
    new_svg.setAttribute('class', 'action-pre-svg');
    new_svg.setAttribute('width', '4%');
    new_svg.setAttribute('height', '40');
    new_svg.setAttribute('version', '1.1');
    new_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    new_svg.setAttribute('vertical-align', 'top');
    return new_svg;
}

function createCap(hide, miss_pre) {
    let new_cap = document.createElementNS("http://www.w3.org/2000/svg", "path");
    new_cap.setAttributeNS(null, "class", "new_cap");
    new_cap.setAttributeNS(null, "d", "M15,40 a1,1 0 1,0 -15,0");
    if (hide)
        new_cap.setAttribute('visibility', 'hidden');
    else
        new_cap.setAttribute('visibility', 'visible');
    if (miss_pre)
        new_cap.setAttributeNS(null, 'fill', 'red');
    else
        new_cap.setAttributeNS(null, 'fill', 'dodgerblue');
    return new_cap;
}

function createLink(hide, color) {
    let new_link = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    new_link.setAttributeNS(null, "class", "new_link");
    new_link.setAttributeNS(null, "x", "2.5");
    new_link.setAttributeNS(null, "y", "0");
    new_link.setAttributeNS(null, "width", "10");
    new_link.setAttributeNS(null, "height", "40");
    //console.log("color:"+color);
    new_link.setAttributeNS(null, "fill", color);
    if (hide)
        new_link.setAttribute('visibility', 'hidden');
    else
        new_link.setAttribute('visibility', 'visible');
    return new_link;
}

// shows only the precondition of each action
function interactiveAddLinksAndCaps(act_idx, row_link_div){
    let action = action_list[act_idx];
    let visited_pre = [];
    // see if satisfy positive preconditions
    for(let pre_idx in action_dict[action]["Precondition"]["pos"]){
        let pre_idx_in_list = action_dict[action]["Precondition"]["pos"][pre_idx];
        let pre = precondition_list[pre_idx_in_list];
        let svg = createSvg(act_idx, pre_idx_in_list);
        // add link
        let hide_link = true;
        for(let duration_idx in effect_duration[pre]){
            let duration = effect_duration[pre][duration_idx];
            // if pre is effect from previous actions, and this/below actions need it as precondition
            if(act_idx > duration[0] && act_idx <= duration[1]){
                hide_link = false;
            }
        }
        let link = createLink(hide_link, color_set[color_idx+pre_idx_in_list]);
        // add cap
        let cap = createCap(false, hide_link);

        // miss positive precondition
        if(hide_link){
            link.classList.add("miss-pos-pre-link");
        }
        // miss negative precondition
        if(!hide_link & action_dict[action]["Precondition"]["neg"].includes(pre_idx_in_list)){
            link.classList.add("miss-neg-pre-link");
        }

        svg.appendChild(link);
        svg.appendChild(cap);
        row_link_div.appendChild(svg);

        // record visited
        visited_pre.push(pre_idx_in_list);
    }

    // see if satisfy negative preconditions
    for(let pre_idx in action_dict[action]["Precondition"]["neg"]){
        let pre_idx_in_list = action_dict[action]["Precondition"]["neg"][pre_idx];
        // not yet visited in positive preconditions
        if(!visited_pre.includes(pre_idx_in_list)){
            let pre = precondition_list[pre_idx_in_list];
            let svg = createSvg(act_idx, pre_idx_in_list);
            // add link
            let hide_link = true;
            for(let duration_idx in effect_duration[pre]){
                let duration = effect_duration[pre][duration_idx];
                // if pre is effect from previous actions, and this/below actions need it as precondition
                if(act_idx > duration[0] && act_idx <= duration[1]){
                    hide_link = false;
                }
            }
            let link = createLink(hide_link, color_set[color_idx+pre_idx_in_list]);
            // add cap
            let cap = createCap(false, !hide_link);

            // miss negative precondition
            if(!hide_link){
                link.classList.add("miss-neg-pre-link");
            }

            svg.appendChild(link);
            svg.appendChild(cap);
            row_link_div.appendChild(svg);
        }
    }
    return row_link_div;
}

// shows the paths of all preconditions
function addLinksAndCaps(act_idx, row_link_div){
    for(let pre_idx in precondition_list){
        let svg = createFullPathLinkAndCap(act_idx, pre_idx);
        // add svg to link_row
        row_link_div.appendChild(svg);
    }
    return row_link_div;
}

function createFullPathLinkAndCap(act_idx, pre_idx){
    let pre = precondition_list[pre_idx];
    let color = color_set[color_idx+parseInt(pre_idx)];
    let svg = createSvg(act_idx, pre_idx);
    let action = action_list[act_idx];

    // determine if the link needs to hide
    let hide_link = true;
    for(let duration_idx in effect_duration[pre]){
        let duration = effect_duration[pre][duration_idx];
        // if pre is effect from previous actions, and this/below actions need it as precondition
        if(act_idx > duration[0] && act_idx <= duration[1]){
            hide_link = false;
        }
    }
    let link = createLink(hide_link, color);

    // determine whether there's a cap or not, if this cap is red(missing precondition)
    let hide_cap = true;
    let miss_pre = false;
    // there's a cap: the action needs this precondition (positive/negative)
    if(action_dict[action]["Precondition"]["pos"].includes(precondition_list.indexOf(pre))){
        hide_cap = false;
        // miss positive precondition
        if(hide_link){
            miss_pre = true;
            link.classList.add("miss-pos-pre-link");
        }
    }
    if(action_dict[action]["Precondition"]["neg"].includes(precondition_list.indexOf(pre))){
        hide_cap = false;
        // miss negative precondition
        if(!hide_link){
            miss_pre = true;
            link.classList.add("miss-neg-pre-link");
        }
    }
    // if hide_link=true, misses pre
    let cap = createCap(hide_cap, miss_pre);

    // append to svg
    svg.appendChild(link);
    svg.appendChild(cap);
    return svg;
}

function createAddButton(target_identifier, target){
    let add_button = document.createElement("button");
    add_button.setAttribute("class", "btn-sm "+target+"_add_button btn-success ml-3");
    add_button.setAttribute("id", target_identifier);
    let add_icon = document.createElement("i");
    add_icon.setAttribute("class", "fa fa-plus-square text-light");
    add_button.appendChild(add_icon);
    return add_button;
}

function createDeleteButton(target_identifier, target) {
    let delete_button = document.createElement("button");
    delete_button.setAttribute("class", "btn "+target+"_delete_button btn-secondary ml-1 mr-3");
    delete_button.setAttribute("id", target_identifier);
    delete_button.setAttribute("padding", "0px 0px");
    delete_button.setAttribute("border", "none");
    let delete_icon = document.createElement("i");
    delete_icon.setAttribute("class", "fa fa-trash text-light");
    delete_button.appendChild(delete_icon);
    return delete_button;
}

function createRows(act_idx) {
    let action = action_list[act_idx];
    let action_text = action;
    if(action!="Initial State" && action!="Goal State") {
        // remove ' [ ]
        let splits = action.toString().split("'");
        const regexp = /([a-z0-9\-\_]+)/;
        let matches = [];
        for (let sid in splits) {
            let s = splits[sid];
            let match = s.match(regexp);
            if (match) {
                matches.push(match[1]);
            }
        }
        action_text = matches.length != 0 ? matches.join(', ') : '';
    }

    // action rows
    let row_action_div = document.createElement("div");
    row_action_div.setAttribute("class", "row action-row");
    row_action_div.setAttribute("id", "action-row-"+act_idx);
    // add action
    let action_div = document.createElement("div");
    action_div.setAttribute("class", "action-row-div");
    action_div.setAttribute("id", "action-row-div-"+act_idx);
    let text_node = document.createElement("h4");
    text_node.setAttribute("class", "action-text ml-3");
    let act_no = act_idx != 0 && act_idx != action_list.length-1 ? act_idx+'. ' : '';
    text_node.innerHTML = `${act_no}${action_text}`;
    // create delete button for the action
    // initial state and goal state can't be deleted
    if(act_idx != 0 && act_idx != (action_list.length-1)){
        let delete_button = createDeleteButton(act_idx, "action");
        text_node.appendChild(delete_button);
    }
    action_div.appendChild(text_node);
    // add to row
    row_action_div.appendChild(action_div);

    // link row is the preconditions for the current action
    if(act_idx!=0){
        let row_link_div = document.createElement("div");
        row_link_div.setAttribute("class", "row link-row");
        row_link_div.setAttribute("id", "link-row-"+act_idx);
        // add links and caps
        //row_link_div = addLinksAndCaps(act_idx, row_link_div);
        row_link_div = interactiveAddLinksAndCaps(act_idx, row_link_div);
        return [row_link_div, row_action_div];
    }
    return [row_action_div];
}

function createAction(act_idx){
    let action_div = document.createElement("div");
    action_div.setAttribute("class","action-div");
    action_div.setAttribute("id",act_idx);
    if(act_idx == 0){
        action_div.classList.add("initial-state");
    }
    else if(act_idx==action_list.length-1){
        action_div.classList.add("goal-state");
    }
    if(act_idx != 0) {
        // create 2 rows for each action
        [row_link_div, row_action_div] = createRows(act_idx);
        action_div.appendChild(row_link_div);
    }
    // start state doesn't have link
    else{
        [row_action_div] = createRows(act_idx);
    }
    action_div.appendChild(row_action_div);
    return action_div;
}

function savePlan(){
    // avoid one button binds multiple plans
    $("#btn_group_1 > #save_plan_button").remove();
    $("#btn_group_1").append(`<button class="btn btn-secondary" id="save_plan_button">Save Plan</button>`);
    $("#save_plan_button").click(function(){
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "/save_plan",
            success: function (saveFile) {
                // download file
                var blob = new Blob ([saveFile], {"type": "text/plain"});
                var a = document.createElement ('a');
                a.download = 'plan.txt';
                a.href = window.URL.createObjectURL (blob);
                a.click ();
                console.log ('Data saved');
            }
        });
    });
}

// load initial planning
function createPlanning() {
    // load position select options for add action panel
    // loadAddActionSelects();

    //get whole frame
    let planning_frame = document.getElementById("planning");
    // clear previous panel
    while (planning_frame.childNodes.length != 0){
        planning_frame.removeChild(planning_frame.childNodes[0]);
    }
    // create new one based on change
    // for each action, links come before action
    for (let act_idx in action_list) {
        let action_div = createAction(act_idx);
        planning_frame.appendChild(action_div);
    }

    // display pre and eff for actions in the middle bar
    displayPreAndEff();
    showAll();
    hideAll();

    // animations to display precondition path
    hoverShowPreInMiddle();
    clickShowPathOnLeft();
    clickShowPathOnMiddle();

    // animation for open condition
    openConditionAnimation();

    // undo functions
    expandPlanning();
    resetPlanning();

    // edit actions
    addAction();
    removeAction();
    reorderActions();
    // save plan
    savePlan();

    // edit preconditions or effects of action
    deletePreOrEff();
    addPreOrEff();
}
