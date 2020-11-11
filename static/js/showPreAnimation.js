function hoverShowPreInMiddle(){
    $(".action-pre-svg").hover(function(){
        let [act_idx, pre_idx] = this.id.split('-');
        act_idx = parseInt(act_idx);
        pre_idx = parseInt(pre_idx);
        $(".action-block").children(".list-group").hide();
        $(".action-block#action-"+act_idx).children(".list-group").toggle();
        $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-primary");
        $("#pos-pre-btn-"+act_idx+"-"+pre_idx).addClass("btn-primary");
        $("#neg-pre-btn-"+act_idx+"-"+pre_idx).addClass("btn-primary");
    });
}

function clickShowPathOnLeft(){
    $(".action-pre-svg").click(function(){
        let [act_idx, pre_idx] = this.id.split('-');
        pre_idx = parseInt(pre_idx);
        act_idx = parseInt(act_idx);
        $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-primary");
        $("#pos-pre-btn-"+act_idx+"-"+pre_idx).addClass("btn-primary");
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
        $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-primary");
        $(this).addClass("btn-primary");
        let [act_idx, pre_idx] = this.id.slice(12,).split('-');
        showPathOnLeft(pre_idx);
    });
    // effects
    $(".pos-eff-btn, .neg-eff-btn").click(function(){
        $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-primary");
        $(this).addClass("btn-primary");
        let [act_idx, eff_idx] = this.id.slice(12,).split('-');
        let eff = effect_list[eff_idx];
        let pre_idx = precondition_list.indexOf(eff);
        showPathOnLeft(pre_idx);
    });
}

function createPath(pre_idx){
    for(let act_idx in action_list){
        let svg = createFullPathLinkAndCap(act_idx, pre_idx);
        $(svg).addClass("temp-svg");
        $("#action-row-"+act_idx).prepend(svg);
        $(svg).hover(function(){
            $(".action-block").children(".list-group").hide();
            $(".action-block#action-"+act_idx).children(".list-group").toggle();
            $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, .neg-eff-btn").removeClass("btn-primary");
            $("#pos-pre-btn-"+act_idx+"-"+pre_idx).addClass("btn-primary");
            $("#neg-pre-btn-"+act_idx+"-"+pre_idx).addClass("btn-primary");
        });
    }
}

function openConditionAnimation(){
    // miss positive preconditions
    let miss_pos_pres = document.getElementsByClassName("miss-pos-pre-link");
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
    for(let i=0; i<miss_neg_pres.length; i++){
        miss_neg_pres[i].addEventListener("animationstart", function(e){
            missNegPreAniStart(this);
        });
        miss_neg_pres[i].addEventListener("animationend", function(e){
            missNegPreAniEnd(this);
        });
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