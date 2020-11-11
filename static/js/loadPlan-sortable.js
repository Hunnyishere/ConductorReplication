$(document).ready(function () {
    console.log(action_list);
    console.log(action_dict);

    createPlanning();

    // mouseOver and mouseOut events (jquery)
    $(".link").on("mouseover", function (event) {
        $(".action-pre, .action-eff").hide();
        showPath(event.target.id);
    });

    $(".link").on("mouseout", function (event) {
        console.log(event.target.id);
    });

    // toggle events
    $(".action-name").click(function (event) {
        let target = $(event.target);
        target.siblings().toggle();
    });

    // sorting events
    $("#planning_frame").sortable({
        connectWith: ".planning_frame"
    }).disableSelection();

    $("#sortable1").sortable({
        connectWith: "#planning_frame"
    }).disableSelection();
});

// show path for one precondition/effect
function showPath (pre) {

}

// setting the graphs
function createSvg (pre) {
    // create new svg object
    let new_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    new_svg.setAttribute('id', pre);
    new_svg.setAttribute('class', 'svg');
    new_svg.setAttribute('width', '4%');
    new_svg.setAttribute('height', '40');
    new_svg.setAttribute('version', '1.1');
    new_svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    new_svg.setAttribute('vertical-align', 'top');
    return new_svg;
}

function createCap (pre, hide, miss_pre) {
    let new_cap = document.createElementNS("http://www.w3.org/2000/svg", "path");
    new_cap.setAttributeNS(null, "class", "cap");
    new_cap.setAttributeNS(null, "id", pre);
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

function createLink (pre, color, hide) {
    let new_link = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    new_link.setAttributeNS(null, "class", "link");
    new_link.setAttributeNS(null, "id", pre);
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

function appendPre (pre) {
    let new_svg = createSvg(pre);
    new_svg.appendChild(createLink(pre, "pink", false));
    new_svg.appendChild(createCap(pre, false, false))
    return new_svg;
}

function appendEff (eff) {
    let new_svg = createSvg(eff);
    new_svg.appendChild(createLink(eff, "green", false));
    return new_svg;
}

function createIcons (action) {
    //<button class="btn"><i class="fa fa-trash"></i></button>
    //<i class='fas fa-pen'></i>
    let delete_button = document.createElement("button");
    delete_button.setAttribute("class", "delete_btn");
    delete_button.setAttribute("id", action + "_delete_button");
    delete_button.setAttribute("padding", "0px 0px");
    delete_button.setAttribute("border", "none");
    let delete_icon = document.createElement("i");
    delete_icon.setAttribute("class", "fa fa-trash");
    delete_button.appendChild(delete_icon);

    let edit_button = document.createElement("button");
    edit_button.setAttribute("class", "edit_btn");
    edit_button.setAttribute("id", action + "_edit_button");
    let edit_icon = document.createElement("i");
    edit_icon.setAttribute("class", "fa fa-pen");
    edit_button.appendChild(edit_icon);

    return [delete_button, edit_button];
}

function createRows (action) {
    // create li for this action
    let action_li = document.createElement("li");
    action_li.setAttribute("class", "action  list-group-item");
    action_li.setAttribute("id", action + "_li");

    // precondition row
    let pre_row = document.createElement("div");
    pre_row.setAttribute("class", "action-pre");
    pre_row.setAttribute("id", action + "_pre");
    for (let pre_idx in action_dict[action]["Precondition"]["pos"]) {
        let pre = action_dict[action]["Precondition"]["pos"][pre_idx];
        pre_row.appendChild(appendPre(pre));
    }

    // name row
    let name_row = document.createElement("div");
    name_row.setAttribute("class", "action-name");
    name_row.setAttribute("id", action + "_name");
    name_row.innerHTML = action;
    // create icon buttons for the action
    // let icon_buttons = createIcons(action);
    // let delete_button = icon_buttons[0];
    // let edit_button = icon_buttons[1];
    // name_row.appendChild(edit_button);
    // name_row.appendChild(delete_button);

    // effect row
    let eff_row = document.createElement("div");
    eff_row.setAttribute("class", "action-eff");
    eff_row.setAttribute("id", action + "_link_row");
    for (let eff_idx in action_dict[action]["Effect"]["pos"]) {
        let eff = action_dict[action]["Effect"]["pos"][eff_idx];
        eff_row.appendChild(appendEff(eff));
    }

    // add to row
    action_li.appendChild(pre_row);
    action_li.appendChild(name_row);
    action_li.appendChild(eff_row);
    return [action_li, pre_row, name_row, eff_row];
}

// load initial planning
function createPlanning () {
    color_idx = 5;

    //get whole frame
    let planning_frame = document.getElementById("planning_frame");
    // clear previous panel
    while (planning_frame.childNodes.length != 0)
        planning_frame.removeChild(planning_frame.childNodes[0]);
    // create new one based on change
    for (let act_idx in action_list) {
        //alert(action); initial state, place brewer on cup...
        let action = action_list[act_idx];

        // create rows for each action
        [action_li, pre_row, name_row, eff_row] = createRows(action, action_dict);

        // add to frame
        planning_frame.appendChild(action_li);
    }

    // // add links and caps
    // for (let pre_idx in precondition_list) {
    //     let pre = precondition_list[pre_idx];

    //     // find all durations for actions in this pre
    //     pre_durations = [];
    //     let duration_idx = 0;
    //     let act_idx_in_pre = 0;
    //     while (act_idx_in_pre < precondition_dict[pre].length && pre in effect_duration && duration_idx < effect_duration[pre].length) {
    //         let pushFlag = false;
    //         let duration = effect_duration[pre][duration_idx];
    //         let act_in_pre = precondition_dict[pre][act_idx_in_pre];
    //         let act_idx = action_list.indexOf(act_in_pre);

    //         if (duration.length == 1 && act_idx > duration[0]) {
    //             pre_durations.push(duration);
    //             pushFlag = true;
    //         }
    //         else if (duration.length == 2 && act_idx > duration[0] && act_idx <= duration[1]) {
    //             pre_durations.push(duration);
    //             pushFlag = true;
    //         }
    //         // if pre_durations.push(duration), skip other actions in the same duration
    //         if (pushFlag) {
    //             while (act_idx_in_pre < precondition_dict[pre].length - 1) {
    //                 act_idx_in_pre++;
    //                 act_in_pre = precondition_dict[pre][act_idx_in_pre];
    //                 act_idx = action_list.indexOf(act_in_pre);
    //                 if (act_idx > duration[1])
    //                     break;
    //             }
    //             duration_idx++;
    //         }
    //         else {
    //             if (act_idx > duration[1])
    //                 duration_idx++;
    //             else {
    //                 act_idx_in_pre++;
    //             }
    //         }
    //     }

    //     let color = color_set[color_idx];
    //     if (precondition_dict[pre].length != 0) {
    //         let last_act_in_pre = precondition_dict[pre][precondition_dict[pre].length - 1];
    //         let last_act_idx_in_pre = action_list.indexOf(last_act_in_pre);
    //     }
    //     for (let j = 0; j < action_list.length - 1; j++) {
    //         let new_svg = createSvg(action_list[j], pre);
    //         hasLinkFlag = false;
    //         // no action need this precondition
    //         if (precondition_dict[pre].length == 0) {
    //             let new_link = createLink(color, hide = true);
    //         }
    //         // there's some action need this precondition
    //         else {
    //             for (let duration_idx in pre_durations) {
    //                 duration = pre_durations[duration_idx];

    //                 if (j < last_act_idx_in_pre && ((duration.length == 2 && j >= duration[0] && j < duration[1]) || (duration.length == 1 && j >= duration[0]))) {
    //                     let new_link = createLink(color, hide = false);
    //                     hasLinkFlag = true;
    //                     break;
    //                 }
    //             }
    //             if (!hasLinkFlag)
    //                 let new_link = createLink(color, hide = true);
    //         }
    //         new_svg.appendChild(new_link);
    //         // create new cap and append to svg
    //         if (precondition_dict[pre].includes(action_list[j + 1])) {
    //             let new_cap = createCap(hide = false, !hasLinkFlag);
    //             if (!hasLinkFlag) {
    //                 if (pre in ori_data["effect_duration"]) {
    //                     // find the duration of this missing precondition
    //                     let duration_diff = ori_data["effect_duration"][pre].filter(function (v) { return effect_duration[pre].indexOf(v) == -1 });
    //                     for (let i = 0; i < duration_diff.length; i++) {
    //                         let duration = duration_diff[i];
    //                         if (j + 1 > duration[0] && j + 1 <= duration[1])
    //                             break;
    //                     }
    //                     // animation for previous links
    //                     for (let act_idx = duration[0]; act_idx < j; act_idx++) {
    //                         let svg = document.getElementById(action_list[act_idx] + "_" + pre + "_svg");
    //                         svg.childNodes[0].setAttribute("fill", "red");
    //                         // first visible
    //                         svg.childNodes[0].setAttribute("visibility", "visible");
    //                         // on animation end
    //                         svg.childNodes[0].addEventListener("animationend", function (e) {
    //                             linkAniEnd(this);
    //                         });
    //                         svg.childNodes[0].classList.add("scaleTransition");
    //                     }
    //                 }
    //                 // user-added new precondition
    //                 else {

    //                 }
    //                 // animation for current new action
    //                 new_svg.childNodes[0].setAttribute("fill", "red");
    //                 // first visible
    //                 new_svg.childNodes[0].setAttribute("visibility", "visible");
    //                 // on animation end
    //                 new_svg.childNodes[0].addEventListener("animationend", function (e) {
    //                     linkAniEnd(this);
    //                 });
    //                 new_svg.childNodes[0].classList.add("scaleTransition");
    //             }
    //         }
    //         else {  // if just cross this action, hide the cap
    //             let new_cap = createCap(hide = true, !hasLinkFlag);
    //         }
    //         new_svg.appendChild(new_cap);
    //         // add svg to document
    //         let link_row = document.getElementById(action_list[j] + "_link_row");
    //         link_row.append(new_svg);
    //     }
    //     color_idx++;
    // }
}