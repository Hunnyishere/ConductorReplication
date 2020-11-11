// should show up in groups, obj xxx, city xxx, truck xxx, ...
function displayPreAndEff(){
    $("#show-actions").empty();
    for(let act_idx in action_list){
        let action = action_list[act_idx];
        //console.log("action=",action);
        $("#show-actions").append("<div class='list-group-item list-group action-block' id='action-"+act_idx+"'></div>");
        $(".action-block#action-"+act_idx).append("<h4 class='action-name' id='action-"+act_idx+"'>"+action+"</h4>");
        $(".action-block#action-"+act_idx).append("<p class='list-group pos-precondition' id='action-"+act_idx+"'>Positive Preconditions</p>");
        $(".action-block#action-"+act_idx).append("<p class='list-group neg-precondition' id='action-"+act_idx+"'>Negative Preconditions</p>");
        $(".action-block#action-"+act_idx).append("<p class='list-group pos-effect' id='action-"+act_idx+"'>Positive Effects</p>");
        $(".action-block#action-"+act_idx).append("<p class='list-group neg-effect' id='action-"+act_idx+"'>Negative Effects</p>");

        // positive preconditions
        let add_button_1 = createAddButton(act_idx, "pos-pre");
        $(".pos-precondition#action-"+act_idx).append(add_button_1);
        let pos_pre_dict = {};
        for(let pos_pre_idx in action_dict[action]["Precondition"]["pos"]){
            let pre_idx_in_list = action_dict[action]["Precondition"]["pos"][pos_pre_idx];
            let pos_pre_list = precondition_list[pre_idx_in_list].split(',');
            let pos_pre_op = pos_pre_list[0];
            if(!(pos_pre_op in pos_pre_dict)){
                pos_pre_dict[pos_pre_op] = [];
            }
            pos_pre_dict[pos_pre_op].push(pos_pre_list.slice(1,));
            //$(".pos-precondition#action-"+act_idx).append("<div class='list-group-item' id='action-"+act_idx+"-pos-pre-"+pre_idx_in_list+"'>"+precondition_list[pre_idx_in_list]+"</div>");
            // let delete_button = createDeleteButton(act_idx+'-'+pre_idx_in_list, "pos-pre");
            // $("#action-"+act_idx+"-pos-pre-"+pre_idx_in_list).append(delete_button);
        }
        let pos_pre_op_idx = 0;
        for(let pre_op in pos_pre_dict){
            $(".pos-precondition#action-"+act_idx).append("<br/><div class='btn-group mr-2' role='group' aria-label='Second group' id='action-"+act_idx+"-pos-pre-group-"+pos_pre_op_idx+"'></div>");
            $("#action-"+act_idx+"-pos-pre-group-"+pos_pre_op_idx).prepend("<div>"+pre_op+"</div>");
            for(let obj_id in pos_pre_dict[pre_op]){
                let obj = pos_pre_dict[pre_op][obj_id];
                let pre_content;
                if(obj.length!=0){
                    pre_content = [pre_op, obj].join(',');
                }
                else{
                    pre_content = pre_op;
                }
                let pre_idx_in_list = precondition_list.indexOf(pre_content);
                $("#action-"+act_idx+"-pos-pre-group-"+pos_pre_op_idx).append("<button type='button' class='btn btn-secondary pos-pre-btn' id='pos-pre-btn-"+act_idx+"-"+pre_idx_in_list+"'>"+obj+"</button>");
                let delete_button = createDeleteButton(act_idx+'-'+pre_idx_in_list, "pos-pre");
                $("#action-"+act_idx+"-pos-pre-group-"+pos_pre_op_idx).append(delete_button);
            }
            pos_pre_op_idx ++;
        }

        // negative preconditions
        let add_button_2 = createAddButton(act_idx, "neg-pre");
        $(".neg-precondition#action-"+act_idx).append(add_button_2);
        let neg_pre_dict = {};
        for(let neg_pre_idx in action_dict[action]["Precondition"]["neg"]){
            let pre_idx_in_list = action_dict[action]["Precondition"]["neg"][neg_pre_idx];
            let neg_pre_list = precondition_list[pre_idx_in_list].split(',');
            let neg_pre_op = neg_pre_list[0];
            if(!(neg_pre_op in neg_pre_dict)){
                neg_pre_dict[neg_pre_op] = [];
            }
            neg_pre_dict[neg_pre_op].push(neg_pre_list.slice(1,));
        }
        let neg_pre_op_idx = 0;
        for(let pre_op in neg_pre_dict){
            $(".neg-precondition#action-"+act_idx).append("<br/><div class='btn-group mr-2' role='group' aria-label='Second group' id='action-"+act_idx+"-neg-pre-group-"+neg_pre_op_idx+"'></div>");
            $("#action-"+act_idx+"-neg-pre-group-"+neg_pre_op_idx).prepend("<div>"+pre_op+"</div>");
            for(let obj_id in neg_pre_dict[pre_op]){
                let obj = neg_pre_dict[pre_op][obj_id];
                let pre_content;
                if(obj.length!=0){
                    pre_content = [pre_op, obj].join(',');
                }
                else{
                    pre_content = pre_op;
                }
                let pre_idx_in_list = precondition_list.indexOf(pre_content);
                $("#action-"+act_idx+"-neg-pre-group-"+neg_pre_op_idx).append("<button type='button' class='btn btn-secondary neg-pre-btn' id='neg-pre-btn-"+act_idx+"-"+pre_idx_in_list+"'>"+obj+"</button>");
                let delete_button = createDeleteButton(act_idx+'-'+pre_idx_in_list, "neg-pre");
                $("#action-"+act_idx+"-neg-pre-group-"+neg_pre_op_idx).append(delete_button);
            }
            neg_pre_op_idx ++;
        }

        // positive effects
        let add_button_3 = createAddButton(act_idx, "pos-eff");
        $(".pos-effect#action-"+act_idx).append(add_button_3);
        let pos_eff_dict = {};
        for(let pos_eff_idx in action_dict[action]["Effect"]["pos"]){
            let eff_idx_in_list = action_dict[action]["Effect"]["pos"][pos_eff_idx];
            let pos_eff_list = effect_list[eff_idx_in_list].split(',');
            let pos_eff_op = pos_eff_list[0];
            if(!(pos_eff_op in pos_eff_dict)){
                pos_eff_dict[pos_eff_op] = [];
            }
            pos_eff_dict[pos_eff_op].push(pos_eff_list.slice(1,));
        }
        let pos_eff_op_idx = 0;
        for(let eff_op in pos_eff_dict){
            $(".pos-effect#action-"+act_idx).append("<br/><div class='btn-group mr-2' role='group' aria-label='Second group' id='action-"+act_idx+"-pos-eff-group-"+pos_eff_op_idx+"'></div>");
            $("#action-"+act_idx+"-pos-eff-group-"+pos_eff_op_idx).prepend("<div>"+eff_op+"</div>");
            for(let obj_id in pos_eff_dict[eff_op]){
                let obj = pos_eff_dict[eff_op][obj_id];
                let eff_content;
                if(obj.length!=0){
                    eff_content = [eff_op, obj].join(',');
                }
                else{
                    eff_content = eff_op;
                }
                let eff_idx_in_list = effect_list.indexOf(eff_content);
                $("#action-"+act_idx+"-pos-eff-group-"+pos_eff_op_idx).append("<button type='button' class='btn btn-secondary pos-eff-btn' id='pos-eff-btn-"+act_idx+"-"+eff_idx_in_list+"'>"+obj+"</button>");
                let delete_button = createDeleteButton(act_idx+'-'+eff_idx_in_list, "pos-eff");
                $("#action-"+act_idx+"-pos-eff-group-"+pos_eff_op_idx).append(delete_button);
            }
            pos_eff_op_idx ++;
        }

        // negative effects
        let add_button_4 = createAddButton(act_idx, "neg-eff");
        $(".neg-effect#action-"+act_idx).append(add_button_4);
        let neg_eff_dict = {};
        for(let neg_eff_idx in action_dict[action]["Effect"]["neg"]){
            let eff_idx_in_list = action_dict[action]["Effect"]["neg"][neg_eff_idx];
            let neg_eff_list = effect_list[eff_idx_in_list].split(',');
            let neg_eff_op = neg_eff_list[0];
            if(!(neg_eff_op in neg_eff_dict)){
                neg_eff_dict[neg_eff_op] = [];
            }
            neg_eff_dict[neg_eff_op].push(neg_eff_list.slice(1,));
        }
        let neg_eff_op_idx = 0;
        for(let eff_op in neg_eff_dict){
            $(".neg-effect#action-"+act_idx).append("<br/><div class='btn-group mr-2' role='group' aria-label='Second group' id='action-"+act_idx+"-neg-eff-group-"+neg_eff_op_idx+"'></div>");
            $("#action-"+act_idx+"-neg-eff-group-"+neg_eff_op_idx).prepend("<div>"+eff_op+"</div>");
            for(let obj_id in neg_eff_dict[eff_op]){
                let obj = neg_eff_dict[eff_op][obj_id];
                let eff_content;
                if(obj.length!=0){
                    eff_content = [eff_op, obj].join(',');
                }
                else{
                    eff_content = eff_op;
                }
                let eff_idx_in_list = effect_list.indexOf(eff_content);
                $("#action-"+act_idx+"-neg-eff-group-"+neg_eff_op_idx).append("<button type='button' class='btn btn-secondary neg-eff-btn' id='neg-eff-btn-"+act_idx+"-"+eff_idx_in_list+"'>"+obj+"</button>");
                let delete_button = createDeleteButton(act_idx+'-'+eff_idx_in_list, "neg-eff");
                $("#action-"+act_idx+"-neg-eff-group-"+neg_eff_op_idx).append(delete_button);
            }
            neg_eff_op_idx ++;
        }
    }
    $(".action-block").children(".list-group").hide();
    $(".action-name").each(function(){
        $(this).click(function(){
            $(this).siblings().toggle();
        });
    });
}

// show all pre and eff
function showAll(){
    $("#show_all_button").click(function(){
        $(".action-block").children(".list-group").show();
    });
}

function hideAll(){
    $("#hide_all_button").click(function(){
        $(".action-block").children(".list-group").hide();
    });
}
