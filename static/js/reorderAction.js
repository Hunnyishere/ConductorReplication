function reorderActions(){
    $("#planning").sortable({

        // cite: http://jsfiddle.net/beyondsanity/HgDZ9/
        stop: function(){
            let new_order = new Array();
            $.map($(this).find(".action-div"), function(action_div){
                let ori_pos = action_div.id;
                let new_pos = $(action_div).index();
                new_order.splice( new_pos, 0, ori_pos);
                //console.log(ori_pos,new_pos);
            });
            //console.log(new_order);

            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "/reorder_action",
                data: JSON.stringify({new_order: new_order}),
                success: function (data) {
                    myData = data;
                    // reload planning
                    loadInitialSetting();
                    createPlanning();
                },
                dataType: "json"
            });
        },
        // disable certain initial-state, goal state
        cancel: ".initial-state, .goal-state"
    });
}