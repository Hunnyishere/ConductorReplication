function hoverShowPreInMiddle(){
    $(".action-pre-svg").hover(function(){
        let [act_idx, pre_idx] = this.id.split('-');
        act_idx = parseInt(act_idx);
        pre_idx = parseInt(pre_idx);
        $(".action-block").children(".list-group").hide();
        $(".action-block#action-"+act_idx).children(".list-group").toggle();
        $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
        $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
        $("#pos-pre-btn-"+act_idx+"-"+pre_idx).addClass("btn-danger");
        $("#neg-pre-btn-"+act_idx+"-"+pre_idx).addClass("btn-danger");
    });
}

function clickShowPathOnLeft(){
    $(".action-pre-svg").click(function(){
        let [act_idx, pre_idx] = this.id.split('-');
        pre_idx = parseInt(pre_idx);
        act_idx = parseInt(act_idx);
        $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
        $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
        $("#pos-pre-btn-"+act_idx+"-"+pre_idx).addClass("btn-danger");
        showPathOnLeft(pre_idx);
    });
}

function showPathOnLeft(pre_idx){
    $(".link-row").hide();
    $(".temp-svg").remove();
    createPath(pre_idx);
}

function clickShowPathOnMiddle(){
    // preconditions
    $(".pos-pre-btn, .neg-pre-btn").click(function(){
        $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
        $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
        $(this).addClass("btn-danger");
        let [act_idx, pre_idx] = this.id.slice(12,).split('-');
        showPathOnLeft(pre_idx);
    });
    // effects
    $(".pos-eff-btn, .neg-eff-btn").click(function(){
        $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
        $(".pos-pre_add_button, .neg-pre_add_button, .pos-eff_add_button, .neg-eff_add_button").removeClass("btn-danger");
        $(this).addClass("btn-danger");
        let [act_idx, eff_idx] = this.id.slice(12,).split('-');
        let eff = effect_list[eff_idx];
        let pre_idx = precondition_list.indexOf(eff);
        showPathOnLeft(pre_idx);
    });
}

function createPath(pre_idx){
    for(let act_idx in action_list){
        let svg = createFullPathLinkAndCap(act_idx, pre_idx);
        //console.log(svg);
        $(svg).addClass("temp-svg");
        $(svg).insertBefore("#action-row-"+act_idx);
        $(svg).hover(function(){
            $(".action-block").children(".list-group").hide();
            $(".action-block#action-"+act_idx).children(".list-group").toggle();
            $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-danger");
            $("#pos-pre-btn-"+act_idx+"-"+pre_idx).addClass("btn-danger");
            $("#neg-pre-btn-"+act_idx+"-"+pre_idx).addClass("btn-danger");
        });
    }
}

function openConditionAnimation(){
    let act_start_idx = action_list.length;  // gray out start action

    // miss positive preconditions
    let miss_pos_pres = document.getElementsByClassName("miss-pos-pre-link");
    if(miss_pos_pres.length!=0){
        let pos_act_start_idx;
        [pos_act_start_idx, ] = miss_pos_pres[0].parentNode.id.split('-');
        if(pos_act_start_idx < act_start_idx){
            act_start_idx = pos_act_start_idx;
        }
    }
    for(let i=0; i<miss_pos_pres.length; i++){
        miss_pos_pres[i].addEventListener("animationstart", function(){
            this.setAttribute("visibility","visible");
            missPosPreAniStart(this);
        });
        miss_pos_pres[i].addEventListener("animationend", function(e){
            missPosPreAniEnd(this);
        });
    }

    // miss negative preconditions
    let miss_neg_pres = document.getElementsByClassName("miss-neg-pre-link");
    if(miss_neg_pres.length!=0){
        let neg_act_start_idx;
        [neg_act_start_idx, ] = miss_neg_pres[0].parentNode.id.split('-');
        if(neg_act_start_idx < act_start_idx){
            act_start_idx = neg_act_start_idx;
        }
    }
    for(let i=0; i<miss_neg_pres.length; i++){
        miss_neg_pres[i].addEventListener("animationstart", function(e){
            missNegPreAniStart(this);
        });
        miss_neg_pres[i].addEventListener("animationend", function(e){
            missNegPreAniEnd(this);
        });
    }

    // gray out invalid actions (from first action missing precondition (positive/negative))
    for(let act_idx = act_start_idx; act_idx < action_list.length; act_idx++){
        $("#action-row-div-"+act_idx).addClass("bg-secondary");
    }
}

function missPosPreAniStart(dom){
    dom.setAttribute("visibility","visible");
}

function missPosPreAniEnd(dom){
    dom.setAttribute("visibility","hidden");
}

function missNegPreAniStart(dom){
    dom.setAttribute("fill","gray");
}

function missNegPreAniEnd(dom){
    let pre_idx = dom.parentNode.id.split('-')[1];
    dom.setAttribute("fill",color_set[color_idx+parseInt(pre_idx)]);
}