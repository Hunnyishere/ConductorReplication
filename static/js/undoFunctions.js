function expandPlanning() {
    $("#expand_planning_button").click(function () {
        $(".temp-svg").remove();
        $(".link-row").show();
        $(".pos-pre-btn, .neg-pre-btn, .pos-eff-btn, neg-eff-btn").removeClass("btn-danger");
        $(".action-block").children(".list-group").hide();
    });
}

function resetPlanning() {
    $("#reset_planning_button").click(function () {
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "/reset_planning",
            success: function (data) {
                myData = data;
                // reload planning
                loadInitialSetting();
                createPlanning();
            },
            dataType: "json"
        });
    });
}